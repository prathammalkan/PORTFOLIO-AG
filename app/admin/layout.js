'use client';
import { usePathname } from 'next/navigation';
import AdminSidebar from '@/components/Admin/AdminSidebar';

const pageTitles = {
  '/admin/dashboard': { title: 'Dashboard', sub: 'Overview of your portfolio performance' },
  '/admin/projects': { title: 'Projects', sub: 'Manage your portfolio projects' },
  '/admin/projects/new': { title: 'New Project', sub: 'Create a new portfolio project' },
  '/admin/videos': { title: 'Videos', sub: 'Manage your video work' },
  '/admin/videos/new': { title: 'Add Video', sub: 'Add a new video to your portfolio' },
  '/admin/design': { title: 'Design Assets', sub: 'Manage your graphic design & visual work' },
  '/admin/testimonials': { title: 'Testimonials', sub: 'Client testimonials and reviews' },
  '/admin/homepage': { title: 'Homepage Editor', sub: 'Edit your homepage content without code' },
  '/admin/media': { title: 'Media Library', sub: 'All uploaded files and assets' },
  '/admin/seo': { title: 'SEO Manager', sub: 'Search engine optimization settings' },
  '/admin/leads': { title: 'Leads & CRM', sub: 'Contact submissions and lead tracking' },
  '/admin/analytics': { title: 'Analytics', sub: 'Visitor and engagement data' },
  '/admin/settings': { title: 'Settings', sub: 'Global site configuration' },
  '/admin/security': { title: 'Security', sub: 'Login history and audit logs' },
};

export default function AdminLayout({ children }) {
  const pathname = usePathname();

  if (pathname === '/admin/login') return <>{children}</>;

  const page = pageTitles[pathname] || { title: 'Admin', sub: '' };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'hsl(240,10%,5%)', fontFamily: 'system-ui, sans-serif' }}>
      <AdminSidebar />
      <div style={{ marginLeft: '240px', flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Header */}
        <div style={{
          padding: '1rem 2rem',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: 'hsl(240,8%,7%)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 50,
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'hsl(0,0%,92%)' }}>{page.title}</h1>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'hsl(0,0%,45%)' }}>{page.sub}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'hsl(0,0%,40%)' }}>
              {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'linear-gradient(135deg, hsl(210,100%,60%), hsl(160,70%,50%))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.7rem', fontWeight: 700, color: 'white',
            }}>PM</div>
          </div>
        </div>
        {/* Content */}
        <main style={{ flex: 1, padding: '2rem', overflow: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
