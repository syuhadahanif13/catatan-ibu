import { useState, useEffect, FormEvent } from "react";
import { FeedingLog, MpasiLog } from "../types";
import { Clock, Play, Pause, Square, Trash2, Heart, Plus, BookOpen, AlertCircle } from "lucide-react";

interface FeedingTrackerProps {
  feedingLogs: FeedingLog[];
  mpasiLogs: MpasiLog[];
  onAddFeedingLog: (log: FeedingLog) => void;
  onAddMpasiLog: (log: MpasiLog) => void;
  onDeleteFeedingLog: (id: string) => void;
  onDeleteMpasiLog: (id: string) => void;
}

export default function FeedingTracker({
  feedingLogs,
  mpasiLogs,
  onAddFeedingLog,
  onAddMpasiLog,
  onDeleteFeedingLog,
  onDeleteMpasiLog
}: FeedingTrackerProps) {
  // Timer states for Direct Breastfeeding
  const [timerActive, setTimerActive] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0); // in seconds
  const [timerSide, setTimerSide] = useState<"left" | "right">("left");

  // Breastfeeding Form state
  const [feedType, setFeedType] = useState<"breast" | "bottle">("breast");
  const [breastSide, setBreastSide] = useState<"left" | "right" | "both">("both");
  const [duration, setDuration] = useState<number>(15);
  const [bottleAmount, setBottleAmount] = useState<number>(100);
  const [feedNotes, setFeedNotes] = useState("");

  // MPASI Form state
  const [mpasiMenu, setMpasiMenu] = useState("");
  const [mpasiAmount, setMpasiAmount] = useState("");
  const [mpasiReaction, setMpasiReaction] = useState<"suka" | "biasa" | "alergi" | "tolak">("biasa");
  const [mpasiNotes, setMpasiNotes] = useState("");

  // Running breastfeeding timer side-effect
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
    // Prepopulate manual form
    setFeedType("breast");
    setBreastSide(timerSide);
    setDuration(durationMinutes);
    alert(`Timer dihentikan! Durasi menyusui ${durationMinutes} menit di payudara ${timerSide === "left" ? "KIRI" : "KANAN"} telah dicatat ke formulir.`);
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

  const handleSubmitFeeding = (e: FormEvent) => {
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
    alert("Berhasil mencatat laktasi!");
  };

  const handleSubmitMpasi = (e: FormEvent) => {
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
    alert("Berhasil mencatat MPASI!");
  };

  // Combine history logs sorted newest first
  const combinedHistory = [
    ...feedingLogs.map((log) => ({ ...log, logCategory: "feed" as const })),
    ...mpasiLogs.map((log) => ({ ...log, logCategory: "mpasi" as const })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const getReactionEmoji = (reaction: string) => {
    switch (reaction) {
      case "suka": return "😍 Suka Sekali";
      case "biasa": return "😐 Lahap / Biasa";
      case "tolak": return "🤢 Tolak / GTM";
      case "alergi": return "⚠️ Alergi Gatal";
      default: return "😐";
    }
  };

  return (
    <div id="feeding-tracker-section" className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column: Direct Breastfeeding Timer & Feeding Form */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Section 1: Lactation Timer */}
          <div className="bg-[#FDFBF7] rounded-3xl p-6 border border-[#E2E8CE] shadow-sm">
            <div className="flex items-center gap-2.5 mb-4">
              <Clock className="w-5 h-5 text-[#BC6C25]" />
              <h4 className="font-serif font-bold text-[#5A5A40] text-base">Stopwatch Laktasi (Susu Langsung)</h4>
            </div>

            <div className="flex flex-col items-center justify-center p-5 bg-white rounded-2xl border border-[#E2E8CE]">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#8B8B6B]">
                Payudara {timerSide === "left" ? "Kiri" : "Kanan"}
              </span>
              <span className="text-4xl font-mono font-bold text-[#5A5A40] mt-1.5">
                {formatTimerTime(timeElapsed)}
              </span>

              {/* Timer Controls */}
              <div className="flex items-center gap-3 mt-5">
                {!timerActive && timeElapsed === 0 ? (
                  <>
                    <button
                      id="btn-timer-left"
                      onClick={() => handleStartTimer("left")}
                      className="px-4 py-2.5 rounded-xl bg-[#BC6C25] hover:bg-[#a6561b] text-white font-bold text-xs uppercase tracking-wider transition shadow-sm"
                    >
                      Mulai KIRI
                    </button>
                    <button
                      id="btn-timer-right"
                      onClick={() => handleStartTimer("right")}
                      className="px-4 py-2.5 rounded-xl bg-[#A3B18A] hover:bg-[#8f9d78] text-[#344E41] font-bold text-xs uppercase tracking-wider transition shadow-sm"
                    >
                      Mulai KANAN
                    </button>
                  </>
                ) : (
                  <>
                    {timerActive ? (
                      <button
                        id="btn-timer-pause"
                        onClick={handlePauseTimer}
                        className="p-3 rounded-full bg-[#BC6C25] hover:bg-[#a6561b] text-white transition shadow-sm"
                        title="Pause"
                      >
                        <Pause className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        id="btn-timer-resume"
                        onClick={() => setTimerActive(true)}
                        className="p-3 rounded-full bg-[#A3B18A] hover:bg-[#8f9d78] text-[#344E41] transition shadow-sm"
                        title="Mulai Lagi"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      id="btn-timer-stop"
                      onClick={handleStopTimer}
                      className="p-3 rounded-full bg-[#5A5A40] hover:bg-[#4a4a35] text-white transition shadow-sm"
                      title="Selesai & Catat"
                    >
                      <Square className="w-4 h-4 fill-white" />
                    </button>

                    <button
                      id="btn-timer-reset"
                      onClick={handleResetTimer}
                      className="px-3.5 py-2 rounded-xl border border-[#E2E8CE] text-[#8B8B6B] hover:bg-[#FDFBF7] text-xs font-bold uppercase tracking-wider transition"
                    >
                      Batal
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Log Feeding Form */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#E2E8CE] shadow-sm space-y-5">
            <h4 className="font-serif font-bold text-[#5A5A40] text-lg flex items-center gap-2.5">
              <Heart className="w-5 h-5 text-[#BC6C25] fill-[#F2E8CF]" />
              Catat Nutrisi & Susu
            </h4>

            {/* Type tabs */}
            <div className="grid grid-cols-2 gap-2 bg-[#FDFBF7] p-1.5 rounded-2xl border border-[#E2E8CE]">
              <button
                type="button"
                id="btn-feed-type-breast"
                onClick={() => setFeedType("breast")}
                className={`py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
                  feedType === "breast"
                    ? "bg-white text-[#BC6C25] shadow-sm border border-[#E2E8CE]"
                    : "text-[#8B8B6B] hover:text-[#5A5A40]"
                }`}
              >
                Menyusui Langsung
              </button>
              <button
                type="button"
                id="btn-feed-type-bottle"
                onClick={() => setFeedType("bottle")}
                className={`py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
                  feedType === "bottle"
                    ? "bg-white text-[#5A5A40] shadow-sm border border-[#E2E8CE]"
                    : "text-[#8B8B6B] hover:text-[#5A5A40]"
                }`}
              >
                Susu Botol (ASIP / Sufor)
              </button>
            </div>

            <form onSubmit={handleSubmitFeeding} className="space-y-4">
              {feedType === "breast" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#5A5A40] uppercase tracking-wider mb-1.5">Posisi Payudara</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(["left", "right", "both"] as const).map((side) => (
                        <button
                          key={side}
                          type="button"
                          id={`btn-breastside-${side}`}
                          onClick={() => setBreastSide(side)}
                          className={`py-2.5 rounded-xl border text-xs font-bold transition uppercase tracking-wider ${
                            breastSide === side
                              ? "bg-[#F2E8CF] border-[#BC6C25] text-[#BC6C25] shadow-sm"
                              : "border-[#E2E8CE] text-[#8B8B6B] hover:bg-[#FDFBF7]"
                          }`}
                        >
                          {side === "left" ? "Kiri" : side === "right" ? "Kanan" : "Kedua"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#5A5A40] uppercase tracking-wider mb-1.5">Durasi Menyusui (Menit)</label>
                    <input
                      id="input-feed-duration"
                      type="number"
                      min={1}
                      max={120}
                      value={duration}
                      onChange={(e) => setDuration(parseInt(e.target.value) || 15)}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8CE] text-xs text-[#5A5A40] bg-white focus:outline-none focus:ring-1 focus:ring-[#BC6C25] focus:border-[#BC6C25] font-sans"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-[#5A5A40] uppercase tracking-wider mb-1.5">Takaran / Volume (ml)</label>
                  <div className="flex gap-2">
                    <input
                      id="input-feed-bottle-amount"
                      type="number"
                      min={5}
                      max={1000}
                      step={5}
                      value={bottleAmount}
                      onChange={(e) => setBottleAmount(parseInt(e.target.value) || 100)}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8CE] text-xs text-[#5A5A40] bg-white focus:outline-none focus:ring-1 focus:ring-[#BC6C25] focus:border-[#BC6C25] font-sans"
                    />
                    <div className="flex gap-1.5 shrink-0">
                      {[60, 90, 120, 150].map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setBottleAmount(v)}
                          className="px-3 py-1 rounded-xl bg-[#F5F5F0] hover:bg-[#E2E8CE]/60 text-[#5A5A40] text-xs font-mono font-bold"
                        >
                          {v}ml
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#5A5A40] uppercase tracking-wider mb-1.5">Catatan Tambahan (Lapar, Rewel, Tidur, dll.)</label>
                <input
                  id="input-feed-notes"
                  type="text"
                  placeholder="Contoh: Laktasi lancar, bayi tertidur lelap."
                  value={feedNotes}
                  onChange={(e) => setFeedNotes(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8CE] text-xs text-[#5A5A40] bg-white focus:outline-none focus:ring-1 focus:ring-[#BC6C25] focus:border-[#BC6C25] font-sans"
                />
              </div>

              <button
                type="submit"
                id="btn-submit-feed-log"
                className="w-full py-2.5 rounded-xl bg-[#BC6C25] hover:bg-[#a6561b] text-white font-bold text-xs uppercase tracking-wider transition shadow-sm"
              >
                Mulai Simpan Log Laktasi
              </button>
            </form>
          </div>

          {/* Section 3: Log MPASI Form */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#E2E8CE] shadow-sm space-y-5">
            <h4 className="font-serif font-bold text-[#5A5A40] text-lg flex items-center gap-2.5">
              <BookOpen className="w-5 h-5 text-[#BC6C25]" />
              Catat MPASI / Makanan Padat
            </h4>

            <form onSubmit={handleSubmitMpasi} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#5A5A40] uppercase tracking-wider mb-1.5">Menu MPASI *</label>
                  <input
                    id="input-mpasi-menu"
                    type="text"
                    required
                    placeholder="Contoh: Puree Pisang, Bubur Saring Wortel"
                    value={mpasiMenu}
                    onChange={(e) => setMpasiMenu(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8CE] text-xs text-[#5A5A40] bg-white focus:outline-none focus:ring-1 focus:ring-[#BC6C25] focus:border-[#BC6C25] font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#5A5A40] uppercase tracking-wider mb-1.5">Porsi / Takaran (g / sdm)</label>
                  <input
                    id="input-mpasi-amount"
                    type="text"
                    placeholder="Contoh: 3 sdm, setengah mangkuk"
                    value={mpasiAmount}
                    onChange={(e) => setMpasiAmount(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8CE] text-xs text-[#5A5A40] bg-white focus:outline-none focus:ring-1 focus:ring-[#BC6C25] focus:border-[#BC6C25] font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5A5A40] uppercase tracking-wider mb-1.5">Reaksi Bayi Terhadap MPASI</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {([
                    { key: "suka", text: "😍 Lahap", bg: "bg-[#E2E8CE] text-[#5A5A40] border-[#A3B18A]" },
                    { key: "biasa", text: "😐 Biasa", bg: "bg-[#FDFBF7] text-[#8B8B6B] border-[#E2E8CE]" },
                    { key: "tolak", text: "🤢 GTM / Tolak", bg: "bg-[#F2E8CF] text-[#BC6C25] border-[#BC6C25]" },
                    { key: "alergi", text: "⚠️ Gatal/Alergi", bg: "bg-orange-50 text-orange-800 border-orange-200" }
                  ] as const).map((r) => (
                    <button
                      key={r.key}
                      type="button"
                      id={`btn-reaction-${r.key}`}
                      onClick={() => setMpasiReaction(r.key)}
                      className={`py-2.5 rounded-xl border text-xs font-bold text-center uppercase tracking-wider transition ${
                        mpasiReaction === r.key
                          ? `${r.bg} shadow-sm ring-1 ring-[#5A5A40]/10`
                          : "border-[#E2E8CE] text-[#8B8B6B] hover:bg-[#FDFBF7]"
                      }`}
                    >
                      {r.text}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5A5A40] uppercase tracking-wider mb-1.5">Catatan Tambahan (Tekstur, Alergen, dll.)</label>
                <input
                  id="input-mpasi-notes"
                  type="text"
                  placeholder="Contoh: Tekstur saring halus bubur beras merah, ditambah kaldu ayam asli."
                  value={mpasiNotes}
                  onChange={(e) => setMpasiNotes(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8CE] text-xs text-[#5A5A40] bg-white focus:outline-none focus:ring-1 focus:ring-[#BC6C25] focus:border-[#BC6C25] font-sans"
                />
              </div>

              <button
                type="submit"
                id="btn-submit-mpasi-log"
                className="w-full py-2.5 rounded-xl bg-[#A3B18A] hover:bg-[#8f9d78] text-[#344E41] font-bold text-xs uppercase tracking-wider transition shadow-sm"
              >
                Mulai Simpan Log MPASI
              </button>
            </form>
          </div>

        </div>

        {/* Right column: Chronological History Timeline */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-[#E2E8CE] shadow-sm flex flex-col h-[650px]">
          <div className="border-b border-[#F5F5F0] pb-4 mb-4 flex justify-between items-center shrink-0">
            <h4 className="font-serif font-bold text-[#5A5A40] text-lg">Riwayat Makan & Susu</h4>
            <span className="text-xs bg-[#E2E8CE] text-[#5A5A40] px-3 py-1 rounded-full font-bold uppercase tracking-wider">
              Total: {combinedHistory.length}
            </span>
          </div>

          {/* Timeline List Scroll Area */}
          <div className="overflow-y-auto flex-1 pr-1 space-y-4">
            {combinedHistory.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#8B8B6B] font-serif italic">
                <Heart className="w-10 h-10 stroke-1 stroke-[#8B8B6B] mb-2" />
                <p className="text-xs">Belum ada riwayat tercatat hari ini.</p>
                <p className="text-[10px] text-[#8B8B6B]/80 mt-1.5 font-sans not-italic">Gunakan formulir laktasi atau MPASI di samping untuk mencatat makan bayi pertama kali.</p>
              </div>
            ) : (
              combinedHistory.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border transition relative group ${
                    item.logCategory === "feed"
                      ? "border-[#E2E8CE] bg-[#FDFBF7] hover:bg-[#F2E8CF]/10"
                      : "border-[#E2E8CE] bg-[#F5F5F0]/40 hover:bg-[#E2E8CE]/30"
                  }`}
                >
                  {/* Delete Button overlay on hover */}
                  <button
                    id={`btn-delete-${item.id}`}
                    onClick={() => {
                      if (confirm("Apakah Ibu yakin ingin menghapus log ini?")) {
                        if (item.logCategory === "feed") onDeleteFeedingLog(item.id);
                        else onDeleteMpasiLog(item.id);
                      }
                    }}
                    className="absolute top-3.5 right-3.5 text-[#8B8B6B] hover:text-[#BC6C25] transition"
                    title="Hapus log"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-[#8B8B6B]">
                      {new Date(item.timestamp).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      item.logCategory === "feed"
                        ? "bg-[#F2E8CF] text-[#BC6C25]"
                        : "bg-[#E2E8CE] text-[#5A5A40]"
                    }`}>
                      {item.logCategory === "feed"
                        ? (item as FeedingLog).type === "breast" ? "Menyusui DBF" : "Susu Botol"
                        : "MPASI Padat"}
                    </span>
                  </div>

                  <div className="mt-2 text-xs text-[#5A5A40]">
                    {item.logCategory === "feed" ? (
                      <div>
                        {(item as FeedingLog).type === "breast" ? (
                          <p>
                            Menyusui selama <span className="font-bold">{(item as FeedingLog).durationMinutes} menit</span> di payudara{" "}
                            <span className="font-bold text-[#BC6C25]">
                              {(item as FeedingLog).breastSide === "left" ? "Kiri" : (item as FeedingLog).breastSide === "right" ? "Kanan" : "Keduanya"}
                            </span>
                          </p>
                        ) : (
                          <p>
                            Minum susu formula/ASIP sebanyak <span className="font-bold">{(item as FeedingLog).amountMl} ml</span>
                          </p>
                        )}
                      </div>
                    ) : (
                      <div>
                        <p className="font-serif font-bold text-[#5A5A40] text-sm">{ (item as MpasiLog).menu }</p>
                        <p className="text-[11px] text-[#8B8B6B] mt-0.5 font-sans">
                          Porsi: <span className="font-semibold text-[#5A5A40]">{(item as MpasiLog).amountText}</span>
                        </p>
                        <div className="inline-flex mt-1.5 text-[10px] px-2 py-0.5 bg-white border border-[#E2E8CE] rounded-xl font-bold uppercase text-[#BC6C25]">
                          {getReactionEmoji((item as MpasiLog).reaction)}
                        </div>
                      </div>
                    )}
                  </div>

                  {item.notes && (
                    <p className="mt-2 text-[11px] text-[#8B8B6B] italic bg-[#FDFBF7] p-2 rounded-xl border border-[#E2E8CE]/40 font-sans">
                      &ldquo;{item.notes}&rdquo;
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
