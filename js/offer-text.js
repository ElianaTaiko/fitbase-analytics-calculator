// Генерация HTML-текста коммерческого предложения: название тарифа, цены и названия
// дашбордов выделяются полужирным (<strong>). Копирование читает textContent — теги
// в буфер обмена не попадают, только сам текст.

function esc(text) {
  return window.Render.escapeHtml(String(text));
}

function bold(text) {
  return `<strong>${esc(text)}</strong>`;
}

function buildOfferHtml(result, config, validUntilStr) {
  const money = window.Render.formatMoney;
  const hours = window.Render.formatHours;
  const lines = [];

  lines.push("Коммерческое предложение от команды Fitbase");
  lines.push("");
  lines.push(`Тариф: ${bold(result.subModeLabel || result.tariff.label)}`);

  if (result.family === "franchise") {
    lines.push(
      `Включено: ${result.studioCount} студ. × ${bold(
        money(config.franchise.monthlyFeePerStudio, config.currency) + "/мес"
      )}; интеграций с рекламными кабинетами — ${result.integrationsCount}`
    );
  } else if (result.family === "custom") {
    const totalObjects = 1 + result.extraObjectsCount;
    lines.push(
      `Включено: ${totalObjects} объект(ов) (1 основной + ${result.extraObjectsCount} доп. по тарифу «Кастомизированный+»); интеграций с рекламным кабинетом — ${result.integrationsCount}`
    );
  } else {
    const includedParts = [];
    const allSelected = [...result.includedDashboards, ...result.extraDashboards];
    if (allSelected.length > 0) {
      includedParts.push(`дашборды — ${allSelected.map((d) => bold(d.label)).join(", ")}`);
    }
    if (result.tariff.integrationOptionEnabled && result.totalIntegrationsCount > 0) {
      includedParts.push(`интеграций с рекламным кабинетом — ${result.totalIntegrationsCount}`);
    }
    lines.push(`Включено: ${includedParts.length > 0 ? includedParts.join("; ") : "дашборды не выбраны"}`);
  }
  lines.push("");

  lines.push(`Ежемесячный платёж: ${bold(money(result.monthlyFee, config.currency) + "/мес")}`);

  if (result.installTotal > 0 && result.installBreakdown.length === 1) {
    // Причина одна — сумма уже названа, не дублируем её отдельной строкой.
    lines.push(
      `Разовый платёж (Install): ${bold(hours(result.installTotalHours, config) + " = " + money(result.installTotal, config.currency))} — ${esc(
        result.installBreakdown[0].label
      )}`
    );
  } else if (result.installTotal > 0) {
    lines.push(
      `Разовый платёж (Install): ${bold(hours(result.installTotalHours, config) + " = " + money(result.installTotal, config.currency))}`
    );
    result.installBreakdown.forEach((row) => {
      lines.push(
        `  — ${esc(row.label)}: ${row.hours} ч × ${money(config.installRatePerHour, config.currency)} = ${bold(
          money(row.amount, config.currency)
        )}`
      );
    });
  } else if (result.family === "dashboard") {
    lines.push(`Разовый платёж (Install): ${bold("0 ₽")} — все выбранные дашборды входят в тариф`);
  } else {
    lines.push(`Разовый платёж (Install): ${bold("0 ₽")}`);
  }

  lines.push("");
  lines.push(`Предложение действительно до ${esc(validUntilStr)}`);

  return lines.join("\n");
}

window.OfferText = { buildOfferHtml };
