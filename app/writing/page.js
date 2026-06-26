import Link from 'next/link';
import { writingData } from '@/lib/writingData';
import styles from './Writing.module.css';

export const metadata = {
  title: 'Writing — Pratham Malkan',
  description: 'Thoughts, teardowns, and engineering strategies.',
};

export default function WritingIndex() {
  return (
    <div className={styles.container}>
      <nav className={styles.nav}>
        <Link href="/" className={styles.backLink}>
          <span>← Back to Home</span>
        </Link>
      </nav>

      <header className={styles.header}>
        <h1 className={styles.title}>Writing</h1>
        <p className={styles.subtitle}>Engineering strategies, design teardowns, and thoughts on building better digital products.</p>
      </header>

      <main className={styles.main}>
        <div className={styles.articleList}>
          {writingData.map((article) => (
            <Link key={article.slug} href={`/writing/${article.slug}`} className={styles.articleCard}>
              <div className={styles.meta}>
                <span className={styles.category}>{article.category}</span>
                <span className={styles.date}>{new Date(article.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                <span className={styles.readTime}>{article.readTime}</span>
              </div>
              <h2 className={styles.articleTitle}>{article.title}</h2>
              <p className={styles.articleExcerpt}>{article.excerpt}</p>
              <span className={styles.readMore}>Read Article →</span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
