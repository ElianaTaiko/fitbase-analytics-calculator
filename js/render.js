// Рендер DOM: читает state+config, полностью перерисовывает контейнеры.

function formatMoney(amount, currency) {
  const rounded = Math.round(amount);
  return rounded.toLocaleString("ru-RU") + " " + currency;
}

function iconCheck() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-check"><path d="M20 6 9 17l-5-5"></path></svg>';
}
function iconPlus() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>';
}
function iconMinus() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><path d="M5 12h14"></path></svg>';
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function renderTariffSwitcher(state, config) {
  const cards = config.tariffs
    .map((t) => {
      const selected = t.id === state.tariffId;
      let priceLine;
      if (t.family === "franchise") {
        priceLine = `от ${formatMoney(config.franchise.monthlyFeePerStudio, config.currency)}/мес за студию`;
      } else if (t.family === "custom") {
        priceLine = `от ${formatMoney(config.custom.monthlyFeeFirstObject, config.currency)}/мес`;
      } else {
        priceLine = t.monthlyFee === 0 ? "0 ₽/мес" : formatMoney(t.monthlyFee, config.currency) + "/мес";
      }
      const subtitleHtml = t.subtitle ? `<div class="tariff-switch-subtitle">${escapeHtml(t.subtitle)}</div>` : "";
      return `
        <label class="tariff-switch-card ${selected ? "is-selected" : ""}" data-tariff-id="${t.id}">
          <input type="radio" name="tariff" class="sr-only" value="${t.id}" ${selected ? "checked" : ""} />
          <div class="tariff-switch-icon">${t.icon || ""}</div>
          <div class="tariff-switch-label">${escapeHtml(t.label)}</div>
          ${subtitleHtml}
          <div class="tariff-switch-price">${priceLine}</div>
        </label>`;
    })
    .join("");
  return `<div class="tariff-switcher">${cards}</div>`;
}

function renderDashboardBadge(dashInfoMap, dashId, config) {
  const info = dashInfoMap[dashId];
  if (!info) return "";
  if (info.status === "included") return '<span class="dash-badge dash-badge-included">Включено</span>';
  if (info.status === "extra")
    return `<span class="dash-badge dash-badge-extra">+${formatMoney(info.installCost, config.currency)}</span>`;
  return "";
}

function buildDashboardInfoMap(tariff, selectedDashboards, config) {
  // Возвращает { dashId: {status: 'included'|'extra', installCost} } на основе текущего выбора,
  // с тем же правилом порядка по категориям, что и в calculators.js.
  const map = {};
  config.dashboardCategories.forEach((category) => {
    const quota = tariff.quota[category.id] || 0;
    let taken = 0;
    category.dashboards.forEach((dash) => {
      if (!selectedDashboards.has(dash.id)) return;
      if (taken < quota) {
        map[dash.id] = { status: "included" };
      } else {
        map[dash.id] = { status: "extra", installCost: category.installCost };
      }
      taken += 1;
    });
  });
  return map;
}

function renderDashboardGrid(state, config, tariff) {
  const infoMap = buildDashboardInfoMap(tariff, state.selectedDashboards, config);

  const categoriesHtml = config.dashboardCategories
    .map((category) => {
      const quota = tariff.quota[category.id] || 0;
      const cardsHtml = category.dashboards
        .map((dash) => {
          const checked = state.selectedDashboards.has(dash.id);
          const badge = renderDashboardBadge(infoMap, dash.id, config);
          return `
            <label class="dash-card ${checked ? "is-selected" : ""}" data-dashboard-id="${dash.id}">
              <input type="checkbox" class="sr-only" ${checked ? "checked" : ""} />
              <span class="dash-check-corner">${iconCheck()}</span>
              <div class="dash-card-icon">${dash.icon || ""}</div>
              <div class="dash-label">${escapeHtml(dash.label)}</div>
              ${badge}
            </label>`;
        })
        .join("");
      return `
        <div class="dash-category">
          <div class="dash-category-header">
            <span class="dash-category-name">${escapeHtml(category.label)}</span>
            <span class="dash-category-quota">включено: ${quota}</span>
          </div>
          <div class="dash-category-grid">${cardsHtml}</div>
        </div>`;
    })
    .join("");

  return `<div class="dash-grid">${categoriesHtml}</div>`;
}

