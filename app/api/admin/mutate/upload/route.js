import { NextResponse } from 'next/server';
import { verifyAdminSession, hasPermission, getServerSupabase } from '@/lib/authServer';

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 MB limit
const ALLOWED_MIME = /^(image\/|video\/|application\/pdf)/i;

export async function POST(request) {
  try {
    const auth = await verifyAdminSession(request.cookies);
    if (!auth.authorized || !hasPermission(auth.role, 'Editor')) {
      return NextResponse.json({ error: 'Unauthorized. Editor tier required for media uploads.' }, { status: 403 });
    }

    const formData = await request.formData().catch(() => null);
    if (!formData) {
      return NextResponse.json({ error: 'No form data received.' }, { status: 400 });
    }

    const files = formData.getAll('file');
    const folder = formData.get('folder') || 'general';
    const bucket = formData.get('bucket') || 'portfolio-media';
    const skipDb = formData.get('skip_db') === 'true';
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided for upload.' }, { status: 400 });
    }

    const supabase = getServerSupabase();
    const uploadedRecords = [];

    for (const file of files) {
      if (typeof file === 'string') continue;

      // ── 1. SERVER-SIDE FILE VALIDATION ──────────────────────────────────────
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File '${file.name}' exceeds the 15MB enterprise upload limit.` },
          { status: 413 }
        );
      }

      const mime = file.type || 'application/octet-stream';
      if (!ALLOWED_MIME.test(mime)) {
        return NextResponse.json(
          { error: `File '${file.name}' has unapproved MIME type '${mime}'. Only images, videos, and PDFs permitted.` },
          { status: 415 }
        );
      }

      // ── 2. SANITIZE & UPLOAD TO BUCKET ──────────────────────────────────────
      const cleanName = Date.now() + '-' + file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
      const bucketPath = `${folder}/${cleanName}`;

      const { error: uploadErr } = await supabase.storage
        .from(bucket)
        .upload(bucketPath, file, { cacheControl: '3600', upsert: false });

      if (uploadErr) {
        console.error('Bucket storage upload failure:', uploadErr);
        return NextResponse.json({ error: `Storage failure: ${uploadErr.message}` }, { status: 500 });
      }

      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(bucketPath);

      let fileType = 'other';
      if (mime.startsWith('image/')) fileType = 'image';
      else if (mime.startsWith('video/')) fileType = 'video';
      else if (mime === 'application/pdf') fileType = 'document';

      const record = {
        name: cleanName,
        original_name: file.name,
        url: publicUrl,
        bucket_path: bucketPath,
        size: file.size,
        mime_type: mime,
        type: fileType,
        folder: String(folder),
      };

      if (!skipDb) {
        const { data: dbRecord, error: dbErr } = await supabase.from('media_files').insert(record).select().single();
        uploadedRecords.push(dbErr ? record : dbRecord);
      } else {
        uploadedRecords.push(record);
      }

      // Audit log
      supabase.from('audit_logs').insert({
        admin_role: auth.role,
        action: 'UPLOAD',
        table_name: 'media_files',
        record_id: cleanName,
        details: { size: file.size, mime, url: publicUrl },
        ip,
      }).catch(() => {});
    }

    return NextResponse.json({ success: true, files: uploadedRecords });
  } catch (err) {
    console.error('Upload API route exception:', err);
    return NextResponse.json({ error: 'Internal server error during upload.' }, { status: 500 });
  }
}
