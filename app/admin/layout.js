'use client';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import AdminSidebar from '@/components/Admin/AdminSidebar';
import { ToastProvider } from '@/components/Admin/ToastProvider';
import sideStyles from '@/components/Admin/AdminSidebar.module.css';

const pageTitles = {
  '/admin/dashboard': {
    title: 'Dashboard',
    sub: 'Overview of your portfolio performance',
  },
  '/admin/projects': {
    title: 'Projects',
    sub: 'Manage your portfolio projects',
  },
  '/admin/projects/new': {
    title: 'New Project',
    sub: 'Create a new portfolio project',
  },
  '/admin/writing': {
    title: 'Articles & Writing CMS',
    sub: 'Create, draft, and schedule blog articles',
  },
  '/admin/videos': { title: 'Videos', sub: 'Manage your video work' },
  '/admin/videos/new': {
    title: 'Add Video',
    sub: 'Add a new video to your portfolio',
  },
  '/admin/design': {
    title: 'Design Assets',
    sub: 'Manage your graphic design & visual work',
  },
  '/admin/testimonials': {
    title: 'Testimonials',
    sub: 'Client testimonials and reviews',
  },
  '/admin/homepage': {
    title: 'Homepage Editor',
    sub: 'Edit your homepage content without code',
  },
  '/admin/media': {
    title: 'Media Library',
    sub: 'All uploaded files and enterprise assets',
  },
  '/admin/seo': {
    title: 'SEO Manager',
    sub: 'Search engine optimization settings',
  },
  '/admin/leads': {
    title: 'Leads & CRM Pipeline',
    sub: 'Inquiry workflow tracking and lead notes',
  },
  '/admin/analytics': {
    title: 'Analytics Center',
    sub: 'Visitor telemetry and device breakdowns',
  },
  '/admin/settings': {
    title: 'System Settings',
    sub: 'Global branding and feature flags',
  },
  '/admin/security': {
    title: 'Security Center',
    sub: 'Login audit history and active session management',
  },
};

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (pathname === '/admin/login') return <>{children}</>;

  const page = pageTitles[pathname] || { title: 'Admin Suite', sub: '' };

  return (
    <ToastProvider>
      <div
        style={{
          display: 'flex',
          minHeight: '100vh',
          background: 'hsl(240,10%,5%)',
          fontFamily: 'system-ui, sans-serif',
          color: 'hsl(0,0%,90%)',
        }}
      >
        <AdminSidebar
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
        />
        <div className={sideStyles.mainShell}>
          {/* Responsive Sticky Header */}
          <header
            style={{
              padding: '1rem 1.5rem',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              background: 'hsl(240,8%,7%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'sticky',
              top: 0,
              zIndex: 50,
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <button
                type="button"
                className={sideStyles.hamburgerBtn}
                onClick={() => setMobileOpen(true)}
                aria-label="Open mobile menu"
              >
                ☰
              </button>
              <div>
                <h1
                  style={{
                    margin: 0,
                    fontSize: '1.15rem',
                    fontWeight: 700,
                    color: 'white',
                  }}
                >
                  {page.title}
                </h1>
                <p
                  style={{
                    margin: 0,
                    fontSize: '0.78rem',
                    color: 'hsl(0,0%,50%)',
                  }}
                >
                  {page.sub}
                </p>
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontSize: '0.78rem',
                  color: 'hsl(0,0%,45%)',
                  display: 'none',
                  '@media (minWidth: 640px)': { display: 'inline' },
                }}
              >
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background:
                    'linear-gradient(135deg, hsl(210,100%,60%), hsl(160,70%,50%))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'white',
                }}
                title="Super Admin Profile"
              >
                PM
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <main style={{ flex: 1, padding: '1.5rem', overflow: 'auto' }}>
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
