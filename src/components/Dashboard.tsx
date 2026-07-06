import { useState, useEffect, FormEvent } from "react";
import { BabyProfile, FeedingLog, MpasiLog, ImmunizationRecord, DailyTask } from "../types";
import { 
  Bell, Heart, Plus, Check, Clock, Sparkles, Smile, PlusCircle, 
  Volume2, Calendar, Play, Pause, Square, Trash2, MapPin, AlertCircle, X, ChevronRight
} from "lucide-react";

interface DashboardProps {
  profile: BabyProfile;
  feedingLogs: FeedingLog[];
  mpasiLogs: MpasiLog[];
  immunizationRecords: ImmunizationRecord[];
  tasks: DailyTask[];
  onAddTask: (task: DailyTask) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onAddFeedingLog: (log: FeedingLog) => void;
  onAddMpasiLog: (log: MpasiLog) => void;
  onToggleImmunization: (id: string, isCompleted: boolean, completedDate?: string, notes?: string) => void;
  onDeleteFeedingLog: (id: string) => void;
  onDeleteMpasiLog: (id: string) => void;
}

export default function Dashboard({
  profile,
  feedingLogs,
  mpasiLogs,
  immunizationRecords,
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onAddFeedingLog,
  onAddMpasiLog,
  onToggleImmunization,
  onDeleteFeedingLog,
  onDeleteMpasiLog
}: DashboardProps) {
  // Custom task form states
  const [taskTitle, setTaskTitle] = useState("");
  const [taskCategory, setTaskCategory] = useState<DailyTask["category"]>("menyusui");
  const [taskTime, setTaskTime] = useState("08:00");

  // Modal selector state
  const [activeModal, setActiveModal] = useState<"laktasi" | "mpasi" | "vaksinasi" | null>(null);

  // Breastfeeding / Laktasi Form state
  const [feedType, setFeedType] = useState<"breast" | "bottle">("breast");
  const [breastSide, setBreastSide] = useState<"left" | "right" | "both">("both");
  const [duration, setDuration] = useState<number>(15);
  const [bottleAmount, setBottleAmount] = useState<number>(100);
  const [feedNotes, setFeedNotes] = useState("");

  // Breastfeeding Timer state
  const [timerActive, setTimerActive] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0); // seconds
  const [timerSide, setTimerSide] = useState<"left" | "right">("left");

  // MPASI Form state
  const [mpasiMenu, setMpasiMenu] = useState("");
  const [mpasiAmount, setMpasiAmount] = useState("");
  const [mpasiReaction, setMpasiReaction] = useState<"suka" | "biasa" | "alergi" | "tolak">("biasa");
  const [mpasiNotes, setMpasiNotes] = useState("");

  // Vaksinasi state (for selection and completion log in modal)
  const [selectedVaccineId, setSelectedVaccineId] = useState<string | null>(null);
  const [vaccineCompleteDate, setVaccineCompleteDate] = useState(new Date().toISOString().split("T")[0]);
  const [vaccineNotes, setVaccineNotes] = useState("");
  const [vaccineTab, setVaccineTab] = useState<"all" | "completed" | "upcoming">("all");

  // Notification simulator states
  const [reminderActive, setReminderActive] = useState(false);
  const [reminderMinutes, setReminderMinutes] = useState(120); // every 2 hours
  const [reminderLogMessage, setReminderLogMessage] = useState<string | null>(null);
  const [showNotificationAlert, setShowNotificationAlert] = useState(false);
  const [alertType, setAlertType] = useState<"laktasi" | "mpasi">("laktasi");

  // Helper to calculate time since last breastfeeding
  const [timeSinceLastFeed, setTimeSinceLastFeed] = useState("Belum ada log");

  useEffect(() => {
    const updateFeedInterval = () => {
      if (feedingLogs.length === 0) {
        setTimeSinceLastFeed("Belum ada log");
        return;
      }
      // Get the latest log
      const latest = [...feedingLogs].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )[0];

      const diffMs = Date.now() - new Date(latest.timestamp).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 60) {
        setTimeSinceLastFeed(`${diffMins} menit yang lalu`);
      } else {
        const hours = Math.floor(diffMins / 60);
        const mins = diffMins % 60;
        setTimeSinceLastFeed(`${hours} jam ${mins} menit yang lalu`);
      }
    };

    updateFeedInterval();
    const interval = setInterval(updateFeedInterval, 30000); // update every 30s
    return () => clearInterval(interval);
  }, [feedingLogs]);

  // Simulate notification timer
  useEffect(() => {
    let timer: any;
    if (reminderActive) {
      // For demonstration in preview, we set a quick 15-second simulation timer 
      // instead of making the user wait hours!
      timer = setTimeout(() => {
        setAlertType("laktasi");
        setShowNotificationAlert(true);
        // Play safe synthesizer sound
        try {
          const synth = window.speechSynthesis;
          if (synth) {
            const utter = new SpeechSynthesisUtterance("Waktunya si kecil menyusui, Bu.");
            utter.lang = "id-ID";
            synth.speak(utter);
          }
        } catch (e) {}
      }, 15000);
    }
    return () => clearTimeout(timer);
  }, [reminderActive]);

  // Laktasi StopWatch running effect
  useEffect(() => {
    let interval: any;
    if (timerActive) {
      interval = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

  const handleStartTimer = (side: "left" | "right") => {
    setTimerSide(side);
    setTimerActive(true);
  };

  const handlePauseTimer = () => {
    setTimerActive(false);
  };

  const handleStopTimer = () => {
    setTimerActive(false);
    const durationMinutes = Math.max(1, Math.round(timeElapsed / 60));
    setFeedType("breast");
    setBreastSide(timerSide);
    setDuration(durationMinutes);
    alert(`Timer dihentikan! Durasi menyusui ${durationMinutes} menit di payudara ${timerSide === "left" ? "KIRI" : "KANAN"} telah dimasukkan.`);
    setTimeElapsed(0);
  };

  const handleResetTimer = () => {
    if (confirm("Reset penghitung laktasi?")) {
      setTimerActive(false);
      setTimeElapsed(0);
    }
  };

  const formatTimerTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Submit log handlers
  const handleFeedingSubmit = (e: FormEvent) => {
    e.preventDefault();
    const newLog: FeedingLog = {
      id: "feed-" + Date.now(),
      type: feedType,
      timestamp: new Date().toISOString(),
      notes: feedNotes,
    };

    if (feedType === "breast") {
      newLog.durationMinutes = duration;
      newLog.breastSide = breastSide;
    } else {
      newLog.amountMl = bottleAmount;
    }

    onAddFeedingLog(newLog);
    setFeedNotes("");
    setActiveModal(null);
    alert("Berhasil mencatat laktasi!");
  };

  const handleMpasiSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!mpasiMenu) return;

    const newLog: MpasiLog = {
      id: "mpasi-" + Date.now(),
      timestamp: new Date().toISOString(),
      menu: mpasiMenu,
      amountText: mpasiAmount || "Secukupnya",
      reaction: mpasiReaction,
      notes: mpasiNotes,
    };

    onAddMpasiLog(newLog);
    setMpasiMenu("");
    setMpasiAmount("");
    setMpasiReaction("biasa");
    setMpasiNotes("");
    setActiveModal(null);
    alert("Berhasil mencatat MPASI!");
  };

  const handleVaksinasiSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedVaccineId) return;
    onToggleImmunization(selectedVaccineId, true, vaccineCompleteDate, vaccineNotes);
    setSelectedVaccineId(null);
    setVaccineNotes("");
    setActiveModal(null);
    alert("Berhasil mencatat imunisasi selesai!");
  };

  // Calculate upcoming immunization
  const getNextVaccine = () => {
    // Find uncompleted vaccines
    const upcoming = immunizationRecords
      .filter((r) => !r.isCompleted)
      .sort((a, b) => a.ageTargetMonths - b.ageTargetMonths);
    return upcoming.length > 0 ? upcoming[0] : null;
  };

  const handleCreateTask = (e: FormEvent) => {
    e.preventDefault();
    if (!taskTitle) return;

    const newTask: DailyTask = {
      id: "task-" + Date.now(),
      title: taskTitle,
      category: taskCategory,
      timeStr: taskTime,
      isCompleted: false,
    };

    onAddTask(newTask);
    setTaskTitle("");
    alert("Tugas berhasil ditambahkan ke daftar hari ini!");
  };

  const handleTriggerMpasiSimulation = () => {
    setAlertType("mpasi");
    setShowNotificationAlert(true);
    try {
      const synth = window.speechSynthesis;
      if (synth) {
        const utter = new SpeechSynthesisUtterance("Waktunya makan MPASI si kecil, Bu.");
        utter.lang = "id-ID";
        synth.speak(utter);
      }
    } catch (e) {}
  };

  const nextVaccine = getNextVaccine();
  const completedTasksCount = tasks.filter((t) => t.isCompleted).length;
  const totalTasksCount = tasks.length;

  return (
    <div id="dashboard-section" className="space-y-8">
      
      {/* 1. Alarm Alert Banner Simulator */}
      {showNotificationAlert && (
        <div id="alarm-banner" className="p-5 bg-gradient-to-r from-[#BC6C25] to-[#A3B18A] rounded-[24px] text-white shadow-md animate-bounce flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="bg-white/20 p-2.5 rounded-full animate-pulse">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h5 className="font-serif font-bold text-base">🔔 Pengingat Pengasuhan Pintar</h5>
              <p className="text-xs text-white/95 mt-1 font-sans">
                {alertType === "laktasi" 
                  ? "Sudah masuk jadwal menyusui si kecil (ASI / Sufor). Yuk, peluk dan susui!" 
                  : "Sudah masuk waktu makan MPASI sehat untuk si kecil!"}
              </p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => {
                setShowNotificationAlert(false);
                setReminderActive(false);
              }}
              className="text-xs bg-white text-[#BC6C25] px-4 py-2 rounded-xl font-bold hover:bg-[#FDFBF7] transition uppercase tracking-wider"
            >
              Sudah Dilakukan
            </button>
            <button
              onClick={() => {
                setShowNotificationAlert(false);
                // Delay 10 seconds for demo
                setTimeout(() => setShowNotificationAlert(true), 10000);
              }}
              className="text-xs bg-white/20 hover:bg-white/30 text-white px-3.5 py-2 rounded-xl font-semibold transition uppercase tracking-wider"
            >
              Tunda 5 Mnt
            </button>
          </div>
        </div>
      )}

      {/* 2. Stat Quick Summary Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Widget Laktasi */}
        <div className="bg-white rounded-3xl p-6 border border-[#E2E8CE] shadow-sm flex items-center justify-between gap-4 hover:border-[#BC6C25] transition-colors relative group">
          <div className="space-y-1">
            <span className="text-[10px] text-[#8B8B6B] uppercase font-bold tracking-widest">Menyusui Terakhir</span>
            <h4 className="font-serif font-bold text-2xl text-[#5A5A40] italic">{timeSinceLastFeed}</h4>
            <p className="text-xs text-[#BC6C25] font-medium font-sans">Batas ideal laktasi: tiap 2-3 jam</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveModal("laktasi")}
              className="p-3.5 rounded-2xl bg-[#BC6C25] text-white hover:bg-[#a6561b] transition shadow-md flex items-center justify-center cursor-pointer"
              title="Catat Laktasi / Menyusui"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </button>
            <div className="p-3.5 rounded-2xl bg-[#F2E8CF] text-[#BC6C25] shrink-0 hidden xs:block">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Widget MPASI */}
        <div className="bg-white rounded-3xl p-6 border border-[#E2E8CE] shadow-sm flex items-center justify-between gap-4 hover:border-[#A3B18A] transition-colors relative group">
          <div className="space-y-1">
            <span className="text-[10px] text-[#8B8B6B] uppercase font-bold tracking-widest">MPASI Hari Ini</span>
            <h4 className="font-serif font-bold text-2xl text-[#5A5A40] italic">{mpasiLogs.length} Kali Sesi</h4>
            <p className="text-xs text-[#8B8B6B] font-medium font-sans">Lengkap dengan catatan alergen</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveModal("mpasi")}
              className="p-3.5 rounded-2xl bg-[#A3B18A] text-[#344E41] hover:bg-[#8f9d78] transition shadow-md flex items-center justify-center cursor-pointer"
              title="Catat MPASI"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </button>
            <div className="p-3.5 rounded-2xl bg-[#E2E8CE] text-[#5A5A40] shrink-0 hidden xs:block">
              <Smile className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Widget Imunisasi Terdekat */}
        <div className="bg-white rounded-3xl p-6 border border-[#E2E8CE] shadow-sm flex items-center justify-between gap-4 sm:col-span-2 lg:col-span-1 hover:border-[#BC6C25] transition-colors relative group">
          <div className="space-y-1">
            <span className="text-[10px] text-[#8B8B6B] uppercase font-bold tracking-widest">Vaksinasi Terdekat</span>
            <h4 className="font-serif font-bold text-base text-[#5A5A40] truncate max-w-[150px] leading-tight">
              {nextVaccine ? nextVaccine.name : "Lengkap"}
            </h4>
            <p className="text-xs text-[#8B8B6B] font-medium flex items-center gap-1 font-sans">
              <Calendar className="w-3.5 h-3.5 text-[#BC6C25]" /> Target: {nextVaccine ? nextVaccine.recommendedAgeStr : "-"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveModal("vaksinasi")}
              className="p-3.5 rounded-2xl bg-[#BC6C25] text-white hover:bg-[#a6561b] transition shadow-md flex items-center justify-center cursor-pointer"
              title="Catat Vaksinasi Selesai"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </button>
            <div className="p-3.5 rounded-2xl bg-[#F5F5F0] text-[#5A5A40] shrink-0 hidden xs:block">
              <Heart className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left main: Checklist of Today's Tasks */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 md:p-8 border border-[#E2E8CE] shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#F5F5F0] pb-4">
            <div>
              <h4 className="font-serif font-bold text-xl text-[#5A5A40]">Daftar Tugas Pengasuhan</h4>
              <p className="text-xs text-[#8B8B6B] mt-1">Selesaikan tugas harian demi tumbuh kembang optimal</p>
            </div>
            <div className="text-xs bg-[#E2E8CE] text-[#5A5A40] px-3 py-1.5 rounded-full font-bold uppercase tracking-wider">
              {completedTasksCount}/{totalTasksCount} Selesai ({totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0}%)
            </div>
          </div>

          {/* Interactive Checklist List */}
          <div className="space-y-3.5 max-h-[420px] overflow-y-auto pr-1">
            {tasks.length === 0 ? (
              <div className="text-center py-12 text-[#8B8B6B] text-xs font-serif italic">
                Belum ada tugas hari ini. Silakan buat di panel bawah!
              </div>
            ) : (
              tasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-4 rounded-2xl border flex items-center justify-between gap-3 transition ${
                    task.isCompleted
                      ? "bg-[#F5F5F0]/60 border-[#E2E8CE]/60 text-[#8B8B6B] line-through"
                      : "bg-white border-[#E2E8CE] text-[#5A5A40] hover:border-[#BC6C25]"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <button
                      id={`btn-toggle-task-${task.id}`}
                      onClick={() => onToggleTask(task.id)}
                      className={`w-5.5 h-5.5 rounded-lg border flex items-center justify-center shrink-0 transition ${
                        task.isCompleted
                          ? "bg-[#BC6C25] border-[#BC6C25] text-white"
                          : "border-[#8B8B6B] hover:border-[#BC6C25] bg-white"
                      }`}
                    >
                      {task.isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>

                    <div>
                      <span className={`font-semibold text-sm ${task.isCompleted ? "opacity-75" : ""}`}>{task.title}</span>
                      <div className="flex items-center gap-1.5 mt-1 font-mono text-[10px] text-[#8B8B6B]">
                        <Clock className="w-3 h-3 text-[#8B8B6B]" />
                        <span>{task.timeStr}</span>
                        <span>•</span>
                        <span className="capitalize">{task.category}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    id={`btn-delete-task-${task.id}`}
                    onClick={() => onDeleteTask(task.id)}
                    className="text-xs text-[#8B8B6B] hover:text-[#BC6C25] font-semibold px-2.5 py-1 rounded-lg hover:bg-[#F5F5F0]"
                  >
                    Hapus
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Create Custom Task Form */}
          <form onSubmit={handleCreateTask} className="bg-[#FDFBF7] p-4 rounded-2xl border border-[#E2E8CE] space-y-4">
            <h5 className="text-xs font-bold text-[#5A5A40] uppercase tracking-wider flex items-center gap-1.5">
              <PlusCircle className="w-4 h-4 text-[#BC6C25]" />
              Tambah Tugas Kustom Baru
            </h5>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-5">
                <input
                  id="input-task-title"
                  type="text"
                  required
                  placeholder="Contoh: Belit popok, Berjemur pagi"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#E2E8CE] text-xs text-[#5A5A40] bg-white focus:outline-none focus:border-[#BC6C25] focus:ring-1 focus:ring-[#BC6C25]"
                />
              </div>

              <div className="sm:col-span-3">
                <select
                  id="select-task-category"
                  value={taskCategory}
                  onChange={(e) => setTaskCategory(e.target.value as any)}
                  className="w-full px-2 py-2.5 rounded-xl border border-[#E2E8CE] text-xs text-[#5A5A40] bg-white focus:outline-none focus:border-[#BC6C25] focus:ring-1 focus:ring-[#BC6C25]"
                >
                  <option value="menyusui">Menyusui</option>
                  <option value="mpasi">MPASI</option>
                  <option value="imunisasi">Imunisasi</option>
                  <option value="tidur">Tidur</option>
                  <option value="stimulasi">Stimulasi</option>
                  <option value="lainnya">Lainnya</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <input
                  id="input-task-time"
                  type="time"
                  required
                  value={taskTime}
                  onChange={(e) => setTaskTime(e.target.value)}
                  className="w-full px-2 py-2.5 rounded-xl border border-[#E2E8CE] text-xs text-[#5A5A40] bg-white focus:outline-none focus:border-[#BC6C25] focus:ring-1 focus:ring-[#BC6C25]"
                />
              </div>

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  id="btn-add-task"
                  className="w-full h-full py-2.5 bg-[#BC6C25] hover:bg-[#a6561b] text-white font-semibold text-xs rounded-xl transition shadow-sm uppercase tracking-wider"
                >
                  Tambah
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Right side: Alarm Simulator Config & Quick action logs */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Alarms Simulator Config Panel */}
          <div className="bg-white rounded-3xl p-6 border border-[#E2E8CE] shadow-sm space-y-5">
            <div className="flex items-center gap-2.5 border-b border-[#F5F5F0] pb-3">
              <Bell className="w-5 h-5 text-[#BC6C25]" />
              <h4 className="font-serif font-bold text-[#5A5A40] text-lg">Asisten Pengingat Suara</h4>
            </div>

            <p className="text-xs text-[#8B8B6B] leading-relaxed">
              Dukung ketepatan waktu laktasi dan pemberian gizi seimbang dengan menyalakan pengingat suara alarm.
            </p>

            <div className="bg-[#FDFBF7] p-4 rounded-2xl border border-[#E2E8CE] space-y-3.5 text-[#5A5A40]">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold">Aktifkan Pengingat Laktasi (ASI)</span>
                <button
                  id="btn-toggle-reminder-alarm"
                  onClick={() => {
                    setReminderActive(!reminderActive);
                    if (!reminderActive) {
                      alert("Simulator laktasi aktif! Tunggu 15 detik untuk simulasi bunyi laktasi di latar belakang.");
                    }
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition uppercase tracking-wider ${
                    reminderActive
                      ? "bg-[#BC6C25] text-white shadow-sm"
                      : "bg-[#F5F5F0] text-[#8B8B6B] hover:bg-[#E2E8CE]/60"
                  }`}
                >
                  {reminderActive ? "ON" : "OFF"}
                </button>
              </div>

              <div className="flex items-center justify-between gap-3 pt-3.5 border-t border-[#E2E8CE]">
                <span className="text-xs font-semibold">Alarm MPASI Instan</span>
                <button
                  id="btn-trigger-mpasi-alarm"
                  onClick={handleTriggerMpasiSimulation}
                  className="flex items-center gap-1.5 text-xs bg-[#A3B18A] hover:bg-[#8f9d78] text-[#344E41] px-3.5 py-2 rounded-xl font-bold shadow-sm transition uppercase tracking-wider"
                >
                  <Volume2 className="w-3.5 h-3.5" /> Tes Alarm MPASI
                </button>
              </div>
            </div>

            <div className="text-[10px] text-[#8B8B6B] flex items-start gap-2 bg-[#F5F5F0]/60 p-3 rounded-xl border border-[#E2E8CE]/50">
              <Sparkles className="w-4 h-4 text-[#BC6C25] shrink-0 mt-0.5" />
              <span>
                Fitur ini mensimulasikan asisten pintar ibu menggunakan suara bahasa Indonesia sintetis (Text-to-Speech) agar bekerja maksimal di browser Anda.
              </span>
            </div>
          </div>

          {/* Quick Stats list / Mother advice banner */}
          <div className="bg-gradient-to-br from-[#E2E8CE] to-[#F2E8CF] rounded-3xl p-6 border border-[#E2E8CE] text-center shadow-sm">
            <h5 className="font-serif font-bold text-[#5A5A40] text-base mb-1.5">💡 Tips Cepat Hari Ini</h5>
            <p className="text-xs text-[#5A5A40]/90 leading-relaxed italic font-serif">
              &ldquo;Susui bayi sesering mungkin di masa pertumbuhan pesat (growth spurt) untuk memicu produksi ASI melimpah. Ibu juga disarankan minum minimal 3 liter air mineral per hari.&rdquo;
            </p>
          </div>

        </div>
      </div>

      {/* --- LAKTASI MODAL --- */}
      {activeModal === "laktasi" && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[32px] border border-[#E2E8CE] shadow-2xl max-w-lg w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-[#F5F5F0] pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-[#F2E8CF] text-[#BC6C25]">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#5A5A40]">Catat Laktasi & Menyusui</h3>
                  <p className="text-[10px] text-[#8B8B6B]">Gunakan stopwatch atau input manual</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setActiveModal(null);
                  setTimerActive(false);
                  setTimeElapsed(0);
                }}
                className="p-1.5 rounded-full hover:bg-[#F5F5F0] text-[#8B8B6B] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* StopWatch Section */}
            <div className="bg-[#FDFBF7] p-4 rounded-2xl border border-[#E2E8CE] text-center space-y-3.5">
              <h4 className="text-xs font-bold text-[#5A5A40] uppercase tracking-wider">⏱️ Pengukur Waktu Laktasi Langsung</h4>
              
              <div className="text-3xl font-mono font-bold text-[#BC6C25] bg-white border border-[#E2E8CE] py-3 rounded-2xl inline-block px-6 tracking-widest shadow-sm">
                {formatTimerTime(timeElapsed)}
              </div>

              <div className="text-[10px] text-[#8B8B6B] font-medium font-serif italic">
                {timerActive ? `Menyusui di Payudara ${timerSide === "left" ? "KIRI" : "KANAN"}...` : "Tekan tombol untuk memulai penghitung"}
              </div>

              <div className="flex justify-center gap-2">
                {!timerActive && timeElapsed === 0 && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleStartTimer("left")}
                      className="flex items-center gap-1 text-xs bg-[#BC6C25] text-white px-3 py-2 rounded-xl font-bold hover:bg-[#a6561b] transition shadow-sm cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5" /> Kiri
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStartTimer("right")}
                      className="flex items-center gap-1 text-xs bg-[#BC6C25] text-white px-3 py-2 rounded-xl font-bold hover:bg-[#a6561b] transition shadow-sm cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5" /> Kanan
                    </button>
                  </>
                )}

                {timerActive && (
                  <button
                    type="button"
                    onClick={handlePauseTimer}
                    className="flex items-center gap-1 text-xs bg-[#A3B18A] text-[#344E41] px-4 py-2 rounded-xl font-bold hover:bg-[#8f9d78] transition shadow-sm cursor-pointer"
                  >
                    <Pause className="w-3.5 h-3.5" /> Pause
                  </button>
                )}

                {!timerActive && timeElapsed > 0 && (
                  <button
                    type="button"
                    onClick={() => handleStartTimer(timerSide)}
                    className="flex items-center gap-1 text-xs bg-[#BC6C25] text-white px-3.5 py-2 rounded-xl font-bold hover:bg-[#a6561b] transition shadow-sm cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5" /> Lanjutkan
                  </button>
                )}

                {timeElapsed > 0 && (
                  <>
                    <button
                      type="button"
                      onClick={handleStopTimer}
                      className="flex items-center gap-1 text-xs bg-[#344E41] text-white px-3.5 py-2 rounded-xl font-bold hover:bg-[#203028] transition shadow-sm cursor-pointer"
                    >
                      <Square className="w-3.5 h-3.5" /> Simpan
                    </button>
                    <button
                      type="button"
                      onClick={handleResetTimer}
                      className="flex items-center gap-1 text-xs bg-red-50 text-red-700 border border-red-200 px-3 py-2 rounded-xl font-bold hover:bg-red-100 transition shadow-sm cursor-pointer"
                    >
                      Reset
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Manual Form Section */}
            <form onSubmit={handleFeedingSubmit} className="space-y-4">
              <h4 className="text-xs font-bold text-[#5A5A40] uppercase tracking-wider pb-1 border-b border-[#F5F5F0]">📝 Pengisian Manual</h4>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFeedType("breast")}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition border ${
                    feedType === "breast"
                      ? "bg-[#BC6C25] text-white border-[#BC6C25] shadow-sm"
                      : "bg-[#FDFBF7] text-[#8B8B6B] border-[#E2E8CE] hover:bg-[#F5F5F0]"
                  }`}
                >
                  ASI Payudara
                </button>
                <button
                  type="button"
                  onClick={() => setFeedType("bottle")}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition border ${
                    feedType === "bottle"
                      ? "bg-[#BC6C25] text-white border-[#BC6C25] shadow-sm"
                      : "bg-[#FDFBF7] text-[#8B8B6B] border-[#E2E8CE] hover:bg-[#F5F5F0]"
                  }`}
                >
                  Susu Botol / Sufor
                </button>
              </div>

              {feedType === "breast" ? (
                <div className="grid grid-cols-2 gap-3 bg-[#FDFBF7] p-3 rounded-xl border border-[#E2E8CE]">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#8B8B6B]">Sisi Payudara</label>
                    <select
                      value={breastSide}
                      onChange={(e) => setBreastSide(e.target.value as any)}
                      className="w-full px-2 py-1.5 rounded-lg border border-[#E2E8CE] text-xs text-[#5A5A40] bg-white"
                    >
                      <option value="both">Kiri & Kanan</option>
                      <option value="left">Kiri Saja</option>
                      <option value="right">Kanan Saja</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#8B8B6B]">Durasi (Menit)</label>
                    <input
                      type="number"
                      min="1"
                      max="120"
                      value={duration}
                      onChange={(e) => setDuration(parseInt(e.target.value) || 15)}
                      className="w-full px-2 py-1.5 rounded-lg border border-[#E2E8CE] text-xs text-[#5A5A40] bg-white"
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-[#FDFBF7] p-3 rounded-xl border border-[#E2E8CE] space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#8B8B6B]">Takaran Susu (ml)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="10"
                      max="500"
                      step="10"
                      value={bottleAmount}
                      onChange={(e) => setBottleAmount(parseInt(e.target.value) || 100)}
                      className="w-full px-3 py-1.5 rounded-lg border border-[#E2E8CE] text-xs text-[#5A5A40] bg-white"
                    />
                    <span className="text-xs font-mono text-[#8B8B6B]">ml</span>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#8B8B6B]">Catatan (Optional)</label>
                <input
                  type="text"
                  placeholder="Contoh: Sangat lahap"
                  value={feedNotes}
                  onChange={(e) => setFeedNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E2E8CE] text-xs text-[#5A5A40] bg-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#BC6C25] hover:bg-[#a6561b] text-white text-xs font-bold rounded-xl shadow-sm uppercase tracking-wider transition cursor-pointer"
              >
                Simpan Catatan Laktasi
              </button>
            </form>

            {/* Mini History Block */}
            <div className="space-y-2 pt-2 border-t border-[#F5F5F0]">
              <h4 className="text-[11px] font-bold text-[#8B8B6B] uppercase tracking-wider">Riwayat Laktasi Terakhir (Maks 3)</h4>
              {feedingLogs.length === 0 ? (
                <p className="text-[11px] text-[#8B8B6B] italic font-serif">Belum ada riwayat tercatat.</p>
              ) : (
                <div className="space-y-1.5">
                  {feedingLogs.slice(0, 3).map((log) => (
                    <div key={log.id} className="flex justify-between items-center text-xs p-2 bg-[#F5F5F0]/60 rounded-xl border border-[#E2E8CE]/60">
                      <div className="space-y-0.5">
                        <span className="font-bold text-[#5A5A40]">
                          {log.type === "breast" ? `ASI (${log.breastSide === "left" ? "Kiri" : log.breastSide === "right" ? "Kanan" : "Keduanya"})` : `Botol (${log.amountMl}ml)`}
                        </span>
                        {log.durationMinutes && <span className="text-[#8B8B6B] text-[10px]"> • {log.durationMinutes} Menit</span>}
                        {log.notes && <p className="text-[10px] text-[#8B8B6B] font-serif italic">"{log.notes}"</p>}
                        <span className="text-[9px] text-[#8B8B6B] block">{new Date(log.timestamp).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                      <button
                        onClick={() => {
                          onDeleteFeedingLog(log.id);
                        }}
                        className="p-1 rounded text-red-600 hover:bg-red-50 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- MPASI MODAL --- */}
      {activeModal === "mpasi" && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[32px] border border-[#E2E8CE] shadow-2xl max-w-lg w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-[#F5F5F0] pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-[#E2E8CE] text-[#5A5A40]">
                  <Smile className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#5A5A40]">Catat MPASI / Makanan Padat</h3>
                  <p className="text-[10px] text-[#8B8B6B]">Mulai usia 6 bulan ke atas</p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1.5 rounded-full hover:bg-[#F5F5F0] text-[#8B8B6B] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleMpasiSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#8B8B6B]">Menu Makanan</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Bubur Tim Beras Merah + Hati Ayam"
                  value={mpasiMenu}
                  onChange={(e) => setMpasiMenu(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E2E8CE] text-xs text-[#5A5A40] bg-[#FDFBF7]/40 focus:outline-none focus:border-[#BC6C25]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#8B8B6B]">Porsi / Jumlah Makan</label>
                <input
                  type="text"
                  placeholder="Contoh: 3 Sendok Makan, atau Setengah Mangkuk"
                  value={mpasiAmount}
                  onChange={(e) => setMpasiAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E2E8CE] text-xs text-[#5A5A40] bg-[#FDFBF7]/40 focus:outline-none focus:border-[#BC6C25]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#8B8B6B] block">Reaksi Lahap & Alergi Si Kecil</label>
                <div className="grid grid-cols-2 gap-2">
                  {(["suka", "biasa", "tolak", "alergi"] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setMpasiReaction(r)}
                      className={`p-2.5 rounded-xl text-xs font-bold border transition text-left flex items-center justify-between cursor-pointer ${
                        mpasiReaction === r
                          ? "bg-[#BC6C25] text-white border-[#BC6C25] shadow-sm font-bold"
                          : "bg-[#FDFBF7] text-[#5A5A40] border-[#E2E8CE] hover:bg-[#F5F5F0]"
                      }`}
                    >
                      <span>
                        {r === "suka" && "😍 Suka Sekali"}
                        {r === "biasa" && "😐 Lahap / Biasa"}
                        {r === "tolak" && "🤢 Tolak / GTM"}
                        {r === "alergi" && "⚠️ Alergi Gatal"}
                      </span>
                      {mpasiReaction === r && <Check className="w-4 h-4 stroke-[3]" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#8B8B6B]">Catatan Tambahan</label>
                <input
                  type="text"
                  placeholder="Contoh: Sangat menyukai labu parang"
                  value={mpasiNotes}
                  onChange={(e) => setMpasiNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E2E8CE] text-xs text-[#5A5A40] bg-[#FDFBF7]/40 focus:outline-none focus:border-[#BC6C25]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#BC6C25] hover:bg-[#a6561b] text-white text-xs font-bold rounded-xl shadow-sm uppercase tracking-wider transition cursor-pointer"
              >
                Simpan Sesi MPASI
              </button>
            </form>

            {/* Mini History Block */}
            <div className="space-y-2 pt-2 border-t border-[#F5F5F0]">
              <h4 className="text-[11px] font-bold text-[#8B8B6B] uppercase tracking-wider">Riwayat MPASI Terakhir (Maks 3)</h4>
              {mpasiLogs.length === 0 ? (
                <p className="text-[11px] text-[#8B8B6B] italic font-serif">Belum ada riwayat tercatat.</p>
              ) : (
                <div className="space-y-1.5">
                  {mpasiLogs.slice(0, 3).map((log) => (
                    <div key={log.id} className="flex justify-between items-center text-xs p-2 bg-[#F5F5F0]/60 rounded-xl border border-[#E2E8CE]/60">
                      <div className="space-y-0.5 max-w-[80%]">
                        <span className="font-bold text-[#5A5A40] block truncate">{log.menu}</span>
                        <span className="text-[#8B8B6B] text-[10px]">Porsi: {log.amountText} • {log.reaction === "suka" ? "😍" : log.reaction === "tolak" ? "🤢" : log.reaction === "alergi" ? "⚠️" : "😐"}</span>
                        {log.notes && <p className="text-[10px] text-[#8B8B6B] font-serif italic">"{log.notes}"</p>}
                        <span className="text-[9px] text-[#8B8B6B] block">{new Date(log.timestamp).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                      <button
                        onClick={() => {
                          onDeleteMpasiLog(log.id);
                        }}
                        className="p-1 rounded text-red-600 hover:bg-red-50 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- VAKSINASI MODAL --- */}
      {activeModal === "vaksinasi" && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[32px] border border-[#E2E8CE] shadow-2xl max-w-xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-[#F5F5F0] pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-[#E2E8CE] text-[#5A5A40]">
                  <Heart className="w-5 h-5 text-[#BC6C25]" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#5A5A40]">Daftar Imunisasi IDAI</h3>
                  <p className="text-[10px] text-[#8B8B6B]">Kelola jadwal suntikan & catatan vaksinasi wajib</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setActiveModal(null);
                  setSelectedVaccineId(null);
                }}
                className="p-1.5 rounded-full hover:bg-[#F5F5F0] text-[#8B8B6B] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selection Completion Area if a vaccine is clicked */}
            {selectedVaccineId ? (
              <form onSubmit={handleVaksinasiSubmit} className="bg-[#FDFBF7] p-4 rounded-2xl border border-[#BC6C25]/40 space-y-4">
                <div className="flex items-center justify-between border-b border-[#E2E8CE] pb-2">
                  <span className="text-xs font-bold text-[#5A5A40]">
                    ✍️ Catat Kelengkapan: <span className="text-[#BC6C25]">{immunizationRecords.find((v) => v.id === selectedVaccineId)?.name}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedVaccineId(null)}
                    className="text-[10px] bg-white border border-[#E2E8CE] px-2 py-1 rounded hover:bg-white text-[#8B8B6B] cursor-pointer"
                  >
                    Batal
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#8B8B6B]">Tanggal Imunisasi</label>
                    <input
                      type="date"
                      required
                      value={vaccineCompleteDate}
                      onChange={(e) => setVaccineCompleteDate(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-[#E2E8CE] text-xs bg-white text-[#5A5A40]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#8B8B6B]">Catatan Tambahan (Misal: Demam Ringan)</label>
                    <input
                      type="text"
                      placeholder="Contoh: Demam ringan setelah suntik"
                      value={vaccineNotes}
                      onChange={(e) => setVaccineNotes(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-[#E2E8CE] text-xs bg-white text-[#5A5A40]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-[#BC6C25] hover:bg-[#a6561b] text-white text-xs font-bold rounded-xl shadow-sm uppercase tracking-wider transition cursor-pointer"
                >
                  Simpan Selesai Vaksinasi
                </button>
              </form>
            ) : null}

            {/* Vaccine Tab filters */}
            <div className="flex gap-1 bg-[#F5F5F0] p-1 rounded-xl">
              {(["all", "upcoming", "completed"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setVaccineTab(tab)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition cursor-pointer ${
                    vaccineTab === tab
                      ? "bg-white text-[#BC6C25] shadow-sm font-bold"
                      : "text-[#8B8B6B] hover:text-[#5A5A40]"
                  }`}
                >
                  {tab === "all" && "Semua"}
                  {tab === "upcoming" && "Belum"}
                  {tab === "completed" && "Sudah"}
                </button>
              ))}
            </div>

            {/* Scrollable vaccine list */}
            <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
              {immunizationRecords
                .filter((rec) => {
                  if (vaccineTab === "upcoming") return !rec.isCompleted;
                  if (vaccineTab === "completed") return rec.isCompleted;
                  return true;
                })
                .map((rec) => (
                  <div
                    key={rec.id}
                    onClick={() => {
                      if (!rec.isCompleted) {
                        setSelectedVaccineId(rec.id);
                      }
                    }}
                    className={`p-3.5 rounded-2xl border transition text-left cursor-pointer flex justify-between items-center gap-3 ${
                      rec.isCompleted
                        ? "bg-[#FDFBF7] border-[#E2E8CE] hover:border-[#BC6C25]/40"
                        : "bg-white border-[#E2E8CE] hover:border-[#BC6C25]"
                    }`}
                  >
                    <div className="space-y-1 max-w-[80%]">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#5A5A40]">{rec.name}</span>
                        <span className="text-[9px] bg-[#E2E8CE]/60 text-[#BC6C25] px-2 py-0.5 rounded-full font-bold uppercase">
                          {rec.recommendedAgeStr}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#8B8B6B] leading-relaxed">{rec.description}</p>
                      {rec.isCompleted && (
                        <div className="text-[10px] text-[#A3B18A] font-semibold flex items-center gap-1">
                          <span>✔️ Diberikan: {rec.completedDate}</span>
                          {rec.notes && <span>• "{rec.notes}"</span>}
                        </div>
                      )}
                    </div>

                    {rec.isCompleted ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm("Ubah status vaksinasi ini menjadi BELUM SELESAI?")) {
                            onToggleImmunization(rec.id, false);
                          }
                        }}
                        className="text-[10px] font-bold text-red-600 border border-red-100 hover:bg-red-50 bg-white px-2.5 py-1.5 rounded-xl uppercase tracking-wider cursor-pointer"
                      >
                        Batal
                      </button>
                    ) : (
                      <div className="p-1.5 rounded-full bg-[#BC6C25]/10 text-[#BC6C25] shrink-0">
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
