import { getAllPosts, getAllTagsFromPosts } from '@/lib/notion'
import SearchLayout from '@/layouts/search'

export default function search ({ tags, posts }) {
  return <SearchLayout tags={tags} posts={posts} />
}
export async function getStaticProps () {
  try {
    const posts = await getAllPosts({ includePages: false }) || [];
    const tags = getAllTagsFromPosts(posts);
    return {
      props: {
        tags,
        posts
      },
      revalidate: 1
    };
  } catch (error) {
    console.error('getStaticProps error:', error.message);
    return {
      props: {
        tags: {},
        posts: []
      },
      revalidate: 1
    }
  }
}
