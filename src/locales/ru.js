export default {
  translation: {
    languages: {
      ru: 'Русский',
    },
    interface: {
      title: 'RSS агрегатор',
      subtitle: 'Начните читать RSS сегодня! Это легко, это красиво.',
      inputPlaceholderText: 'Ссылка RSS',
      addBtn: 'Добавить',
      example: 'Пример: https://lorem-rss.hexlet.app/feed',
    },
    validation: {
      errors: {
        required: 'Не должно быть пустым',
        notOneOf: 'RSS уже существует',
        validURL: 'Ссылка должна быть валидным URL',
        invalidRss: 'Ресурс не содержит валидный RSS',
        network: 'Ошибка сети',
      },
      valid: 'RSS успешно загружен',
    },
    postsList: 'Посты',
    feedsList: 'Фиды',
    previewButton: 'Просмотр',
    modal: {
      modalReadBtn: 'Читать полностью',
      modalCloseBtn: 'Закрыть',
    },
  },
}
