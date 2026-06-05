import { proxy } from 'valtio/vanilla'
import _ from 'lodash'
import watch from './view.js'
import { makeSchema } from './validation.js'
import { renderStaticTexts } from './initHtml.js'
import { buildProxyUrl, parseRSS } from './rss.js'
import { updatePosts } from './updater.js'
import i18next from 'i18next'
import resources from './locales/index'
import axios from 'axios'

const validate = (task, feeds) => {
  const addedUrls = feeds.map(feed => feed.url)
  const schema = makeSchema(addedUrls)
  return schema.validate(task, { abortEarly: false })
}

const parseValidationErrors = (err) => {
  const errorsByPath = _.keyBy(err.inner, 'path')
  return _.mapValues(errorsByPath, errorItem => errorItem.message.key)
}

const app = () => {
  const defaultLang = 'ru'
  const i18n = i18next.createInstance()
  i18n.init({
    lng: defaultLang,
    debug: false,
    resources,
  })
    .then(() => {
      renderStaticTexts(i18n)
      const state = proxy({
        feeds: [],
        uiState: {
          activePost: null,
        },
        form: {
          status: null, // filling, submitting, validated, invalid
          errors: {},
          message: null,
        },
        loadingProcess: {
          status: 'updated',
          error: null,
        },
      })

      const elements = {
        form: document.getElementById('rss-form'),
        input: document.getElementById('rss-input'),
        errorContainer: document.getElementById('error-msg'),
        submit: document.getElementById('rss-submit'),
        outputField: document.getElementById('outputField'),
        modal: document.getElementById('modal'),
      }

      watch(elements, state, i18n)

      elements.input.addEventListener('focus', () => {
        state.form.status = 'filling'
      })

      elements.form.addEventListener('submit', (e) => {
        e.preventDefault()
        const formData = new FormData(e.target)
        const rssUrl = Object.fromEntries(formData)
        state.form.status = 'submitting'
        state.form.message = null
        state.loadingProcess.status = 'loading'
        state.loadingProcess.error = null

        validate(rssUrl, state.feeds)
          .then(() => axios.get(buildProxyUrl(rssUrl.rss)))
          .then((response) => {
            const { contents } = response.data
            if (contents === null) {
              throw new Error('network_error')
            }
            return parseRSS(contents)
          })
          .then((parsedData) => {
            parsedData.url = rssUrl.rss
            state.feeds.push((parsedData))
            state.loadingProcess.status = 'updated'
            state.form.message = 'validation.valid'
            state.form.status = 'validated'
          })
          .catch((err) => {
            if (err.name === 'ValidationError') {
              state.form.status = 'invalid'
              state.form.errors = parseValidationErrors(err)
              state.form.message = Object.values(state.form.errors)[0]
            }
            else if (err.name === 'ParsingError' || err.message === 'invalid_rss') {
              state.loadingProcess.status = 'failed'
              state.loadingProcess.error = 'validation.errors.invalidRss'
              state.form.status = 'invalid'
              state.form.message = 'validation.errors.invalidRss'
            }
            else {
              state.loadingProcess.status = 'failed'
              state.loadingProcess.error = 'validation.errors.network'
              state.form.status = 'failed'
              state.form.message = 'validation.errors.network'
            }
          })
      })

      elements.input.addEventListener('input', () => {
        state.form.status = 'filling'
      })

      updatePosts(state)

      elements.outputField.addEventListener('click', (e) => {
        const target = e.target.closest('[data-id]')
        if (!target) return
        const postId = target.dataset.id
        state.feeds.forEach((feed) => {
          const currentPost = feed.posts.find(feedPost => feedPost.id === postId)
          if (currentPost) {
            currentPost.visited = true
            state.uiState.activePost = { ...currentPost }
          }
        })
      })

      elements.modal.addEventListener('hidden.bs.modal', () => {
        state.uiState.activePost = null
      })
    })
}

export default app
