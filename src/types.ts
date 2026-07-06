export interface BabyProfile {
  name: string;
  gender: "male" | "female";
  birthDate: string; // YYYY-MM-DD
  wakeTime: string;  // HH:MM
  specialNotes?: string;
}

export interface FeedingLog {
  id: string;
  type: "breast" | "bottle";
  timestamp: string; // ISO string
  durationMinutes?: number; // for breast
  breastSide?: "left" | "right" | "both"; // for breast
  amountMl?: number; // for bottle
  notes?: string;
}

export interface MpasiLog {
  id: string;
  timestamp: string; // ISO string
  menu: string;
  amountText: string; // e.g. "3 sdm", "Setengah mangkok"
  reaction: "suka" | "biasa" | "alergi" | "tolak"; // reaction types
  notes?: string;
}

export interface ImmunizationRecord {
  id: string;
  name: string;
  ageTargetMonths: number;
  recommendedAgeStr: string;
  description: string;
  isCompleted: boolean;
  completedDate?: string;
  notes?: string;
}

export interface DailyTask {
  id: string;
  title: string;
  category: "menyusui" | "mpasi" | "imunisasi" | "tidur" | "stimulasi" | "lainnya";
  timeStr: string; // HH:MM
  isCompleted: boolean;
  notes?: string;
}

export interface AiRecommendation {
  schedule: {
    time: string;
    activity: string;
    duration: string;
    description: string;
  }[];
  mpasiTips: string[];
  milestones: string[];
  advice: string;
  generatedAt: string; // ISO string
}
