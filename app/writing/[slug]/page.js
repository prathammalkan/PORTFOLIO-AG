import { notFound } from 'next/navigation';
import Link from 'next/link';
import { writingData } from '@/lib/writingData';
import styles from './Article.module.css';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const article = writingData.find(a => a.slug === slug);
  
  if (!article) return { title: 'Article Not Found' };
  
  return {
    title: `${article.title} — Pratham Malkan`,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: 'article',
      publishedTime: article.date,
    }
  };
}

export function generateStaticParams() {
  return writingData.map((article) => ({
    slug: article.slug,
  }));
}

export default async function ArticlePage({ params }) {
  const { slug } = await params;
  const article = writingData.find(a => a.slug === slug);

  if (!article) {
    notFound();
  }

  const renderContent = (text) => {
    const lines = text.trim().split('\n');
    const elements = [];
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      if (line.startsWith('```')) {
        const codeLines = [];
        i++;
        while (i < lines.length && !lines[i].startsWith('```')) {
          codeLines.push(lines[i]);
          i++;
        }
        elements.push(
          <pre key={`code-${i}`} className={styles.pre}>
            <code className={styles.code}>{codeLines.join('\n')}</code>
          </pre>
        );
        i++;
        continue;
      }
      if (line.startsWith('# ')) {
        elements.push(<h1 key={i} className={styles.h1}>{line.replace('# ', '')}</h1>);
        i++;
        continue;
      }
      if (line.startsWith('## ')) {
        elements.push(<h2 key={i} className={styles.h2}>{line.replace('## ', '')}</h2>);
        i++;
        continue;
      }
      if (line.startsWith('### ')) {
        elements.push(<h3 key={i} className={styles.h3}>{line.replace('### ', '')}</h3>);
        i++;
        continue;
      }
      if (line.startsWith('- ') || line.startsWith('* ')) {
        const listItems = [];
        while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('* '))) {
          let itemText = lines[i].substring(2);
          if (itemText.includes('**')) {
            const parts = itemText.split('**');
            itemText = parts.map((part, pIdx) => pIdx % 2 !== 0 ? <strong key={pIdx}>{part}</strong> : part);
          }
          listItems.push(<li key={i} className={styles.li}>{itemText}</li>);
          i++;
        }
        elements.push(<ul key={`ul-${i}`} style={{ marginBottom: '1.5em' }}>{listItems}</ul>);
        continue;
      }
      if (line.trim() === '') {
        i++;
        continue;
      }
      let formattedLine = line;
      if (formattedLine.includes('**')) {
        const parts = formattedLine.split('**');
        formattedLine = parts.map((part, pIdx) => pIdx % 2 !== 0 ? <strong key={pIdx}>{part}</strong> : part);
      }
      elements.push(<p key={i} className={styles.p}>{formattedLine}</p>);
      i++;
    }
    return elements;
  };

  return (
    <div className={styles.container}>
      <nav className={styles.nav}>
        <Link href="/writing" className={styles.backLink}>
          <span>← All Articles</span>
        </Link>
      </nav>

      <article className={styles.article}>
        <header className={styles.header}>
          <div className={styles.meta}>
            <span className={styles.category}>{article.category}</span>
            <span className={styles.date}>{new Date(article.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            <span className={styles.readTime}>{article.readTime}</span>
          </div>
          <h1 className={styles.title}>{article.title}</h1>
        </header>

        <div className={styles.content}>
          {renderContent(article.content)}
        </div>

        <footer className={styles.footer}>
          <div className={styles.author}>
            <span className={styles.authorName}>Pratham Malkan</span>
            <span className={styles.authorTitle}>Creative Technologist</span>
          </div>
          <Link href="/#contact" className={styles.ctaButton}>
            Hire Me for Your Next Project
          </Link>
        </footer>
      </article>
    </div>
  );
}
