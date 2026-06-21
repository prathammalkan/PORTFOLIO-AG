'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';

const STATUS_COLORS = { new: '#3399ff', contacted: '#f0b429', 'follow-up': '#fb923c', proposal: '#a78bfa', converted: '#33cc88', closed: '#666' };

export default function Dashboard() {
  const [stats, setStats] = useState({ leads: 0, newLeads: 0, projects: 0, published: 0, videos: 0, testimonials: 0, views30: 0, views7: 0 });
  const [recentLeads, setRecentLeads] = useState([]);
  const [topPages, setTopPages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    const now = new Date();
    const d30 = new Date(now - 30 * 864e5).toISOString();
    const d7 = new Date(now - 7 * 864e5).toISOString();

    const [
      { count: leads }, { count: newLeads },
      { count: projects }, { count: published },
      { count: videos }, { count: testimonials },
      { count: views30 }, { count: views7 },
      { data: recent },
      { data: pages },
    ] = await Promise.all([
      supabase.from('contact_submissions').select('*', { count: 'exact', head: true }),
      supabase.from('contact_submissions').select('*', { count: 'exact', head: true }).eq('read', false),
      supabase.from('projects').select('*', { count: 'exact', head: true }),
      supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'published'),
      supabase.from('videos').select('*', { count: 'exact', head: true }),
      supabase.from('testimonials').select('*', { count: 'exact', head: true }),
      supabase.from('analytics_pageviews').select('*', { count: 'exact', head: true }).gte('created_at', d30),
      supabase.from('analytics_pageviews').select('*', { count: 'exact', head: true }).gte('created_at', d7),
      supabase.from('contact_submissions').select('name,email,service,lead_status,created_at').order('created_at', { ascending: false }).limit(5),
      supabase.from('analytics_pageviews').select('path').gte('created_at', d30),
    ]);

    setStats({ leads: leads || 0, newLeads: newLeads || 0, projects: projects || 0, published: published || 0, videos: videos || 0, testimonials: testimonials || 0, views30: views30 || 0, views7: views7 || 0 });
    setRecentLeads(recent || []);

    // Aggregate top pages
    const pageCounts = {};
    (pages || []).forEach(p => { pageCounts[p.path] = (pageCounts[p.path] || 0) + 1; });
    setTopPages(Object.entries(pageCounts).sort((a, b) => b[1] - a[1]).slice(0, 5));
    setLoading(false);
  };

  const statCards = [
    { label: 'Visitors (30d)', value: stats.views30, color: '#3399ff', icon: '👤' },
    { label: 'New Inquiries', value: stats.newLeads, color: '#f0b429', icon: '📬' },
    { label: 'Total Projects', value: stats.projects, color: '#33cc88', icon: '📁' },
    { label: 'Published', value: stats.published, color: '#a78bfa', icon: '✅' },
    { label: 'Total Views (7d)', value: stats.views7, color: '#3399ff', icon: '📊' },
    { label: 'Total Leads', value: stats.leads, color: '#fb923c', icon: '📋' },
    { label: 'Videos', value: stats.videos, color: '#e05533', icon: '🎬' },
    { label: 'Testimonials', value: stats.testimonials, color: '#33cc88', icon: '⭐' },
  ];

  const quickActions = [
    { label: '+ New Project', href: '/admin/projects/new', color: '#3399ff' },
    { label: '+ Add Video', href: '/admin/videos/new', color: '#e05533' },
    { label: '+ Testimonial', href: '/admin/testimonials', color: '#33cc88' },
    { label: '✏ Edit Homepage', href: '/admin/homepage', color: '#f0b429' },
    { label: '📊 Analytics', href: '/admin/analytics', color: '#a78bfa' },
    { label: '📬 View Leads', href: '/admin/leads', color: '#fb923c' },
  ];

  return (
    <div className={styles.page}>
      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        {statCards.map((s) => (
          <div key={s.label} className={styles.statCard} style={{ borderTop: `2px solid ${s.color}` }}>
            <div className={styles.statIcon}>{s.icon}</div>
            <div className={styles.statValue} style={{ color: s.color }}>
              {loading ? '—' : s.value.toLocaleString()}
            </div>
            <div className={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className={styles.grid2}>
        {/* Recent Leads */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>Recent Inquiries</h2>
            <Link href="/admin/leads" className={styles.panelLink}>View All →</Link>
          </div>
          {loading ? <p className={styles.dim}>Loading...</p> : recentLeads.length === 0 ? (
            <p className={styles.dim}>No inquiries yet.</p>
          ) : (
            <table className={styles.table}>
              <thead><tr>
                <th>Name</th><th>Service</th><th>Status</th><th>Date</th>
              </tr></thead>
              <tbody>
                {recentLeads.map((l, i) => (
                  <tr key={i}>
                    <td>
                      <div className={styles.name}>{l.name}</div>
                      <div className={styles.email}>{l.email}</div>
                    </td>
                    <td className={styles.dim}>{l.service}</td>
                    <td><span className={styles.badge} style={{ color: STATUS_COLORS[l.lead_status] || '#666', background: (STATUS_COLORS[l.lead_status] || '#666') + '18' }}>{l.lead_status || 'new'}</span></td>
                    <td className={styles.dim}>{new Date(l.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Right column */}
        <div className={styles.rightCol}>
          {/* Quick Actions */}
          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>Quick Actions</h2>
            <div className={styles.actionsGrid}>
              {quickActions.map((a) => (
                <Link key={a.href} href={a.href} className={styles.actionBtn} style={{ color: a.color, borderColor: a.color + '33', background: a.color + '0d' }}>
                  {a.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Top Pages */}
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}>Top Pages (30d)</h2>
              <Link href="/admin/analytics" className={styles.panelLink}>Full Report →</Link>
            </div>
            {loading ? <p className={styles.dim}>Loading...</p> : topPages.length === 0 ? (
              <p className={styles.dim}>No analytics data yet. Visitors will appear here.</p>
            ) : (
              <div className={styles.pagesList}>
                {topPages.map(([path, count]) => (
                  <div key={path} className={styles.pageItem}>
                    <span className={styles.pagePath}>{path || '/'}</span>
                    <span className={styles.pageCount}>{count}</span>
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
