import { snapshot, subscribe } from 'valtio/vanilla'

const renderMessage = (messageKey, snapshotState, elements, i18n) => {
  const { input, errorContainer } = elements
  if (!messageKey) {
    errorContainer.textContent = ''
    return
  }
  const isError = ['invalid', 'failed'].includes(snapshotState.form.status)
  input.classList.toggle('is-invalid', isError)
  errorContainer.classList.toggle('text-danger', isError)
  errorContainer.classList.toggle('text-success', !isError)
  errorContainer.textContent = i18n.t(messageKey)
}

const renderLists = (snapshotState, elements, i18n) => {
  const { outputField } = elements
  outputField.innerHTML = ''
  const postsListTitle = i18n.t('postsList')
  const feedsListTitle = i18n.t('feedsList')
  const feeds = snapshotState.feeds || []
  const allPosts = feeds.flatMap(feed => feed.posts || [])
  const sortedPosts = [...allPosts].sort((a, b) => b.pubDate - a.pubDate)

  const postsListBody = sortedPosts
    .map((post) => {
      const linkClass = post.visited ? 'fw-normal link-secondary' : 'fw-bold'
      return `<li class="list-group-item d-flex flex-row justify-content-between align-items-center border-0">
      <a href="${post.link}" class="${linkClass}" data-id="${post.id}">${post.title}</a>
      <button type="button" class="btn btn-outline-primary btn-sm flex-shrink-0 ms-auto" data-id="${post.id}" data-bs-toggle="modal" data-bs-target="#modal">${i18n.t('previewButton')}</button>
      </li>`
    })
    .join('')
  const feedsListBody = feeds.map(feed => `<li class="list-group-item border-0">
      <h3 class="h6 m-0">${feed.feedTitle}</h3>
      <p class="text-secondary mt-2 mb-0 small">${feed.feedDescription}</p></li>`).join('')
  const div = document.createElement('div')
  div.classList.add('row')
  const divPosts = document.createElement('div')
  divPosts.classList.add('col-md-8')
  const divFeeds = document.createElement('div')
  divFeeds.classList.add('col-md-4')
  const ulPosts = document.createElement('ul')
  ulPosts.classList.add('list-group', 'list-group-flush', 'posts')
  const ulFeeds = document.createElement('ul')
  ulFeeds.classList.add('list-group', 'list-group-flush', 'feeds')
  ulPosts.innerHTML = postsListBody
  ulFeeds.innerHTML = feedsListBody
  const h4posts = document.createElement('h4')
  const h4feeds = document.createElement('h4')
  h4posts.classList.add('m-3')
  h4feeds.classList.add('m-3')
  h4posts.textContent = postsListTitle
  h4feeds.textContent = feedsListTitle
  divPosts.append(h4posts, ulPosts)
  divFeeds.append(h4feeds, ulFeeds)
  div.append(divPosts, divFeeds)
  outputField.append(div)
}

const handleProcessState = (elements, process) => {
  switch (process) {
    case null:
      break
    case 'filling':
      elements.input.disabled = false
      elements.submit.disabled = false
      elements.submit.classList.remove('btn-secondary')
      elements.submit.classList.add('btn-primary')
      elements.errorContainer.textContent = ''
      elements.errorContainer.classList.remove('text-success', 'text-danger')
      elements.input.classList.remove('is-invalid')
      break

    case 'submitting':
      elements.submit.disabled = true
      elements.input.disabled = true
      break

    case 'invalid':
      elements.input.disabled = false
      elements.submit.disabled = false
      break

    case 'validated':
      elements.form.reset()
      elements.input.focus()
      elements.input.disabled = false
      elements.submit.disabled = false
      elements.input.classList.remove('is-invalid')
      break

    case 'failed':
      elements.input.disabled = false
      elements.submit.disabled = false
      break

    default:
      throw new Error(`Unknown process ${process}`)
  }
}

const renderModal = (post, snapshotState, elements) => {
  if (!post) return
  const { modal, outputField } = elements
  const modalTitle = modal.querySelector('#modal-title')
  const modalContent = modal.querySelector('#modal-content')
  const modalReadBtn = modal.querySelector('#modal-read')
  modalTitle.textContent = post.title
  modalContent.textContent = post.description
  modalReadBtn.setAttribute('href', post.link)
  const targetLink = outputField.querySelector(`a[data-id="${post.id}"]`)
  if (targetLink) {
    targetLink.classList.remove('fw-bold')
    targetLink.classList.add('fw-normal', 'link-secondary')
  }
}

const watch = (elements, state, i18n) => {
  const render = (path, value, currentSnapshot) => {
    switch (path) {
      case 'form.status':
        handleProcessState(elements, value)
        break
      case 'form.message':
        renderMessage(value, currentSnapshot, elements, i18n)
        break
      case 'feeds':
        renderLists(currentSnapshot, elements, i18n)
        break
      case 'loadingProcess.error':
        renderMessage(value, currentSnapshot, elements, i18n)
        break
      case 'state.uiState.activePost':
        renderModal(value, currentSnapshot, elements)
        break
      default:
        break
    }
  }

  let prevForm = snapshot(state.form)

  subscribe(state.form, () => {
    const current = snapshot(state.form)
    const currentFullState = snapshot(state)
    Object.keys(current).forEach((key) => {
      if (current[key] !== prevForm[key]) {
        render(`form.${key}`, current[key], currentFullState)
      }
    })
    prevForm = current
  })

  subscribe(state.feeds, () => {
    render('feeds', null, snapshot(state))
  })

  subscribe(state.loadingProcess, () => {
    render('loadingProcess.error', snapshot(state.loadingProcess).error, snapshot(state))
  })

  subscribe(state.uiState, () => {
    const uiSnapshot = snapshot(state.uiState)
    render('state.uiState.activePost', uiSnapshot.activePost, snapshot(state))
  })
}

export default watch
