require('dotenv').config();
const path = require('path');
const fs = require('fs');

const USE_SUPABASE = !!process.env.SUPABASE_URL;
const LOCAL_UPLOADS = path.join(__dirname, '..', '..', 'data', 'uploads');

let _supabase = null;

function getSupabase() {
  if (_supabase) return _supabase;
  if (!USE_SUPABASE) return null;
  const { createClient } = require('@supabase/supabase-js');
  _supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
  return _supabase;
}

const BUCKET = 'uploads';

async function initStorage() {
  if (USE_SUPABASE) {
    const supabase = getSupabase();
    // Create bucket if not exists
    const { data: buckets } = await supabase.storage.listBuckets();
    if (!buckets?.find(b => b.name === BUCKET)) {
      await supabase.storage.createBucket(BUCKET, { public: false, fileSizeLimit: 26214400 }); // 25MB
      console.log('✓ Supabase storage bucket created');
    }
    console.log('✓ Using Supabase storage');
  } else {
    fs.mkdirSync(LOCAL_UPLOADS, { recursive: true });
    console.log('✓ Using local file storage');
  }
}

// Upload a file — returns the stored path and size
async function uploadFile(filename, buffer) {
  const size = buffer.length;

  if (USE_SUPABASE) {
    const supabase = getSupabase();
    const storagePath = `${Date.now()}_${filename}`;
    const { error } = await supabase.storage.from(BUCKET).upload(storagePath, buffer, {
      contentType: guessMimeType(filename),
      upsert: false,
    });
    if (error) throw new Error(`Upload failed: ${error.message}`);
    return { path: storagePath, size };
  } else {
    const safeName = `${Date.now()}_${filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    fs.writeFileSync(path.join(LOCAL_UPLOADS, safeName), buffer);
    return { path: safeName, size };
  }
}

// Download / get a file — returns { buffer, contentType }
async function getFile(storagePath) {
  if (USE_SUPABASE) {
    const supabase = getSupabase();
    const { data, error } = await supabase.storage.from(BUCKET).download(storagePath);
    if (error) throw new Error(`Download failed: ${error.message}`);
    const buffer = Buffer.from(await data.arrayBuffer());
    return { buffer, contentType: data.type || guessMimeType(storagePath) };
  } else {
    const fp = path.join(LOCAL_UPLOADS, storagePath);
    if (!fs.existsSync(fp)) throw new Error('File not found');
    return { buffer: fs.readFileSync(fp), contentType: guessMimeType(storagePath) };
  }
}

// Get a public/signed URL for a file
async function getFileUrl(storagePath) {
  if (USE_SUPABASE) {
    const supabase = getSupabase();
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(storagePath, 3600); // 1 hour
    if (error) throw new Error(error.message);
    return data.signedUrl;
  } else {
    return `/api/files/${storagePath}`;
  }
}

// Delete a file
async function deleteFile(storagePath) {
  if (!storagePath) return;
  if (USE_SUPABASE) {
    const supabase = getSupabase();
    await supabase.storage.from(BUCKET).remove([storagePath]);
  } else {
    const fp = path.join(LOCAL_UPLOADS, storagePath);
    if (fs.existsSync(fp)) fs.unlinkSync(fp);
  }
}

function guessMimeType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const map = {
    '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
    '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf', '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.csv': 'text/csv', '.txt': 'text/plain',
  };
  return map[ext] || 'application/octet-stream';
}

module.exports = { initStorage, uploadFile, getFile, getFileUrl, deleteFile, isSupabase: () => USE_SUPABASE };
