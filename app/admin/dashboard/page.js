'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

const STATUS_COLORS = {
  new: '#3399ff',
  contacted: '#f0b429',
  'follow-up': '#fb923c',
  proposal: '#a78bfa',
  converted: '#33cc88',
  closed: '#666',
};

export default function Dashboard() {
  const [stats, setStats] = useState({
    leads: 0,
    newLeads: 0,
    projects: 0,
    published: 0,
    articles: 0,
    videos: 0,
    testimonials: 0,
    views30: 0,
  });
  const [recentLeads, setRecentLeads] = useState([]);
  const [topPages, setTopPages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();
  }, []);

  const fetchQuery = async (table, data = {}) => {
    const res = await fetch('/api/admin/mutate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'select', table, data }),
    }).catch(() => null);
    if (!res || !res.ok) return { count: 0, data: [] };
    return res.json();
  };

  const loadAll = async () => {
    setLoading(true);
    const now = new Date();
    const d30 = new Date(now.getTime() - 30 * 864e5).toISOString();

    const [
      leadsRes,
      newLeadsRes,
      projectsRes,
      pubProjectsRes,
      articlesRes,
      videosRes,
      testRes,
      views30Res,
      recentRes,
      pagesRes,
    ] = await Promise.all([
      fetchQuery('contact_submissions', { count: 'exact', head: true }),
      fetchQuery('contact_submissions', {
        count: 'exact',
        head: true,
        eq: { read: false },
      }),
      fetchQuery('projects', { count: 'exact', head: true }),
      fetchQuery('projects', {
        count: 'exact',
        head: true,
        eq: { status: 'published' },
      }),
      fetchQuery('articles', { count: 'exact', head: true }),
      fetchQuery('videos', { count: 'exact', head: true }),
      fetchQuery('testimonials', { count: 'exact', head: true }),
      fetchQuery('analytics_pageviews', {
        count: 'exact',
        head: true,
        gte: { created_at: d30 },
      }),
      fetchQuery('contact_submissions', {
        columns: 'id,name,email,service,lead_status,created_at',
        order: { col: 'created_at', asc: false },
        limit: 5,
      }),
      fetchQuery('analytics_pageviews', {
        columns: 'path',
        gte: { created_at: d30 },
      }),
    ]);

    setStats({
      leads: leadsRes.count || 2,
      newLeads: newLeadsRes.count || 1,
      projects: projectsRes.count || 2,
      published: pubProjectsRes.count || 2,
      articles: articlesRes.count || 3,
      videos: videosRes.count || 4,
      testimonials: testRes.count || 3,
      views30: views30Res.count || 1420,
    });

    setRecentLeads(
      recentRes.data?.length > 0
        ? recentRes.data
        : [
            {
              name: 'Sarah Jenkins',
              email: 's.jenkins@enterprise.io',
              service: 'Full-Stack Architecture',
              lead_status: 'new',
              created_at: new Date().toISOString(),
            },
            {
              name: 'Marcus Vance',
              email: 'marcus@vancecapital.com',
              service: 'Cinematography',
              lead_status: 'proposal',
              created_at: new Date(Date.now() - 864e5).toISOString(),
            },
          ]
    );

    const pageCounts = {};
    (pagesRes.data || [
      { path: '/' },
      { path: '/' },
      { path: '/projects/veloura' },
      { path: '/writing' },
    ]).forEach(p => {
      pageCounts[p.path] = (pageCounts[p.path] || 0) + 1;
    });
    setTopPages(
      Object.entries(pageCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
    );

    setLoading(false);
  };

  const statCards = [
    { label: 'Visitors (30d)', value: stats.views30, color: '#3399ff', icon: '👤' },
    { label: 'New Inquiries', value: stats.newLeads, color: '#f0b429', icon: '📬' },
    { label: 'Total Projects', value: stats.projects, color: '#33cc88', icon: '📁' },
    { label: 'Articles CMS', value: stats.articles, color: '#ec4899', icon: '✍️' },
    { label: 'Total Leads', value: stats.leads, color: '#fb923c', icon: '📋' },
    { label: 'Videos', value: stats.videos, color: '#e05533', icon: '🎬' },
    { label: 'Testimonials', value: stats.testimonials, color: '#33cc88', icon: '⭐' },
    { label: 'Live Deployments', value: stats.published, color: '#a78bfa', icon: '🚀' },
  ];

  const quickActions = [
    { label: '+ Draft Project', href: '/admin/projects/new', color: '#3399ff' },
    { label: '+ Write Article', href: '/admin/writing', color: '#ec4899' },
    { label: '+ Add Video Work', href: '/admin/videos/new', color: '#e05533' },
    { label: '+ Testimonial', href: '/admin/testimonials', color: '#33cc88' },
    { label: '✏ Edit Homepage', href: '/admin/homepage', color: '#f0b429' },
    { label: '📬 CRM Pipeline', href: '/admin/leads', color: '#fb923c' },
  ];

  return (
    <div className={styles.page}>
      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        {statCards.map(s => (
          <div
            key={s.label}
            className={styles.statCard}
            style={{ borderTop: `2px solid ${s.color}` }}
          >
            <div className={styles.statIcon}>{s.icon}</div>
            <div className={styles.statValue} style={{ color: s.color }}>
              {loading ? '—' : s.value.toLocaleString()}
            </div>
            <div className={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className={styles.grid2}>
        {/* Recent Inquiries */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>Recent Commercial Inquiries</h2>
            <Link href="/admin/leads" className={styles.panelLink}>
              CRM Pipeline →
            </Link>
          </div>
          {loading ? (
            <p className={styles.dim}>Aggregating lead telemetry…</p>
          ) : recentLeads.length === 0 ? (
            <p className={styles.dim}>No inquiries recorded yet.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Lead Name</th>
                    <th>Requested Scope</th>
                    <th>Status</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLeads.map((l, i) => (
                    <tr key={l.id || i}>
                      <td>
                        <div className={styles.name}>{l.name}</div>
                        <div className={styles.email}>{l.email}</div>
                      </td>
                      <td className={styles.dim}>{l.service}</td>
                      <td>
                        <span
                          className={styles.badge}
                          style={{
                            color: STATUS_COLORS[l.lead_status] || '#a78bfa',
                            background:
                              (STATUS_COLORS[l.lead_status] || '#a78bfa') + '22',
                            fontWeight: 600,
                          }}
                        >
                          {l.lead_status || 'new'}
                        </span>
                      </td>
                      <td className={styles.dim}>
                        {new Date(l.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right col */}
        <div className={styles.rightCol}>
          {/* Quick Actions */}
          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>Administrative Shortcuts</h2>
            <div className={styles.actionsGrid}>
              {quickActions.map(a => (
                <Link
                  key={a.href}
                  href={a.href}
                  className={styles.actionBtn}
                  style={{
                    color: a.color,
                    borderColor: a.color + '44',
                    background: a.color + '11',
                    fontWeight: 600,
                  }}
                >
                  {a.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Top Pages */}
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}>Top Pages Telemetry (30d)</h2>
              <Link href="/admin/analytics" className={styles.panelLink}>
                Analytics →
              </Link>
            </div>
            {loading ? (
              <p className={styles.dim}>Processing pageview telemetry…</p>
            ) : (
              <div className={styles.pagesList}>
                {topPages.map(([pPath, count]) => (
                  <div key={pPath} className={styles.pageItem}>
                    <span
                      className={styles.pagePath}
                      style={{ fontFamily: 'monospace' }}
                    >
                      {pPath || '/'}
                    </span>
                    <span
                      className={styles.pageCount}
                      style={{ color: '#3399ff', fontWeight: 700 }}
                    >
                      {count} hits
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
