import { useParams, Link } from "react-router-dom";
import { students } from "@/data/students";
import IslamicQuote from "@/components/IslamicQuote";
import MurajaahSection from "@/components/MurajaahSection";
import { ArrowLeft } from "lucide-react";

const StudentMurajaah = () => {
  const { id } = useParams<{ id: string }>();
  const student = students.find((s) => s.id === id);

  if (!student) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <p className="text-muted-foreground mb-4">Siswa tidak ditemukan</p>
        <Link to="/" className="text-primary hover:underline">
          Kembali ke beranda
        </Link>
      </div>
    );
  }

  const formatName = (name: string) => {
    return name.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
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
          <h1 className="text-xl font-bold">{formatName(student.name)}</h1>
          <p className="text-white/80 text-sm">
            Murajaah Hafalan Al-Qur'an
          </p>
        </div>
      </div>

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Islamic Quote */}
        <div className="mb-6">
          <IslamicQuote variant="full" />
        </div>

        {/* Murajaah Section */}
        <MurajaahSection student={student} />
      </main>
    </div>
  );
};

export default StudentMurajaah;