function renderIntegrationStepper(state, tariff, config) {
  if (!tariff.integrationOptionEnabled) return "";
  const included = tariff.includedIntegrations;
  const includedWord = included === 1 ? "интеграция" : included === 2 || included === 3 || included === 4 ? "интеграции" : "интеграций";
  return `
    <div class="field-block">
      <label class="field-label">Доп. интеграции с рекламным кабинетом</label>
      <div class="stepper">
        <button type="button" class="stepper-btn" data-action="dec-integration">${iconMinus()}</button>
        <div class="stepper-value">${state.extraIntegrationsCount}</div>
        <button type="button" class="stepper-btn" data-action="inc-integration">${iconPlus()}</button>
      </div>
      <p class="field-hint">Тариф уже включает бесплатно: ${included} ${includedWord}. Счётчик выше — только дополнительные сверх этого, каждая — ${formatMoney(
    config.integration.costPerUnit,
    config.currency
  )} (${config.integration.hoursPerUnit} ч по ${formatMoney(config.integration.ratePerHour, config.currency)}/ч).</p>
    </div>`;
}

function quotaSummaryText(tariff, config) {
  const parts = config.dashboardCategories
    .map((c) => {
      const n = tariff.quota[c.id] || 0;
      return { n, label: n === 1 ? c.singularLabel : c.pluralLabel };
    })
    .filter((p) => p.n > 0)
    .map((p) => `${p.n} ${p.label}`);
  if (parts.length === 0) return "";
  return `Включено в тариф: ${parts.join(" + ")} (Install бесплатно). Дополнительные дашборды — платно.`;
}

function renderFranchiseFields(state, config) {
  const f = config.franchise;
  return `
    <div class="field-block">
      <label class="field-label">Количество студий</label>
      <div class="stepper">
        <button type="button" class="stepper-btn" data-action="dec-studio">${iconMinus()}</button>
        <div class="stepper-value">${state.studioCount}</div>
        <button type="button" class="stepper-btn" data-action="inc-studio">${iconPlus()}</button>
      </div>
      <p class="field-hint">${formatMoney(f.monthlyFeePerStudio, config.currency)}/мес за каждую студию.</p>
    </div>
    <div class="field-block">
      <label class="field-label">Интеграции с рекламными кабинетами</label>
      <div class="stepper">
        <button type="button" class="stepper-btn" data-action="dec-franchise-integration">${iconMinus()}</button>
        <div class="stepper-value">${state.franchiseIntegrationsCount}</div>
        <button type="button" class="stepper-btn" data-action="inc-franchise-integration">${iconPlus()}</button>
      </div>
      <p class="field-hint">Например: ${f.integrationExamples.join(
        ", "
      )} — каждая интеграция ${formatMoney(f.integrationCostPerUnit, config.currency)} (${f.integrationHoursPerUnit} ч).</p>
    </div>
    <p class="field-hint note-box">Install-пакет ${formatMoney(
      f.installFlat,
      config.currency
    )} (${f.installFlatHours} ч) — разовый платёж для партнёра, не зависит от количества студий.</p>`;
}

