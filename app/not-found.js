import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'hsl(240, 10%, 4%)',
      color: 'hsl(0, 0%, 95%)',
      fontFamily: 'var(--font-primary)',
      padding: '2rem',
      textAlign: 'center',
    }}>
      <h1 style={{ fontSize: 'clamp(4rem, 10vw, 8rem)', fontWeight: 700, lineHeight: 1, marginBottom: '1rem', letterSpacing: '-0.04em' }}>
        404
      </h1>
      <p style={{ fontSize: '1.1rem', color: 'hsl(0, 0%, 60%)', marginBottom: '2rem', maxWidth: '400px' }}>
        This page doesn&apos;t exist yet. Maybe it will someday.
      </p>
      <Link href="/" style={{
        padding: '0.75rem 1.5rem',
        border: '1px solid hsla(0, 0%, 100%, 0.15)',
        borderRadius: '9999px',
        color: 'hsl(0, 0%, 90%)',
        fontSize: '0.85rem',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        textDecoration: 'none',
        transition: 'all 0.3s ease',
      }}>
        ← Back to Portfolio
      </Link>
    </div>
  );
}
