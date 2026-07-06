import { useState, useEffect } from "react";
import { BabyProfile, AiRecommendation } from "../types";
import { Clock, Sparkles, BookOpen, ThumbsUp, Activity, AlertCircle, RefreshCw } from "lucide-react";

interface DailyScheduleProps {
  profile: BabyProfile;
  savedAiRec: AiRecommendation | null;
  onSaveAiRec: (rec: AiRecommendation) => void;
}

export default function DailySchedule({ profile, savedAiRec, onSaveAiRec }: DailyScheduleProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiRec, setAiRec] = useState<AiRecommendation | null>(savedAiRec);
  const [ageMonths, setAgeMonths] = useState<number>(0);
  const [loadingPhrase, setLoadingPhrase] = useState("");

  const loadingPhrases = [
    "Menghitung ritme tidur ideal bayi...",
    "Merancang porsi MPASI & jadwal laktasi bernutrisi...",
    "Mengumpulkan stimulasi motorik sesuai usia...",
    "Meracik kata-kata penyemangat untuk Ibu..."
  ];

  // Rotate loading phrases
  useEffect(() => {
    let interval: any;
    if (loading) {
      setLoadingPhrase(loadingPhrases[0]);
      let i = 1;
      interval = setInterval(() => {
        setLoadingPhrase(loadingPhrases[i % loadingPhrases.length]);
        i++;
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  // Calculate age on profile load
  useEffect(() => {
    if (!profile.birthDate) return;
    const birth = new Date(profile.birthDate);
    const today = new Date();
    let months = (today.getFullYear() - birth.getFullYear()) * 12 + today.getMonth() - birth.getMonth();
    if (today.getDate() < birth.getDate()) {
      months--;
    }
    setAgeMonths(Math.max(0, months));
  }, [profile.birthDate]);

  // Get active cohort for presets
  const getAgeCohort = () => {
    if (ageMonths < 3) return "0-3";
    if (ageMonths < 6) return "3-6";
    if (ageMonths < 9) return "6-9";
    if (ageMonths < 12) return "9-12";
    return "12-24";
  };

  const getCohortName = () => {
    if (ageMonths < 3) return "Newborn (0-3 Bulan)";
    if (ageMonths < 6) return "Infant Awal (3-6 Bulan)";
    if (ageMonths < 9) return "Transisi MPASI (6-9 Bulan)";
    if (ageMonths < 12) return "MPASI Aktif (9-12 Bulan)";
    return "Toddler (12-24 Bulan)";
  };

  // Indonesia pediatric default presets
  const PRESETS: Record<string, {
    schedule: { time: string; activity: string; duration: string; description: string }[];
    mpasiTips: string[];
    milestones: string[];
    advice: string;
  }> = {
    "0-3": {
      schedule: [
        { time: "06:00", activity: "Bangun Pagi & Menyusui (ASI/Susu)", duration: "20-30 mnt", description: "ASI/Susu pertama di pagi hari. Berikan pelukan hangat untuk memulai harinya." },
        { time: "07:30", activity: "Tummy Time & Stimulasi Visual", duration: "5-10 mnt", description: "Latih kekuatan otot leher dengan tummy time di kasur matras. Gunakan kartu kontras hitam-putih." },
        { time: "08:00", activity: "Tidur Pagi (Nap 1)", duration: "60-90 mnt", description: "Bayi usia ini hanya bertahan bangun sekitar 60-90 menit sekali waktu." },
        { time: "10:00", activity: "Menyusui & Log Mandi Pagi", duration: "30 mnt", description: "Susu pagi hari dilanjutkan dengan mandi air hangat agar segar." },
        { time: "11:30", activity: "Tidur Siang Ringan (Nap 2)", duration: "45-90 mnt", description: "Tidur siang di tempat sejuk dengan sirkulasi udara baik." },
        { time: "13:30", activity: "Menyusui & Stimulasi Suara", duration: "30 mnt", description: "Susu siang hari. Ajak mengobrol dan bunyikan mainan bergemerincing (rattle)." },
        { time: "15:00", activity: "Tidur Sore (Nap 3)", duration: "45-60 mnt", description: "Siklus tidur pendek untuk mencegah over-tired (terlalu lelah) di malam hari." },
        { time: "16:30", activity: "Menyusui & Pijat Lembut Bayi", duration: "20 mnt", description: "Pijat lembut dengan baby oil untuk relaksasi otot setelah beraktivitas." },
        { time: "19:00", activity: "Menyusui Malam & Persiapan Tidur", duration: "30 mnt", description: "Redupkan lampu, matikan TV, susui dengan tenang untuk merangsang produksi hormon melatonin tidur." },
        { time: "20:30", activity: "Tidur Malam", duration: "Semalaman", description: "Waktu tidur malam utama. Jaga ruangan tetap tenang." }
      ],
      mpasiTips: [
        "ASI Eksklusif: ASI adalah nutrisi terbaik dan mutlak, berikan on-demand (tiap 2-3 jam).",
        "Kapasitas Lambung: Masih sangat kecil (sebesar buah ceri hingga telur), jangan heran jika bayi sering menyusu.",
        "Belum boleh MPASI: Pencernaan belum siap untuk makanan padat sama sekali."
      ],
      milestones: [
        "Mengikuti gerakan benda atau wajah dengan matanya.",
        "Mulai belajar menegakkan kepala sejenak saat tummy time.",
        "Merespons suara keras dengan terkejut atau menoleh."
      ],
      advice: "Ibu hebat, bayi baru lahir butuh waktu adaptasi dengan dunia luar. Tidurlah saat bayi tidur untuk menjaga stamina Anda."
    },
    "3-6": {
      schedule: [
        { time: "06:00", activity: "Bangun Pagi & Menyusui", duration: "20 mnt", description: "Susu pagi hari yang menyegarkan." },
        { time: "07:30", activity: "Berjemur & Bermain Bersama", duration: "15 mnt", description: "Berjemur matahari pagi hangat (pukul 7-8 pagi selama 10-15 menit) diselingi tengkurap mandiri." },
        { time: "08:30", activity: "Tidur Pagi (Nap 1)", duration: "60-90 mnt", description: "Pola tidur mulai terbentuk teratur." },
        { time: "10:30", activity: "Menyusui & Mandi Pagi", duration: "30 mnt", description: "Susu dilanjutkan dengan sesi mandi yang menyenangkan." },
        { time: "11:30", activity: "Bermain Interaktif / Read Aloud", duration: "20 mnt", description: "Bacakan buku bergambar bertekstur atau bernyanyi bersama bayi." },
        { time: "12:30", activity: "Tidur Siang (Nap 2)", duration: "90-120 mnt", description: "Tidur siang terpanjang hari ini." },
        { time: "15:00", activity: "Menyusui & Stimulasi Motorik", duration: "30 mnt", description: "Latih meraih mainan di hadapannya guna melatih kekuatan genggaman tangan." },
        { time: "16:30", activity: "Tidur Sore Singkat (Nap 3)", duration: "30-45 mnt", description: "Power nap penutup sebelum malam." },
        { time: "18:30", activity: "Menyusui & Persiapan Ritual Tidur", duration: "30 mnt", description: "Seka badan, ganti baju tidur nyaman, redupkan lampu kamar." },
        { time: "19:30", activity: "Tidur Malam Utama", duration: "Semalaman", description: "Bayi mulai tidur lebih nyenyak di malam hari." }
      ],
      mpasiTips: [
        "Lanjutkan ASI Eksklusif hingga usia 6 bulan genap.",
        "Mulai amati tanda kesiapan MPASI: Kepala tegak kokoh, tertarik dengan makanan orang dewasa, refleks menjulurkan lidah berkurang."
      ],
      milestones: [
        "Mulai bisa tengkurap sendiri dan berguling bolak-balik.",
        "Tertawa keras (giggle) dan mengeluarkan ocehan bermakna (cooing).",
        "Bisa menggenggam mainan erat dengan seluruh telapak tangannya."
      ],
      advice: "Bayi Anda mulai sangat ekspresif! Terus ajak mengobrol karena ini adalah masa keemasan perkembangan bahasanya."
    },
    "6-9": {
      schedule: [
        { time: "06:00", activity: "Bangun Pagi & Menyusui", duration: "20 mnt", description: "ASI/susu pembuka setelah tidur semalaman." },
        { time: "07:30", activity: "Sarapan MPASI Pertama", duration: "30 mnt", description: "Sajikan MPASI porsi pengenalan (bubur saring halus). Berikan dengan sabar, hargai jika bayi kenyang." },
        { time: "08:30", activity: "Tidur Pagi (Nap 1)", duration: "60 mnt", description: "Tidur pagi untuk pemulihan energi setelah sarapan." },
        { time: "10:30", activity: "Selingan ASI / Susu Cair", duration: "15 mnt", description: "Menyusui secukupnya di sela waktu makan utama." },
        { time: "12:00", activity: "Makan Siang MPASI Kedua", duration: "30 mnt", description: "MPASI porsi siang hari. Boleh sajikan sayur atau buah lumat." },
        { time: "13:00", activity: "Tidur Siang (Nap 2)", duration: "90-120 mnt", description: "Waktu istirahat siang utama." },
        { time: "15:30", activity: "Selingan Buah Lumat (Snack)", duration: "20 mnt", description: "Beri puree buah alpukat, pisang kerok, atau pepaya lumat halus." },
        { time: "16:30", activity: "Mandi Sore & Bermain", duration: "30 mnt", description: "Mandi sore segar, latih duduk dengan bimbingan bantal pelindung." },
        { time: "18:30", activity: "Menyusui & Ritual Tidur", duration: "20 mnt", description: "Menyusui porsi penutup hari." },
        { time: "19:15", activity: "Tidur Malam", duration: "Semalaman", description: "Pastikan kamar ber-AC/sejuk seimbang agar bayi nyaman." }
      ],
      mpasiTips: [
        "Tekstur: Mulai dengan puree bubur saring sangat halus (semi cair ke kental), berlanjut perlahan.",
        "Frekuensi: 2 kali makanan utama (sarapan & makan siang), ditambah 1 kali selingan buah.",
        "Porsi: Cukup 2-3 sendok makan per porsi makan utama awal, tingkatkan perlahan sampai 125ml."
      ],
      milestones: [
        "Dapat duduk tegap sendiri tanpa disangga selama beberapa detik.",
        "Mulai mengenali namanya saat dipanggil dan menoleh aktif.",
        "Memindahkan mainan dari tangan kanan ke tangan kiri."
      ],
      advice: "Selamat memasuki era MPASI! Ingat, porsi makan awal masih sedikit karena ASI tetap sumber energi dominan. Sabar dan buat suasana makan menyenangkan!"
    },
    "9-12": {
      schedule: [
        { time: "06:00", activity: "Bangun Pagi & Menyusui", duration: "15 mnt", description: "Asupan ASI pagi penenang tidur." },
        { time: "07:30", activity: "Sarapan MPASI Utama", duration: "30 mnt", description: "Bubur tim kasar / dicincang halus (minced) kaya zat besi (hati ayam, daging)." },
        { time: "09:00", activity: "Tidur Pagi (Nap 1)", duration: "60 mnt", description: "Tidur pagi pendek." },
        { time: "10:30", activity: "Snack Pagi (Finger Food)", duration: "20 mnt", description: "Beri finger food lunak (contoh: potongan wortel kukus, kentang kukus, pisang)." },
        { time: "12:30", activity: "Makan Siang MPASI Utama", duration: "30 mnt", description: "Menu lengkap gizi seimbang protein dan lemak tambahan (minyak kelapa/mentega)." },
        { time: "13:30", activity: "Tidur Siang (Nap 2)", duration: "90 mnt", description: "Tidur siang berkualitas." },
        { time: "15:30", activity: "Snack Sore & Menyusui", duration: "30 mnt", description: "Snack sore padat gizi diikuti sedikit ASI." },
        { time: "17:00", activity: "Mandi Sore & Bermain Aktif", duration: "45 mnt", description: "Mandi dilanjutkan latihan merangkak, berdiri pegangan, atau merambat." },
        { time: "18:30", activity: "Makan Malam MPASI Utama", duration: "30 mnt", description: "Makan malam sekeluarga dengan menu ringan teratur." },
        { time: "20:00", activity: "Menyusui & Tidur Malam", duration: "Semalaman", description: "Tidur malam lelap tanpa gangguan laktasi berlebih." }
      ],
      mpasiTips: [
        "Tekstur: Naik tingkat menjadi dicincang halus (minced), dicincang kasar (chopped), atau nasi tim lembek.",
        "Frekuensi: Sudah 3 kali makanan utama, plus 1-2 kali makanan selingan (finger food).",
        "Porsi: Sekitar setengah mangkuk ukuran 250 ml (125 ml) tiap makan utama."
      ],
      milestones: [
        "Merangkak dengan lincah, berpegangan pada furnitur untuk berdiri (cruising).",
        "Bisa melambai tangan ('dadah'), tepuk tangan, dan menunjuk benda.",
        "Mulai mengucapkan kata pertama sederhana seperti 'Mama', 'Papa', 'Dada'."
      ],
      advice: "Bayi Anda kini sangat aktif bergerak dan ingin tahu segalanya! Pastikan sudut-sudut rumah Anda aman (baby-proofed) dari ujung tajam dan benda berbahaya."
    },
    "12-24": {
      schedule: [
        { time: "06:30", activity: "Bangun Pagi & Susu / ASI", duration: "15 mnt", description: "Menyusui santai di kasur." },
        { time: "07:30", activity: "Sarapan Makanan Keluarga", duration: "30 mnt", description: "Mulai konsumsi menu meja keluarga biasa dengan bumbu minimalis alami." },
        { time: "10:00", activity: "Snack Pagi & Ajak Jalan Keluar", duration: "45 mnt", description: "Ajak berjalan keliling perumahan, menghirup udara luar dan bersosialisasi." },
        { time: "12:00", activity: "Makan Siang Utama", duration: "30 mnt", description: "Makan siang kaya serat, karbohidrat, dan protein sehat." },
        { time: "13:00", activity: "Tidur Siang Tunggal", duration: "120 mnt", description: "Mayoritas balita beralih ke pola 1 kali tidur siang saja berdurasi panjang." },
        { time: "15:30", activity: "Susu Sore & Selingan Sehat", duration: "30 mnt", description: "Susu UHT / ASI disandingkan dengan kudapan puding susu atau buah potong." },
        { time: "16:30", activity: "Mandi & Lari / Bermain Bebas", duration: "60 mnt", description: "Bermain lego besar, bola, atau menyusun balok kayu." },
        { time: "18:30", activity: "Makan Malam Bersama", duration: "30 mnt", description: "Waktu berharga makan malam bersama seluruh anggota keluarga." },
        { time: "19:30", activity: "Dongeng Dongeng / Read Aloud", duration: "20 mnt", description: "Ritual membaca dongeng sebelum tidur untuk kosa kata cerdas." },
        { time: "20:00", activity: "Susu Penutup & Tidur Malam", duration: "Semalaman", description: "Tidur malam disiplin guna pemulihan hormon tumbuh kembang tinggi badan." }
      ],
      mpasiTips: [
        "Makanan Keluarga: Sudah bisa makan menu yang sama dengan orang tua, potong kecil-kecil.",
        "Kurangi Gula-Garam: Batasi asupan gula tambahan dan makanan kemasan tinggi natrium.",
        "ASI/Susu Tambahan: Berikan sekitar 400-500 ml susu per hari saja agar anak tetap nafsu makan padat."
      ],
      milestones: [
        "Dapat berjalan mandiri dengan mantap, menaiki anak tangga dengan bantuan.",
        "Menyebutkan minimal 6-10 kata fungsional mandiri.",
        "Mulai meniru pekerjaan rumah sederhana (menyapu, mengelap)."
      ],
      advice: "Balita Anda sedang mengeksplorasi kemandiriannya! Berikan pilihan terstruktur (contoh: 'Mau pakai baju merah atau kuning?') untuk mendukung rasa percaya dirinya."
    }
  };

  const activePreset = PRESETS[getAgeCohort()];

  const handleGenerateAiSchedule = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/gemini/schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          babyName: profile.name,
          babyAgeMonths: ageMonths,
          babyGender: profile.gender,
          wakeTime: profile.wakeTime,
          specialNotes: profile.specialNotes,
        }),
      });

      if (!response.ok) {
        throw new Error("Gagal terhubung dengan server rekomendasi AI.");
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      const newRec: AiRecommendation = {
        ...data,
        generatedAt: new Date().toISOString(),
      };

      setAiRec(newRec);
      onSaveAiRec(newRec);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Terjadi kesalahan sistem, silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetToPreset = () => {
    if (confirm("Apakah Ibu ingin kembali ke jadwal rekomendasi standar medis?")) {
      setAiRec(null);
      // Clean parent storage state
      onSaveAiRec(null as any);
    }
  };

  const displaySchedule = aiRec ? aiRec.schedule : activePreset.schedule;
  const displayMpasi = aiRec ? aiRec.mpasiTips : activePreset.mpasiTips;
  const displayMilestones = aiRec ? aiRec.milestones : activePreset.milestones;
  const displayAdvice = aiRec ? aiRec.advice : activePreset.advice;

  return (
    <div id="daily-schedule-section" className="space-y-8">
      {/* Age Badge & Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#FDFBF7] p-5 rounded-3xl border border-[#E2E8CE]">
        <div>
          <span className="text-[10px] text-[#BC6C25] font-bold uppercase tracking-widest">Rekomendasi Berdasarkan Usia</span>
          <h3 className="font-serif font-bold text-xl text-[#5A5A40] flex items-center gap-2 mt-1">
            <Activity className="w-5 h-5 text-[#BC6C25]" />
            {getCohortName()}
          </h3>
        </div>

        <div className="flex gap-2">
          {aiRec ? (
            <button
              id="btn-back-to-preset"
              onClick={handleResetToPreset}
              className="flex items-center gap-1.5 text-xs font-bold text-[#8B8B6B] hover:text-[#5A5A40] bg-white border border-[#E2E8CE] px-3.5 py-2 rounded-xl transition uppercase tracking-wider"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#BC6C25]" /> Gunakan Jadwal Standar
            </button>
          ) : null}

          <button
            id="btn-generate-ai-schedule"
            onClick={handleGenerateAiSchedule}
            disabled={loading}
            className="flex items-center gap-2 text-xs font-bold bg-[#BC6C25] hover:bg-[#a6561b] text-white px-4 py-2.5 rounded-xl shadow-sm transition disabled:opacity-50 uppercase tracking-wider"
          >
            <Sparkles className="w-3.5 h-3.5 fill-white" />
            {loading ? "Menyusun..." : aiRec ? "Perbarui via AI Pintar" : "Konsultasi Jadwal Pintar AI"}
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-[#F2E8CF] border border-[#BC6C25]/20 rounded-2xl text-[#BC6C25] text-sm flex gap-2 items-center">
          <AlertCircle className="w-5 h-5 shrink-0 text-[#BC6C25]" />
          <span className="font-sans font-medium">{error}</span>
        </div>
      )}

      {/* Loading Screen */}
      {loading ? (
        <div className="bg-white rounded-3xl p-12 border border-[#E2E8CE] shadow-sm flex flex-col items-center justify-center text-center space-y-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-[#E2E8CE] animate-pulse"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-[#BC6C25] animate-spin"></div>
          </div>
          <h4 className="font-serif font-bold text-[#5A5A40] text-xl">Konsultasi AI Dokter & Parenting</h4>
          <p className="text-sm text-[#8B8B6B] max-w-sm italic font-serif">
            &ldquo;{loadingPhrase}&rdquo;
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Daily Schedule Timeline */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 md:p-8 border border-[#E2E8CE] shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-[#F5F5F0] pb-4">
              <h4 className="font-serif font-bold text-xl text-[#5A5A40] flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#BC6C25]" />
                Runtutan Jadwal Harian
              </h4>
              <span className="text-xs bg-[#E2E8CE] text-[#5A5A40] px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                {aiRec ? "Kustomisasi AI Pintar" : "Rekomendasi Medis IDAI"}
              </span>
            </div>

            <div className="relative border-l-2 border-[#E2E8CE] pl-6 ml-3 space-y-6">
              {displaySchedule.map((item, index) => (
                <div key={index} className="relative group">
                  {/* Dot */}
                  <span className="absolute -left-[31px] top-1.5 bg-[#BC6C25] border-4 border-white w-4 h-4 rounded-full group-hover:bg-[#a6561b] transition shadow-sm"></span>

                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1.5">
                    <span className="font-mono text-[10px] font-bold text-[#BC6C25] bg-[#F2E8CF] px-2.5 py-1 rounded-lg self-start">
                      {item.time} ({item.duration})
                    </span>
                    <span className="text-[10px] text-[#8B8B6B] uppercase font-bold tracking-wider">Langkah {index + 1}</span>
                  </div>

                  <h5 className="font-serif font-bold text-base text-[#5A5A40] mt-2">{item.activity}</h5>
                  <p className="text-xs text-[#8B8B6B] mt-1 leading-relaxed font-sans">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebars: MPASI & Milestones */}
          <div className="space-y-6">
            {/* MPASI Tips Card */}
            <div className="bg-[#F2E8CF]/20 rounded-3xl p-6 border border-[#E2E8CE] shadow-sm space-y-4">
              <h4 className="font-serif font-bold text-lg text-[#BC6C25] flex items-center gap-2 border-b border-[#E2E8CE] pb-3">
                <BookOpen className="w-5 h-5 text-[#BC6C25]" />
                Panduan MPASI & Nutrisi
              </h4>
              <ul className="space-y-3">
                {displayMpasi.map((tip, idx) => (
                  <li key={idx} className="text-xs text-[#5A5A40] flex items-start gap-2 leading-relaxed">
                    <span className="text-[#BC6C25] font-bold shrink-0">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Milestones Card */}
            <div className="bg-[#E2E8CE]/20 rounded-3xl p-6 border border-[#E2E8CE] shadow-sm space-y-4">
              <h4 className="font-serif font-bold text-lg text-[#5A5A40] flex items-center gap-2 border-b border-[#E2E8CE] pb-3">
                <Sparkles className="w-5 h-5 text-[#BC6C25]" />
                Target Tumbuh Kembang
              </h4>
              <ul className="space-y-3">
                {displayMilestones.map((milestone, idx) => (
                  <li key={idx} className="text-xs text-[#5A5A40] flex items-start gap-2 leading-relaxed font-sans">
                    <span className="text-[#BC6C25] font-bold shrink-0">✓</span>
                    <span>{milestone}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* AI Supportive Advice Warm Card */}
            <div className="bg-white rounded-3xl p-6 border border-[#E2E8CE] shadow-sm text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-[#BC6C25]"></div>
              <h5 className="font-serif font-bold text-[#BC6C25] text-sm flex items-center justify-center gap-1.5 mb-2.5">
                <ThumbsUp className="w-4 h-4 fill-[#BC6C25] text-[#BC6C25]" /> Kata Semangat Untuk Ibu
              </h5>
              <p className="text-xs text-[#5A5A40] italic leading-relaxed font-serif">
                &ldquo;{displayAdvice}&rdquo;
              </p>
              {aiRec && (
                <p className="text-[9px] text-[#8B8B6B] font-mono mt-3 uppercase tracking-wider">
                  Diperbarui via AI pada {new Date(aiRec.generatedAt).toLocaleString("id-ID")}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
