import * as yup from 'yup'
import i18next from 'i18next';
import { proxy, subscribe, snapshot } from 'valtio/vanilla'

i18next.init({
  lng: 'ru',
  resources: {
    ru: {
      translation: {
        errors: {
          required: 'Не должно быть пустым',
          url: 'Ссылка должна быть валидным URL',
          duplicate: 'RSS уже существует'
        },
        ui: {
          label: 'Ссылка RSS',
          button: 'Добавить',
          example: 'Пример: https://lorem-rss.hexlet.app/feed'
        }
      }
    }
  }
});

yup.setLocale({
  string: {
    required: i18next.t('errors.required'),
    url: i18next.t('errors.url')
  }
});

const schema = yup.object().shape({
    url: yup.string().required('Не должно быть пустым').url('Ссылка должна быть валидным URL')
})

const createValidator = (existingUrls) => (url) => {
    return schema.validate({ url }, { abortEarly: false })
        .then(() => {
            if (existingUrls.includes(url)) {
                return { error: 'RSS уже существует', isValid: false }
            }
            return { error: null, isValid: true}
        })
        .catch((e) => {
            const error = e.error?.[0] || 'Ссылка должна быть валидным URL'
            return { error, isValid: false }
        })
}

const state = proxy({
    urls: [],
    currentUrl: '',
    error: ''
})

const form = document.getElementById('rssForm')
const input = document.getElementById('rssUrl')
const feedbackDiv = document.getElementById('url=feedback')

export default () => {
    const updateUi = () => {
        if (!input) return
        if (state.error) {
            input.classList.add('is-invalid')
            if (feedbackDiv) {
                feedbackDiv.textContent = state.error
            }
        } else {
            input.classList.remove('is-invalid')
            if (feedbackDiv) {
                feedbackDiv.textContent = ''
            }
        }
    }

    const addUrl = (url) => {
        const validator = createValidator(state.urls)

        return validator(url).then(({ error, isValid }) => {
            if (isValid) {
                state.urls.push(url)
                state.currentUrl = ''
                state.error = ''
                if (input) {
                    input.value = ''
                    input.focus()
                }
            } else {
                state.error = error
                if (input) {
                    input.focus()
                }
            }
        })
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        const url = state.currentUrl.trim()
        if (!url) {
            state.error = 'Не должно быть пустым'
            if (input) {
                input.classList.add('is-invalid')
                input.focus()
            }
            return
        }
        addUrl(url)
    }

    const handleInputChange = (e) => {
        const value = e.target.value
        state.currentUrl = value
        state.error = ''
    }

    subscribe(state, () => {
        updateUi()
    })

    form.addEventListener('submit', handleSubmit)
    input.addEventListener('input', handleInputChange)
    input.focus()
    updateUi()
}
