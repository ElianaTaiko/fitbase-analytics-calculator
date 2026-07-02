(function () {
  const config = window.PRICING_CONFIG;
  const state = window.AppState.createInitialState(config);

  function rerenderAll() {
    window.Render.renderAll(state, config);
  }
  function rerenderLeftAndRight() {
    window.Render.renderLeftColumn(state, config);
    window.Render.renderRightColumn(state, config);
  }
  function rerenderRightOnly() {
    window.Render.renderRightColumn(state, config);
  }

  // Переключатель тарифов
  document.getElementById("tariff-switcher-slot").addEventListener("click", (e) => {
    const card = e.target.closest("[data-tariff-id]");
    if (!card) return;
    window.AppState.selectTariff(state, config, card.dataset.tariffId);
    rerenderAll();
  });

  // Левая колонка: клики (дашборды, чекбокс Fitbase PRO, степперы, переключатели режимов)
  document.getElementById("left-column-body").addEventListener("click", (e) => {
    const dashCard = e.target.closest("[data-dashboard-id]");
    if (dashCard) {
      const tariff = window.Calculators.getTariff(config, state.tariffId);
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
