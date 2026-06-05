import { buildProxyUrl, parseRSS } from './rss.js'
import _ from 'lodash'
import axios from 'axios'

export const updatePosts = (state) => {
  const promises = state.feeds.map((feed) => {
    return axios.get(buildProxyUrl(feed.url))
      .then ((response) => {
        const { contents } = response.data
        if (contents === null) {
          throw new Error('network_error')
        }
        const updatedFeed = parseRSS(contents)
        const newPosts = _.differenceBy(updatedFeed.posts, feed.posts, 'link')
        if (newPosts.length > 0) {
          feed.posts = [...feed.posts, ...newPosts]
        }
      })
      .catch((err) => {
        console.error(`Ошибка обновления фида ${feed.url}:`, err.message)
      })
  })
  Promise.all(promises).finally(() => {
    setTimeout(() => updatePosts(state), 5000)
  })
}
