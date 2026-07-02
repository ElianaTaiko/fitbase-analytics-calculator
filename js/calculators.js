// Чистые функции расчёта: не трогают DOM, принимают state+config, возвращают данные.

function getTariff(config, tariffId) {
  return config.tariffs.find((t) => t.id === tariffId);
}

function computeEffectiveQuota(tariff, config) {
  // Квота дашбордов не меняется галкой Fitbase PRO — она обнуляет только ежемесячную плату
  // (см. calculateDashboardTariff), а не добавляет дашборды сверх тарифа.
  return { ...tariff.quota };
}

function calculateDashboardTariff(tariffId, selectedDashboardIds, extraIntegrationsCount, config, fitbasePro) {
  const tariff = getTariff(config, tariffId);
  const selectedSet = new Set(selectedDashboardIds);
  const effectiveQuota = computeEffectiveQuota(tariff, config);

  const includedDashboards = [];
  const extraDashboards = [];

  config.dashboardCategories.forEach((category) => {
    const quota = effectiveQuota[category.id] || 0;
    let takenInCategory = 0;
    category.dashboards.forEach((dash) => {
      if (!selectedSet.has(dash.id)) return;
      const item = { id: dash.id, label: dash.label, categoryId: category.id, categoryLabel: category.label };
      if (takenInCategory < quota) {
        includedDashboards.push(item);
        takenInCategory += 1;
      } else {
        extraDashboards.push({ ...item, installCost: category.installCost, installHours: category.installHours });
      }
    });
  });

  const includedIntegrations = tariff.includedIntegrations || 0;
  extraIntegrationsCount = Math.max(0, extraIntegrationsCount);
  const totalIntegrationsCount = includedIntegrations + extraIntegrationsCount;
  const extraIntegrationsCost = extraIntegrationsCount * config.integration.costPerUnit;

  const installBreakdown = extraDashboards.map((d) => ({
    label: `«${d.label}»`,
    amount: d.installCost,
    hours: d.installHours,
  }));
  if (extraIntegrationsCount > 0) {
    installBreakdown.push({
      label: `Интеграция с рекламным кабинетом × ${extraIntegrationsCount}`,
      amount: extraIntegrationsCost,
      hours: config.integration.hoursPerUnit * extraIntegrationsCount,
    });
  }

  const installTotal = extraDashboards.reduce((sum, d) => sum + d.installCost, 0) + extraIntegrationsCost;

  return {
    family: "dashboard",
    tariff,
    monthlyFee: fitbasePro ? 0 : tariff.monthlyFee,
    fitbasePro: !!fitbasePro,
    effectiveQuota,
    includedDashboards,
    extraDashboards,
    includedIntegrations,
    extraIntegrationsCount,
    totalIntegrationsCount,
    installBreakdown,
    installTotal,
    installTotalHours: installTotal / config.installRatePerHour,
  };
}

function calculateFranchiseTariff(studioCount, integrationsCount, config) {
  const f = config.franchise;
  // "Франшиза" больше не отдельный тариф-карточка — это режим внутри "Кастомизированного"
  // (Франшиза для партнёра), поэтому tariff-объект берём тот же, что и для custom.
  const tariff = getTariff(config, "custom");
  studioCount = Math.max(1, studioCount || 0);
  integrationsCount = Math.max(0, integrationsCount || 0);

  const monthlyFee = studioCount * f.monthlyFeePerStudio;
  const integrationsCost = integrationsCount * f.integrationCostPerUnit;
  const installTotal = f.installFlat + integrationsCost;

  const installBreakdown = [
    { label: `Install-пакет (${f.installFlatHours} ч)`, amount: f.installFlat, hours: f.installFlatHours },
  ];
  if (integrationsCount > 0) {
    installBreakdown.push({
      label: `Интеграции с рекламными кабинетами × ${integrationsCount}`,
      amount: integrationsCost,
      hours: f.integrationHoursPerUnit * integrationsCount,
    });
  }

  return {
    family: "franchise",
    tariff,
    monthlyFee,
    studioCount,
    integrationsCount,
    installTotal,
    installTotalHours: installTotal / config.installRatePerHour,
    installBreakdown,
  };
}

function calculateCustomTariff(installHours, integrationsCount, extraObjectsCount, config) {
  const c = config.custom;
  const tariff = getTariff(config, "custom");
  installHours = Math.max(0, installHours || 0);
  integrationsCount = Math.max(0, integrationsCount || 0);
  extraObjectsCount = Math.max(0, extraObjectsCount || 0);

  const monthlyFee = c.monthlyFeeFirstObject + extraObjectsCount * c.monthlyFeePerExtraObject;
  const installBase = installHours * c.installRatePerHour;
  const integrationsCost = integrationsCount * c.integrationCostPerUnit;
  const installTotal = installBase + integrationsCost;

  const installBreakdown = [];
  if (installBase > 0) {
    installBreakdown.push({ label: `Install по ТЗ (${installHours} ч)`, amount: installBase, hours: installHours });
  }
  if (integrationsCost > 0) {
    installBreakdown.push({
      label: `Интеграция с рекламным кабинетом × ${integrationsCount}`,
      amount: integrationsCost,
      hours: c.integrationHoursPerUnit * integrationsCount,
    });
  }

  return {
    family: "custom",
    tariff,
    monthlyFee,
    installHours,
    integrationsCount,
    extraObjectsCount,
    installTotal,
    installTotalHours: installTotal / config.installRatePerHour,
    installBreakdown,
  };
}

function calculateCurrentSelection(state, config) {
  const tariff = getTariff(config, state.tariffId);
  if (!tariff) return null;

  if (tariff.family === "custom") {
    let result;
    if (state.customSubMode === "franchise") {
      if (state.franchiseType === "partner") {
        result = calculateFranchiseTariff(state.studioCount, state.franchiseIntegrationsCount, config);
        result.subModeLabel = "Франшиза для партнёра";
      } else {
        result = calculateCustomTariff(state.customInstallHours, state.customIntegrationsCount, 0, config);
        result.subModeLabel = "Франшиза для УК";
      }
    } else {
      const extraObjectsCount = state.customSubMode === "custom_plus" ? 1 : 0;
      result = calculateCustomTariff(state.customInstallHours, state.customIntegrationsCount, extraObjectsCount, config);
      result.subModeLabel = state.customSubMode === "custom_plus" ? "Кастомизированный+" : "Кастомизированный";
    }
    result.customSubMode = state.customSubMode;
    result.franchiseType = state.franchiseType;
    return result;
  }

  const fitbasePro = tariff.id === "basic_tier" && state.fitbasePro;
  return calculateDashboardTariff(
    tariff.id,
    Array.from(state.selectedDashboards),
    state.extraIntegrationsCount,
    config,
    fitbasePro
  );
}

window.Calculators = {
  getTariff,
  computeEffectiveQuota,
  calculateDashboardTariff,
  calculateFranchiseTariff,
  calculateCustomTariff,
  calculateCurrentSelection,
};
