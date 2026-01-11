import { useState, useEffect } from "react";
import { Student, HafalanRecord, getGradeStatus, regularSurahs, specialSurahs } from "@/data/students";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Edit2, Save, X, FileDown } from "lucide-react";
import { toast } from "sonner";

interface MonitoringSectionProps {
  student: Student;
  isLoggedIn: boolean;
}

const MonitoringSection = ({ student, isLoggedIn }: MonitoringSectionProps) => {
  const [records, setRecords] = useState<HafalanRecord[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    surah: "",
    ayat: "",
    score: "",
    notes: "",
  });

  const surahs = student.isSpecial ? specialSurahs : regularSurahs;

  // Load records from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(`hafalan_${student.id}`);
    if (stored) {
      setRecords(JSON.parse(stored));
    }
  }, [student.id]);

  // Save records to localStorage
  const saveRecords = (newRecords: HafalanRecord[]) => {
    localStorage.setItem(`hafalan_${student.id}`, JSON.stringify(newRecords));
    setRecords(newRecords);
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split("T")[0],
      surah: "",
      ayat: "",
      score: "",
      notes: "",
    });
  };

  const handleAdd = () => {
    if (!formData.surah || !formData.ayat || !formData.score) {
      toast.error("Mohon lengkapi semua field yang wajib diisi");
      return;
    }

    const score = parseInt(formData.score);
    if (score < 1 || score > 100) {
      toast.error("Nilai harus antara 1-100");
      return;
    }

    const newRecord: HafalanRecord = {
      id: Date.now().toString(),
      studentId: student.id,
      date: formData.date,
      surah: formData.surah,
      ayat: formData.ayat,
      score: score,
      notes: formData.notes,
    };

    saveRecords([...records, newRecord]);
    resetForm();
    setIsAdding(false);
    toast.success("Data hafalan berhasil ditambahkan");
  };

  const handleEdit = (record: HafalanRecord) => {
    setEditingId(record.id);
    setFormData({
      date: record.date,
      surah: record.surah,
      ayat: record.ayat,
      score: record.score.toString(),
      notes: record.notes,
    });
  };

  const handleUpdate = () => {
    if (!editingId) return;

    const score = parseInt(formData.score);
    if (score < 1 || score > 100) {
      toast.error("Nilai harus antara 1-100");
      return;
    }

    const updated = records.map((r) =>
      r.id === editingId
        ? {
            ...r,
            date: formData.date,
            surah: formData.surah,
            ayat: formData.ayat,
            score: score,
            notes: formData.notes,
          }
        : r
    );

    saveRecords(updated);
    setEditingId(null);
    resetForm();
    toast.success("Data hafalan berhasil diperbarui");
  };

  const handleDelete = (id: string) => {
    const updated = records.filter((r) => r.id !== id);
    saveRecords(updated);
    toast.success("Data hafalan berhasil dihapus");
  };

  const exportToPDF = () => {
    // Create printable content
    const content = `
      <html>
        <head>
          <title>Laporan Hafalan - ${student.name}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #059669; text-align: center; }
            h2 { color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            th { background-color: #059669; color: white; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .status { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
            .sangat-lancar { background: #d1fae5; color: #065f46; }
            .lancar { background: #dbeafe; color: #1e40af; }
            .kurang-lancar { background: #fef3c7; color: #92400e; }
            .tidak-lancar { background: #fee2e2; color: #991b1b; }
          </style>
        </head>
        <body>
          <h1>Madrasah Nuurul Qur'an</h1>
          <h2>Laporan Monitoring Hafalan</h2>
          <p><strong>Nama:</strong> ${student.name}</p>
          <p><strong>Program:</strong> ${student.isSpecial ? "Khusus" : "Reguler"}</p>
          <p><strong>Tanggal Cetak:</strong> ${new Date().toLocaleDateString("id-ID")}</p>
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Tanggal</th>
                <th>Surat</th>
                <th>Ayat</th>
                <th>Nilai</th>
                <th>Status</th>
                <th>Catatan</th>
              </tr>
            </thead>
            <tbody>
              ${records.map((r, i) => {
                const status = getGradeStatus(r.score);
                const statusClass = r.score >= 90 ? 'sangat-lancar' : r.score >= 80 ? 'lancar' : r.score >= 70 ? 'kurang-lancar' : 'tidak-lancar';
                return `
                  <tr>
                    <td>${i + 1}</td>
                    <td>${new Date(r.date).toLocaleDateString("id-ID")}</td>
                    <td>${r.surah}</td>
                    <td>${r.ayat}</td>
                    <td>${r.score}</td>
                    <td><span class="status ${statusClass}">${status.label}</span></td>
                    <td>${r.notes || "-"}</td>
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
      printWindow.document.write(content);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with actions */}
      <div className="flex flex-wrap gap-2 justify-between items-center">
        <h3 className="font-semibold text-foreground">Riwayat Setoran</h3>
        {isLoggedIn && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={exportToPDF}
              disabled={records.length === 0}
            >
              <FileDown className="w-4 h-4 mr-1" />
              Export PDF
            </Button>
            {!isAdding && !editingId && (
              <Button
                size="sm"
                onClick={() => setIsAdding(true)}
                className="btn-primary-islamic"
              >
                <Plus className="w-4 h-4 mr-1" />
                Tambah
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Form */}
      {isLoggedIn && (isAdding || editingId) && (
        <div className="card-islamic p-4 space-y-4 animate-slide-up">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Tanggal</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="surah">Surat</Label>
              <Select
                value={formData.surah}
                onValueChange={(value) => setFormData({ ...formData, surah: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih surat" />
                </SelectTrigger>
                <SelectContent>
                  {surahs.map((surah) => (
                    <SelectItem key={surah} value={surah}>
                      {surah}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ayat">Ayat yang Dihafal</Label>
              <Input
                id="ayat"
                placeholder="Contoh: 1-10"
                value={formData.ayat}
                onChange={(e) => setFormData({ ...formData, ayat: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="score">Nilai (1-100)</Label>
              <Input
                id="score"
                type="number"
                min="1"
                max="100"
                value={formData.score}
                onChange={(e) => setFormData({ ...formData, score: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Catatan Guru</Label>
            <Textarea
              id="notes"
              placeholder="Catatan tambahan..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setIsAdding(false);
                setEditingId(null);
                resetForm();
              }}
            >
              <X className="w-4 h-4 mr-1" />
              Batal
            </Button>
            <Button
              onClick={editingId ? handleUpdate : handleAdd}
              className="btn-primary-islamic"
            >
              <Save className="w-4 h-4 mr-1" />
              {editingId ? "Perbarui" : "Simpan"}
            </Button>
          </div>
        </div>
      )}

      {/* Records List */}
      {records.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>Belum ada data setoran hafalan</p>
        </div>
      ) : (
        <div className="space-y-3">
          {records
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map((record) => {
              const status = getGradeStatus(record.score);
              return (
                <div
                  key={record.id}
                  className="card-islamic p-4 animate-fade-in"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="font-semibold text-foreground">
                          {record.surah}
                        </span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">
                          Ayat {record.ayat}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <span className="text-muted-foreground">
                          {new Date(record.date).toLocaleDateString("id-ID", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${status.class}`}>
                          {record.score} - {status.label}
                        </span>
                      </div>
                      {record.notes && (
                        <p className="text-sm text-muted-foreground mt-2 italic">
                          "{record.notes}"
                        </p>
                      )}
                    </div>
                    {isLoggedIn && (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(record)}
                          className="h-8 w-8"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(record.id)}
                          className="h-8 w-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
};

export default MonitoringSection;
