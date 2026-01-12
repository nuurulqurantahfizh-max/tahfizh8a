import { students } from "@/data/students";
import Header from "@/components/Header";
import StudentCard from "@/components/StudentCard";
import IslamicQuote from "@/components/IslamicQuote";
import { BookOpen, RefreshCw, FileText, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-background islamic-pattern">
      <Header />

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Islamic Quote */}
        <div className="mb-6 animate-fade-in">
          <IslamicQuote variant="full" />
        </div>

        {/* Dashboard Button */}
        <Link
          to="/dashboard"
          className="flex items-center justify-center gap-2 py-4 px-4 rounded-xl bg-gradient-to-r from-primary to-gold text-white hover:opacity-90 transition-opacity font-semibold text-sm shadow-lg mb-4"
        >
          <BarChart3 className="w-5 h-5" />
          <span>Dashboard Statistik</span>
        </Link>

        {/* Rekap Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Link
            to="/rekap/monitoring"
            className="flex items-center justify-center gap-2 py-4 px-4 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-semibold text-sm shadow-lg"
          >
            <FileText className="w-5 h-5" />
            <span>Rekap Monitoring</span>
          </Link>
          <Link
            to="/rekap/murajaah"
            className="flex items-center justify-center gap-2 py-4 px-4 rounded-xl bg-gold text-white hover:bg-gold/90 transition-colors font-semibold text-sm shadow-lg"
          >
            <FileText className="w-5 h-5" />
            <span>Rekap Murajaah</span>
          </Link>
        </div>

        {/* Student List Header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-6 bg-primary rounded-full" />
          <h2 className="text-lg font-bold text-foreground">Daftar Peserta Didik</h2>
        </div>

        {/* Student List */}
        <div className="space-y-4">
          {students.map((student, index) => (
            <StudentCard key={student.id} student={student} index={index} />
          ))}
        </div>

        {/* Footer */}
        <footer className="mt-8 pb-6 text-center">
          <div className="geometric-border w-16 mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">
            Madrasah Nuurul Qur'an
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Program Tahfizh Al-Qur'an • Kelas 8A
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Index;
