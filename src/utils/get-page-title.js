import defaultSettings from '@/settings'

const title = defaultSettings.title || 'Beyongx通用后台管理平台'

export default function getPageTitle(pageTitle) {
  if (pageTitle) {
    return `${pageTitle} - ${title}`
  }
  return `${title}`
}
