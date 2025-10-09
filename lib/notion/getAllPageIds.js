import { idToUuid } from 'notion-utils'
export default function getAllPageIds (collectionQuery, viewId) {
  // 检查 collectionQuery 是否有效
  if (!collectionQuery || typeof collectionQuery !== 'object') {
    console.warn('collectionQuery is invalid:', collectionQuery);
    return [];
  }

  const views = Object.values(collectionQuery)[0]

  // 检查 views 是否有效
  if (!views || typeof views !== 'object') {
    console.warn('views is invalid:', views);
    return [];
  }

  let pageIds = []
  if (viewId) {
    const vId = idToUuid(viewId)
    pageIds = views[vId]?.blockIds || []
  } else {
    const pageSet = new Set()
    Object.values(views).forEach(view => {
      view?.collection_group_results?.blockIds?.forEach(id => pageSet.add(id))
    })
    pageIds = [...pageSet]
  }
  return pageIds
}
