import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// serve frontend
app.use(express.static(path.join(__dirname, "public")));

// Ensure upload folder exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// Upload endpoint
app.post("/upload", upload.single("image"), (req, res) => {
  const logPath = path.join(uploadDir, "log.json");

  let log = [];
  if (fs.existsSync(logPath)) {
    log = JSON.parse(fs.readFileSync(logPath, "utf-8"));
  }

  const entry = {
    filename: req.file.filename,
    original: req.file.originalname,
    uploadedAt: new Date().toISOString(),
  };

  log.push(entry);
  fs.writeFileSync(logPath, JSON.stringify(log, null, 2));

  res.json({ success: true, file: entry });
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});

