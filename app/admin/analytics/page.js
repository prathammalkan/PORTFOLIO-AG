'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import s from '../admin.module.css';

export default function AnalyticsPage() {
  const [range, setRange] = useState(30);
  const [views, setViews] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, [range]);

  const load = async () => {
    setLoading(true);
    const since = new Date(Date.now() - range * 864e5).toISOString();
    const [{ data: pv }, { data: ev }] = await Promise.all([
      supabase.from('analytics_pageviews').select('*').gte('created_at', since).order('created_at'),
      supabase.from('analytics_events').select('*').gte('created_at', since),
    ]);
    setViews(pv || []);
    setEvents(ev || []);
    setLoading(false);
  };

  // Aggregations
  const uniqueSessions = new Set(views.map(v => v.session_id)).size;
  const pageCounts = {};
  views.forEach(v => { pageCounts[v.path] = (pageCounts[v.path] || 0) + 1; });
  const topPages = Object.entries(pageCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);

  const deviceCounts = { desktop: 0, mobile: 0, tablet: 0 };
  views.forEach(v => { if (v.device_type) deviceCounts[v.device_type] = (deviceCounts[v.device_type] || 0) + 1; });

  const browserCounts = {};
  views.forEach(v => { if (v.browser) browserCounts[v.browser] = (browserCounts[v.browser] || 0) + 1; });

  const refCounts = {};
  views.forEach(v => { const ref = v.referrer ? (new URL(v.referrer).hostname || 'Direct') : 'Direct'; refCounts[ref] = (refCounts[ref] || 0) + 1; });
  const topRefs = Object.entries(refCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  // Daily chart data
  const dayData = {};
  for (let i = range - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 864e5).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    dayData[d] = 0;
  }
  views.forEach(v => {
    const d = new Date(v.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (dayData[d] !== undefined) dayData[d]++;
  });
  const chartData = Object.entries(dayData);
  const maxViews = Math.max(...chartData.map(([, v]) => v), 1);

  // Event aggregation
  const eventCounts = {};
  events.forEach(e => { eventCounts[e.event_name] = (eventCounts[e.event_name] || 0) + 1; });
  const topEvents = Object.entries(eventCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);

  const totalDevices = views.length || 1;

  return (
    <div className={s.page}>
      <div className={s.topBar}>
        <h2 className={s.pageTitle}>Analytics Center</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {[7, 30, 90].map(r => (
            <button key={r} className={`${s.filterTab} ${range === r ? s.filterTabActive : ''}`} onClick={() => setRange(r)}>
              {r}d
            </button>
          ))}
        </div>
      </div>

      {/* Overview stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        {[
          { label: 'Total Pageviews', value: views.length, color: '#3399ff' },
          { label: 'Unique Sessions', value: uniqueSessions, color: '#33cc88' },
          { label: 'Avg / Day', value: Math.round(views.length / range), color: '#f0b429' },
          { label: 'Events Tracked', value: events.length, color: '#a78bfa' },
        ].map(stat => (
          <div key={stat.label} className={s.panel} style={{ borderTop: `2px solid ${stat.color}` }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: stat.color }}>{loading ? '—' : stat.value.toLocaleString()}</div>
            <div style={{ fontSize: '0.72rem', color: 'hsl(0,0%,50%)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '0.25rem' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {loading ? <p className={s.loadingRow}>Loading analytics…</p> : views.length === 0 ? (
        <div className={s.empty}>
          <div className={s.emptyIcon}>📊</div>
          <div className={s.emptyTitle}>No analytics data yet</div>
          <p style={{ fontSize: '0.82rem', color: 'hsl(0,0%,45%)', marginTop: '0.5rem' }}>Visitor data will appear here once people visit your portfolio.</p>
        </div>
      ) : (
        <>
          {/* Daily chart */}
          <div className={s.panel}>
            <div className={s.sectionTitle}>Pageviews — Last {range} Days</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: 120, paddingBottom: 24, position: 'relative', overflowX: 'auto' }}>
              {chartData.map(([day, count]) => (
                <div key={day} style={{ flex: '0 0 auto', minWidth: range <= 7 ? 60 : range <= 30 ? 20 : 8, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', gap: 4 }}>
                  <div title={`${day}: ${count} views`} style={{ width: '100%', height: `${(count / maxViews) * 90}px`, minHeight: count > 0 ? 2 : 0, background: 'hsl(210,100%,60%)', borderRadius: '2px 2px 0 0', transition: 'height 0.3s' }} />
                  {range <= 30 && <span style={{ fontSize: '0.5rem', color: 'hsl(0,0%,35%)', whiteSpace: 'nowrap', transform: 'rotate(-30deg)', transformOrigin: 'center' }}>{day}</span>}
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {/* Top pages */}
            <div className={s.panel}>
              <div className={s.sectionTitle}>Top Pages</div>
              {topPages.map(([path, count]) => (
                <div key={path} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'hsl(0,0%,65%)', fontFamily: 'monospace' }}>{path || '/'}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: 80, height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(count / views.length) * 100}%`, background: 'hsl(210,100%,60%)', borderRadius: 2 }} />
                    </div>
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#3399ff', minWidth: 24, textAlign: 'right' }}>{count}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Device breakdown */}
            <div className={s.panel}>
              <div className={s.sectionTitle}>Device Breakdown</div>
              {Object.entries(deviceCounts).map(([device, count]) => (
                <div key={device} style={{ marginBottom: '0.875rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                    <span style={{ fontSize: '0.82rem', color: 'hsl(0,0%,70%)', textTransform: 'capitalize' }}>{device}</span>
                    <span style={{ fontSize: '0.78rem', color: 'hsl(0,0%,55%)' }}>{count} ({Math.round((count / totalDevices) * 100)}%)</span>
                  </div>
                  <div className={s.progressBar}><div className={s.progressFill} style={{ width: `${(count / totalDevices) * 100}%`, background: device === 'desktop' ? '#3399ff' : device === 'mobile' ? '#33cc88' : '#f0b429' }} /></div>
                </div>
              ))}

              <div className={s.sectionTitle} style={{ marginTop: '1.25rem' }}>Browsers</div>
              {Object.entries(browserCounts).sort((a, b) => b[1] - a[1]).map(([browser, count]) => (
                <div key={browser} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.8rem', color: 'hsl(0,0%,65%)' }}>
                  <span>{browser}</span><span style={{ color: 'hsl(0,0%,85%)', fontWeight: 600 }}>{count}</span>
                </div>
              ))}
            </div>

            {/* Top referrers */}
            <div className={s.panel}>
              <div className={s.sectionTitle}>Traffic Sources</div>
              {topRefs.map(([ref, count]) => (
                <div key={ref} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.82rem', color: 'hsl(0,0%,65%)' }}>
                  <span>{ref}</span>
                  <span style={{ fontWeight: 600, color: 'hsl(0,0%,85%)' }}>{count}</span>
                </div>
              ))}
            </div>

            {/* Events */}
            <div className={s.panel}>
              <div className={s.sectionTitle}>Click Events</div>
              {topEvents.length === 0 ? <p style={{ fontSize: '0.8rem', color: 'hsl(0,0%,40%)' }}>No events tracked yet. Add data-track attributes to buttons.</p> : topEvents.map(([name, count]) => (
                <div key={name} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.82rem', color: 'hsl(0,0%,65%)' }}>
                  <span style={{ fontFamily: 'monospace' }}>{name}</span>
                  <span style={{ fontWeight: 600, color: '#a78bfa' }}>{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent activity */}
          <div className={s.panel}>
            <div className={s.sectionTitle}>Recent Visitor Activity</div>
            <div className={s.tableWrap} style={{ border: 'none', borderRadius: 0 }}>
              <table className={s.table}>
                <thead><tr><th>Page</th><th>Device</th><th>Browser</th><th>Source</th><th>Time</th></tr></thead>
                <tbody>
                  {views.slice(-20).reverse().map((v, i) => (
                    <tr key={i}>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{v.path || '/'}</td>
                      <td style={{ fontSize: '0.78rem', textTransform: 'capitalize', color: 'hsl(0,0%,60%)' }}>{v.device_type || '—'}</td>
                      <td style={{ fontSize: '0.78rem', color: 'hsl(0,0%,60%)' }}>{v.browser || '—'}</td>
                      <td style={{ fontSize: '0.75rem', color: 'hsl(0,0%,50%)' }}>{v.referrer ? new URL(v.referrer).hostname : 'Direct'}</td>
                      <td style={{ fontSize: '0.75rem', color: 'hsl(0,0%,45%)' }}>{new Date(v.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
