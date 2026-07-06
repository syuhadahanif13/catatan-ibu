import { useState, FormEvent } from "react";
import { BabyProfile } from "../types";
import { Baby, Calendar, Clock, Edit2, Heart } from "lucide-react";

interface ProfileFormProps {
  profile: BabyProfile | null;
  onSave: (profile: BabyProfile) => void;
}

export default function ProfileForm({ profile, onSave }: ProfileFormProps) {
  const [isEditing, setIsEditing] = useState(!profile);
  const [name, setName] = useState(profile?.name || "");
  const [gender, setGender] = useState<"male" | "female">(profile?.gender || "male");
  const [birthDate, setBirthDate] = useState(profile?.birthDate || "");
  const [wakeTime, setWakeTime] = useState(profile?.wakeTime || "06:00");
  const [specialNotes, setSpecialNotes] = useState(profile?.specialNotes || "");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name || !birthDate) return;
    onSave({ name, gender, birthDate, wakeTime, specialNotes });
    setIsEditing(false);
  };

  // Helper to calculate precise age
  const calculateAge = (dateString: string) => {
    if (!dateString) return "";
    const today = new Date();
    const birthDateObj = new Date(dateString);
    let years = today.getFullYear() - birthDateObj.getFullYear();
    let months = today.getMonth() - birthDateObj.getMonth();
    let days = today.getDate() - birthDateObj.getDate();

    if (days < 0) {
      months--;
      const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += lastMonth.getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    const totalMonths = years * 12 + months;

    if (totalMonths === 0) {
      return `${days} Hari`;
    }
    return `${totalMonths} Bulan ${days} Hari`;
  };

  if (!isEditing && profile) {
    return (
      <div id="profile-card" className="bg-white rounded-3xl p-6 md:p-8 border border-[#E2E8CE] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className={`p-4 rounded-full ${profile.gender === "female" ? "bg-[#F2E8CF] text-[#BC6C25]" : "bg-[#E2E8CE] text-[#5A5A40]"}`}>
            <Baby className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif font-bold text-xl text-[#5A5A40]">{profile.name}</h2>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${profile.gender === "female" ? "bg-[#F2E8CF] text-[#BC6C25]" : "bg-[#E2E8CE] text-[#5A5A40]"}`}>
                {profile.gender === "female" ? "Perempuan" : "Laki-laki"}
              </span>
            </div>
            <p className="text-sm text-[#8B8B6B] mt-1.5 flex items-center gap-1.5 font-sans">
              <Calendar className="w-4 h-4 text-[#BC6C25]" /> Lahir: {profile.birthDate} <span className="font-serif italic font-semibold">({calculateAge(profile.birthDate)})</span>
            </p>
            <p className="text-sm text-[#8B8B6B] flex items-center gap-1.5 mt-1 font-sans">
              <Clock className="w-4 h-4 text-[#BC6C25]" /> Bangun Pagi: {profile.wakeTime}
            </p>
            {profile.specialNotes && (
              <p className="text-xs bg-[#FDFBF7] text-[#5A5A40] rounded-xl p-3 mt-3 border border-[#E2E8CE] font-sans">
                <span className="font-bold text-[#BC6C25] uppercase tracking-wider text-[10px] block mb-0.5">Catatan Khusus:</span> {profile.specialNotes}
              </p>
            )}
          </div>
        </div>
        <button
          id="edit-profile-btn"
          onClick={() => setIsEditing(true)}
          className="flex items-center gap-2 text-xs font-bold text-[#BC6C25] hover:text-white bg-[#F2E8CF] hover:bg-[#BC6C25] px-4 py-3 rounded-xl transition duration-200 self-start md:self-center uppercase tracking-wider shadow-sm"
        >
          <Edit2 className="w-4 h-4" /> Edit Profil Bayi
        </button>
      </div>
    );
  }

  return (
    <div id="profile-form-card" className="bg-white rounded-3xl p-6 md:p-8 border border-[#E2E8CE] shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <Heart className="w-6 h-6 text-[#BC6C25] fill-[#BC6C25] animate-pulse" />
        <h2 className="font-serif font-bold text-xl md:text-2xl text-[#5A5A40]">
          {profile ? "Edit Profil Bayi" : "Atur Profil Bayi Anda"}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#5A5A40] uppercase tracking-wider mb-1.5">Nama Panggilan Bayi *</label>
            <input
              id="input-baby-name"
              type="text"
              required
              placeholder="Contoh: Aruna Safira"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8CE] focus:outline-none focus:ring-1 focus:ring-[#BC6C25] focus:border-[#BC6C25] text-xs text-[#5A5A40] bg-white font-sans"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#5A5A40] uppercase tracking-wider mb-1.5">Jenis Kelamin *</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                id="btn-gender-male"
                onClick={() => setGender("male")}
                className={`py-2.5 rounded-xl border text-xs font-bold uppercase tracking-wider transition ${
                  gender === "male"
                    ? "bg-[#E2E8CE] border-[#A3B18A] text-[#5A5A40] shadow-sm"
                    : "border-[#E2E8CE] text-[#8B8B6B] hover:bg-[#FDFBF7]"
                }`}
              >
                Laki-laki
              </button>
              <button
                type="button"
                id="btn-gender-female"
                onClick={() => setGender("female")}
                className={`py-2.5 rounded-xl border text-xs font-bold uppercase tracking-wider transition ${
                  gender === "female"
                    ? "bg-[#F2E8CF] border-[#BC6C25] text-[#BC6C25] shadow-sm"
                    : "border-[#E2E8CE] text-[#8B8B6B] hover:bg-[#FDFBF7]"
                }`}
              >
                Perempuan
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#5A5A40] uppercase tracking-wider mb-1.5">Tanggal Lahir *</label>
            <input
              id="input-baby-birthdate"
              type="date"
              required
              max={new Date().toISOString().split("T")[0]}
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8CE] focus:outline-none focus:ring-1 focus:ring-[#BC6C25] focus:border-[#BC6C25] text-xs text-[#5A5A40] bg-white font-sans"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#5A5A40] uppercase tracking-wider mb-1.5">Jam Bangun Pagi Biasanya *</label>
            <input
              id="input-baby-waketime"
              type="time"
              required
              value={wakeTime}
              onChange={(e) => setWakeTime(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8CE] focus:outline-none focus:ring-1 focus:ring-[#BC6C25] focus:border-[#BC6C25] text-xs text-[#5A5A40] bg-white font-sans"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#5A5A40] uppercase tracking-wider mb-1.5">Catatan Khusus (Alergi, Riwayat Lahir, dll.)</label>
          <textarea
            id="input-baby-notes"
            placeholder="Contoh: Alergi telur, lahir prematur 36 minggu, dsb."
            value={specialNotes}
            onChange={(e) => setSpecialNotes(e.target.value)}
            rows={2}
            className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8CE] focus:outline-none focus:ring-1 focus:ring-[#BC6C25] focus:border-[#BC6C25] text-xs text-[#5A5A40] bg-white resize-none font-sans"
          />
        </div>

        <div className="flex gap-2 justify-end mt-4">
          {profile && (
            <button
              type="button"
              id="btn-cancel-edit-profile"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2.5 rounded-xl border border-[#E2E8CE] text-[#8B8B6B] hover:bg-[#FDFBF7] text-xs font-bold uppercase tracking-wider transition"
            >
              Batal
            </button>
          )}
          <button
            type="submit"
            id="btn-save-profile"
            className="px-5 py-2.5 rounded-xl bg-[#BC6C25] hover:bg-[#a6561b] text-white text-xs font-bold uppercase tracking-wider transition shadow-sm shadow-[#BC6C25]/10"
          >
            Simpan Profil Bayi
          </button>
        </div>
      </form>
    </div>
  );
}
