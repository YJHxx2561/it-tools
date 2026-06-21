import { Cloud } from '@vicons/ionicons5';
// 如果模块未安装，请先运行: npm install @vicons/ionicons5
// 或者使用替代图标方案
// import { Cloud } from '@vicons/carbon'; // 尝试使用其他图标库
// import { Cloud } from '@vicons/fa'; // 或者 FontAwesome 图标
// 或者使用 SVG 内联图标作为替代方案
import { defineTool } from '../tool';
import { translate as t } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: t('tools.cloudflare-pages-deployer.title'),
  path: '/cloudflare-pages-deployer',
  description: t('tools.cloudflare-pages-deployer.description'),
  keywords: ['cloudflare', 'pages', 'deploy', 'upload', 'static', 'hosting', 'deployment'],
  component: () => import('./cloudflare-pages-deployer.vue'),
  icon: Cloud,
  createdAt: new Date('2026-06-21'),
  category: 'Web',
});
