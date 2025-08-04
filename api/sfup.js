const express = require("express");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");

const app = express();
const upload = multer();

app.post("/tools/sfup", upload.single("file"), async (req, res) => {
  const apikey = req.query.apikey;
  if (apikey !== "bagus") {
    return res.status(403).json({ success: false, message: "API key salah!" });
  }

  if (!req.file) {
    return res.status(400).json({ success: false, message: "File tidak ditemukan!" });
  }

  try {
    const form = new FormData();
    form.append("file1", req.file.buffer, req.file.originalname);
    form.append("des", "Uploaded via curl");

    const uploadRes = await axios.post("https://sfile.mobi/guest_remote_parser.php", form, {
      headers: form.getHeaders()
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
      urls: [...new Set(urls)] // hapus duplikat jika ada
    });

  } catch (err) {
    return res.status(500).json({ success: false, message: "Gagal upload ke Sfile.", error: err.message });
  }
});

app.get("/", (_, res) => {
  res.send("POST /tools/sfup");
});

app.listen(3000, () => {
  console.log("🚀 Server berjalan di http://localhost:3000");
});