function renderCustomFields(state, config) {
  const c = config.custom;
  return `
    <div class="field-block">
      <label class="field-label">Install по ТЗ — часы разработки</label>
      <input type="number" min="0" step="1" class="number-input" id="custom-install-hours" value="${state.customInstallHours}" />
      <p class="field-hint">1 час = ${formatMoney(c.installRatePerHour, config.currency)}. Сумма считается автоматически.</p>
    </div>
    <div class="field-block">
      <label class="field-label">Интеграция с рекламным кабинетом</label>
      <div class="stepper">
        <button type="button" class="stepper-btn" data-action="dec-custom-integration">${iconMinus()}</button>
        <div class="stepper-value">${state.customIntegrationsCount}</div>
        <button type="button" class="stepper-btn" data-action="inc-custom-integration">${iconPlus()}</button>
      </div>
      <p class="field-hint">Каждая — ${formatMoney(c.integrationCostPerUnit, config.currency)} (${c.integrationHoursPerUnit} ч). Относится к основному объекту.</p>
    </div>
    <div class="field-block">
      <label class="field-label">Доп. объекты («Кастомизированный+»)</label>
      <div class="stepper">
        <button type="button" class="stepper-btn" data-action="dec-custom-extra-object">${iconMinus()}</button>
        <div class="stepper-value">${state.customExtraObjects}</div>
        <button type="button" class="stepper-btn" data-action="inc-custom-extra-object">${iconPlus()}</button>
      </div>
      <p class="field-hint">Каждый доп. объект — ${formatMoney(
        c.monthlyFeePerExtraObject,
        config.currency
      )}/мес, без Install и без своей интеграции.</p>
    </div>`;
}

function renderLeftColumn(state, config) {
  const tariff = window.Calculators.getTariff(config, state.tariffId);
  const container = document.getElementById("left-column-body");
  if (!tariff) {
    container.innerHTML = "";
    return;
  }

  const forWhomHtml = tariff.forWhom ? `<p class="quota-summary">${escapeHtml(tariff.forWhom)}</p>` : "";

  if (tariff.family === "franchise") {
    container.innerHTML = forWhomHtml + renderFranchiseFields(state, config);
    return;
  }

  if (tariff.family === "custom") {
    container.innerHTML = forWhomHtml + renderCustomFields(state, config);
    return;
  }

  const noteHtml = tariff.note ? `<p class="field-hint note-box">${escapeHtml(tariff.note)}</p>` : "";
  container.innerHTML = `
    <p class="quota-summary">${quotaSummaryText(tariff, config)}</p>
    ${noteHtml}
    ${renderDashboardGrid(state, config, tariff)}
    ${renderIntegrationStepper(state, tariff, config)}`;
}

function renderTotalsAndInstall(monthlyFee, installTotal, installBreakdown, config) {
  // Если причина ровно одна, сумма уже показана в блоке "Разовый платёж" выше —
  // повторно её выводить не нужно, достаточно назвать источник начисления.
  let installRows;
  if (installBreakdown.length === 0) {
    installRows = `<div class="install-row install-row-muted"><span>Дополнительных начислений нет</span></div>`;
  } else if (installBreakdown.length === 1) {
    installRows = `<div class="install-row install-row-muted"><span>${escapeHtml(installBreakdown[0].label)}</span></div>`;
  } else {
    installRows = installBreakdown
      .map(
        (row) =>
          `<div class="install-row"><span>${escapeHtml(row.label)}</span><span>${formatMoney(
            row.amount,
            config.currency
          )}</span></div>`
      )
      .join("");
  }

  return `
    <div class="totals-grid">
      <div class="total-box total-box-primary">
        <div class="total-box-label">Ежемесячный платёж</div>
        <div class="total-box-value">${formatMoney(monthlyFee, config.currency)}</div>
      </div>
      <div class="total-box total-box-neutral">
        <div class="total-box-label">Разовый платёж (Install)</div>
        <div class="total-box-value">${formatMoney(installTotal, config.currency)}</div>
      </div>
    </div>
    <p class="field-hint">Install и ежемесячный платёж — разные типы платежей, не суммируются.</p>

    <div class="install-breakdown">
      <div class="install-breakdown-title">Разбивка Install</div>
      ${installRows}
    </div>`;
}

