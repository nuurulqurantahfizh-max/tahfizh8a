import { useState, useEffect } from "react";
import { Student, HafalanRecord, getGradeStatus } from "@/data/students";
import { surahData, getAyatOptions, formatAyatRange, calculateAyatCount } from "@/data/surahData";
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
import { Plus, Trash2, Edit2, Save, X, FileDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface MonitoringSectionProps {
  student: Student;
  isLoggedIn: boolean;
}

const MonitoringSection = ({ student, isLoggedIn }: MonitoringSectionProps) => {
  const [records, setRecords] = useState<HafalanRecord[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    surah: "",
    ayatStart: "",
    ayatEnd: "",
    score: "",
    notes: "",
    isAbsent: false,
  });

  // Get available ayat options based on selected surah
  const ayatOptions = formData.surah ? getAyatOptions(formData.surah) : [];
  
  // Filter end ayat options to only show ayat >= start ayat
  const ayatEndOptions = formData.ayatStart 
    ? ayatOptions.filter(a => a >= parseInt(formData.ayatStart))
    : ayatOptions;

  // Load records from database
  useEffect(() => {
    const fetchRecords = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('hafalan_records')
          .select('*')
          .eq('student_id', student.id)
          .order('date', { ascending: false });

        if (error) throw error;

        const mappedRecords: HafalanRecord[] = (data || []).map(record => ({
          id: record.id,
          studentId: record.student_id,
          date: record.date,
          surah: record.surah,
          ayat: record.ayat,
          score: record.score,
          notes: record.notes || '',
        }));

        setRecords(mappedRecords);
      } catch (error) {
        console.error('Error fetching records:', error);
        toast.error("Gagal memuat data hafalan");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecords();
  }, [student.id]);

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split("T")[0],
      surah: "",
      ayatStart: "",
      ayatEnd: "",
      score: "",
      notes: "",
      isAbsent: false,
    });
  };

  // Helper to parse ayat range from stored format (e.g., "1-10" or "5")
  const parseAyatRange = (ayatStr: string): { start: string; end: string } => {
    if (!ayatStr) return { start: "", end: "" };
    const trimmed = ayatStr.trim();
    if (trimmed.includes("-")) {
      const parts = trimmed.split("-").map(p => p.trim());
      return { start: parts[0], end: parts[1] };
    }
    return { start: trimmed, end: trimmed };
  };

  const handleAdd = async () => {
    // For absent students, only date is required
    if (formData.isAbsent) {
      if (!formData.date) {
        toast.error("Mohon pilih tanggal");
        return;
      }
    } else {
      if (!formData.surah || !formData.ayatStart || !formData.ayatEnd || !formData.score) {
        toast.error("Mohon lengkapi semua field yang wajib diisi");
        return;
      }

      const score = parseInt(formData.score);
      if (score < 1 || score > 100) {
        toast.error("Nilai harus antara 1-100");
        return;
      }
    }

    const score = formData.isAbsent ? 0 : parseInt(formData.score);
    const ayatRange = formData.isAbsent ? "-" : formatAyatRange(parseInt(formData.ayatStart), parseInt(formData.ayatEnd));
    const surah = formData.isAbsent ? "Tidak Hadir" : formData.surah;
    const notes = formData.isAbsent ? (formData.notes || "Siswa tidak hadir") : formData.notes;

    setIsSaving(true);

    try {
      const { data, error } = await supabase
        .from('hafalan_records')
        .insert({
          student_id: student.id,
          date: formData.date,
          surah: surah,
          ayat: ayatRange,
          score: score,
          notes: notes,
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      const newRecord: HafalanRecord = {
        id: data.id,
        studentId: data.student_id,
        date: data.date,
        surah: data.surah,
        ayat: data.ayat,
        score: data.score,
        notes: data.notes || '',
      };

      setRecords([newRecord, ...records]);
      resetForm();
      setIsAdding(false);
      toast.success(formData.isAbsent ? "Data ketidakhadiran berhasil dicatat" : "Data hafalan berhasil ditambahkan");
    } catch (error) {
      console.error('Error adding record:', error);
      toast.error("Gagal menyimpan data");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (record: HafalanRecord) => {
    setEditingId(record.id);
    const { start, end } = parseAyatRange(record.ayat);
    setFormData({
      date: record.date,
      surah: record.surah,
      ayatStart: start,
      ayatEnd: end,
      score: record.score.toString(),
      notes: record.notes,
      isAbsent: record.score === 0,
    });
  };

  const handleUpdate = async () => {
    if (!editingId) return;

    // For absent students
    if (formData.isAbsent) {
      if (!formData.date) {
        toast.error("Mohon pilih tanggal");
        return;
      }
    } else {
      const score = parseInt(formData.score);
      if (score < 1 || score > 100) {
        toast.error("Nilai harus antara 1-100");
        return;
      }
    }

    const score = formData.isAbsent ? 0 : parseInt(formData.score);
    const ayatRange = formData.isAbsent ? "-" : formatAyatRange(parseInt(formData.ayatStart), parseInt(formData.ayatEnd));
    const surah = formData.isAbsent ? "Tidak Hadir" : formData.surah;
    const notes = formData.isAbsent ? (formData.notes || "Siswa tidak hadir") : formData.notes;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('hafalan_records')
        .update({
          date: formData.date,
          surah: surah,
          ayat: ayatRange,
          score: score,
          notes: notes,
        })
        .eq('id', editingId);

      if (error) throw error;

      const updated = records.map((r) =>
        r.id === editingId
          ? {
              ...r,
              date: formData.date,
              surah: surah,
              ayat: ayatRange,
              score: score,
              notes: notes,
            }
          : r
      );

      setRecords(updated);
      setEditingId(null);
      resetForm();
      toast.success("Data berhasil diperbarui");
    } catch (error) {
      console.error('Error updating record:', error);
      toast.error("Gagal memperbarui data");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('hafalan_records')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setRecords(records.filter((r) => r.id !== id));
      toast.success("Data hafalan berhasil dihapus");
    } catch (error) {
      console.error('Error deleting record:', error);
      toast.error("Gagal menghapus data hafalan");
    }
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
            .tidak-hadir { background: #e5e7eb; color: #374151; }
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
                const statusClass = r.score === 0 ? 'tidak-hadir' : r.score >= 90 ? 'sangat-lancar' : r.score >= 80 ? 'lancar' : r.score >= 70 ? 'kurang-lancar' : 'tidak-lancar';
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Memuat data...</span>
      </div>
    );
  }

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
          {/* Absent Checkbox */}
          <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg border">
            <input
              type="checkbox"
              id="isAbsent"
              checked={formData.isAbsent}
              onChange={(e) => setFormData({ 
                ...formData, 
                isAbsent: e.target.checked,
                score: e.target.checked ? "0" : "",
                surah: e.target.checked ? "" : formData.surah,
                ayatStart: e.target.checked ? "" : formData.ayatStart,
                ayatEnd: e.target.checked ? "" : formData.ayatEnd,
              })}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="isAbsent" className="text-sm font-medium cursor-pointer">
              Siswa Tidak Hadir (Nilai otomatis 0)
            </Label>
          </div>

          {/* Form fields - hide when absent */}
          {!formData.isAbsent && (
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
                  onValueChange={(value) => setFormData({ ...formData, surah: value, ayatStart: "", ayatEnd: "" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih surat" />
                  </SelectTrigger>
                  <SelectContent>
                    {surahData.map((surah) => (
                      <SelectItem key={surah.name} value={surah.name}>
                        {surah.name} ({surah.totalAyat} ayat)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ayatStart">Ayat Mulai</Label>
                <Select
                  value={formData.ayatStart}
                  onValueChange={(value) => {
                    const newEnd = formData.ayatEnd && parseInt(formData.ayatEnd) < parseInt(value) 
                      ? value 
                      : formData.ayatEnd;
                    setFormData({ ...formData, ayatStart: value, ayatEnd: newEnd });
                  }}
                  disabled={!formData.surah}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih ayat mulai" />
                  </SelectTrigger>
                  <SelectContent>
                    {ayatOptions.map((ayat) => (
                      <SelectItem key={ayat} value={ayat.toString()}>
                        Ayat {ayat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ayatEnd">Ayat Selesai</Label>
                <Select
                  value={formData.ayatEnd}
                  onValueChange={(value) => setFormData({ ...formData, ayatEnd: value })}
                  disabled={!formData.ayatStart}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih ayat selesai" />
                  </SelectTrigger>
                  <SelectContent>
                    {ayatEndOptions.map((ayat) => (
                      <SelectItem key={ayat} value={ayat.toString()}>
                        Ayat {ayat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
          )}

          {/* Date only for absent */}
          {formData.isAbsent && (
            <div className="space-y-2">
              <Label htmlFor="date">Tanggal Tidak Hadir</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
          )}
          {/* Show ayat count */}
          {!formData.isAbsent && formData.ayatStart && formData.ayatEnd && (
            <div className="text-sm text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg">
              Jumlah ayat yang disetorkan: <span className="font-semibold text-primary">{calculateAyatCount(formatAyatRange(parseInt(formData.ayatStart), parseInt(formData.ayatEnd)))}</span> ayat
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="notes">{formData.isAbsent ? "Keterangan (opsional)" : "Catatan Guru"}</Label>
            <Textarea
              id="notes"
              placeholder={formData.isAbsent ? "Keterangan tidak hadir (opsional)..." : "Catatan tambahan..."}
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
              disabled={isSaving}
            >
              <X className="w-4 h-4 mr-1" />
              Batal
            </Button>
            <Button
              onClick={editingId ? handleUpdate : handleAdd}
              className="btn-primary-islamic"
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-1" />
              )}
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