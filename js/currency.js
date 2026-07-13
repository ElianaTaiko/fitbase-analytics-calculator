// Валюты и курсы: официальный курс ЦБ РФ (cbr-xml-daily.ru), кэш в localStorage,
// резервные курсы из PRICING_CONFIG.currencies. Конвертация выполняется на уровне
// конфига (buildConfig): калькуляторы, рендер и текст КП работают с уже переведёнными
// ставками, поэтому разбивки всегда сходятся с итогами без повторного округления.

(function () {
  const API_URL = "https://www.cbr-xml-daily.ru/daily_json.js";
  const STORAGE_KEY = "fitbaseCalcCbrRates";

  // Живые курсы: { KZT: { rate, asOf }, UZS: { rate, asOf } }; rate — единиц валюты за 1 ₽.
  // null, пока не пришёл fetch и нет кэша — тогда работаем на резервных курсах из конфига.
  let liveRates = loadCachedRates();
  let onRatesUpdated = null; // колбэк main.js — перерисовать, когда придёт свежий курс

  function loadCachedRates() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed && parsed.KZT && parsed.UZS) return parsed;
    } catch (e) {
      // localStorage может быть недоступен (приватный режим, некоторые file://) — не критично.
    }
    return null;
  }

  function saveCachedRates(rates) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rates));
    } catch (e) {}
  }

  function fetchRates() {
    if (typeof fetch !== "function") return;
    fetch(API_URL)
      .then((response) => response.json())
      .then((data) => {
        const asOf = new Date(data.Date).toLocaleDateString("ru-RU");
        const rates = {};
        ["KZT", "UZS"].forEach((code) => {
          const valute = data.Valute[code];
          // ЦБ РФ публикует "Value ₽ за Nominal единиц валюты" → единиц валюты за 1 ₽:
          rates[code] = { rate: valute.Nominal / valute.Value, asOf };
        });
        liveRates = rates;
        saveCachedRates(rates);
        if (onRatesUpdated) onRatesUpdated();
      })
      .catch(() => {
        // Оффлайн или API недоступен — остаёмся на кэше/резервных курсах.
      });
  }

  // Курс для валюты: { rate, asOfLabel, source }. source — "ЦБ РФ" (fetch или кэш)
  // либо "резервный" (константы из pricing-config.js).
  function getRateInfo(config, code) {
    if (code === "RUB") return { rate: 1, asOfLabel: "", source: "" };
    const def = config.currencies[code];
    const live = liveRates && liveRates[code];
    if (live) return { rate: live.rate, asOfLabel: live.asOf, source: "ЦБ РФ" };
    return { rate: def.fallbackRate, asOfLabel: def.fallbackAsOf, source: "резервный" };
  }

  // Округление вниз до шага валюты: при обратном пересчёте в рубли сумма
  // гарантированно не превышает исходную рублёвую ставку.
  function convertDown(rubAmount, rate, step) {
    return Math.floor((rubAmount * rate) / step) * step;
  }

  // Копия PRICING_CONFIG со ставками в выбранной валюте. Часовые стоимости (Install,
  // интеграции) не конвертируются по отдельности, а выводятся как часы × конвертированная
  // ставка часа — так строка «N ч × ставка = сумма» точно сходится в любой валюте.
  // Отдельно (floor до шага) конвертируются только не-часовые ежемесячные платежи.
  function buildConfig(baseConfig, code) {
    if (code === "RUB") return baseConfig;
    const def = baseConfig.currencies[code];
    const rate = getRateInfo(baseConfig, code).rate;
    const conv = (rub) => convertDown(rub, rate, def.step);

    const cfg = JSON.parse(JSON.stringify(baseConfig));
    cfg.currency = def.symbol;

    const hourRate = conv(baseConfig.installRatePerHour);
    cfg.installRatePerHour = hourRate;
    cfg.dashboardCategories.forEach((cat) => {
      cat.installCost = cat.installHours * hourRate;
    });
    cfg.integration.ratePerHour = hourRate;
    cfg.integration.costPerUnit = cfg.integration.hoursPerUnit * hourRate;
    cfg.franchise.installFlat = cfg.franchise.installFlatHours * hourRate;
    cfg.franchise.integrationCostPerUnit = cfg.franchise.integrationHoursPerUnit * hourRate;
    cfg.custom.installRatePerHour = hourRate;
    cfg.custom.integrationCostPerUnit = cfg.custom.integrationHoursPerUnit * hourRate;

    cfg.franchise.monthlyFeePerStudio = conv(baseConfig.franchise.monthlyFeePerStudio);
    cfg.custom.monthlyFeeFirstObject = conv(baseConfig.custom.monthlyFeeFirstObject);
    cfg.custom.monthlyFeePerExtraObject = conv(baseConfig.custom.monthlyFeePerExtraObject);
    cfg.franchiseUk.adminMonthlyFee = conv(baseConfig.franchiseUk.adminMonthlyFee);
    cfg.franchiseUk.perObjectMonthlyFee = conv(baseConfig.franchiseUk.perObjectMonthlyFee);
    cfg.tariffs.forEach((t) => {
      if (typeof t.monthlyFee === "number") t.monthlyFee = conv(t.monthlyFee);
    });

    return cfg;
  }

  window.Currency = {
    fetchRates,
    getRateInfo,
    buildConfig,
    setOnRatesUpdated(cb) {
      onRatesUpdated = cb;
    },
  };
})();
