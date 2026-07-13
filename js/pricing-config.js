window.PRICING_CONFIG = {
  currency: "₽",
  offerValidityDaysDefault: 5,

  // Валюты расчёта. fallbackRate — «единиц валюты за 1 ₽» по курсу ЦБ РФ (резерв на случай
  // оффлайна; обновлять при деплое), актуальный курс подтягивается с cbr-xml-daily.ru
  // (см. js/currency.js). step — шаг округления ВНИЗ: цена в валюте при обратном пересчёте
  // в рубли никогда не превышает исходную рублёвую ставку.
  currencies: {
    RUB: { symbol: "₽", label: "Рубли", step: 1 },
    KZT: {
      symbol: "₸",
      label: "Тенге",
      offerLabel: "в казахстанских тенге",
      step: 500,
      fallbackRate: 6.0968,
      fallbackAsOf: "11.07.2026",
    },
    UZS: {
      symbol: "сум",
      label: "Сумы",
      offerLabel: "в узбекских сумах",
      step: 5000,
      fallbackRate: 157.5168,
      fallbackAsOf: "11.07.2026",
    },
  },
  // Единая ставка часа разработки — используется только для отображения Install в часах
  // (все installCost/installHours ниже ей соответствуют: installCost = installHours * installRatePerHour).
  installRatePerHour: 5000,

  dashboardCategories: [
    {
      id: "basic",
      label: "Базовые",
      singularLabel: "базовый",
      pluralLabel: "базовых",
      installCost: 25000,
      installHours: 5,
      dashboards: [
        { id: "revenue", label: "Выручка", icon: "💰", iconImage: "dashboard-revenue.webp" },
        { id: "funnel", label: "Воронка", icon: "⏳", iconImage: "dashboard-funnel.webp" },
        { id: "subscriptions", label: "Реализация абонементов и услуг", icon: "🎫", iconImage: "dashboard-realization.webp" },
      ],
    },
    {
      id: "advanced",
      label: "Продвинутые",
      singularLabel: "продвинутый",
      pluralLabel: "продвинутых",
      installCost: 40000,
      installHours: 8,
      dashboards: [
        { id: "sales_dept", label: "Отдел продаж", icon: "📈", iconImage: "dashboard-sales.webp" },
        { id: "marketing", label: "Маркетинг", icon: "🎯", iconImage: "dashboard-marketing.webp" },
        { id: "clients", label: "Клиенты", icon: "👥", iconImage: "dashboard-clients.webp" },
        { id: "trainers", label: "Тренеры", icon: "🏋️", iconImage: "dashboard-trainers.webp" },
      ],
    },
    {
      id: "expert",
      label: "Экспертные",
      singularLabel: "экспертный",
      pluralLabel: "экспертных",
      installCost: 50000,
      installHours: 10,
      dashboards: [
        { id: "trainer_payroll", label: "Зарплаты тренеров", icon: "💵", iconImage: "dashboard-trainer-salary.webp" },
        { id: "smart_schedule", label: "Умное расписание", icon: "🗓️", iconImage: "dashboard-timetable.webp" },
      ],
    },
  ],

  // Стандартная ставка доп. интеграции с рекламным кабинетом (Базовый/Продвинутый/Экспертный).
  integration: {
    label: "Интеграция с рекламным кабинетом",
    hoursPerUnit: 10,
    ratePerHour: 5000,
    costPerUnit: 50000,
  },

  // Франшиза = Франшиза Партнёр (отдельная студия сети). Франшиза УК — своя секция ниже (franchiseUk).
  franchise: {
    monthlyFeePerStudio: 2000,
    installFlat: 10000, // одноразовый пакет, не зависит от числа студий
    installFlatHours: 2,
    integrationCostPerUnit: 25000,
    integrationHoursPerUnit: 5,
    integrationExamples: ["Яндекс.Директ", "Рекламный кабинет ВКонтакте", "Яндекс.Карты"],
  },

  // Кастомизированный: основной объект + доп. объекты "Кастомизированный+" (без Install).
  custom: {
    monthlyFeeFirstObject: 6000,
    monthlyFeePerExtraObject: 3000,
    installRatePerHour: 5000,
    integrationCostPerUnit: 50000,
    integrationHoursPerUnit: 10,
  },

  // Франшиза для УК: Install и интеграции считаются по ставкам custom (см. выше) — это не
  // меняется. Ежемесячная плата зависит от галки "Собрать дашборд для УК со всеми
  // подключенными объектами" (см. calculateFranchiseUkTariff): выключена — фикс. adminMonthlyFee
  // (УК как суперадмин-инструмент, отдельного сводного дашборда нет); включена —
  // perObjectMonthlyFee × число подключённых объектов (заменяет adminMonthlyFee, не складывается).
  franchiseUk: {
    adminMonthlyFee: 5500,
    perObjectMonthlyFee: 1000,
  },

  tariffs: [
    {
      id: "basic_tier",
      family: "dashboard",
      label: "Базовый",
      icon: "⭐",
      iconImage: "tariff-basic.webp",
      forWhom: "Массовый стандартный тариф",
      monthlyFee: 5000,
      quota: { basic: 1, advanced: 0, expert: 0 },
      includedIntegrations: 0,
      dashboardGridEnabled: true,
      integrationOptionEnabled: true,
      fitbaseProOptionEnabled: true,
    },
    {
      id: "advanced_tier",
      family: "dashboard",
      label: "Продвинутый",
      icon: "🚀",
      iconImage: "tariff-advanced.webp",
      forWhom: "Расширенный стандартный тариф",
      monthlyFee: 10000,
      quota: { basic: 2, advanced: 1, expert: 0 },
      includedIntegrations: 0,
      dashboardGridEnabled: true,
      integrationOptionEnabled: true,
      fitbaseProOptionEnabled: true,
    },
    {
      id: "expert_tier",
      family: "dashboard",
      label: "Экспертный",
      icon: "👑",
      iconImage: "tariff-expert.webp",
      forWhom: "Старший стандартный тариф",
      monthlyFee: 20000,
      quota: { basic: 2, advanced: 2, expert: 1 },
      includedIntegrations: 0,
      dashboardGridEnabled: true,
      integrationOptionEnabled: true,
      fitbaseProOptionEnabled: true,
    },
    {
      id: "custom",
      family: "custom",
      label: "Кастомизированный",
      icon: "🛠️",
      iconImage: "tariff-custom.webp",
      forWhom:
        "Клиенты с индивидуальным ТЗ. Три режима: «Кастомизированный» (один объект), «Кастомизированный+» (доп. объект того же клиента, отдельный договор) и «Франшиза» (для УК сети — по ставкам Кастомизированного, для партнёра сети — по ставкам за студию).",
    },
  ],
};
