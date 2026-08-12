// OwlByte 品牌常量数据
// 所有静态内容集中管理，便于后续维护与扩展

export type NavItem = {
  label: string;
  href: string;
  index: string; // 序号用于装饰
};

export type Capability = {
  id: string;
  index: string;
  title: string;
  subtitle: string;
  description: string;
  glyph: 'eye' | 'caliper' | 'shield';
  accent: 'amber' | 'moon' | 'parchment';
};

export type Product = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  href: string;
  status: 'GA' | 'BETA' | 'PREVIEW';
  span: 'tall' | 'wide' | 'regular'; // 非对称网格布局
  accent: 'amber' | 'moon';
  symbol: string; // 短代号字符
};

export type Watchman = {
  id: string;
  name: string;
  code: string; // 代号
  roleLabel: string;
  accent: 'amber' | 'moon' | 'parchment';
  description: string;
  href: string;
  roles: string[];
  inDevProjects: string[];
  avatar?: string; // public 路径
  quote: string;
};

export type Social = {
  label: string;
  handle: string;
  href: string;
};

export type Stat = {
  value: number;
  suffix: string;
  label: string;
};

export const NAV_ITEMS: NavItem[] = [
  { label: '观察', href: '#manifesto', index: '01' },
  { label: '能力', href: '#capabilities', index: '02' },
  { label: '作品', href: '#products', index: '03' },
  { label: '群落', href: '#community', index: '04' },
];

export const CAPABILITIES: Capability[] = [
  {
    id: 'insight',
    index: 'I',
    title: '洞察',
    subtitle: 'Insight',
    description: '在数据洪流中辨识真正有价值的信号。我们以夜行者的耐心与精度，过滤瞬时噪音，留下可被信任的真相。',
    glyph: 'eye',
    accent: 'amber',
  },
  {
    id: 'precision',
    index: 'II',
    title: '精度',
    subtitle: 'Precision',
    description: '每一字节都经过反复校准。从架构到交互，我们拒绝"差不多"——工程之美藏在 0.5px 的对齐与 12ms 的响应曲线里。',
    glyph: 'caliper',
    accent: 'moon',
  },
  {
    id: 'guard',
    index: 'III',
    title: '守护',
    subtitle: 'Custody',
    description: '你的数据、你的注意力、你的时间——都是我们守护的对象。无追踪、无噪声、无暗箱，只有可审计的克制。',
    glyph: 'shield',
    accent: 'parchment',
  },
];

export const PRODUCTS: Product[] = [
  {
    id: 'observatory',
    name: 'Observatory',
    tagline: '数据观测台',
    description: '为工程师打造的多源数据观测与异常感知系统。统一接入、低延迟流式处理、可组合的告警管线。',
    href: '#',
    status: 'GA',
    span: 'tall',
    accent: 'amber',
    symbol: 'Ob',
  },
  {
    id: 'lumen',
    name: 'Lumen',
    tagline: '夜间专注引擎',
    description: '基于行为建模的专注力调度器。在你最敏锐的时段打开灯，在最深的夜里收束噪声。',
    href: '#',
    status: 'BETA',
    span: 'regular',
    accent: 'moon',
    symbol: 'Lu',
  },
  {
    id: 'parchment',
    name: 'Parchment',
    tagline: '可信赖的发布平台',
    description: '为技术写作与长内容设计的发布系统。版本化、可引用、永久存档——为思想留下羊皮纸般的耐久载体。',
    href: '#',
    status: 'GA',
    span: 'wide',
    accent: 'amber',
    symbol: 'Pa',
  },
  {
    id: 'opencdk',
    name: 'OpenCDK',
    tagline: '工具链调度器',
    description: '为工程师打造的多语言工具链调度器。纯 C 编写，零依赖，清华镜像加速——在最深的夜里，一键点亮十四种语言的工具链。',
    href: '/project/opencdk',
    status: 'GA',
    span: 'regular',
    accent: 'moon',
    symbol: 'OC',
  },
];

export const WATCHMEN: Watchman[] = [
  {
    id: 'hedwig',
    name: 'Hedwig',
    code: 'HEDWIG · 01',
    roleLabel: 'night-keeper',
    accent: 'amber',
    description: 'OwlByte 几乎所有项目（游戏除外）均由 Hedwig 独立完成全栈开发——从第一行代码到最后一像素的打磨，在最深的夜里由他亲手点亮。',
    href: '/watchman/hedwig',
    roles: ['首席开发者', '核心创始人之一', '工作室主理人', '工作室顶梁柱'],
    inDevProjects: [
      'Assembly Coder',
      'Bitlang',
      'codechat',
      'LE',
      'Mandel',
      'OpenCDK',
      'openHDK',
      'openRender',
      'Owl Craft Luncher',
      'OwlOS',
      'SuyuanAI',
    ],
    avatar: '/assets/Night_Watchman/Hedwig.png',
    quote: '一个人就是一支夜间工程队伍。',
  },
];

export const SOCIALS: Social[] = [
  { label: 'GitHub', handle: '@Hedwig207', href: 'https://github.com/Hedwig207' },
  { label: 'Discussions', handle: 'community', href: 'https://github.com/orgs/community/discussions/' },
  { label: 'Email', handle: 'hedwig38@163.com', href: 'mailto:hedwig38@163.com' },
];

export const STATS: Stat[] = [
  { value: 18420, suffix: '+', label: '社区观察者' },
  { value: 4, suffix: '', label: '在制作品' },
  { value: 99, suffix: '.9%', label: '夜间可用率' },
];

// 二进制装饰流文本
export const BINARY_LINES = [
  '01101110 01101001 01100111 01101000 01110100',
  '01001111 01110111 01101100 01000010 01111001',
  '01110100 01100101 00100000 01100001 01101110',
  '01100100 00100000 01110011 01101001 01100111',
  '01101000 01110100 00100000 01101001 01101110',
  '01110100 01101111 00100000 01110100 01101000',
  '01100101 00100000 01100100 01100001 01110100',
  '01100001 00100000 01100110 01101100 01101111',
];
