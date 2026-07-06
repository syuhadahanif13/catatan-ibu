import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Initialize GoogleGenAI SDK safely with User-Agent headers
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

app.use(express.json());

// API Endpoint to get customized daily schedule using Gemini 3.5 Flash
app.post("/api/gemini/schedule", async (req, res) => {
  try {
    const { babyName, babyAgeMonths, babyGender, wakeTime, specialNotes } = req.body;

    if (!babyAgeMonths && babyAgeMonths !== 0) {
      return res.status(400).json({ error: "Usia bayi harus disertakan." });
    }

    const name = babyName || "Bayi";
    const genderStr = babyGender === "female" ? "perempuan" : "laki-laki";
    const notesStr = specialNotes ? `Catatan khusus / kondisi: ${specialNotes}` : "";

    const systemPrompt = `Anda adalah seorang Dokter Anak spesialis laktasi dan MPASI serta Konsultan Pola Asuh (Parenting). 
Tugas Anda adalah membuat rencana jadwal harian, rekomendasi nutrisi/MPASI, dan catatan perkembangan (milestones) untuk bayi bernama ${name}, berjenis kelamin ${genderStr}, berusia ${babyAgeMonths} bulan.
Waktu bangun pagi bayi biasanya sekitar jam ${wakeTime || "06:00"}.
${notesStr}

Berikan respons dalam format JSON yang valid dengan struktur persis seperti berikut (gunakan bahasa Indonesia):
{
  "schedule": [
    {
      "time": "Format jam, contoh '06:00'",
      "activity": "Nama aktivitas, contoh 'Menyusui Pagi' atau 'Makan MPASI Utama'",
      "duration": "Durasi perkiraan, contoh '20-30 menit'",
      "description": "Deskripsi singkat aktivitas dan tips pelaksanaannya."
    }
  ],
  "mpasiTips": [
    "Rekomendasi takaran/porsi makanan sesuai usia ini",
    "Tekstur makanan yang direkomendasikan",
    "Contoh menu sehat atau tips laktasi/MPASI"
  ],
  "milestones": [
    "Milestones perkembangan motorik/sensorik yang patut diamati di usia ini",
    "Saran stimulasi harian sederhana untuk ibu"
  ],
  "advice": "Pesan semangat hangat untuk Ibu."
}

PENTING: Hanya keluarkan JSON yang valid, tanpa penjelasan tambahan di luar JSON. Pastikan JSON bersih dan bisa diparse.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: "Buatkan jadwal bayi saya.",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            schedule: {
              type: Type.ARRAY,
              description: "Daftar aktivitas harian berurutan",
              items: {
                type: Type.OBJECT,
                properties: {
                  time: { type: Type.STRING },
                  activity: { type: Type.STRING },
                  duration: { type: Type.STRING },
                  description: { type: Type.STRING }
                },
                required: ["time", "activity", "duration", "description"]
              }
            },
            mpasiTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Tips pemberian MPASI atau susu sesuai usia bayi"
            },
            milestones: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Milestones perkembangan penting"
            },
            advice: {
              type: Type.STRING,
              description: "Pesan hangat dukungan bagi Ibu"
            }
          },
          required: ["schedule", "mpasiTips", "milestones", "advice"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("Gagal menerima respons teks dari Gemini.");
    }

    const parsedData = JSON.parse(text.trim());
    res.json(parsedData);
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ 
      error: "Gagal membuat rekomendasi jadwal.", 
      details: error.message 
    });
  }
});

// API Endpoint for Bunda Care AI Chatbot
app.post("/api/gemini/chat", async (req, res) => {
  try {
    const { messages, babyProfile } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Riwayat pesan tidak valid." });
    }

    // Format the history for @google/genai SDK
    // Keep it within a reasonable size (e.g., last 15 messages) to respect token limits
    const sliceStart = Math.max(0, messages.length - 15);
    const recentMessages = messages.slice(sliceStart);

    const formattedContents = recentMessages.map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }]
    }));

    let babyInfo = "";
    if (babyProfile) {
      const birthDateObj = new Date(babyProfile.birthDate);
      const today = new Date();
      let ageMonths = (today.getFullYear() - birthDateObj.getFullYear()) * 12 + today.getMonth() - birthDateObj.getMonth();
      if (today.getDate() < birthDateObj.getDate()) {
        ageMonths--;
      }
      ageMonths = Math.max(0, ageMonths);

      babyInfo = `Anda adalah asisten virtual bernama "Bunda Care AI", seorang Dokter Anak ahli laktasi, nutrisi MPASI, dan Konsultan Pola Asuh (Parenting). 
Misi Anda adalah membimbing Ibu (Bunda) dalam mendidik, menstimulasi, mengasuh, dan merawat bayinya dengan sangat ramah, penuh empati, sopan, dan hangat.
Semua jawaban Anda harus merujuk pada standar medis profesional, khususnya Ikatan Dokter Anak Indonesia (IDAI) dan WHO.

Profil bayi Ibu saat ini:
- Nama bayi: ${babyProfile.name || "Bayi"}
- Jenis kelamin: ${babyProfile.gender === "female" ? "Perempuan" : "Laki-laki"}
- Tanggal lahir: ${babyProfile.birthDate}
- Usia bayi saat ini: Sekitar ${ageMonths} bulan
- Waktu bangun pagi rata-rata: ${babyProfile.wakeTime}
- Catatan khusus dari Ibu: ${babyProfile.specialNotes || "Tidak ada catatan khusus"}

Gunakan informasi bayi di atas untuk menjawab secara relevan dan terpersonalisasi. Jika Ibu bertanya tentang makanan, berikan tekstur dan porsi yang sesuai dengan usia ${ageMonths} bulan. Berikan panduan yang menenangkan dan kurangi kecemasan Ibu.`;
    } else {
      babyInfo = `Anda adalah asisten virtual bernama "Bunda Care AI", seorang Dokter Anak ahli laktasi, nutrisi MPASI, dan Konsultan Pola Asuh (Parenting). 
Misi Anda adalah membimbing Ibu (Bunda) dalam mendidik, menstimulasi, mengasuh, dan merawat bayinya dengan sangat ramah, penuh empati, sopan, dan hangat.
Semua jawaban Anda harus merujuk pada standar medis profesional, khususnya Ikatan Dokter Anak Indonesia (IDAI) dan WHO.`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedContents,
      config: {
        systemInstruction: babyInfo,
      }
    });

    const reply = response.text || "Maaf Bun, saya tidak bisa memproses pesan ini sekarang. Silakan coba sesaat lagi ya.";
    res.json({ reply });
  } catch (error: any) {
    console.error("Gemini Chat API Error:", error);
    res.status(500).json({
      error: "Gagal memproses pesan chat.",
      details: error.message
    });
  }
});

// PWA manifest.json endpoint
app.get("/manifest.json", (req, res) => {
  res.setHeader("Content-Type", "application/manifest+json");
  res.json({
    name: "Catatan Ibu PWA",
    short_name: "Catatan Ibu",
    description: "Pengingat Jadwal Harian Bayi, MPASI, Imunisasi & Tanya AI Pintar",
    start_url: "/",
    display: "standalone",
    background_color: "#FDFBF7",
    theme_color: "#BC6C25",
    icons: [
      {
        src: "https://cdn-icons-png.flaticon.com/512/3209/3209971.png",
        sizes: "192x192",
        type: "image/png"
      },
      {
        src: "https://cdn-icons-png.flaticon.com/512/3209/3209971.png",
        sizes: "512x512",
        type: "image/png"
      }
    ]
  });
});

// PWA sw.js (service worker) endpoint
app.get("/sw.js", (req, res) => {
  res.setHeader("Content-Type", "application/javascript");
  res.send(`
    const CACHE_NAME = 'catatan-ibu-cache-v1';
    self.addEventListener('install', (event) => {
      event.waitUntil(self.skipWaiting());
    });
    self.addEventListener('activate', (event) => {
      event.waitUntil(self.clients.claim());
    });
    self.addEventListener('fetch', (event) => {
      // Basic network-first strategy with cache fallback
      event.respondWith(
        fetch(event.request).catch(() => {
          return caches.match(event.request);
        })
      );
    });
  `);
});

// Configure Vite integration for asset serving & SPA rendering
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
