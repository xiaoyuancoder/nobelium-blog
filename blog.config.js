const BLOG = {
  title: '拾光-分享技术、生活、思考',
  author: '拾光',
  email: 'i@craigary.net',
  link: 'https://nobelium.vercel.app',
  description: '分享技术、生活、思考',
  lang: 'zh-CN', // ['en-US', 'zh-CN', 'zh-HK', 'zh-TW', 'ja-JP', 'es-ES']
  timezone: 'Asia/Shanghai', // Notion 文章的日期将按此时区解析。更多选项见 https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
  appearance: 'auto', // ['light', 'dark', 'auto']
  font: 'sans-serif', // ['sans-serif', 'serif']
  lightBackground: '#ffffff', // 使用十六进制颜色，别忘了加 '#'，例如 #fffefc
  darkBackground: '#18181B', // 使用十六进制颜色，别忘了加 '#'
  path: '', // 若部署在子路径下才需要填写，否则留空
  since: 2025, // 留空则默认当前年份
  postsPerPage: 7,
  sortByDate: false,
  showAbout: true,
  showArchive: true,
  autoCollapsedNavBar: false, // 自动折叠导航栏
  ogImageGenerateURL: 'https://og-image-craigary.vercel.app', // 生成 OG 图片的服务地址，末尾不要加斜杠
  socialLink: 'https://www.picktimehub.cn/',
  seo: {
    keywords: ['拾光', '拾光博客', '技术', '生活', '思考'],
    googleSiteVerification: '' // 留空或替换为你的 Google 站点验证代码
  },
  notionPageId: process.env.NOTION_PAGE_ID, // 不要修改此项！！！
  notionAccessToken: process.env.NOTION_ACCESS_TOKEN, // 如果不想公开 Notion 数据库，可以在此填入访问令牌
  analytics: {
    provider: '', // 目前支持 Google Analytics 与 Ackee，填 'ga' 或 'ackee'，留空则禁用
    ackeeConfig: {
      tracker: '', // 例如 'https://ackee.craigary.net/tracker.js'
      dataAckeeServer: '', // 例如 https://ackee.craigary.net ，末尾不要加斜杠
      domainId: '' // 例如 '0e2257a8-54d4-4847-91a1-0311ea48cc7b'
    },
    gaConfig: {
      measurementId: '' // 例如：G-XXXXXXXXXX
    }
  },
  comment: {
    // 支持的评论提供方：gitalk、utterances、cusdis
    provider: '', // 不需要评论功能则留空
    gitalkConfig: {
      repo: '', // 用于存储评论的仓库
      owner: '',
      admin: [],
      clientID: '',
      clientSecret: '',
      distractionFreeMode: false
    },
    utterancesConfig: {
      repo: ''
    },
    cusdisConfig: {
      appId: '', // 对应 data-app-id
      host: 'https://cusdis.com', // 对应 data-host；自建时改为你的域名
      scriptSrc: 'https://cusdis.com/js/cusdis.es.js' // 自建时替换为你的脚本地址
    }
  },
  isProd: process.env.VERCEL_ENV === 'production' // 区分开发与生产环境（参考：https://vercel.com/docs/environment-variables#system-environment-variables）
}
// export default BLOG
module.exports = BLOG
