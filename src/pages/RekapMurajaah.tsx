import { Link } from "react-router-dom";
import { students, MurajaahRecord } from "@/data/students";
import { ArrowLeft, FileText, Download, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

const RekapMurajaah = () => {
  const [allRecords, setAllRecords] = useState<(MurajaahRecord & { studentName: string })[]>([]);

  useEffect(() => {
    const records: (MurajaahRecord & { studentName: string })[] = [];
    students.forEach((student) => {
      const stored = localStorage.getItem(`murajaah_${student.id}`);
      if (stored) {
        const studentRecords: MurajaahRecord[] = JSON.parse(stored);
        studentRecords.forEach((record) => {
          records.push({
            ...record,
            studentName: student.name.toLowerCase().replace(/\b\w/g, c => c.toUpperCase()),
          });
        });
      }
    });
    // Sort by date descending
    records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setAllRecords(records);
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

  const exportToPDF = () => {
    const printContent = `
      <html>
        <head>
          <title>Rekap Murajaah Hafalan - Kelas 11 A</title>
          <style>
            body { font-family: 'Segoe UI', sans-serif; padding: 20px; }
            h1 { color: #d97706; text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
            th { background-color: #d97706; color: white; }
            .lancar { color: #166534; font-weight: bold; }
            .kurang-lancar { color: #d97706; font-weight: bold; }
            .tidak-lancar { color: #dc2626; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>Rekap Murajaah Hafalan</h1>
          <p style="text-align: center;">Madrasah Nuurul Qur'an - Kelas 11 A</p>
          <p style="text-align: center;">Dicetak: ${format(new Date(), "dd MMMM yyyy", { locale: localeId })}</p>
          
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Nama</th>
                <th>Tanggal</th>
                <th>Surat/Ayat</th>
                <th>Kelancaran</th>
              </tr>
            </thead>
            <tbody>
              ${allRecords.map((record, index) => {
                const statusClass = record.status === "Lancar" ? "lancar" : 
                  record.status === "Kurang Lancar" ? "kurang-lancar" : "tidak-lancar";
                return `
                  <tr>
                    <td>${index + 1}</td>
                    <td>${record.studentName}</td>
                    <td>${format(new Date(record.date), "dd/MM/yyyy")}</td>
                    <td>${record.surah}</td>
                    <td class="${statusClass}">${record.status}</td>
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
      <div className="bg-gold text-white py-4 px-4">
        <div className="container mx-auto max-w-2xl">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </Link>
          <h1 className="text-xl font-bold">Rekap Murajaah</h1>
          <p className="text-white/80 text-sm">
            Seluruh data murajaah siswa Kelas 11 A
          </p>
        </div>
      </div>

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Export Button */}
        <button
          onClick={exportToPDF}
          className="w-full mb-6 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 border-gold text-gold hover:bg-gold/5 transition-colors font-medium"
        >
          <Download className="w-5 h-5" />
          Export PDF
        </button>

        {/* Records */}
        {allRecords.length === 0 ? (
          <div className="card-islamic p-8 text-center">
            <RefreshCw className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Belum ada data murajaah</p>
          </div>
        ) : (
          <div className="space-y-3">
            {allRecords.map((record) => (
              <div key={record.id} className="card-islamic p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-foreground">{record.studentName}</h3>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(record.date), "dd MMMM yyyy", { locale: localeId })}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusStyle(record.status)}`}>
                    {record.status}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {record.surah}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default RekapMurajaah;