function renderDashboardResults(result, config) {
  const includedLine =
    result.includedDashboards.length > 0
      ? result.includedDashboards.map((d) => d.label).join(", ")
      : "нет выбранных дашбордов";

  return `
    <div class="summary-table">
      <div class="summary-row"><span>Тариф</span><span>${escapeHtml(result.tariff.label)}</span></div>
      <div class="summary-row"><span>Выбранные дашборды</span><span>${escapeHtml(includedLine)}</span></div>
      ${
        result.tariff.integrationOptionEnabled
          ? `<div class="summary-row"><span>Интеграций с рекл. кабинетом (всего)</span><span>${result.totalIntegrationsCount}</span></div>`
          : ""
      }
    </div>
    ${renderTotalsAndInstall(result.monthlyFee, result.installTotal, result.installBreakdown, config)}`;
}

function renderFranchiseResults(result, config) {
  return `
    <div class="summary-table">
      <div class="summary-row"><span>Тариф</span><span>${escapeHtml(result.tariff.label)} (Партнёр)</span></div>
      <div class="summary-row"><span>Количество студий</span><span>${result.studioCount}</span></div>
      <div class="summary-row"><span>Интеграций с рекл. кабинетами</span><span>${result.integrationsCount}</span></div>
    </div>
    ${renderTotalsAndInstall(result.monthlyFee, result.installTotal, result.installBreakdown, config)}`;
}

function renderCustomResults(result, config) {
  const totalObjects = 1 + result.extraObjectsCount;
  return `
    <div class="summary-table">
      <div class="summary-row"><span>Тариф</span><span>${escapeHtml(result.tariff.label)}</span></div>
      <div class="summary-row"><span>Объектов всего</span><span>${totalObjects} (1 основной + ${result.extraObjectsCount} доп.)</span></div>
      <div class="summary-row"><span>Install, часы по ТЗ</span><span>${result.installHours} ч</span></div>
      <div class="summary-row"><span>Интеграций с рекл. кабинетом</span><span>${result.integrationsCount}</span></div>
    </div>
    ${renderTotalsAndInstall(result.monthlyFee, result.installTotal, result.installBreakdown, config)}`;
}

function renderResultsBlock(result, config) {
  if (result.family === "franchise") return renderFranchiseResults(result, config);
  if (result.family === "custom") return renderCustomResults(result, config);
  return renderDashboardResults(result, config);
}

function renderOfferCard(state, config, result) {
  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + state.offerValidityDays);
  const validUntilStr = validUntil.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });

  const offerHtml = window.OfferText.buildOfferHtml(result, config, validUntilStr);

  return `
    <div class="card offer-card" id="offer-card">
      <div class="offer-card-header">
        <h2>Коммерческое предложение</h2>
        <button type="button" class="btn-link" id="copy-offer-btn">Копировать</button>
      </div>
      <div class="field-block">
        <label class="field-label">Срок действия предложения</label>
        <div class="stepper">
          <button type="button" class="stepper-btn" data-action="dec-validity">${iconMinus()}</button>
          <div class="stepper-value">${state.offerValidityDays}</div>
          <button type="button" class="stepper-btn" data-action="inc-validity">${iconPlus()}</button>
        </div>
        <span class="field-hint-inline">дня, до ${validUntilStr}</span>
      </div>
      <pre class="offer-text" id="offer-text">${offerHtml}</pre>
      <button type="button" class="btn-primary btn-block" id="pdf-offer-btn">Скачать PDF</button>
    </div>`;
}

function renderRightColumn(state, config) {
  const result = window.Calculators.calculateCurrentSelection(state, config);
  const resultsContainer = document.getElementById("results-card-body");
  resultsContainer.innerHTML = renderResultsBlock(result, config);

  const offerContainer = document.getElementById("offer-card-slot");
  offerContainer.innerHTML = renderOfferCard(state, config, result);
}

function renderAll(state, config) {
  document.getElementById("tariff-switcher-slot").innerHTML = renderTariffSwitcher(state, config);
  renderLeftColumn(state, config);
  renderRightColumn(state, config);
}

window.Render = {
  renderAll,
  renderLeftColumn,
  renderRightColumn,
  formatMoney,
  escapeHtml,
};
