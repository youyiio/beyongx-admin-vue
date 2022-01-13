import defaultSettings from '@/settings'

const title = defaultSettings.title || process.env.VUE_APP_NAME

export default function getPageTitle(pageTitle) {
  if (pageTitle) {
    return `${pageTitle} - ${title}`
  }
  return `${title}`
}
