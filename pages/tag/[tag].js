import { getAllPosts, getAllTagsFromPosts } from '@/lib/notion'
import SearchLayout from '@/layouts/search'

export default function Tag ({ tags, posts, currentTag }) {
  return <SearchLayout tags={tags} posts={posts} currentTag={currentTag} />
}

export async function getStaticProps ({ params }) {
  try {
    const currentTag = params.tag
    const posts = await getAllPosts({ includePages: false }) || [];
    const tags = getAllTagsFromPosts(posts);
    const filteredPosts = posts.filter(
      post => post && post.tags && post.tags.includes(currentTag)
    );
    return {
      props: {
        tags,
        posts: filteredPosts,
        currentTag
      },
      revalidate: 1
    }
  } catch (error) {
    console.error('getStaticProps error:', error.message);
    return {
      props: {
        tags: {},
        posts: [],
        currentTag: params.tag
      },
      revalidate: 1
    };
  }
}

export async function getStaticPaths () {
  try {
    const posts = await getAllPosts({ includePages: false }) || [];
    const tags = getAllTagsFromPosts(posts);
    return {
      paths: Object.keys(tags).map(tag => ({ params: { tag } })),
      fallback: true
    };
  } catch (error) {
    console.warn('getStaticPaths error:', error.message);
    return {
      paths: [],
      fallback: true
    }
  }
}
