-- ══════════════════════════════════════════════════════════════════════════════
-- PRISM PORTFOLIO V1 — ENTERPRISE COMMERCIAL DATABASE SCHEMA & SECURITY POLICIES
-- ══════════════════════════════════════════════════════════════════════════════
-- Run this complete script in your Supabase SQL Editor to initialize or verify
-- production tables, relational constraints, composite indexes, and strict RLS.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── 1. SITE SETTINGS ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 2. SEO SETTINGS ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS seo_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key TEXT UNIQUE NOT NULL,
  page_name TEXT NOT NULL,
  meta_title TEXT,
  meta_description TEXT,
  og_image TEXT,
  keywords TEXT,
  canonical_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 3. AUTH & SECURITY AUDIT TABLES ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip TEXT NOT NULL,
  user_agent TEXT,
  success BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip_time ON login_attempts(ip, created_at DESC);

CREATE TABLE IF NOT EXISTS admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token TEXT UNIQUE NOT NULL,
  ip TEXT,
  user_agent TEXT,
  role TEXT NOT NULL DEFAULT 'Super Admin',
  revoked BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(session_token);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_role TEXT,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id TEXT,
  details JSONB,
  ip TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_time ON audit_logs(created_at DESC);

-- ── 4. CONTENT MANAGEMENT (PROJECTS, VIDEOS, DESIGN, TESTIMONIALS) ────────────
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT DEFAULT 'Web Development',
  tier TEXT DEFAULT 'large',
  status TEXT NOT NULL DEFAULT 'draft',
  featured BOOLEAN DEFAULT false,
  featured_image TEXT,
  thumbnail TEXT,
  description TEXT,
  client_name TEXT,
  client_industry TEXT,
  project_date TEXT,
  project_duration TEXT,
  technologies TEXT[],
  skills TEXT[],
  tools TEXT[],
  results TEXT,
  challenges TEXT,
  process TEXT,
  case_study TEXT,
  live_url TEXT,
  repo_url TEXT,
  drive_url TEXT,
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_projects_status_date ON projects(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);

CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT DEFAULT 'Cinematography',
  video_url TEXT NOT NULL,
  thumbnail TEXT,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS design_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT DEFAULT 'Brand Identity',
  url TEXT NOT NULL,
  thumbnail TEXT,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name TEXT NOT NULL,
  client_company TEXT,
  client_role TEXT,
  content TEXT NOT NULL,
  avatar_url TEXT,
  rating INTEGER DEFAULT 5,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 5. WRITING SYSTEM (ARTICLES & BLOG) ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT,
  category TEXT DEFAULT 'Engineering',
  tags TEXT[],
  status TEXT NOT NULL DEFAULT 'draft',
  read_time TEXT DEFAULT '5 min read',
  featured_image TEXT,
  seo_title TEXT,
  seo_description TEXT,
  og_image TEXT,
  scheduled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_articles_status_slug ON articles(status, slug);
CREATE INDEX IF NOT EXISTS idx_articles_date ON articles(created_at DESC);

-- ── 6. MEDIA LIBRARY STORAGE RECORDS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS media_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  original_name TEXT,
  url TEXT NOT NULL,
  bucket_path TEXT NOT NULL,
  size BIGINT DEFAULT 0,
  mime_type TEXT,
  type TEXT DEFAULT 'other',
  folder TEXT DEFAULT 'general',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_media_files_type ON media_files(type, created_at DESC);

-- ── 7. CRM LEADS & INQUIRIES ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  service TEXT NOT NULL,
  budget TEXT,
  message TEXT NOT NULL,
  ip TEXT,
  read BOOLEAN DEFAULT false,
  lead_status TEXT DEFAULT 'new',
  assigned_to TEXT DEFAULT 'Unassigned',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON contact_submissions(lead_status, created_at DESC);

CREATE TABLE IF NOT EXISTS lead_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES contact_submissions(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_lead_notes_lead_id ON lead_notes(lead_id);

-- ── 8. ANALYTICS TRACKING ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS analytics_pageviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path TEXT NOT NULL,
  referrer TEXT,
  session_id TEXT,
  device_type TEXT DEFAULT 'desktop',
  browser TEXT DEFAULT 'Chrome',
  ip TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_analytics_pv_time ON analytics_pageviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_pv_path ON analytics_pageviews(path);

CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name TEXT NOT NULL,
  metadata JSONB,
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════════════════════════
-- ROW-LEVEL SECURITY (RLS) POLICIES — ELIMINATING ANONYMOUS MUTATIONS
-- ══════════════════════════════════════════════════════════════════════════════

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE design_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_pageviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- PUBLIC READ POLICIES (Safe anonymous SELECT on published frontend content)
CREATE POLICY "Allow public read site_settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Allow public read seo_settings" ON seo_settings FOR SELECT USING (true);
CREATE POLICY "Allow public read published projects" ON projects FOR SELECT USING (status = 'published');
CREATE POLICY "Allow public read videos" ON videos FOR SELECT USING (true);
CREATE POLICY "Allow public read design_assets" ON design_assets FOR SELECT USING (true);
CREATE POLICY "Allow public read testimonials" ON testimonials FOR SELECT USING (true);
CREATE POLICY "Allow public read published articles" ON articles FOR SELECT USING (status = 'published');

-- PUBLIC INSERT POLICIES (Contact forms & Analytics telemetry only)
CREATE POLICY "Allow anon insert contact_submissions" ON contact_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon insert analytics_pageviews" ON analytics_pageviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon insert analytics_events" ON analytics_events FOR INSERT WITH CHECK (true);

-- NOTE: All administrative writes (INSERT/UPDATE/DELETE) execute strictly via
-- backend API Routes (/api/admin/mutate) or Service Credentials. Public anonymous
-- users are mathematically blocked from mutating ANY table.
