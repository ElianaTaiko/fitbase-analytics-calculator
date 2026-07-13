// Генерация HTML-текста коммерческого предложения: название тарифа, цены и названия
// дашбордов выделяются полужирным (<strong>). Копирование читает textContent — теги
// в буфер обмена не попадают, только сам текст.

function esc(text) {
  return window.Render.escapeHtml(String(text));
}

function bold(text) {
  return `<strong>${esc(text)}</strong>`;
}

function buildOfferHtml(result, config, validUntilStr, currencyCode) {
  const money = window.Render.formatMoney;
  const hours = window.Render.formatHours;
  const lines = [];

  // Эмодзи-акценты и маркированный список — в стиле КП основного продукта Fitbase.
  const tariffTitle = `${esc(result.tariff.icon)} ${bold(result.subModeLabel || result.tariff.label)}`;

  lines.push("💼 Коммерческое предложение от команды Fitbase");
  lines.push("");
  lines.push(`Тариф: ${tariffTitle}`);
  lines.push("");

  lines.push(`🧩 Включено в тариф ${tariffTitle}:`);
  const bullets = [];
  if (result.family === "franchise") {
    bullets.push(
      `Студии сети: ${result.studioCount} × ${bold(money(config.franchise.monthlyFeePerStudio, config.currency) + "/мес")}`
    );
    if (result.integrationsCount > 0) {
      bullets.push(`Интеграция с рекламным кабинетом × ${result.integrationsCount}`);
    }
  } else if (result.family === "franchise_uk") {
    bullets.push(
      result.consolidatedDashboard
        ? `Сводный дашборд УК (подключено объектов: ${result.connectedObjectsCount})`
        : "УК как суперадмин-инструмент (без сводного дашборда)"
    );
    bullets.push(`Install по ТЗ: ${result.installHours} ч`);
    if (result.integrationsCount > 0) {
      bullets.push(`Интеграция с рекламным кабинетом × ${result.integrationsCount}`);
    }
  } else if (result.family === "custom") {
    const totalObjects = 1 + result.extraObjectsCount;
    bullets.push(`Объекты: ${totalObjects} (1 основной + ${result.extraObjectsCount} доп. по тарифу «Кастомизированный+»)`);
    if (result.integrationsCount > 0) {
      bullets.push(`Интеграция с рекламным кабинетом × ${result.integrationsCount}`);
    }
  } else {
    const allSelected = [...result.includedDashboards, ...result.extraDashboards];
    allSelected.forEach((d) => bullets.push(bold(d.label)));
    if (result.tariff.integrationOptionEnabled && result.totalIntegrationsCount > 0) {
      bullets.push(`Интеграция с рекламным кабинетом × ${result.totalIntegrationsCount}`);
    }
    if (bullets.length === 0) bullets.push("Дашборды не выбраны");
  }
  bullets.forEach((b) => lines.push(`• ${b}`));
  lines.push("");

  lines.push(`💰 Ежемесячный платёж: ${bold(money(result.monthlyFee, config.currency) + "/мес")}`);

  if (result.installTotal > 0 && result.installBreakdown.length === 1) {
    // Причина одна — сумма уже названа, не дублируем её отдельной строкой.
    lines.push(
      `💰 Разовый платёж (Install): ${bold(hours(result.installTotalHours, config) + " = " + money(result.installTotal, config.currency))} — ${esc(
        result.installBreakdown[0].label
      )}`
    );
  } else if (result.installTotal > 0) {
    lines.push(
      `💰 Разовый платёж (Install): ${bold(hours(result.installTotalHours, config) + " = " + money(result.installTotal, config.currency))}`
    );
    result.installBreakdown.forEach((row) => {
      lines.push(
        `  — ${esc(row.label)}: ${row.hours} ч × ${money(config.installRatePerHour, config.currency)} = ${bold(
          money(row.amount, config.currency)
        )}`
      );
    });
  } else if (result.family === "dashboard") {
    lines.push(
      `💰 Разовый платёж (Install): ${bold(money(0, config.currency))} — все выбранные дашборды входят в тариф`
    );
  } else {
    lines.push(`💰 Разовый платёж (Install): ${bold(money(0, config.currency))}`);
  }

  lines.push("");
  lines.push(`⏰ Предложение действительно до ${esc(validUntilStr)}`);

  // Для не-рублёвых валют фиксируем в КП курс и дату, по которым выполнен расчёт.
  if (currencyCode && currencyCode !== "RUB") {
    const base = window.PRICING_CONFIG;
    const def = base.currencies[currencyCode];
    const info = window.Currency.getRateInfo(base, currencyCode);
    const rateStr = info.rate.toLocaleString("ru-RU", { maximumFractionDigits: 2 });
    const sourceLabel = info.source === "ЦБ РФ" ? `по курсу ЦБ РФ на ${info.asOfLabel}` : `по резервному курсу на ${info.asOfLabel}`;
    lines.push("");
    lines.push(esc(`Расчёт выполнен ${def.offerLabel} ${sourceLabel} (1 ₽ = ${rateStr} ${def.symbol}).`));
  }

  return lines.join("\n");
}

window.OfferText = { buildOfferHtml };
