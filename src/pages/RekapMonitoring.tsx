import { Link } from "react-router-dom";
import { students, getGradeStatus, HafalanRecord } from "@/data/students";
import { ArrowLeft, FileText, Download, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const RekapMonitoring = () => {
  const [allRecords, setAllRecords] = useState<(HafalanRecord & { studentName: string })[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllRecords = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('hafalan_records')
          .select('*')
          .order('date', { ascending: false });

        if (error) throw error;

        const records: (HafalanRecord & { studentName: string })[] = (data || []).map(record => {
          const student = students.find(s => s.id === record.student_id);
          return {
            id: record.id,
            studentId: record.student_id,
            date: record.date,
            surah: record.surah,
            ayat: record.ayat,
            score: record.score,
            notes: record.notes || '',
            studentName: student?.name.toLowerCase().replace(/\b\w/g, c => c.toUpperCase()) || 'Unknown',
          };
        });

        setAllRecords(records);
      } catch (error) {
        console.error('Error fetching records:', error);
        toast.error("Gagal memuat data monitoring");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllRecords();
  }, []);

  const exportToPDF = () => {
    const printContent = `
      <html>
        <head>
          <title>Rekap Monitoring Hafalan - Kelas 8A</title>
          <style>
            body { font-family: 'Segoe UI', sans-serif; padding: 20px; }
            h1 { color: #166534; text-align: center; }
            h2 { color: #166534; margin-top: 30px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
            th { background-color: #166534; color: white; }
            .status-sangat-lancar { color: #166534; font-weight: bold; }
            .status-lancar { color: #2563eb; font-weight: bold; }
            .status-kurang-lancar { color: #d97706; font-weight: bold; }
            .status-tidak-lancar { color: #dc2626; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>Rekap Monitoring Hafalan</h1>
          <p style="text-align: center;">Madrasah Nuurul Qur'an - Kelas 8A</p>
          <p style="text-align: center;">Dicetak: ${format(new Date(), "dd MMMM yyyy", { locale: localeId })}</p>
          
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Nama</th>
                <th>Tanggal</th>
                <th>Surat</th>
                <th>Ayat</th>
                <th>Nilai</th>
                <th>Status</th>
                <th>Catatan</th>
              </tr>
            </thead>
            <tbody>
              ${allRecords.map((record, index) => {
                const status = getGradeStatus(record.score);
                return `
                  <tr>
                    <td>${index + 1}</td>
                    <td>${record.studentName}</td>
                    <td>${format(new Date(record.date), "dd/MM/yyyy")}</td>
                    <td>${record.surah}</td>
                    <td>${record.ayat}</td>
                    <td>${record.score}</td>
                    <td class="${status.class}">${status.label}</td>
                    <td>${record.notes || "-"}</td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>
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
      <div className="bg-primary text-primary-foreground py-4 px-4">
        <div className="container mx-auto max-w-2xl">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground text-sm mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </Link>
          <h1 className="text-xl font-bold">Rekap Monitoring</h1>
          <p className="text-primary-foreground/80 text-sm">
            Seluruh data hafalan siswa Kelas 8A
          </p>
        </div>
      </div>

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Export Button */}
        <button
          onClick={exportToPDF}
          disabled={allRecords.length === 0 || isLoading}
          className="w-full mb-6 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 border-primary text-primary hover:bg-primary/5 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-5 h-5" />
          Export PDF
        </button>

        {/* Records */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Memuat data...</span>
          </div>
        ) : allRecords.length === 0 ? (
          <div className="card-islamic p-8 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Belum ada data monitoring</p>
          </div>
        ) : (
          <div className="space-y-3">
            {allRecords.map((record) => {
              const status = getGradeStatus(record.score);
              return (
                <div key={record.id} className="card-islamic p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-foreground">{record.studentName}</h3>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(record.date), "dd MMMM yyyy", { locale: localeId })}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-primary">{record.score}</span>
                      <p className={`text-xs font-medium ${status.class}`}>{status.label}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="px-2 py-0.5 bg-primary/10 rounded text-primary text-xs">
                      {record.surah}
                    </span>
                    <span>Ayat {record.ayat}</span>
                  </div>
                  {record.notes && (
                    <p className="mt-2 text-sm text-muted-foreground italic">
                      "{record.notes}"
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default RekapMonitoring;