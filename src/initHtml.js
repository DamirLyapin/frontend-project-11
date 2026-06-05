export const renderStaticTexts = (i18n) => {
  const textElements = document.querySelectorAll('[data-i18n]')
  textElements.forEach((element) => {
    const translationKey = element.getAttribute('data-i18n')
    element.textContent = i18n.t(translationKey)
  })
}
