import { config as BLOG } from '@/lib/server/config'

import { idToUuid } from 'notion-utils'
import dayjs from 'dayjs'
import api from '@/lib/server/notion-api'
import getAllPageIds from './getAllPageIds'
import getPageProperties from './getPageProperties'
import filterPublishedPosts from './filterPublishedPosts'

// 加载手动文章配置
let manualPostsConfig = { useManualPosts: false, manualPostIds: [] };
try {
  manualPostsConfig = require('@/posts.config.js');
} catch (e) {
  // 配置文件不存在，使用默认值
}

/**
 * @param {{ includePages: boolean }} - false: posts only / true: include pages
 */
export async function getAllPosts ({ includePages = false }) {
  const id = idToUuid(process.env.NOTION_PAGE_ID)

  let response;
  try {
    response = await api.getPage(id);
  } catch (error) {
    console.error('Failed to fetch Notion page:', error.message);
    console.error('Please check:');
    console.error('1. NOTION_PAGE_ID is correct in your .env file');
    console.error('2. Notion database is accessible');
    console.error('3. NOTION_ACCESS_TOKEN is valid (if using private database)');
    console.error('4. Network connection is stable');
    return [];
  }

  if (!response || !response.block || !response.collection) {
    console.error('Invalid response from Notion API');
    return [];
  }

  const collection = Object.values(response.collection)[0]?.value
  const collectionId = Object.keys(response.collection)[0]
  const collectionQuery = response.collection_query
  const block = response.block
  const schema = collection?.schema

  if (!block[id]) {
    console.error(`Block ${id} not found in response`);
    return [];
  }

  const rawMetadata = block[id].value

  // Check Type
  if (
    rawMetadata?.type !== 'collection_view_page' &&
    rawMetadata?.type !== 'collection_view'
  ) {
    console.log(`pageId "${id}" is not a database`)
    return null
  } else {
    // Construct Data
    let pageIds = getAllPageIds(collectionQuery, rawMetadata?.view_ids?.[0]);

    // Fallback: 如果 collection_query 为空（530 错误），尝试其他方法获取页面
    if (!pageIds || pageIds.length === 0) {
      console.warn('collection_query is empty, trying fallback methods');

      // Fallback 1: 使用手动配置的文章 ID
      if (manualPostsConfig.useManualPosts && manualPostsConfig.manualPostIds.length > 0) {
        console.log('Using manually configured post IDs');
        pageIds = manualPostsConfig.manualPostIds.map(id => idToUuid(id));
        console.log(`Found ${pageIds.length} posts from manual configuration`);
      }
      // Fallback 2: 从 block 中提取
      else {
        console.log('Attempting to extract page IDs from blocks');
        pageIds = Object.keys(block).filter(key => {
          const blockValue = block[key]?.value;
          return blockValue?.type === 'page' &&
            blockValue?.parent_table === 'collection' &&
            blockValue?.parent_id === collectionId;
        });
        console.log(`Found ${pageIds.length} pages from blocks`);
      }

      // Fallback 3: 如果还是找不到，尝试获取所有 page 类型的 block
      if (pageIds.length === 0) {
        console.log('Still no pages found, trying to get all page blocks');
        pageIds = Object.keys(block).filter(key => {
          const blockValue = block[key]?.value;
          return blockValue?.type === 'page' && blockValue?.parent_table === 'collection';
        });
        console.log(`Found ${pageIds.length} page blocks in total`);
      }
    }

    const data = []
    for (let i = 0; i < pageIds.length; i++) {
      const id = pageIds[i]

      // 如果 block 中没有这个页面的数据，尝试直接获取
      if (!block[id] && manualPostsConfig.useManualPosts) {
        try {
          console.log(`Fetching page ${id} directly from API`);
          const pageData = await api.getPage(id);
          // 将获取的数据合并到 block 中
          if (pageData.block) {
            Object.assign(block, pageData.block);
          }
        } catch (error) {
          console.warn(`Failed to fetch page ${id}:`, error.message);
          continue;
        }
      }

      const properties = (await getPageProperties(id, block, schema)) || null

      if (properties) {
        // Add fullwidth to properties
        properties.fullWidth = block[id]?.value?.format?.page_full_width ?? false;
        // Convert date (with timezone) to unix milliseconds timestamp
        properties.date = (
          properties.date?.start_date
            ? dayjs.tz(properties.date?.start_date)
            : dayjs(block[id]?.value?.created_time)
        ).valueOf()

        data.push(properties)
      }
    }

    // remove all the the items doesn't meet requirements
    const posts = filterPublishedPosts({ posts: data, includePages })

    // Sort by date
    if (BLOG.sortByDate) {
      posts.sort((a, b) => b.date - a.date)
    }

    console.log(`Returning ${posts.length} posts after filtering`)
    return posts
  }
}
