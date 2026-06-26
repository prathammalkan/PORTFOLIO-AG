import { projectsData } from '@/lib/projectsData';
import { writingData } from '@/lib/writingData';

export default function sitemap() {
  const baseUrl = 'https://prathammalkan.com';

  const workRoutes = Object.keys(projectsData).map((slug) => ({
    url: `${baseUrl}/work/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  const writingRoutes = writingData.map((article) => ({
    url: `${baseUrl}/writing/${article.slug}`,
    lastModified: new Date(article.date),
    changeFrequency: 'never',
    priority: 0.7,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/writing`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    ...workRoutes,
    ...writingRoutes,
  ];
}
