import { useState, useEffect } from "react";
import { BabyProfile, FeedingLog, MpasiLog, ImmunizationRecord, DailyTask, AiRecommendation } from "./types";
import ProfileForm from "./components/ProfileForm";
import DailySchedule from "./components/DailySchedule";
import FeedingTracker from "./components/FeedingTracker";
import ImmunizationTracker from "./components/ImmunizationTracker";
import Dashboard from "./components/Dashboard";
import AiChat from "./components/AiChat";

import { 
  Home, 
  Clock, 
  Heart, 
  FileCheck2, 
  User, 
  Baby, 
  HeartHandshake, 
  Calendar,
  Sparkles,
  MessageSquare,
  Download,
  Share,
  X
} from "lucide-react";

// Default standard IDAI Immunization records for 0-24 Months
const DEFAULT_IMMUNIZATIONS: ImmunizationRecord[] = [
  { id: "v1", name: "Hepatitis B - 1", ageTargetMonths: 0, recommendedAgeStr: "0 Bulan (Lahir)", description: "Mencegah infeksi hati Hepatitis B berat, disuntikkan dalam 24 jam setelah bayi lahir.", isCompleted: false },
  { id: "v2", name: "Polio - 0", ageTargetMonths: 0, recommendedAgeStr: "0 Bulan (Lahir)", description: "Vaksin tetes polio pertama guna melatih kekebalan terhadap lumpuh layu.", isCompleted: false },
  { id: "v3", name: "BCG (TBC)", ageTargetMonths: 1, recommendedAgeStr: "1 Bulan", description: "Melindungi bayi dari serangan penyakit Tuberkulosis (TBC) paru, otak, dan tulang.", isCompleted: false },
  { id: "v4", name: "Polio - 1", ageTargetMonths: 1, recommendedAgeStr: "1 Bulan", description: "Tetes polio kedua untuk memperkuat kekebalan pencernaan bayi.", isCompleted: false },
  { id: "v5", name: "DPT-HB-Hib - 1", ageTargetMonths: 2, recommendedAgeStr: "2 Bulan", description: "Mencegah Difteri, Pertusis (batuk rejan), Tetanus, Hepatitis B, serta Meningitis/Radang Otak.", isCompleted: false },
  { id: "v6", name: "Polio - 2", ageTargetMonths: 2, recommendedAgeStr: "2 Bulan", description: "Tetes polio ketiga untuk perlindungan bertahap.", isCompleted: false },
  { id: "v7", name: "PCV - 1", ageTargetMonths: 2, recommendedAgeStr: "2 Bulan", description: "Melindungi dari bakteri Pneumokokus pemicu radang paru (Pneumonia) berbahaya.", isCompleted: false },
  { id: "v8", name: "Rotavirus - 1", ageTargetMonths: 2, recommendedAgeStr: "2 Bulan", description: "Vaksin tetes mencegah diare parah dan dehidrasi akibat infeksi virus Rotavirus.", isCompleted: false },
  { id: "v9", name: "DPT-HB-Hib - 2", ageTargetMonths: 3, recommendedAgeStr: "3 Bulan", description: "Suntikan kombinasi dosis kedua guna mempertahankan titer antibodi bayi.", isCompleted: false },
  { id: "v10", name: "Polio - 3", ageTargetMonths: 3, recommendedAgeStr: "3 Bulan", description: "Tetes polio keempat.", isCompleted: false },
  { id: "v11", name: "Rotavirus - 2", ageTargetMonths: 3, recommendedAgeStr: "3 Bulan", description: "Tetes rotavirus dosis kedua.", isCompleted: false },
  { id: "v12", name: "DPT-HB-Hib - 3", ageTargetMonths: 4, recommendedAgeStr: "4 Bulan", description: "Suntikan kombinasi dosis ketiga untuk pembentukan imun lengkap dasar.", isCompleted: false },
  { id: "v13", name: "Polio - 4 / IPV - 1", ageTargetMonths: 4, recommendedAgeStr: "4 Bulan", description: "Suntikan polio (IPV) guna melengkapi cakupan kekebalan tetes polio cair.", isCompleted: false },
  { id: "v14", name: "PCV - 2", ageTargetMonths: 4, recommendedAgeStr: "4 Bulan", description: "Suntikan PCV dosis kedua.", isCompleted: false },
  { id: "v15", name: "Rotavirus - 3", ageTargetMonths: 4, recommendedAgeStr: "4 Bulan", description: "Tetes rotavirus dosis ketiga (terakhir).", isCompleted: false },
  { id: "v16", name: "Influenza - 1", ageTargetMonths: 6, recommendedAgeStr: "6 Bulan", description: "Vaksinasi tahunan pertama untuk mencegah gejala infeksi pernapasan influenza berat.", isCompleted: false },
  { id: "v17", name: "PCV - 3", ageTargetMonths: 6, recommendedAgeStr: "6 Bulan", description: "PCV dosis ketiga untuk perlindungan penuh infeksi bakteri pernapasan.", isCompleted: false },
  { id: "v18", name: "MR / Campak-Rubela", ageTargetMonths: 9, recommendedAgeStr: "9 Bulan", description: "Mencegah penularan Campak (Measles) dan Rubela penyebab kecacatan bawaan.", isCompleted: false },
  { id: "v19", name: "PCV Booster", ageTargetMonths: 12, recommendedAgeStr: "12 Bulan", description: "Penguat PCV dosis keempat agar kekebalan bertahan jangka panjang.", isCompleted: false },
  { id: "v20", name: "DPT-HB-Hib Booster", ageTargetMonths: 18, recommendedAgeStr: "18 Bulan", description: "Suntikan penguat (booster) kombinasi dosis keempat.", isCompleted: false },
  { id: "v21", name: "MR Booster", ageTargetMonths: 18, recommendedAgeStr: "18 Bulan", description: "Suntikan penguat Campak-Rubela dosis kedua.", isCompleted: false }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "schedule" | "chat" | "profile">("dashboard");

  // Core App states
  const [profile, setProfile] = useState<BabyProfile | null>(null);
  const [feedingLogs, setFeedingLogs] = useState<FeedingLog[]>([]);
  const [mpasiLogs, setMpasiLogs] = useState<MpasiLog[]>([]);
  const [immunizationRecords, setImmunizationRecords] = useState<ImmunizationRecord[]>([]);
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [savedAiRec, setSavedAiRec] = useState<AiRecommendation | null>(null);

  // PWA states
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  // Detect PWA Installation and Device context
  useEffect(() => {
    const ua = navigator.userAgent;
    const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    const isMov = mobileRegex.test(ua);
    setIsMobile(isMov);

    const ios = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    setIsIOS(ios);

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Only show if not dismissed before
      if (!localStorage.getItem("pwa_dismissed_catatan_ibu")) {
        setShowInstallBanner(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // If it is iOS Safari and not standalone, show prompt to guide them
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;
    if (isMov && ios && !isStandalone && !localStorage.getItem("pwa_dismissed_catatan_ibu")) {
      setShowInstallBanner(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (isIOS) {
      setShowIOSInstructions(true);
      setShowInstallBanner(false);
    } else if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === "accepted") {
          console.log("User accepted the install prompt");
        } else {
          console.log("User dismissed the install prompt");
        }
        setDeferredPrompt(null);
        setShowInstallBanner(false);
      });
    } else {
      // Fallback for general browsers
      alert("Aplikasi ini dapat di-install melalui menu Browser Anda (titik tiga di kanan atas > 'Instal Aplikasi' / 'Tambahkan ke Layar Utama').");
      setShowInstallBanner(false);
    }
  };

  // Initialize data from LocalStorage
  useEffect(() => {
    try {
      const storedProfile = localStorage.getItem("bunda_care_profile");
      if (storedProfile) {
        setProfile(JSON.parse(storedProfile));
      } else {
        // Force onboarding profile tab if none exists
        setActiveTab("profile");
      }

      const storedFeeds = localStorage.getItem("bunda_care_feeds");
      if (storedFeeds) setFeedingLogs(JSON.parse(storedFeeds));

      const storedMpasis = localStorage.getItem("bunda_care_mpasis");
      if (storedMpasis) setMpasiLogs(JSON.parse(storedMpasis));

      const storedImm = localStorage.getItem("bunda_care_immunizations");
      if (storedImm) {
        setImmunizationRecords(JSON.parse(storedImm));
      } else {
        setImmunizationRecords(DEFAULT_IMMUNIZATIONS);
      }

      const storedTasks = localStorage.getItem("bunda_care_tasks");
      if (storedTasks) setTasks(JSON.parse(storedTasks));

      const storedAiRec = localStorage.getItem("bunda_care_ai_rec");
      if (storedAiRec) setSavedAiRec(JSON.parse(storedAiRec));

    } catch (e) {
      console.error("Error loading localStorage:", e);
    }
  }, []);

  // Save baby tasks when profile changes (generate base tasks based on age)
  useEffect(() => {
    if (!profile) return;
    const storedTasks = localStorage.getItem("bunda_care_tasks");
    if (storedTasks) return; // Do not overwrite if tasks already exist

    // If tasks is empty, populate based on age cohort
    const birth = new Date(profile.birthDate);
    const today = new Date();
    let months = (today.getFullYear() - birth.getFullYear()) * 12 + today.getMonth() - birth.getMonth();
    if (today.getDate() < birth.getDate()) months--;
    const ageMonths = Math.max(0, months);

    let defaultTaskTitles: string[] = [];
    if (ageMonths < 3) {
      defaultTaskTitles = ["Menyusui DBF Pagi", "Berjemur Pagi (15 mnt)", "Tidur Pagi (Nap 1)", "Mandikan Bayi Air Hangat", "Tidur Siang (Nap 2)", "Pijat Bayi Lembut", "Tidur Malam"];
    } else if (ageMonths < 6) {
      defaultTaskTitles = ["Menyusui Pagi", "Berjemur Pagi", "Tidur Pagi (Nap 1)", "Latih Tummy Time", "Tidur Siang (Nap 2)", "Read Aloud Dongeng", "Tidur Malam"];
    } else if (ageMonths < 9) {
      defaultTaskTitles = ["Menyusui Pagi", "Sarapan MPASI Bubur Saring", "Tidur Pagi (Nap 1)", "ASI Siang", "Makan Siang MPASI", "Tidur Siang (Nap 2)", "Selingan Buah", "Mandi Sore", "Tidur Malam"];
    } else if (ageMonths < 12) {
      defaultTaskTitles = ["Menyusui Pagi", "Sarapan MPASI Tim Kasar", "Tidur Pagi", "Snack Finger Food Sore", "Makan Siang Utama", "Tidur Siang", "Latih Merangkak/Berdiri", "Makan Malam MPASI", "Tidur Malam"];
    } else {
      defaultTaskTitles = ["ASI/Susu Pagi", "Sarapan Menu Keluarga", "Jalan-jalan Pagi", "Makan Siang Utama", "Tidur Siang Tunggal", "Susu Sore & Buah", "Latihan Lego/Menyusun Balok", "Makan Malam Bersama", "Dongeng Sebelum Tidur"];
    }

    const initialTasks: DailyTask[] = defaultTaskTitles.map((title, idx) => ({
      id: `preset-${idx}-${Date.now()}`,
      title,
      category: title.toLowerCase().includes("mpasi") ? "mpasi" : title.toLowerCase().includes("menyusui") || title.toLowerCase().includes("susu") ? "menyusui" : "lainnya",
      timeStr: `${(7 + idx * 2).toString().padStart(2, "0")}:00`,
      isCompleted: false,
    }));

    setTasks(initialTasks);
    localStorage.setItem("bunda_care_tasks", JSON.stringify(initialTasks));
  }, [profile]);

  // Profile Save helper
  const handleSaveProfile = (newProfile: BabyProfile) => {
    setProfile(newProfile);
    localStorage.setItem("bunda_care_profile", JSON.stringify(newProfile));
    setActiveTab("dashboard");
  };

  // Add Feeding helper
  const handleAddFeedingLog = (log: FeedingLog) => {
    const updated = [log, ...feedingLogs];
    setFeedingLogs(updated);
    localStorage.setItem("bunda_care_feeds", JSON.stringify(updated));
  };

  // Add MPASI helper
  const handleAddMpasiLog = (log: MpasiLog) => {
    const updated = [log, ...mpasiLogs];
    setMpasiLogs(updated);
    localStorage.setItem("bunda_care_mpasis", JSON.stringify(updated));
  };

  // Toggle Immunization Vaccine
  const handleToggleImmunization = (id: string, isCompleted: boolean, completedDate?: string, notes?: string) => {
    const updated = immunizationRecords.map((rec) => {
      if (rec.id === id) {
        return {
          ...rec,
          isCompleted,
          completedDate: isCompleted ? (completedDate || new Date().toISOString().split("T")[0]) : undefined,
          notes: isCompleted ? notes : undefined
        };
      }
      return rec;
    });
    setImmunizationRecords(updated);
    localStorage.setItem("bunda_care_immunizations", JSON.stringify(updated));
  };

  // Task checklist handlers
  const handleAddTask = (task: DailyTask) => {
    const updated = [task, ...tasks];
    setTasks(updated);
    localStorage.setItem("bunda_care_tasks", JSON.stringify(updated));
  };

  const handleToggleTask = (id: string) => {
    const updated = tasks.map((t) => (t.id === id ? { ...t, isCompleted: !t.isCompleted } : t));
    setTasks(updated);
    localStorage.setItem("bunda_care_tasks", JSON.stringify(updated));
  };

  const handleDeleteTask = (id: string) => {
    const updated = tasks.filter((t) => t.id !== id);
    setTasks(updated);
    localStorage.setItem("bunda_care_tasks", JSON.stringify(updated));
  };

  // AI Rec Save helper
  const handleSaveAiRec = (newRec: AiRecommendation) => {
    setSavedAiRec(newRec);
    localStorage.setItem("bunda_care_ai_rec", JSON.stringify(newRec));
  };

  const calculateAge = (birthDateStr: string) => {
    const birth = new Date(birthDateStr);
    const today = new Date();
    let months = (today.getFullYear() - birth.getFullYear()) * 12 + today.getMonth() - birth.getMonth();
    let days = today.getDate() - birth.getDate();

    if (days < 0) {
      months--;
      const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += lastMonth.getDate();
    }

    if (months === 0) {
      return `${days} Hari`;
    }
    return `${months} Bulan ${days} Hari`;
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#5A5A40] font-sans flex flex-col selection:bg-[#E2E8CE]">
      {/* 1. Header Banner */}
      <header className="bg-white border-b border-[#E2E8CE] sticky top-0 z-40 shrink-0 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#E2E8CE] flex items-center justify-center text-[#5A5A40] border-2 border-white shadow-sm">
              <Baby className="w-6 h-6 text-[#5A5A40]" />
            </div>
            <div>
              <h1 className="font-serif font-bold text-lg md:text-xl text-[#5A5A40] flex items-center gap-1.5 leading-none">
                Catatan Ibu <span className="text-[10px] bg-[#E2E8CE] text-[#5A5A40] px-2 py-0.5 rounded-full font-sans font-bold tracking-wider uppercase">PWA</span>
              </h1>
              <p className="text-[11px] text-[#8B8B6B] mt-1 font-medium uppercase tracking-wider">Pengingat Jadwal, MPASI, Imunisasi & AI Pintar</p>
            </div>
          </div>

          {profile && (
            <div className="flex items-center gap-3 bg-white border border-[#E2E8CE] px-3.5 py-1.5 rounded-2xl shadow-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#BC6C25] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#BC6C25]"></span>
              </span>
              <div className="text-right">
                <div className="text-xs font-bold text-[#5A5A40]">{profile.name}</div>
                <div className="text-[10px] text-[#8B8B6B] font-medium font-serif italic">{calculateAge(profile.birthDate)}</div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* 2. Main Work Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 pb-24 md:pb-12">
        {!profile ? (
          <div className="max-w-xl mx-auto py-12">
            <div className="text-center space-y-3 mb-8">
              <div className="w-16 h-16 rounded-full bg-[#E2E8CE] flex items-center justify-center mx-auto mb-4">
                <HeartHandshake className="w-8 h-8 text-[#BC6C25] animate-bounce" />
              </div>
              <h2 className="font-serif font-bold text-2xl md:text-3xl text-[#5A5A40]">Selamat Datang, Ibu Hebat!</h2>
              <p className="text-sm text-[#8B8B6B] max-w-md mx-auto leading-relaxed">
                Mulai gunakan asisten digital PWA hari ini untuk melacak asupan laktasi, MPASI padat, imunisasi wajib IDAI, dan rekomendasi harian pintar.
              </p>
            </div>
            <div className="bg-white border border-[#E2E8CE] rounded-[32px] p-2 shadow-sm">
              <ProfileForm profile={null} onSave={handleSaveProfile} />
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            
             {/* Nav tabs for desktop */}
            <div className="hidden md:flex gap-1 bg-white p-1 rounded-2xl border border-[#E2E8CE] shadow-sm max-w-2xl">
              {(["dashboard", "schedule", "chat", "profile"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 uppercase tracking-wider ${
                    activeTab === tab
                      ? "bg-[#BC6C25] text-white shadow-sm"
                      : "text-[#8B8B6B] hover:text-[#5A5A40] hover:bg-[#F5F5F0]"
                  }`}
                >
                  {tab === "dashboard" && <Home className="w-4 h-4" />}
                  {tab === "schedule" && <Clock className="w-4 h-4" />}
                  {tab === "chat" && <MessageSquare className="w-4 h-4" />}
                  {tab === "profile" && <User className="w-4 h-4" />}
                  <span>{tab === "dashboard" ? "Home" : tab === "schedule" ? "Jadwal" : tab === "chat" ? "Tanya AI" : "Profil"}</span>
                </button>
              ))}
            </div>

             {/* Routed View Components */}
            <div className="min-h-[450px]">
              {activeTab === "dashboard" && (
                <Dashboard
                  profile={profile}
                  feedingLogs={feedingLogs}
                  mpasiLogs={mpasiLogs}
                  immunizationRecords={immunizationRecords}
                  tasks={tasks}
                  onAddTask={handleAddTask}
                  onToggleTask={handleToggleTask}
                  onDeleteTask={handleDeleteTask}
                  onAddFeedingLog={handleAddFeedingLog}
                  onAddMpasiLog={handleAddMpasiLog}
                  onToggleImmunization={handleToggleImmunization}
                  onDeleteFeedingLog={(id) => {
                    const updated = feedingLogs.filter((log) => log.id !== id);
                    setFeedingLogs(updated);
                    localStorage.setItem("bunda_care_feeds", JSON.stringify(updated));
                  }}
                  onDeleteMpasiLog={(id) => {
                    const updated = mpasiLogs.filter((log) => log.id !== id);
                    setMpasiLogs(updated);
                    localStorage.setItem("bunda_care_mpasis", JSON.stringify(updated));
                  }}
                />
              )}

              {activeTab === "schedule" && (
                <DailySchedule
                  profile={profile}
                  savedAiRec={savedAiRec}
                  onSaveAiRec={handleSaveAiRec}
                />
              )}

              {activeTab === "chat" && (
                <AiChat
                  profile={profile}
                />
              )}

              {activeTab === "profile" && (
                <div className="max-w-2xl mx-auto bg-white border border-[#E2E8CE] rounded-[32px] p-2 shadow-sm">
                  <ProfileForm profile={profile} onSave={handleSaveProfile} />
                </div>
              )}
            </div>

          </div>
        )}
      </main>

      {/* 3. Bottom Navigation Bar for Mobile */}
      {profile && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E2E8CE] shadow-lg px-2 py-2.5 flex md:hidden justify-around items-center z-50 rounded-t-2xl">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition ${
              activeTab === "dashboard" ? "text-[#BC6C25] scale-110 font-bold" : "text-[#8B8B6B]"
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] mt-1 font-semibold uppercase tracking-wider">Home</span>
          </button>

          <button
            onClick={() => setActiveTab("schedule")}
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition ${
              activeTab === "schedule" ? "text-[#BC6C25] scale-110 font-bold" : "text-[#8B8B6B]"
            }`}
          >
            <Clock className="w-5 h-5" />
            <span className="text-[10px] mt-1 font-semibold uppercase tracking-wider">Jadwal</span>
          </button>

          <button
            onClick={() => setActiveTab("chat")}
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition ${
              activeTab === "chat" ? "text-[#BC6C25] scale-110 font-bold" : "text-[#8B8B6B]"
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            <span className="text-[10px] mt-1 font-semibold uppercase tracking-wider">Tanya AI</span>
          </button>

          <button
            onClick={() => setActiveTab("profile")}
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition ${
              activeTab === "profile" ? "text-[#BC6C25] scale-110 font-bold" : "text-[#8B8B6B]"
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-[10px] mt-1 font-semibold uppercase tracking-wider">Profil</span>
          </button>
        </nav>
      )}

      {/* Custom PWA Install Banner */}
      {showInstallBanner && (
        <div className="fixed bottom-20 left-4 right-4 md:bottom-6 md:right-6 md:left-auto z-50 max-w-sm bg-white border-2 border-[#E2E8CE] rounded-[24px] p-4 shadow-xl flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-6 duration-300">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-2xl bg-[#F2E8CF] text-[#BC6C25] shrink-0">
              <Download className="w-6 h-6 stroke-[2]" />
            </div>
            <div className="space-y-1">
              <h4 className="font-serif font-bold text-sm text-[#5A5A40]">Pasang Catatan Ibu di HP 📲</h4>
              <p className="text-[11px] text-[#8B8B6B] leading-relaxed">
                Akses lebih cepat & praktis langsung dari layar utama HP Anda, tanpa perlu membuka browser lagi!
              </p>
            </div>
            <button
              onClick={() => {
                setShowInstallBanner(false);
                localStorage.setItem("pwa_dismissed_catatan_ibu", "true");
              }}
              className="p-1 rounded-full text-[#8B8B6B] hover:bg-[#F5F5F0] transition cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex justify-end gap-2 text-xs font-bold pt-2 border-t border-[#F5F5F0]">
            <button
              onClick={() => {
                setShowInstallBanner(false);
                localStorage.setItem("pwa_dismissed_catatan_ibu", "true");
              }}
              className="px-3 py-1.5 rounded-xl border border-[#E2E8CE] text-[#8B8B6B] hover:bg-[#F5F5F0] transition cursor-pointer"
            >
              Nanti Saja
            </button>
            <button
              onClick={handleInstallClick}
              className="px-4 py-1.5 rounded-xl bg-[#BC6C25] text-white hover:bg-[#a6561b] transition shadow-md flex items-center gap-1 cursor-pointer"
            >
              Pasang Sekarang
            </button>
          </div>
        </div>
      )}

      {/* iOS Safari Custom Instructions Modal */}
      {showIOSInstructions && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] border border-[#E2E8CE] shadow-2xl max-w-sm w-full p-6 text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-center">
              <div className="p-3.5 rounded-full bg-[#F2E8CF] text-[#BC6C25]">
                <Share className="w-8 h-8" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="font-serif font-bold text-lg text-[#5A5A40]">Panduan Pasang di iOS / Safari</h3>
              <p className="text-xs text-[#8B8B6B] leading-relaxed">
                Ikuti langkah mudah berikut untuk memasang aplikasi di layar utama iPhone/iPad Anda:
              </p>
            </div>
            <div className="bg-[#FDFBF7] p-4 rounded-2xl border border-[#E2E8CE] text-left text-xs text-[#5A5A40] space-y-2.5">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#E2E8CE] text-[#5A5A40] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                <span>Ketuk tombol <strong>"Share" (Bagikan)</strong> di bagian bawah Safari (ikon kotak dengan panah ke atas).</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#E2E8CE] text-[#5A5A40] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                <span>Gulir ke bawah lalu ketuk menu <strong>"Tambahkan ke Layar Utama" (Add to Home Screen)</strong>.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#E2E8CE] text-[#5A5A40] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">3</span>
                <span>Ketuk <strong>"Tambah" (Add)</strong> di pojok kanan atas. Selesai!</span>
              </div>
            </div>
            <button
              onClick={() => {
                setShowIOSInstructions(false);
                localStorage.setItem("pwa_dismissed_catatan_ibu", "true");
              }}
              className="w-full py-2 bg-[#BC6C25] text-white text-xs font-bold rounded-xl shadow-md hover:bg-[#a6561b] transition uppercase tracking-wider cursor-pointer"
            >
              Saya Mengerti
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
