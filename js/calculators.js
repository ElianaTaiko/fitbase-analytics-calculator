// Чистые функции расчёта: не трогают DOM, принимают state+config, возвращают данные.

function getTariff(config, tariffId) {
  return config.tariffs.find((t) => t.id === tariffId);
}

function calculateDashboardTariff(tariffId, selectedDashboardIds, extraIntegrationsCount, config) {
  const tariff = getTariff(config, tariffId);
  const selectedSet = new Set(selectedDashboardIds);

  const includedDashboards = [];
  const extraDashboards = [];

  config.dashboardCategories.forEach((category) => {
    const quota = tariff.quota[category.id] || 0;
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
  }));
  if (extraIntegrationsCount > 0) {
    installBreakdown.push({
      label: `Интеграция с рекламным кабинетом × ${extraIntegrationsCount}`,
      amount: extraIntegrationsCost,
    });
  }

  const installTotal = extraDashboards.reduce((sum, d) => sum + d.installCost, 0) + extraIntegrationsCost;

  return {
    family: "dashboard",
    tariff,
    monthlyFee: tariff.monthlyFee,
    includedDashboards,
    extraDashboards,
    includedIntegrations,
    extraIntegrationsCount,
    totalIntegrationsCount,
    installBreakdown,
    installTotal,
  };
}

function calculateFranchiseTariff(studioCount, integrationsCount, config) {
  const f = config.franchise;
  const tariff = getTariff(config, "franchise");
  studioCount = Math.max(1, studioCount || 0);
  integrationsCount = Math.max(0, integrationsCount || 0);

  const monthlyFee = studioCount * f.monthlyFeePerStudio;
  const integrationsCost = integrationsCount * f.integrationCostPerUnit;
  const installTotal = f.installFlat + integrationsCost;

  const installBreakdown = [{ label: `Install-пакет (${f.installFlatHours} ч)`, amount: f.installFlat }];
  if (integrationsCount > 0) {
    installBreakdown.push({
      label: `Интеграции с рекламными кабинетами × ${integrationsCount}`,
      amount: integrationsCost,
    });
  }

  return {
    family: "franchise",
    tariff,
    monthlyFee,
    studioCount,
    integrationsCount,
    installTotal,
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
    installBreakdown.push({ label: `Install по ТЗ (${installHours} ч)`, amount: installBase });
  }
  if (integrationsCost > 0) {
    installBreakdown.push({
      label: `Интеграция с рекламным кабинетом × ${integrationsCount}`,
      amount: integrationsCost,
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
    installBreakdown,
  };
}

function calculateCurrentSelection(state, config) {
  const tariff = getTariff(config, state.tariffId);
  if (!tariff) return null;
  if (tariff.family === "franchise") {
    return calculateFranchiseTariff(state.studioCount, state.franchiseIntegrationsCount, config);
  }
  if (tariff.family === "custom") {
    return calculateCustomTariff(state.customInstallHours, state.customIntegrationsCount, state.customExtraObjects, config);
  }
  return calculateDashboardTariff(tariff.id, Array.from(state.selectedDashboards), state.extraIntegrationsCount, config);
}

window.Calculators = {
  getTariff,
  calculateDashboardTariff,
  calculateFranchiseTariff,
  calculateCustomTariff,
  calculateCurrentSelection,
};
