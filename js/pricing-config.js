window.PRICING_CONFIG = {
  currency: "₽",
  offerValidityDaysDefault: 5,

  dashboardCategories: [
    {
      id: "basic",
      label: "Базовые",
      singularLabel: "базовый",
      pluralLabel: "базовых",
      installCost: 25000,
      installHours: 5,
      dashboards: [
        { id: "revenue", label: "Выручка", icon: "💰" },
        { id: "funnel", label: "Воронка", icon: "⏳" },
        { id: "subscriptions", label: "Реализация абонементов и услуг", icon: "🎫" },
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
        { id: "sales_dept", label: "Отдел продаж", icon: "📈" },
        { id: "marketing", label: "Маркетинг", icon: "🎯" },
        { id: "clients", label: "Клиенты", icon: "👥" },
        { id: "trainers", label: "Тренеры", icon: "🏋️" },
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
        { id: "trainer_payroll", label: "Зарплаты тренеров", icon: "💵" },
        { id: "smart_schedule", label: "Умное расписание", icon: "🗓️" },
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
      id: "start",
      family: "dashboard",
      label: "Стартовый",
      subtitle: "(для клиентов Фитбейс ПРО)",
      icon: "🌱",
      forWhom: "Для клиентов с подпиской Fitbase ПРО",
      monthlyFee: 0,
      quota: { basic: 1, advanced: 0, expert: 0 },
      includedIntegrations: 0,
      dashboardGridEnabled: true,
      integrationOptionEnabled: true,
      note:
        "Доступно только клиентам с активной подпиской Fitbase ПРО. Сборка 1 базового дашборда — бесплатно (без Install), без ежемесячной платы.",
    },
    {
      id: "basic_tier",
      family: "dashboard",
      label: "Базовый",
      icon: "⭐",
      forWhom: "Массовый стандартный тариф",
      monthlyFee: 5000,
      quota: { basic: 1, advanced: 0, expert: 0 },
      includedIntegrations: 0,
      dashboardGridEnabled: true,
      integrationOptionEnabled: true,
    },
    {
      id: "advanced_tier",
      family: "dashboard",
      label: "Продвинутый",
      icon: "🚀",
      forWhom: "Расширенный стандартный тариф",
      monthlyFee: 10000,
      quota: { basic: 2, advanced: 1, expert: 0 },
      includedIntegrations: 1,
      dashboardGridEnabled: true,
      integrationOptionEnabled: true,
    },
    {
      id: "expert_tier",
      family: "dashboard",
      label: "Экспертный",
      icon: "👑",
      forWhom: "Старший стандартный тариф",
      monthlyFee: 20000,
      quota: { basic: 2, advanced: 2, expert: 1 },
      includedIntegrations: 2,
      dashboardGridEnabled: true,
      integrationOptionEnabled: true,
    },
    {
      id: "franchise",
      family: "franchise",
      label: "Франшиза",
      icon: "🏢",
      forWhom: "Франшиза Партнёр — отдельная студия франчайзинговой сети. Управляющая компания сети (Франшиза УК) считается по тарифу «Кастомизированный».",
    },
    {
      id: "custom",
      family: "custom",
      label: "Кастомизированный",
      icon: "🛠️",
      forWhom:
        "Клиенты с индивидуальным ТЗ, в т.ч. управляющие компании франшиз (Франшиза УК). Доп. объекты того же клиента подключаются как «Кастомизированный+».",
    },
  ],
};
