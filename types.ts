
export type ToneType = '种草风' | '专业风' | '随性风' | '科普风';
export type Platform = 'xiaohongshu' | 'wechat' | 'toutiao' | 'baijiahao' | 'sohu' | 'seo';

// Combined PostTypes for all platforms
export type PostType = 
  // Xiaohongshu
  | '种草' | '攻略' | '教程' | '分享' | '电商' | '测评' | '干货' 
  // Official Accounts / News
  | '深度观点' | '热点评论' | '行业资讯' | '情感故事' | '官方通告'
  // General / Other
  | '科普'
  | '行业干货' | '产品评测' | '技术教程' | 'Q&A问答' | '新闻资讯'
  | '任意';

export type WordCountType = '200字左右' | '300字左右' | '500字左右' | '800字左右' | '1000字以上' | '2000字以上' | '不限字数';

export interface GenerationOptions {
  quoteTitle: boolean;
  useEmoji: boolean;
  addHashtags: boolean;
  filterProhibited: boolean;
  filterMarketing: boolean;
  // SEO Specific
  industry?: string;
  brandName?: string;
  // Image Library
  images?: string[];
}

export interface GeneratedContent {
  title: string;
  body: string;
}

export interface PosterConfig {
  bgColor: string;
  textColor: string;
  fontFamily: 'sans' | 'serif' | 'mono' | 'cursive';
  fontSize: 'normal' | 'large' | 'huge';
  align: 'left' | 'center' | 'right';
  style: 'simple' | 'bold' | 'outline';
}

export interface Template {
  id: string;
  category: string;
  title: string;
  description: string;
  imageUrl: string;
  tags: string[];
}

export const TEMPLATES: Template[] = [
  {
    id: '1',
    category: '美妆护肤',
    title: '前后对比大变身',
    description: '展示戏剧性的转变结果。非常适合护肤品、清洁产品或装修对比。',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAO_BLF7UhmEUhwHDxtTeIxBHWHEfYe5mHbG3jyPWooESOS_h6xZgUOPxbt-Jv9jbfJUjB_Y91b3Sb70ovJQeQl9NczqpNmKgcnrCXkbT9QK8Knujopz3PWwaXjDFDKviGbkWUZaiNfHzN7WqoVZ151MHT0FZVikqgOknohV3-w34mWAtHZhPW4dyMovQh_12vJUOG4skkIU38ZfthyLtRe70aLiC_sEJtfTE0xx3zcgp-MaXoF0hxLmFT5cLlNVqO4ASJKSokW6zA',
    tags: ['高转化']
  },
  {
    id: '2',
    category: '通用',
    title: '反向观点大揭秘',
    description: '通过发表与热门话题相反的观点来引发大量互动。非常适合评论区讨论。',
    imageUrl: 'https://placehold.co/600x400/indigo/white?text=Question',
    tags: ['争议性']
  },
  {
    id: '3',
    category: '知识科普',
    title: '避雷指南：3个常见错误',
    description: '触发错失恐惧症的科普结构。“你是否也在犯这些错误？”',
    imageUrl: 'https://placehold.co/600x400/orange/white?text=Warning',
    tags: ['紧迫感']
  },
  {
    id: '4',
    category: '生活方式',
    title: '沉浸式Vlog：我的一天',
    description: '引起共鸣的故事叙述格式。非常适合建立个人联系并在场景中展示产品。',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCPdps7dyun_VZO_S-aPn0ed7AIXJXK72soJrGbKyXGIWs8nMwzbBCoR1ak0d6_CPzreptONxa-SWXWzg_pdp-L5LVI2IPc0HFGEfl1cNoZdJMFidjhlmiMlODzDU5rmDIEEgEYPU37w0p_TGnG4iWspmcu-txwxyecsjx9p9Yv9lk7mzeQv77I_PVbo6XhGavqv0y99CB9seTC-lK7a0JNwbuiamKj5ryUi3eBBGBEyPUxqC4UXfDWXtiBrYpTj237kusqNbPT9cU',
    tags: ['故事感']
  },
  {
    id: '5',
    category: '数码科技',
    title: '硬核数码真实测评',
    description: '优缺点列表布局。通过对新设备的客观分析建立信任。',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCCsBhTB3053BBkhFyjPkWy2pFt-ufT0rPZVDERmmd6gAKw0GynRNWHinrmWnwaiSV_bL5LGhovk5CU9Ymt77rtMVyVv-hFJE2km2rYIF47SB-aoEexua7xNa4aHhZMBajezPCOVh30PH2Z48fbQRFMbyd4-Q49QRtGc50q5eI7KP448TfwUQqmJOWxlLU9V4uDP2nsV7VIaxY8vDxOWF7Geawouo5qKWAp6U1sgiWpjePEWKP_qnuZSBzICnQL4TItxng90MTgWWI',
    tags: ['测评']
  },
  {
    id: '6',
    category: '旅游',
    title: '本地人私藏的小众景点',
    description: '适合分享5-10个非游客陷阱的必去景点图文轮播。',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAb3gABG3E1xx3Jd3f_9vtZuANNAekcXj7_clQgK6FpicL_mhaTa7A_BiFDI05dH86Y1e4NIFDOr4IGDbvatf8RZU43FNgUBEDA1tIBD5mMFt4_iy4aMdvED8NNX9TxLIdakDKCqAQ41uVE8V-La9aQwIW78Z9WZkAdYKBUyLZoGHx2VrSBNi9iM38RUYhhKq7vICqxSyfST71_09wtLOx1KhLZIyKSfYZ--xDoySI6h04_UfUIwiqDxCgYZVyEw6xXgv89J1c4oZ0',
    tags: ['攻略']
  }
];