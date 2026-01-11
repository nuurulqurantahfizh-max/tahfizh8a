export interface Student {
  id: string;
  name: string;
  isSpecial: boolean; // Special surah list for Satrio, Hasbi, Syahwal
}

export const students: Student[] = [
  { id: "1", name: "ABDURAHMAN ALFATHUR", isSpecial: false },
  { id: "2", name: "ADHITYA SATRIO WIJAYA", isSpecial: true },
  { id: "3", name: "AHMAD AL FATHIR", isSpecial: false },
  { id: "4", name: "BAYU WICAKSONO RAMADHAN", isSpecial: false },
  { id: "5", name: "DANISHTARA RIEFANDI", isSpecial: false },
  { id: "6", name: "FADLAN ALTAF HAZIQ", isSpecial: false },
  { id: "7", name: "FIRANDA DEWANTORO", isSpecial: false },
  { id: "8", name: "HABBIL MUHAMAD HUSAN", isSpecial: false },
  { id: "9", name: "HASBI ROBBY FIZI AL FARISI", isSpecial: true },
  { id: "10", name: "JOSENO DANI UTOMO", isSpecial: false },
  { id: "11", name: "MUHAMMAD ADHA PRATAMA ARFI", isSpecial: false },
  { id: "12", name: "MUHAMMAD GHASSAN SURYA ALBANI", isSpecial: false },
  { id: "13", name: "MUHAMMAD SHABRAN PUTRA RASYID", isSpecial: false },
  { id: "14", name: "RAISYAN AKHDAN ROFIQ", isSpecial: false },
  { id: "15", name: "SYAFIQ", isSpecial: false },
  { id: "16", name: "SYAHWAL DWI FARIZQIE", isSpecial: true },
];

export const regularSurahs = [
  "Al-Ahqaf",
  "Muhammad",
  "Al-Fath",
];

export const specialSurahs = [
  "Al-Mumtahanah",
  "Al-Hasyr",
  "Ash-Shof",
  "Al-Jumu'ah",
  "Al-Munafiqun",
  "At-Taghabun",
];

export const islamicQuotes = [
  {
    arabic: "اقْرَأْ وَرَبُّكَ الْأَكْرَمُ",
    translation: "Bacalah, dan Tuhanmulah Yang Maha Mulia",
    source: "QS. Al-'Alaq: 3",
  },
  {
    arabic: "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ",
    translation: "Sebaik-baik kalian adalah yang mempelajari Al-Qur'an dan mengajarkannya",
    source: "HR. Bukhari",
  },
  {
    arabic: "إِنَّ هَٰذَا الْقُرْآنَ يَهْدِي لِلَّتِي هِيَ أَقْوَمُ",
    translation: "Sesungguhnya Al-Qur'an ini memberikan petunjuk kepada jalan yang lebih lurus",
    source: "QS. Al-Isra: 9",
  },
  {
    arabic: "وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ",
    translation: "Dan sungguh, telah Kami mudahkan Al-Qur'an untuk peringatan",
    source: "QS. Al-Qamar: 17",
  },
  {
    arabic: "اَلْقُرْآنُ شَافِعٌ مُشَفَّعٌ",
    translation: "Al-Qur'an adalah pemberi syafaat yang syafaatnya diterima",
    source: "HR. Ibnu Hibban",
  },
];

export const getGradeStatus = (score: number): { label: string; class: string } => {
  if (score >= 90) return { label: "Sangat Lancar", class: "status-sangat-lancar" };
  if (score >= 80) return { label: "Lancar", class: "status-lancar" };
  if (score >= 70) return { label: "Kurang Lancar (Mengulang)", class: "status-kurang-lancar" };
  return { label: "Tidak Lancar", class: "status-tidak-lancar" };
};

export interface HafalanRecord {
  id: string;
  studentId: string;
  date: string;
  surah: string;
  ayat: string;
  score: number;
  notes: string;
}

export interface MurajaahRecord {
  id: string;
  studentId: string;
  date: string;
  surah: string;
  status: "Lancar" | "Kurang Lancar" | "Tidak Lancar";
}
