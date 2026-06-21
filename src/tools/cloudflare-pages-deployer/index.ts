import { Cloud } from '@vicons/tabler';
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
