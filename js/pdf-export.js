// Экспорт карточки "Коммерческое предложение" в PDF через системный диалог печати браузера.
// Без внешних библиотек — работает офлайн, кнопка "Скачать PDF" открывает диалог печати
// с опцией "Сохранить как PDF".

function exportOfferAsPdf() {
  document.body.classList.add("printing-offer");
  const cleanup = () => {
    document.body.classList.remove("printing-offer");
    window.removeEventListener("afterprint", cleanup);
  };
  window.addEventListener("afterprint", cleanup);
  window.print();
}

window.PdfExport = { exportOfferAsPdf };
