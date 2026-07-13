// Состояние выбора пользователя + мутаторы.

function createInitialState(config) {
  return {
    tariffId: "basic_tier",
    // dashboard-тарифы
    selectedDashboards: new Set(),
    extraIntegrationsCount: 0,
    fitbasePro: false,
    // franchise (Франшиза Партнёр)
    studioCount: 1,
    franchiseIntegrationsCount: 0,
    // custom (Кастомизированный / Кастомизированный+ / Франшиза)
    customInstallHours: 0,
    customIntegrationsCount: 0,
    customSubMode: "custom", // "custom" | "custom_plus" — актуально только при franchiseMode === false
    franchiseMode: false, // флажок "Франшиза"
    franchiseType: "uk", // "uk" | "partner" — актуально только при franchiseMode === true
    // franchise UK (актуально только при franchiseMode === true && franchiseType === "uk")
    ukConsolidatedDashboard: false, // галка "Собрать дашборд для УК со всеми подключенными объектами"
    ukConnectedObjectsCount: 1, // используется только когда ukConsolidatedDashboard === true
    // общее (не сбрасывается при смене тарифа)
    currency: "RUB", // "RUB" | "KZT" | "UZS" — валюта отображения расчёта
    offerValidityDays: config.offerValidityDaysDefault,
  };
}

function resetFamilyFields(state) {
  state.selectedDashboards = new Set();
  state.extraIntegrationsCount = 0;
  state.fitbasePro = false;
  state.studioCount = 1;
  state.franchiseIntegrationsCount = 0;
  state.customInstallHours = 0;
  state.customIntegrationsCount = 0;
  state.customSubMode = "custom";
  state.franchiseMode = false;
  state.franchiseType = "uk";
  state.ukConsolidatedDashboard = false;
  state.ukConnectedObjectsCount = 1;
}

function selectTariff(state, config, tariffId) {
  if (tariffId === state.tariffId) return;
  state.tariffId = tariffId;
  // Любое ручное переключение тарифа (даже между Базовый/Продвинутый/Экспертный внутри
  // одного семейства "dashboard") сбрасывает весь выбор — дашборды, интеграции, галку
  // Fitbase PRO и т.д. Менеджер начинает расчёт заново под новый тариф.
  resetFamilyFields(state);
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

function setCustomSubMode(state, value) {
  state.customSubMode = value;
}

function setFranchiseMode(state, value) {
  state.franchiseMode = !!value;
}

function setFranchiseType(state, value) {
  state.franchiseType = value;
}

function setUkConsolidatedDashboard(state, value) {
  state.ukConsolidatedDashboard = !!value;
}

function setUkConnectedObjectsCount(state, value) {
  state.ukConnectedObjectsCount = Math.max(0, value);
}

function setFitbasePro(state, value) {
  state.fitbasePro = !!value;
}

function setCurrency(state, value) {
  state.currency = value;
}

function setOfferValidityDays(state, value) {
  state.offerValidityDays = Math.max(1, value);
}

window.AppState = {
  createInitialState,
  selectTariff,
  toggleDashboard,
  setExtraIntegrationsCount,
  setStudioCount,
  setFranchiseIntegrationsCount,
  setCustomInstallHours,
  setCustomIntegrationsCount,
  setCustomSubMode,
  setFranchiseMode,
  setFranchiseType,
  setUkConsolidatedDashboard,
  setUkConnectedObjectsCount,
  setFitbasePro,
  setCurrency,
  setOfferValidityDays,
};
