import { useState, useEffect } from "react";
import { Student, MurajaahRecord } from "@/data/students";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, FileDown, BookOpen, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface MurajaahSectionProps {
  student: Student;
  isLoggedIn?: boolean;
  requireLogin?: boolean;
  title?: string;
  infoMessage?: string;
}

const MurajaahSection = ({ 
  student, 
  isLoggedIn = true, 
  requireLogin = false,
  title = "Riwayat Murajaah",
  infoMessage = "Silakan catat hasil murajaah hafalan ananda di rumah. Murajaah adalah mengulang hafalan yang sudah dihafal agar tetap terjaga."
}: MurajaahSectionProps) => {
  const [records, setRecords] = useState<MurajaahRecord[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    surah: "",
    status: "" as "Lancar" | "Kurang Lancar" | "Tidak Lancar" | "",
  });

  // Load records from database
  useEffect(() => {
    const fetchRecords = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('murajaah_records')
          .select('*')
          .eq('student_id', student.id)
          .order('date', { ascending: false });

        if (error) throw error;

        const mappedRecords: MurajaahRecord[] = (data || []).map(record => ({
          id: record.id,
          studentId: record.student_id,
          date: record.date,
          surah: record.surah,
          status: record.status as "Lancar" | "Kurang Lancar" | "Tidak Lancar",
        }));

        setRecords(mappedRecords);
      } catch (error) {
        console.error('Error fetching records:', error);
        toast.error("Gagal memuat data murajaah");
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
      status: "",
    });
  };

  const handleAdd = async () => {
    if (!formData.surah || !formData.status) {
      toast.error("Mohon lengkapi semua field");
      return;
    }

    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from('murajaah_records')
        .insert({
          student_id: student.id,
          date: formData.date,
          surah: formData.surah,
          status: formData.status,
        })
        .select()
        .single();

      if (error) throw error;

      const newRecord: MurajaahRecord = {
        id: data.id,
        studentId: data.student_id,
        date: data.date,
        surah: data.surah,
        status: data.status as "Lancar" | "Kurang Lancar" | "Tidak Lancar",
      };

      setRecords([newRecord, ...records]);
      resetForm();
      setIsAdding(false);
      toast.success("Murajaah berhasil dicatat. Jazakallahu khairan!");
    } catch (error) {
      console.error('Error adding record:', error);
      toast.error("Gagal menyimpan data murajaah");
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Lancar":
        return "status-sangat-lancar";
      case "Kurang Lancar":
        return "status-kurang-lancar";
      case "Tidak Lancar":
        return "status-tidak-lancar";
      default:
        return "";
    }
  };

  const exportToPDF = () => {
    const content = `
      <html>
        <head>
          <title>Laporan Murajaah - ${student.name}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #059669; text-align: center; }
            h2 { color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            th { background-color: #059669; color: white; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .status { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
            .lancar { background: #d1fae5; color: #065f46; }
            .kurang-lancar { background: #fef3c7; color: #92400e; }
            .tidak-lancar { background: #fee2e2; color: #991b1b; }
          </style>
        </head>
        <body>
          <h1>Madrasah Nuurul Qur'an</h1>
          <h2>Laporan Murajaah Hafalan</h2>
          <p><strong>Nama:</strong> ${student.name}</p>
          <p><strong>Tanggal Cetak:</strong> ${new Date().toLocaleDateString("id-ID")}</p>
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Tanggal</th>
                <th>Surat</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${records.map((r, i) => {
                const statusClass = r.status === 'Lancar' ? 'lancar' : r.status === 'Kurang Lancar' ? 'kurang-lancar' : 'tidak-lancar';
                return `
                  <tr>
                    <td>${i + 1}</td>
                    <td>${new Date(r.date).toLocaleDateString("id-ID")}</td>
                    <td>${r.surah}</td>
                    <td><span class="status ${statusClass}">${r.status}</span></td>
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

  const canAdd = requireLogin ? isLoggedIn : true;

  return (
    <div className="space-y-4">
      {/* Info message */}
      {infoMessage && (
        <div className="bg-secondary/50 rounded-lg p-4 border border-border/50">
          <div className="flex items-start gap-3">
            <BookOpen className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-foreground font-medium">
                {requireLogin ? "Info Guru" : "Assalamu'alaikum Bapak/Ibu"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {infoMessage}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header with actions */}
      <div className="flex flex-wrap gap-2 justify-between items-center">
        <h3 className="font-semibold text-foreground">{title}</h3>
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
          {!isAdding && canAdd && (
            <Button
              size="sm"
              onClick={() => setIsAdding(true)}
              className="btn-primary-islamic"
            >
              <Plus className="w-4 h-4 mr-1" />
              Catat Murajaah
            </Button>
          )}
        </div>
      </div>

      {/* Add Form */}
      {isAdding && (
        <div className="card-islamic p-4 space-y-4 animate-slide-up">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="murajaah-date">Tanggal</Label>
              <Input
                id="murajaah-date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="murajaah-surah">Surat yang Dimurajaah</Label>
              <Input
                id="murajaah-surah"
                placeholder="Contoh: Al-Mursalat"
                value={formData.surah}
                onChange={(e) => setFormData({ ...formData, surah: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="murajaah-status">Kelancaran</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as typeof formData.status })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Lancar">Lancar</SelectItem>
                  <SelectItem value="Kurang Lancar">Kurang Lancar</SelectItem>
                  <SelectItem value="Tidak Lancar">Tidak Lancar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setIsAdding(false);
                resetForm();
              }}
              disabled={isSaving}
            >
              Batal
            </Button>
            <Button
              onClick={handleAdd}
              className="btn-primary-islamic"
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : null}
              Simpan
            </Button>
          </div>
        </div>
      )}

      {/* Records List */}
      {records.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>Belum ada data murajaah</p>
        </div>
      ) : (
        <div className="space-y-3">
          {records
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map((record) => (
              <div
                key={record.id}
                className="card-islamic p-4 animate-fade-in"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="font-semibold text-foreground">
                      {record.surah}
                    </span>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(record.date).toLocaleDateString("id-ID", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusStyle(record.status)}`}>
                    {record.status}
                  </span>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default MurajaahSection;