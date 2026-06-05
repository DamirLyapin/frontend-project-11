import _ from 'lodash'

const buildProxyUrl = (url) => {
  const proxyUrl = new URL('/get', 'https://allorigins.hexlet.app/')
  proxyUrl.searchParams.set('disableCache', 'true')
  proxyUrl.searchParams.set('url', url)
  return proxyUrl.toString()
}

const parseRSS = (xmlText) => {
  const parser = new DOMParser()
  const xmlDoc = parser.parseFromString(xmlText, 'text/xml')
  const errorNode = xmlDoc.querySelector('parsererror')
  const isRss = xmlDoc.querySelector('rss, feed, channel')
  if (!isRss || errorNode) {
    const error = new Error('invalid_rss')
    error.name = 'ParsingError'
    throw error
  }
  const feed = {}
  feed.feedId = _.uniqueId()
  feed.feedTitle = xmlDoc.querySelector('title').textContent
  feed.feedDescription = xmlDoc.querySelector('description').textContent
  feed.posts = Array.from(xmlDoc.querySelectorAll('item'), item => ({
    id: `post_${_.uniqueId()}`,
    title: item.querySelector('title')?.textContent,
    link: item.querySelector('link')?.textContent,
    description: item.querySelector('description')?.textContent,
    pubDate: Date.parse(item.querySelector('pubDate')?.textContent || ''),
    visited: false,
  }))
  return feed
}

export { buildProxyUrl, parseRSS }
