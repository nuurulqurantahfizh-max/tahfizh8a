import { Link } from "react-router-dom";
import { students, MurajaahRecord } from "@/data/students";
import { ArrowLeft, Download, Loader2, CalendarIcon } from "lucide-react";
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

  // Filter records based on date range
  const filteredRecords = useMemo(() => {
    if (!startDate || !endDate) return allRecords;
    return allRecords.filter(record => {
      const recordDate = parseISO(record.date);
      return isWithinInterval(recordDate, { start: startDate, end: endDate });
    });
  }, [allRecords, startDate, endDate]);

  const MIN_TARGET = 3; // Minimum setoran per periode

  // Build submission data for ALL students
  const allStudentSubmissions = useMemo(() => {
    const countMap: Record<string, number> = {};
    filteredRecords.forEach(record => {
      countMap[record.studentId] = (countMap[record.studentId] || 0) + 1;
    });

    return students.map(s => ({
      id: s.id,
      name: s.name.toLowerCase().replace(/\b\w/g, c => c.toUpperCase()),
      count: countMap[s.id] || 0,
      status: countMap[s.id] >= MIN_TARGET 
        ? 'target' 
        : countMap[s.id] > 0 
          ? 'kurang' 
          : 'tidak'
    }));
  }, [filteredRecords]);

  // Categorize students
  const studentsMeetTarget = useMemo(() => 
    allStudentSubmissions.filter(s => s.status === 'target'), [allStudentSubmissions]);
  
  const studentsLessThanTarget = useMemo(() => 
    allStudentSubmissions.filter(s => s.status === 'kurang'), [allStudentSubmissions]);
  
  const studentsNoSubmission = useMemo(() => 
    allStudentSubmissions.filter(s => s.status === 'tidak'), [allStudentSubmissions]);

  const exportToPDF = () => {
    const printContent = `
      <html>
        <head>
          <title>Rekap Murajaah Orang Tua - Kelas 8A</title>
          <style>
            body { font-family: 'Segoe UI', sans-serif; padding: 20px; }
            h1 { color: #d97706; text-align: center; }
            h2 { color: #374151; margin-top: 30px; font-size: 16px; }
            .subtitle { text-align: center; color: #666; margin: 5px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
            th { background-color: #d97706; color: white; }
            .summary { display: flex; gap: 20px; margin: 20px 0; }
            .summary-item { text-align: center; }
            .summary-item .number { font-size: 24px; font-weight: bold; }
            .summary-item .label { font-size: 11px; color: #666; }
            .target { color: #16a34a; }
            .kurang { color: #d97706; }
            .tidak { color: #dc2626; }
            .row-target { background-color: #f0fdf4; }
            .row-kurang { background-color: #fffbeb; }
            .row-tidak { background-color: #fef2f2; }
          </style>
        </head>
        <body>
          <h1>Rekap Murajaah Hafalan (Orang Tua)</h1>
          <p class="subtitle">Madrasah Nuurul Qur'an - Kelas 8A</p>
          <p class="subtitle">Periode: ${startDate ? format(startDate, "dd MMMM yyyy", { locale: localeId }) : "-"} s/d ${endDate ? format(endDate, "dd MMMM yyyy", { locale: localeId }) : "-"}</p>
          <p class="subtitle">Dicetak: ${format(new Date(), "dd MMMM yyyy", { locale: localeId })}</p>
          
          <div class="summary">
            <div class="summary-item">
              <div class="number" style="color: #d97706;">${filteredRecords.length}</div>
              <div class="label">Total Setoran</div>
            </div>
            <div class="summary-item">
              <div class="number target">${studentsMeetTarget.length}</div>
              <div class="label">Siswa Memenuhi Target (≥3x)</div>
            </div>
            <div class="summary-item">
              <div class="number kurang">${studentsLessThanTarget.length}</div>
              <div class="label">Kurang dari 3x</div>
            </div>
            <div class="summary-item">
              <div class="number tidak">${studentsNoSubmission.length}</div>
              <div class="label">Tidak Setoran</div>
            </div>
          </div>

          <h2>Ringkasan Setoran Per Siswa</h2>
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Nama Siswa</th>
                <th>Jumlah Setoran</th>
                <th>Keterangan</th>
              </tr>
            </thead>
            <tbody>
              ${allStudentSubmissions.map((s, i) => {
                const rowClass = s.status === 'target' ? 'row-target' : s.status === 'kurang' ? 'row-kurang' : 'row-tidak';
                const statusClass = s.status === 'target' ? 'target' : s.status === 'kurang' ? 'kurang' : 'tidak';
                const statusText = s.status === 'target' 
                  ? '✓ Memenuhi Target' 
                  : s.status === 'kurang' 
                    ? '⚠ Kurang dari Target' 
                    : '✗ Tidak Ada Setoran';
                return `
                  <tr class="${rowClass}">
                    <td>${i + 1}</td>
                    <td>${s.name}</td>
                    <td>${s.count}x</td>
                    <td class="${statusClass}">${statusText}</td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>

          ${studentsNoSubmission.length > 0 ? `
            <h2 class="tidak">Daftar Siswa Tidak Setoran Murajaah</h2>
            <table>
              <thead>
                <tr>
                  <th>No</th>
                  <th>Nama Siswa</th>
                </tr>
              </thead>
              <tbody>
                ${studentsNoSubmission.map((s, i) => `
                  <tr class="row-tidak">
                    <td>${i + 1}</td>
                    <td class="tidak">${s.name}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          ` : ''}

          ${studentsLessThanTarget.length > 0 ? `
            <h2 class="kurang">Daftar Siswa Kurang Setoran (Kurang dari 3x)</h2>
            <table>
              <thead>
                <tr>
                  <th>No</th>
                  <th>Nama Siswa</th>
                  <th>Jumlah Setoran</th>
                </tr>
              </thead>
              <tbody>
                ${studentsLessThanTarget.map((s, i) => `
                  <tr class="row-kurang">
                    <td>${i + 1}</td>
                    <td class="kurang">${s.name}</td>
                    <td>${s.count}x</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
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
              <div className="grid grid-cols-4 gap-2 text-center">
                <div>
                  <p className="text-xl font-bold text-gold">{filteredRecords.length}</p>
                  <p className="text-xs text-muted-foreground">Total Setoran</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-green-600">{studentsMeetTarget.length}</p>
                  <p className="text-xs text-muted-foreground">Memenuhi Target (≥3x)</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-amber-600">{studentsLessThanTarget.length}</p>
                  <p className="text-xs text-muted-foreground">Kurang dari 3x</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-red-600">{studentsNoSubmission.length}</p>
                  <p className="text-xs text-muted-foreground">Tidak Setoran</p>
                </div>
              </div>
            </div>

            {/* All Students Summary Table */}
            <div className="card-islamic p-4">
              <h3 className="font-semibold text-foreground mb-3">📝 Ringkasan Setoran Per Siswa</h3>
              <div className="space-y-2">
                {allStudentSubmissions.map((student, index) => {
                  const bgClass = student.status === 'target' 
                    ? 'bg-green-50' 
                    : student.status === 'kurang' 
                      ? 'bg-amber-50' 
                      : 'bg-red-50';
                  const textClass = student.status === 'target' 
                    ? 'text-green-700' 
                    : student.status === 'kurang' 
                      ? 'text-amber-700' 
                      : 'text-red-700';
                  const statusText = student.status === 'target' 
                    ? '✓ Memenuhi Target' 
                    : student.status === 'kurang' 
                      ? '⚠ Kurang dari Target' 
                      : '✗ Tidak Ada Setoran';
                  
                  return (
                    <div key={student.id} className={`flex items-center justify-between py-2 px-3 rounded-lg ${bgClass}`}>
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-white text-foreground text-xs flex items-center justify-center font-medium border">
                          {index + 1}
                        </span>
                        <span className="text-sm text-foreground">{student.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-foreground">{student.count}x</span>
                        <span className={`text-xs font-medium ${textClass}`}>{statusText}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Students Without Submission */}
            {studentsNoSubmission.length > 0 && (
              <div className="card-islamic p-4 bg-red-50 border-red-200">
                <h3 className="font-semibold text-red-700 mb-3">✗ Daftar Siswa Tidak Setoran Murajaah</h3>
                <div className="space-y-2">
                  {studentsNoSubmission.map((student, index) => (
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

            {/* Students Less Than Target */}
            {studentsLessThanTarget.length > 0 && (
              <div className="card-islamic p-4 bg-amber-50 border-amber-200">
                <h3 className="font-semibold text-amber-700 mb-3">⚠ Daftar Siswa Kurang Setoran (Kurang dari 3x)</h3>
                <div className="space-y-2">
                  {studentsLessThanTarget.map((student, index) => (
                    <div key={student.id} className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-600 text-xs flex items-center justify-center font-medium">
                          {index + 1}
                        </span>
                        <span className="text-sm text-amber-700">{student.name}</span>
                      </div>
                      <span className="text-sm font-medium text-amber-700">{student.count}x</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default RekapMurajaah;
