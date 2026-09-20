const multer = require('multer');
const path = require('path');
const os = require('os');
const fs = require('fs');

function resolveUploadDir() {
  const preferred = path.join(__dirname, '..', '..', 'uploads');
  try {
    if (!fs.existsSync(preferred)) {
      fs.mkdirSync(preferred, { recursive: true });
    }
    return preferred;
  } catch {
    // Serverless platforms (e.g. Vercel) have a read-only filesystem
    // except for os.tmpdir(); fall back to that instead of crashing.
    const fallback = path.join(os.tmpdir(), 'uploads');
    if (!fs.existsSync(fallback)) {
      fs.mkdirSync(fallback, { recursive: true });
    }
    return fallback;
  }
}

const uploadDir = resolveUploadDir();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 } // 15MB
});

module.exports = upload;
