const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");

const upload = multer();

const runMiddleware = (req, res, fn) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      return result instanceof Error ? reject(result) : resolve(result);
    });
  });
};

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Metode tidak diizinkan." });
  }

  const apikey = req.query.apikey;
  if (apikey !== "bagus") {
    return res.status(403).json({ success: false, message: "API key salah!" });
  }

  await runMiddleware(req, res, upload.single("file"));

  if (!req.file) {
    return res.status(400).json({ success: false, message: "File tidak ditemukan!" });
  }

  try {
    const form = new FormData();
    form.append("file1", req.file.buffer, req.file.originalname);
    form.append("des", "Uploaded via Vercel");

    const uploadRes = await axios.post("https://sfile.mobi/guest_remote_parser.php", form, {
  headers: {
    ...form.getHeaders(),
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
  }
});

    const urls = [...uploadRes.data.matchAll(/https:\/\/sfile\.mobi\/[a-zA-Z0-9]{10,}/g)].map(m => m[0]);

    if (!urls.length) {
      return res.status(500).json({ success: false, message: "Gagal mendapatkan URL dari Sfile.", raw: uploadRes.data });
    }

    return res.json({
      success: true,
      creator: "Bagus Bahril",
      filename: req.file.originalname,
      uploaded_at: new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }),
      urls: [...new Set(urls)]
    });

  } catch (err) {
    return res.status(500).json({ success: false, message: "Gagal upload ke Sfile.", error: err.message });
  }
};
