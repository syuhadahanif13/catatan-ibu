import { useState, useEffect, FormEvent } from "react";
import { BabyProfile, ImmunizationRecord } from "../types";
import { Check, Calendar, MapPin, Sparkles, BookOpen, Clock, AlertTriangle } from "lucide-react";

interface ImmunizationTrackerProps {
  profile: BabyProfile;
  records: ImmunizationRecord[];
  onToggleRecord: (id: string, isCompleted: boolean, completedDate?: string, notes?: string) => void;
}

export default function ImmunizationTracker({ profile, records, onToggleRecord }: ImmunizationTrackerProps) {
  const [activeTab, setActiveTab] = useState<"all" | "completed" | "upcoming">("all");
  const [babyAgeMonths, setBabyAgeMonths] = useState<number>(0);

  // Modal editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [completeDate, setCompleteDate] = useState("");
  const [vaccineNotes, setVaccineNotes] = useState("");

  // Calculate age on render
  useEffect(() => {
    if (!profile.birthDate) return;
    const birth = new Date(profile.birthDate);
    const today = new Date();
    let months = (today.getFullYear() - birth.getFullYear()) * 12 + today.getMonth() - birth.getMonth();
    if (today.getDate() < birth.getDate()) {
      months--;
    }
    setBabyAgeMonths(Math.max(0, months));
  }, [profile.birthDate]);

  // Helper to determine status based on age
  const getVaccineStatus = (record: ImmunizationRecord) => {
    if (record.isCompleted) return { label: "Selesai", style: "bg-emerald-50 text-emerald-700 border-emerald-200" };
    
    if (babyAgeMonths >= record.ageTargetMonths) {
      if (babyAgeMonths > record.ageTargetMonths + 2) {
        return { label: "Terlambat", style: "bg-rose-50 text-rose-700 border-rose-200 animate-pulse" };
      }
      return { label: "Jadwal Sekarang", style: "bg-amber-50 text-amber-700 border-amber-200" };
    }
    return { label: "Belum Waktunya", style: "bg-slate-50 text-slate-400 border-slate-100" };
  };

  // Helper to calculate estimated schedule date
  const calculateEstimatedDate = (targetMonths: number) => {
    if (!profile.birthDate) return "";
    const birth = new Date(profile.birthDate);
    birth.setMonth(birth.getMonth() + targetMonths);
    return birth.toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" });
  };

  const handleOpenCompleteModal = (record: ImmunizationRecord) => {
    setEditingId(record.id);
    setCompleteDate(record.completedDate || new Date().toISOString().split("T")[0]);
    setVaccineNotes(record.notes || "");
  };

  const handleSaveCompletion = (e: FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    onToggleRecord(editingId, true, completeDate, vaccineNotes);
    setEditingId(null);
    setVaccineNotes("");
    alert("Catatan imunisasi berhasil disimpan!");
  };

  const handleUndoCompletion = (id: string) => {
    if (confirm("Apakah Ibu ingin membatalkan status selesai untuk imunisasi ini?")) {
      onToggleRecord(id, false);
    }
  };

  const completedCount = records.filter((r) => r.isCompleted).length;
  const totalCount = records.length;
  const percentCompleted = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Filtering records
  const filteredRecords = records.filter((record) => {
    if (activeTab === "completed") return record.isCompleted;
    if (activeTab === "upcoming") return !record.isCompleted;
    return true;
  });

  return (
    <div id="immunization-tracker-section" className="space-y-8">
      
      {/* Visual Circular Progress Panel */}
      <div className="bg-[#FDFBF7] rounded-3xl p-6 border border-[#E2E8CE] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="text-xs text-[#BC6C25] font-bold uppercase tracking-wider">Laporan Imunisasi IDAI</span>
          <h3 className="font-serif font-bold text-xl text-[#5A5A40]">Perkembangan Vaksinasi Adek</h3>
          <p className="text-xs text-[#8B8B6B] max-w-md leading-relaxed font-sans">
            Sangat penting menjaga kedisiplinan jadwal imunisasi agar si kecil terlindungi dari wabah penyakit berbahaya (PD3I).
          </p>
        </div>

        {/* Progress Bar & Stats */}
        <div className="flex items-center gap-4 bg-white rounded-2xl p-4 border border-[#E2E8CE]">
          <div className="relative flex items-center justify-center">
            {/* Simple circular progress ring */}
            <svg className="w-16 h-16 transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="26"
                stroke="#F5F5F0"
                strokeWidth="6"
                fill="transparent"
              />
              <circle
                cx="32"
                cy="32"
                r="26"
                stroke="#BC6C25"
                strokeWidth="6"
                fill="transparent"
                strokeDasharray={163.36}
                strokeDashoffset={163.36 - (163.36 * percentCompleted) / 100}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <span className="absolute text-xs font-mono font-bold text-[#5A5A40]">{percentCompleted}%</span>
          </div>

          <div>
            <div className="text-sm font-serif font-bold text-[#5A5A40]">
              {completedCount} dari {totalCount} Selesai
            </div>
            <p className="text-[11px] text-[#8B8B6B] mt-0.5">Vaksinasi wajib & anjuran IDAI</p>
          </div>
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex gap-1.5 bg-[#F5F5F0] p-1 rounded-2xl border border-[#E2E8CE]">
          {(["all", "completed", "upcoming"] as const).map((tab) => (
            <button
              key={tab}
              id={`tab-imm-${tab}`}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-xs font-bold rounded-xl uppercase tracking-wider transition ${
                activeTab === tab
                  ? "bg-white text-[#BC6C25] shadow-sm border border-[#E2E8CE]"
                  : "text-[#8B8B6B] hover:text-[#5A5A40]"
              }`}
            >
              {tab === "all" ? "Semua Vaksin" : tab === "completed" ? "Selesai" : "Belum Vaksin"}
            </button>
          ))}
        </div>

        <span className="text-[11px] text-[#8B8B6B] italic font-serif">
          *Estimasi tanggal dihitung dari kelahiran {profile.birthDate}
        </span>
      </div>

      {/* Edit Form Modal (inline simulated overlay) */}
      {editingId && (
        <div className="p-6 bg-[#FDFBF7] rounded-3xl border border-[#BC6C25] shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#BC6C25] animate-pulse" />
            <h4 className="font-serif font-bold text-[#5A5A40] text-sm">
              Catat Vaksinasi Selesai: {records.find((r) => r.id === editingId)?.name}
            </h4>
          </div>

          <form onSubmit={handleSaveCompletion} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-xs font-bold text-[#5A5A40] uppercase tracking-wider mb-1.5">Tanggal Penyuntikan *</label>
              <input
                id="input-imm-date"
                type="date"
                required
                max={new Date().toISOString().split("T")[0]}
                value={completeDate}
                onChange={(e) => setCompleteDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8CE] text-xs text-[#5A5A40] bg-white focus:outline-none focus:ring-1 focus:ring-[#BC6C25] focus:border-[#BC6C25]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#5A5A40] uppercase tracking-wider mb-1.5">Lokasi / Dokter Anak (Opsional)</label>
              <input
                id="input-imm-notes"
                type="text"
                placeholder="Contoh: Puskesmas Kebayoran, Dr. Indah Sp.A"
                value={vaccineNotes}
                onChange={(e) => setVaccineNotes(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8CE] text-xs text-[#5A5A40] bg-white focus:outline-none focus:ring-1 focus:ring-[#BC6C25] focus:border-[#BC6C25]"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setEditingId(null)}
                className="px-3 py-2.5 rounded-xl border border-[#E2E8CE] text-xs font-bold uppercase tracking-wider text-[#8B8B6B] bg-white hover:bg-[#FDFBF7] flex-1 transition"
              >
                Batal
              </button>
              <button
                type="submit"
                id="btn-save-imm-submit"
                className="px-4 py-2.5 rounded-xl bg-[#BC6C25] hover:bg-[#a6561b] text-white text-xs font-bold uppercase tracking-wider shadow-sm flex-1 transition"
              >
                Simpan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid of Vaccines cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredRecords.length === 0 ? (
          <div className="col-span-2 text-center py-12 bg-white rounded-3xl border border-[#E2E8CE] text-[#8B8B6B] font-serif italic text-sm">
            Tidak ada vaksin dalam kategori filter ini.
          </div>
        ) : (
          filteredRecords.map((record) => {
            const status = getVaccineStatus(record);
            
            // Adjust status colors to match Natural Tones
            let customStatusStyle = status.style;
            if (status.label === "Selesai") {
              customStatusStyle = "bg-[#E2E8CE] text-[#344E41] border-[#A3B18A]";
            } else if (status.label === "Terlambat") {
              customStatusStyle = "bg-orange-50 text-orange-800 border-orange-200 animate-pulse";
            } else if (status.label === "Jadwal Sekarang") {
              customStatusStyle = "bg-[#F2E8CF] text-[#BC6C25] border-[#BC6C25]";
            } else {
              customStatusStyle = "bg-[#FDFBF7] text-[#8B8B6B] border-[#E2E8CE]";
            }

            return (
              <div
                key={record.id}
                className={`p-6 rounded-3xl border transition flex flex-col justify-between gap-5 bg-white hover:shadow-md ${
                  record.isCompleted
                    ? "border-[#E2E8CE]"
                    : "border-[#E2E8CE]/60"
                }`}
              >
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[10px] font-mono font-bold text-[#BC6C25] bg-[#F2E8CF] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      Target: {record.recommendedAgeStr}
                    </span>
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-bold uppercase tracking-wider ${customStatusStyle}`}>
                      {status.label}
                    </span>
                  </div>

                  <h4 className="font-serif font-bold text-[#5A5A40] text-base mt-3 flex items-center gap-1.5">
                    {record.name}
                  </h4>
                  <p className="text-xs text-[#8B8B6B] mt-1.5 leading-relaxed font-sans">{record.description}</p>

                  <div className="mt-4 pt-4 border-t border-[#F5F5F0] space-y-2">
                    <p className="text-[11px] text-[#8B8B6B] flex items-center gap-2 font-sans">
                      <Calendar className="w-3.5 h-3.5 text-[#8B8B6B]" />
                      Estimasi Tanggal: <span className="font-semibold text-[#5A5A40]">{calculateEstimatedDate(record.ageTargetMonths)}</span>
                    </p>

                    {record.isCompleted && (
                      <>
                        <p className="text-[11px] text-[#344E41] flex items-center gap-2 font-bold font-sans">
                          <Check className="w-3.5 h-3.5 text-[#A3B18A]" />
                          Disuntik pada: {new Date(record.completedDate!).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })}
                        </p>
                        {record.notes && (
                          <p className="text-[11px] text-[#8B8B6B] flex items-center gap-2 bg-[#FDFBF7] p-2 rounded-xl border border-[#E2E8CE]/40 font-sans">
                            <MapPin className="w-3 h-3 text-[#BC6C25]" />
                            Lokasi: <span className="font-semibold text-[#5A5A40]">{record.notes}</span>
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  {record.isCompleted ? (
                    <button
                      id={`btn-undo-imm-${record.id}`}
                      onClick={() => handleUndoCompletion(record.id)}
                      className="w-full py-2 bg-[#F5F5F0] hover:bg-[#E2E8CE]/60 border border-[#E2E8CE] rounded-xl text-xs text-[#8B8B6B] font-bold uppercase tracking-wider transition"
                    >
                      Batalkan Selesai
                    </button>
                  ) : (
                    <button
                      id={`btn-complete-imm-${record.id}`}
                      onClick={() => handleOpenCompleteModal(record)}
                      className="w-full py-2.5 bg-[#BC6C25] hover:bg-[#a6561b] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" /> Tandai Sudah Vaksin
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Helpful educational disclaimer */}
      <div className="bg-[#FDFBF7] rounded-3xl p-5 border border-[#E2E8CE] flex gap-3.5 items-start">
        <AlertTriangle className="w-5 h-5 text-[#BC6C25] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h5 className="text-xs font-serif font-bold text-[#5A5A40] uppercase tracking-wider">Catatan Medis Penting</h5>
          <p className="text-[11px] text-[#8B8B6B] leading-relaxed font-sans">
            Jadwal di atas merujuk pada standar Ikatan Dokter Anak Indonesia (IDAI). Pastikan Ibu selalu melakukan konsultasi secara langsung dengan dokter anak atau bidan di Posyandu/Puskesmas terdekat mengenai kondisi fisik si kecil sebelum melakukan penyuntikan vaksin.
          </p>
        </div>
      </div>
    </div>
  );
}
