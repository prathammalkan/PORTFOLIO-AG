import { notFound } from 'next/navigation';
import { projectsData } from '@/lib/projectsData';
import CaseStudyClient from './CaseStudyClient';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const project = projectsData[slug];
  
  if (!project) return { title: 'Project Not Found' };
  
  return {
    title: `${project.name} — Pratham Malkan Case Study`,
    description: project.sections.overview.substring(0, 160) + '...',
    openGraph: {
      title: `${project.name} Case Study`,
      description: project.tagline,
    }
  };
}

export function generateStaticParams() {
  return Object.keys(projectsData).map((slug) => ({
    slug,
  }));
}

export default async function CaseStudyPage({ params }) {
  const { slug } = await params;
  const project = projectsData[slug];

  if (!project) {
    notFound();
  }

  return <CaseStudyClient project={project} />;
}
