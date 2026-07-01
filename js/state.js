// Состояние выбора пользователя + мутаторы.

function createInitialState(config) {
  return {
    tariffId: "basic_tier",
    // dashboard-тарифы
    selectedDashboards: new Set(),
    extraIntegrationsCount: 0,
    // franchise (Франшиза Партнёр)
    studioCount: 1,
    franchiseIntegrationsCount: 0,
    // custom (Кастомизированный / Кастомизированный+)
    customInstallHours: 0,
    customIntegrationsCount: 0,
    customExtraObjects: 0,
    // общее
    offerValidityDays: config.offerValidityDaysDefault,
  };
}

function resetFamilyFields(state) {
  state.selectedDashboards = new Set();
  state.extraIntegrationsCount = 0;
  state.studioCount = 1;
  state.franchiseIntegrationsCount = 0;
  state.customInstallHours = 0;
  state.customIntegrationsCount = 0;
  state.customExtraObjects = 0;
}

function selectTariff(state, config, tariffId) {
  const prevTariff = window.Calculators.getTariff(config, state.tariffId);
  const nextTariff = window.Calculators.getTariff(config, tariffId);
  state.tariffId = tariffId;

  const prevFamily = prevTariff ? prevTariff.family : null;
  if (nextTariff.family !== prevFamily || nextTariff.family === "dashboard") {
    // Смена семейства тарифа (или переход между разными дашборд-тарифами с разными квотами) —
    // сбрасываем выбор, чтобы не тащить неактуальные значения.
    resetFamilyFields(state);
  }
}

// Автоматический апгрейд со Стартового (ПРО) на платный тариф при выборе дашбордов сверх
// бесплатной квоты. В отличие от selectTariff, НЕ сбрасывает выбранные дашборды/интеграции —
// клиент продолжает с тем же набором, просто под другим (платным) тарифом.
function upgradeToTariff(state, tariffId) {
  state.tariffId = tariffId;
}

function toggleDashboard(state, dashboardId) {
  if (state.selectedDashboards.has(dashboardId)) {
    state.selectedDashboards.delete(dashboardId);
  } else {
    state.selectedDashboards.add(dashboardId);
  }
}

function setExtraIntegrationsCount(state, value) {
  state.extraIntegrationsCount = Math.max(0, value);
}

function setStudioCount(state, value) {
  state.studioCount = Math.max(1, value);
}

function setFranchiseIntegrationsCount(state, value) {
  state.franchiseIntegrationsCount = Math.max(0, value);
}

function setCustomInstallHours(state, value) {
  state.customInstallHours = Math.max(0, value);
}

function setCustomIntegrationsCount(state, value) {
  state.customIntegrationsCount = Math.max(0, value);
}

function setCustomExtraObjects(state, value) {
  state.customExtraObjects = Math.max(0, value);
}

function setOfferValidityDays(state, value) {
  state.offerValidityDays = Math.max(1, value);
}

window.AppState = {
  createInitialState,
  selectTariff,
  upgradeToTariff,
  toggleDashboard,
  setExtraIntegrationsCount,
  setStudioCount,
  setFranchiseIntegrationsCount,
  setCustomInstallHours,
  setCustomIntegrationsCount,
  setCustomExtraObjects,
  setOfferValidityDays,
};
