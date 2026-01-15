// Data surah dengan jumlah ayat
export interface SurahInfo {
  name: string;
  totalAyat: number;
}

export const surahData: SurahInfo[] = [
  { name: "Al-Mursalat", totalAyat: 50 },
  { name: "Al-Insan", totalAyat: 31 },
  { name: "Al-Qiyamah", totalAyat: 40 },
  { name: "Al-Muddatstsir", totalAyat: 56 },
  { name: "Al-Muzammil", totalAyat: 20 },
  { name: "Al-Jin", totalAyat: 28 },
];

// Helper function to get surah info by name
export const getSurahInfo = (name: string): SurahInfo | undefined => {
  return surahData.find(s => s.name === name);
};

// Helper function to generate ayat options for a surah
export const getAyatOptions = (surahName: string): number[] => {
  const surah = getSurahInfo(surahName);
  if (!surah) return [];
  return Array.from({ length: surah.totalAyat }, (_, i) => i + 1);
};

// Helper function to calculate total ayat from range string like "1-10" or "5"
export const calculateAyatCount = (ayatRange: string): number => {
  if (!ayatRange) return 0;
  
  const trimmed = ayatRange.trim();
  
  // Check if it's a range (e.g., "1-10")
  if (trimmed.includes("-")) {
    const parts = trimmed.split("-").map(p => parseInt(p.trim()));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return Math.abs(parts[1] - parts[0]) + 1;
    }
  }
  
  // Single ayat
  const single = parseInt(trimmed);
  if (!isNaN(single)) {
    return 1;
  }
  
  return 0;
};

// Helper to format ayat range for display
export const formatAyatRange = (start: number, end: number): string => {
  if (start === end) return start.toString();
  return `${start}-${end}`;
};
