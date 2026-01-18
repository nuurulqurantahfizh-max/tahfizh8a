export interface Student {
  id: string;
  name: string;
  isSpecial: boolean; // Special surah list for Satrio, Hasbi, Syahwal
}

// PENTING: ID siswa tidak boleh diubah karena digunakan sebagai referensi di database
// Jika menambah siswa baru, gunakan ID baru yang belum terpakai
export const students: Student[] = [
  { id: "1", name: "ABDUL HAKIM", isSpecial: false },
  { id: "2", name: "ABDURROZZAQ ASSYABANI", isSpecial: false },
  { id: "3", name: "ANFIELLANO RAGHIB NAROTTAMA", isSpecial: false },
  { id: "4", name: "DAFFA SATRIOTETHUKO", isSpecial: false },
  { id: "5", name: "DEVIN AHZA PURBA", isSpecial: false },
  { id: "6", name: "ETHAN YUSUF HABIBBULAH", isSpecial: false },
  { id: "7", name: "GHIFARI ALFARIZY", isSpecial: false },
  { id: "25", name: "IMRON", isSpecial: false },
  { id: "9", name: "KENZIE LUTFAN PERMADI", isSpecial: false },
  { id: "10", name: "KHALISH IBNU ABDURAHMAN", isSpecial: false },
  { id: "11", name: "MUHAMAD IBRAHIM", isSpecial: false },
  { id: "12", name: "MUHAMMAD AZAM AL MUTAQIN", isSpecial: false },
  { id: "13", name: "MUHAMMAD AZMY ABDILLAH", isSpecial: false },
  { id: "14", name: "MUHAMMAD DENY ARDIANTO", isSpecial: false },
  { id: "15", name: "MUHAMMAD FATHURAHMAN YUSUP", isSpecial: false },
  { id: "16", name: "MUHAMMAD FAUZUL KABIR", isSpecial: false },
  { id: "17", name: "MUHAMMAD NIZAM", isSpecial: false },
  { id: "18", name: "MUHAMMAD ROYYAN SAPUTRA", isSpecial: false },
  { id: "19", name: "MUHAMMAD ZAID AR-RAHMAN", isSpecial: false },
  { id: "20", name: "NAUFAL HERMAWAN", isSpecial: false },
  { id: "21", name: "RANGGA EL-QADRY", isSpecial: false },
  { id: "22", name: "TSANY ALZAM ABHINAYA", isSpecial: false },
  { id: "23", name: "YAHYA ABDURRASYID", isSpecial: false },
  { id: "24", name: "ZIDDAN HUBBILLAH", isSpecial: false },
];

export const regularSurahs = [
  "Al-Mursalat",
  "Al-Insan",
  "Al-Qiyamah",
  "Al-Muddatstsir",
  "Al-Muzammil",
  "Al-Jin",
];

export const specialSurahs = [
  "Al-Mursalat",
  "Al-Insan",
  "Al-Qiyamah",
  "Al-Muddatstsir",
  "Al-Muzammil",
  "Al-Jin",
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
  if (score === 0) return { label: "Tidak Hadir", class: "status-tidak-hadir" };
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
