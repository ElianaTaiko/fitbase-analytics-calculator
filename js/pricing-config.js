window.PRICING_CONFIG = {
  currency: "₽",
  offerValidityDaysDefault: 5,
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

  // Франшиза = Франшиза Партнёр (отдельная студия сети). Франшиза УК считается по тарифу custom.
  franchise: {
    monthlyFeePerStudio: 1000,
    installFlat: 10000, // одноразовый пакет, не зависит от числа студий
    installFlatHours: 2,
    integrationCostPerUnit: 25000,
    integrationHoursPerUnit: 5,
    integrationExamples: ["Яндекс.Директ", "Рекламный кабинет ВКонтакте", "Яндекс.Карты"],
  },

  // Кастомизированный: основной объект + доп. объекты "Кастомизированный+" (без Install).
  custom: {
    monthlyFeeFirstObject: 5000,
    monthlyFeePerExtraObject: 2500,
    installRatePerHour: 5000,
    integrationCostPerUnit: 50000,
    integrationHoursPerUnit: 10,
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
      includedIntegrations: 1,
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
      includedIntegrations: 2,
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
