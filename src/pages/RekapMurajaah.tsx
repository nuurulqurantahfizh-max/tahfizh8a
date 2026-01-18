import { Link } from "react-router-dom";
import { students, MurajaahRecord } from "@/data/students";
import { ArrowLeft, Download, RefreshCw, Loader2, CalendarIcon } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const RekapMurajaah = () => {
  const [allRecords, setAllRecords] = useState<(MurajaahRecord & { studentName: string })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [startDate, setStartDate] = useState<Date | undefined>(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState<Date | undefined>(endOfMonth(new Date()));

  useEffect(() => {
    const fetchAllRecords = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('murajaah_records')
          .select('*')
          .eq('type', 'home')
          .order('date', { ascending: false });

        if (error) throw error;

        const records: (MurajaahRecord & { studentName: string })[] = (data || []).map(record => {
          const student = students.find(s => s.id === record.student_id);
          return {
            id: record.id,
            studentId: record.student_id,
            date: record.date,
            surah: record.surah,
            status: record.status as "Lancar" | "Kurang Lancar" | "Tidak Lancar",
            studentName: student?.name.toLowerCase().replace(/\b\w/g, c => c.toUpperCase()) || 'Unknown',
          };
        });

        setAllRecords(records);
      } catch (error) {
        console.error('Error fetching records:', error);
        toast.error("Gagal memuat data murajaah");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllRecords();
  }, []);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Lancar":
        return "bg-green-100 text-green-700 border-green-200";
      case "Kurang Lancar":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "Tidak Lancar":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  // Filter records based on date range
  const filteredRecords = useMemo(() => {
    if (!startDate || !endDate) return allRecords;
    return allRecords.filter(record => {
      const recordDate = parseISO(record.date);
      return isWithinInterval(recordDate, { start: startDate, end: endDate });
    });
  }, [allRecords, startDate, endDate]);

  // Count submissions per student
  const studentSubmissionCount = useMemo(() => {
    const countMap: Record<string, { name: string; count: number }> = {};
    filteredRecords.forEach(record => {
      if (!countMap[record.studentId]) {
        countMap[record.studentId] = { name: record.studentName, count: 0 };
      }
      countMap[record.studentId].count++;
    });
    return countMap;
  }, [filteredRecords]);

  // Get students who didn't submit
  const studentsWithoutSubmission = useMemo(() => {
    const submittedIds = new Set(filteredRecords.map(r => r.studentId));
    return students.filter(s => !submittedIds.has(s.id)).map(s => ({
      id: s.id,
      name: s.name.toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
    }));
  }, [filteredRecords]);

  const exportToPDF = () => {
    // Sort students by submission count (highest first)
    const sortedSubmissions = Object.entries(studentSubmissionCount)
      .sort((a, b) => b[1].count - a[1].count)
      .map(([id, data], index) => ({ rank: index + 1, ...data }));

    const printContent = `
      <html>
        <head>
          <title>Rekap Murajaah Orang Tua - Kelas 8A</title>
          <style>
            body { font-family: 'Segoe UI', sans-serif; padding: 20px; }
            h1 { color: #d97706; text-align: center; }
            h2 { color: #374151; margin-top: 30px; font-size: 16px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
            th { background-color: #d97706; color: white; }
            .summary { background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .summary p { margin: 5px 0; }
            .no-submit { color: #dc2626; }
            .no-submit-list { background-color: #fee2e2; padding: 15px; border-radius: 8px; }
            .no-submit-list ul { margin: 10px 0; padding-left: 20px; }
          </style>
        </head>
        <body>
          <h1>Rekap Murajaah Hafalan (Orang Tua)</h1>
          <p style="text-align: center;">Madrasah Nuurul Qur'an - Kelas 8A</p>
          <p style="text-align: center;">Periode: ${startDate ? format(startDate, "dd MMMM yyyy", { locale: localeId }) : "-"} s/d ${endDate ? format(endDate, "dd MMMM yyyy", { locale: localeId }) : "-"}</p>
          <p style="text-align: center;">Dicetak: ${format(new Date(), "dd MMMM yyyy", { locale: localeId })}</p>
          
          <div class="summary">
            <p><strong>Total Setoran:</strong> ${filteredRecords.length} kali</p>
            <p><strong>Siswa yang Setor:</strong> ${Object.keys(studentSubmissionCount).length} siswa</p>
            <p><strong>Siswa yang Tidak Setor:</strong> ${studentsWithoutSubmission.length} siswa</p>
          </div>

          <h2>📊 Jumlah Setoran Per Siswa</h2>
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Nama Siswa</th>
                <th>Jumlah Setoran</th>
              </tr>
            </thead>
            <tbody>
              ${sortedSubmissions.map((data) => `
                <tr>
                  <td>${data.rank}</td>
                  <td>${data.name}</td>
                  <td>${data.count} kali</td>
                </tr>
              `).join("")}
            </tbody>
          </table>

          ${studentsWithoutSubmission.length > 0 ? `
            <h2 class="no-submit">⚠️ Siswa yang Tidak Setor Murajaah</h2>
            <div class="no-submit-list">
              <ul>
                ${studentsWithoutSubmission.map((s, i) => `<li>${i + 1}. ${s.name}</li>`).join("")}
              </ul>
            </div>
          ` : ''}
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="min-h-screen bg-background islamic-pattern">
      {/* Header */}
      <div className="bg-gold text-white py-4 px-4">
        <div className="container mx-auto max-w-2xl">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </Link>
          <h1 className="text-xl font-bold">Rekap Murajaah Orang Tua</h1>
          <p className="text-white/80 text-sm">
            Data murajaah dari orang tua siswa Kelas 8A
          </p>
        </div>
      </div>

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Date Filter */}
        <div className="card-islamic p-4 mb-4">
          <p className="text-sm font-medium text-foreground mb-3">Filter Tanggal:</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">Dari</p>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "dd MMM yyyy", { locale: localeId }) : "Pilih tanggal"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">Sampai</p>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "dd MMM yyyy", { locale: localeId }) : "Pilih tanggal"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        {/* Export Button */}
        <button
          onClick={exportToPDF}
          disabled={filteredRecords.length === 0 || isLoading}
          className="w-full mb-6 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 border-gold text-gold hover:bg-gold/5 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-5 h-5" />
          Export PDF ({filteredRecords.length} data)
        </button>

        {/* Summary Preview */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-gold" />
            <span className="ml-2 text-muted-foreground">Memuat data...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary Stats */}
            <div className="card-islamic p-4 bg-gold/5 border-gold/20">
              <h3 className="font-semibold text-foreground mb-3">📊 Ringkasan Periode</h3>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-2xl font-bold text-gold">{filteredRecords.length}</p>
                  <p className="text-xs text-muted-foreground">Total Setoran</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{Object.keys(studentSubmissionCount).length}</p>
                  <p className="text-xs text-muted-foreground">Siswa Setor</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">{studentsWithoutSubmission.length}</p>
                  <p className="text-xs text-muted-foreground">Tidak Setor</p>
                </div>
              </div>
            </div>

            {/* Submission Count per Student */}
            {Object.keys(studentSubmissionCount).length > 0 && (
              <div className="card-islamic p-4">
                <h3 className="font-semibold text-foreground mb-3">📝 Jumlah Setoran Per Siswa</h3>
                <div className="space-y-2">
                  {Object.entries(studentSubmissionCount)
                    .sort((a, b) => b[1].count - a[1].count)
                    .map(([id, data], index) => (
                      <div key={id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-gold/10 text-gold text-xs flex items-center justify-center font-medium">
                            {index + 1}
                          </span>
                          <span className="text-sm text-foreground">{data.name}</span>
                        </div>
                        <span className="text-sm font-medium text-gold">{data.count} kali</span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Students Without Submission */}
            {studentsWithoutSubmission.length > 0 && (
              <div className="card-islamic p-4 bg-red-50 border-red-200">
                <h3 className="font-semibold text-red-700 mb-3">⚠️ Siswa yang Tidak Setor Murajaah</h3>
                <div className="space-y-2">
                  {studentsWithoutSubmission.map((student, index) => (
                    <div key={student.id} className="flex items-center gap-2 py-1">
                      <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 text-xs flex items-center justify-center font-medium">
                        {index + 1}
                      </span>
                      <span className="text-sm text-red-700">{student.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {filteredRecords.length === 0 && studentsWithoutSubmission.length === 0 && (
              <div className="card-islamic p-8 text-center">
                <RefreshCw className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Tidak ada data pada periode ini</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default RekapMurajaah;