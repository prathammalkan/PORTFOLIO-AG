import { NextResponse } from 'next/server';
import { verifyAdminSession, hasPermission, getServerSupabase } from '@/lib/authServer';

const ALLOWED_TABLES = new Set([
  'projects', 'videos', 'design_assets', 'testimonials',
  'articles', 'media_files', 'contact_submissions', 'lead_notes',
  'site_settings', 'seo_settings', 'admin_sessions', 'analytics_pageviews',
  'analytics_events', 'login_attempts', 'audit_logs'
]);

const ELEVATED_TABLES = new Set(['site_settings', 'seo_settings', 'admin_sessions', 'login_attempts', 'audit_logs']);

export async function POST(request) {
  try {
    const auth = await verifyAdminSession(request.cookies);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid mutation payload.' }, { status: 400 });
    }

    const { action, table, id, data, onConflict } = body;
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

    if (!table || !ALLOWED_TABLES.has(table)) {
      return NextResponse.json({ error: `Table '${table}' is not permitted for backend access.` }, { status: 403 });
    }

    // RBAC Authorization Check
    let requiredRole = 'Viewer';
    if (action !== 'select') {
      requiredRole = ELEVATED_TABLES.has(table) ? 'Super Admin' : 'Editor';
    } else if (ELEVATED_TABLES.has(table)) {
      requiredRole = 'Editor';
    }

    if (!hasPermission(auth.role, requiredRole)) {
      return NextResponse.json(
        { error: `Insufficient permissions. Tier '${requiredRole}' required for '${action}' on '${table}'.` },
        { status: 403 }
      );
    }

    const supabase = getServerSupabase();
    let queryResult = null;

    if (action === 'select') {
      const cols = data?.columns || '*';
      const selectOpts = {};
      if (data?.count) selectOpts.count = data.count;
      if (data?.head) selectOpts.head = data.head;

      let q = supabase.from(table).select(cols, selectOpts);

      if (data?.eq && typeof data.eq === 'object') {
        for (const [k, v] of Object.entries(data.eq)) q = q.eq(k, v);
      }
      if (data?.gte && typeof data.gte === 'object') {
        for (const [k, v] of Object.entries(data.gte)) q = q.gte(k, v);
      }
      if (data?.order && typeof data.order === 'object') {
        q = q.order(data.order.col, { ascending: data.order.asc !== false });
      }
      if (data?.limit && typeof data.limit === 'number') {
        q = q.limit(data.limit);
      }

      queryResult = await q;
      return NextResponse.json({
        success: true,
        data: queryResult.data,
        count: queryResult.count
      });
    } else if (action === 'insert') {
      if (!data || typeof data !== 'object') {
        return NextResponse.json({ error: 'Data payload required for insert.' }, { status: 400 });
      }
      queryResult = await supabase.from(table).insert(data).select();
    } else if (action === 'update') {
      if (!id || !data) {
        return NextResponse.json({ error: 'Record ID and Data required for update.' }, { status: 400 });
      }
      queryResult = await supabase.from(table).update(data).eq('id', id).select();
    } else if (action === 'delete') {
      if (!id) {
        return NextResponse.json({ error: 'Record ID required for delete.' }, { status: 400 });
      }
      if (Array.isArray(id)) {
        queryResult = await supabase.from(table).delete().in('id', id);
      } else {
        queryResult = await supabase.from(table).delete().eq('id', id);
      }
    } else if (action === 'upsert') {
      if (!data) {
        return NextResponse.json({ error: 'Data required for upsert.' }, { status: 400 });
      }
      const opts = onConflict ? { onConflict } : undefined;
      queryResult = await supabase.from(table).upsert(data, opts).select();
    } else {
      return NextResponse.json({ error: `Unsupported action '${action}'.` }, { status: 400 });
    }

    if (queryResult.error) {
      console.error(`Mutation database error (${table}.${action}):`, queryResult.error);
      return NextResponse.json({ error: queryResult.error.message }, { status: 500 });
    }

    // Non-blocking security audit log for state modifications
    supabase.from('audit_logs').insert({
      admin_role: auth.role,
      action: action.toUpperCase(),
      table_name: table,
      record_id: Array.isArray(id) ? id.join(',') : String(id || data?.id || data?.slug || data?.key || ''),
      details: data || { id },
      ip,
    }).catch(() => {});

    return NextResponse.json({ success: true, data: queryResult.data });
  } catch (err) {
    console.error('Mutation API exception:', err);
    return NextResponse.json({ error: 'Internal server error during mutation.' }, { status: 500 });
  }
}
