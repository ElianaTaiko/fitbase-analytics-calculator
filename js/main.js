(function () {
  const baseConfig = window.PRICING_CONFIG;
  const state = window.AppState.createInitialState(baseConfig);

  // Конфиг в валюте state.currency (для рублей — исходный PRICING_CONFIG).
  // Мемоизация по валюте и курсу: пересборка только при смене валюты или приходе
  // свежего курса ЦБ РФ, а не на каждый клик.
  let cachedConfig = baseConfig;
  let cachedConfigKey = "RUB:1";
  function activeConfig() {
    const rate = window.Currency.getRateInfo(baseConfig, state.currency).rate;
    const key = state.currency + ":" + rate;
    if (key !== cachedConfigKey) {
      cachedConfig = window.Currency.buildConfig(baseConfig, state.currency);
      cachedConfigKey = key;
    }
    return cachedConfig;
  }

  function rerenderAll() {
    window.Render.renderAll(state, activeConfig());
  }
  function rerenderLeftAndRight() {
    window.Render.renderLeftColumn(state, activeConfig());
    window.Render.renderRightColumn(state, activeConfig());
  }
  function rerenderRightOnly() {
    window.Render.renderRightColumn(state, activeConfig());
  }

  // Переключатель валют (шапка)
  document.getElementById("currency-switcher-slot").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-currency]");
    if (!btn || btn.dataset.currency === state.currency) return;
    window.AppState.setCurrency(state, btn.dataset.currency);
    rerenderAll();
  });

  // Пришёл свежий курс ЦБ РФ — перерисовываем, если выбрана не-рублёвая валюта
  // (activeConfig пересоберёт конфиг сам: курс входит в ключ мемоизации).
  window.Currency.setOnRatesUpdated(() => {
    if (state.currency !== "RUB") rerenderAll();
  });
  window.Currency.fetchRates();

  // Переключатель тарифов
  document.getElementById("tariff-switcher-slot").addEventListener("click", (e) => {
    const card = e.target.closest("[data-tariff-id]");
    if (!card) return;
    window.AppState.selectTariff(state, activeConfig(), card.dataset.tariffId);
    rerenderAll();
  });

  // Левая колонка: клики (дашборды, чекбокс Fitbase PRO, степперы, переключатели режимов)
  document.getElementById("left-column-body").addEventListener("click", (e) => {
    const dashCard = e.target.closest("[data-dashboard-id]");
    if (dashCard) {
      const tariff = window.Calculators.getTariff(activeConfig(), state.tariffId);
      if (tariff.dashboardGridEnabled) {
        window.AppState.toggleDashboard(state, dashCard.dataset.dashboardId);
        rerenderLeftAndRight();
      }
      return;
    }

    const fitbaseProToggle = e.target.closest('[data-action="toggle-fitbase-pro"]');
    if (fitbaseProToggle) {
      window.AppState.setFitbasePro(state, !state.fitbasePro);
      rerenderLeftAndRight();
      return;
    }

    const franchiseToggle = e.target.closest('[data-action="toggle-franchise-mode"]');
    if (franchiseToggle) {
      window.AppState.setFranchiseMode(state, !state.franchiseMode);
      rerenderLeftAndRight();
      return;
    }

    const ukConsolidatedToggle = e.target.closest('[data-action="toggle-uk-consolidated-dashboard"]');
    if (ukConsolidatedToggle) {
      window.AppState.setUkConsolidatedDashboard(state, !state.ukConsolidatedDashboard);
      rerenderLeftAndRight();
      return;
    }

    const stepperBtn = e.target.closest("[data-action]");
    if (!stepperBtn) return;
    const action = stepperBtn.dataset.action;

    if (action === "set-custom-submode") {
      window.AppState.setCustomSubMode(state, stepperBtn.dataset.value);
      rerenderLeftAndRight();
      return;
    }
    if (action === "set-franchise-type") {
      window.AppState.setFranchiseType(state, stepperBtn.dataset.value);
      rerenderLeftAndRight();
      return;
    }

    if (action === "inc-integration") {
      window.AppState.setExtraIntegrationsCount(state, state.extraIntegrationsCount + 1);
      rerenderLeftAndRight();
    } else if (action === "dec-integration") {
      window.AppState.setExtraIntegrationsCount(state, state.extraIntegrationsCount - 1);
      rerenderLeftAndRight();
    } else if (action === "inc-studio") {
      window.AppState.setStudioCount(state, state.studioCount + 1);
      rerenderLeftAndRight();
    } else if (action === "dec-studio") {
      window.AppState.setStudioCount(state, state.studioCount - 1);
      rerenderLeftAndRight();
    } else if (action === "inc-franchise-integration") {
      window.AppState.setFranchiseIntegrationsCount(state, state.franchiseIntegrationsCount + 1);
      rerenderLeftAndRight();
    } else if (action === "dec-franchise-integration") {
      window.AppState.setFranchiseIntegrationsCount(state, state.franchiseIntegrationsCount - 1);
      rerenderLeftAndRight();
    } else if (action === "inc-custom-integration") {
      window.AppState.setCustomIntegrationsCount(state, state.customIntegrationsCount + 1);
      rerenderLeftAndRight();
    } else if (action === "dec-custom-integration") {
      window.AppState.setCustomIntegrationsCount(state, state.customIntegrationsCount - 1);
      rerenderLeftAndRight();
    } else if (action === "inc-uk-objects") {
      window.AppState.setUkConnectedObjectsCount(state, state.ukConnectedObjectsCount + 1);
      rerenderLeftAndRight();
    } else if (action === "dec-uk-objects") {
      window.AppState.setUkConnectedObjectsCount(state, state.ukConnectedObjectsCount - 1);
      rerenderLeftAndRight();
    }
  });

  // Левая колонка: ввод часов Install по ТЗ (Кастомизированный) — перерисовываем только правую
  // колонку, чтобы не терять фокус в поле при вводе.
  document.getElementById("left-column-body").addEventListener("input", (e) => {
    if (e.target && e.target.id === "custom-install-hours") {
      const value = parseInt(e.target.value, 10);
      window.AppState.setCustomInstallHours(state, Number.isNaN(value) ? 0 : value);
      rerenderRightOnly();
    }
  });

  // Правая колонка: степпер срока действия КП, копирование, PDF
  document.getElementById("right-column").addEventListener("click", (e) => {
    const stepperBtn = e.target.closest("[data-action]");
    if (stepperBtn) {
      const action = stepperBtn.dataset.action;
      if (action === "inc-validity") {
        window.AppState.setOfferValidityDays(state, state.offerValidityDays + 1);
        rerenderRightOnly();
      } else if (action === "dec-validity") {
        window.AppState.setOfferValidityDays(state, state.offerValidityDays - 1);
        rerenderRightOnly();
      }
      return;
    }

    if (e.target.closest("#copy-offer-btn")) {
      const btn = e.target.closest("#copy-offer-btn");
      const text = document.getElementById("offer-text").textContent;
      navigator.clipboard.writeText(text).then(() => {
        const original = btn.textContent;
        btn.textContent = "Скопировано!";
        setTimeout(() => {
          btn.textContent = original;
        }, 1500);
      });
      return;
    }

    if (e.target.closest("#pdf-offer-btn")) {
      window.PdfExport.exportOfferAsPdf();
    }
  });

  rerenderAll();
})();
