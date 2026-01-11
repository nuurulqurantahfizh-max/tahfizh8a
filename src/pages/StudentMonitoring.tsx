import { useParams, Link } from "react-router-dom";
import { students, regularSurahs, specialSurahs } from "@/data/students";
import Header from "@/components/Header";
import IslamicQuote from "@/components/IslamicQuote";
import MonitoringSection from "@/components/MonitoringSection";
import TeacherLoginModal from "@/components/TeacherLoginModal";
import { ArrowLeft, BookOpen } from "lucide-react";
import { useState } from "react";

const StudentMonitoring = () => {
  const { id } = useParams<{ id: string }>();
  const student = students.find((s) => s.id === id);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

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

  const surahs = student.isSpecial ? specialSurahs : regularSurahs;

  const formatName = (name: string) => {
    return name.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
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
          <h1 className="text-xl font-bold">{formatName(student.name)}</h1>
          <p className="text-primary-foreground/80 text-sm">
            Monitoring Hafalan Al-Qur'an
          </p>
        </div>
      </div>

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Islamic Quote */}
        <div className="mb-6">
          <IslamicQuote variant="full" />
        </div>

        {/* Surat yang Dihafal */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-foreground">Surat yang Dihafal</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {surahs.map((surah) => (
              <span
                key={surah}
                className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium border border-primary/20"
              >
                {surah}
              </span>
            ))}
          </div>
        </div>

        {/* Monitoring Section */}
        <MonitoringSection
          student={student}
          isLoggedIn={isLoggedIn}
        />

        {/* Login/Logout Button */}
        <div className="mt-6">
          {isLoggedIn ? (
            <button
              onClick={() => setIsLoggedIn(false)}
              className="w-full py-3 px-4 rounded-lg border-2 border-destructive/30 text-destructive hover:bg-destructive/5 transition-colors font-medium text-sm"
            >
              Logout Guru
            </button>
          ) : (
            <button
              onClick={() => setShowLoginModal(true)}
              className="w-full py-3 px-4 rounded-lg border-2 border-primary/30 text-primary hover:bg-primary/5 transition-colors font-medium text-sm"
            >
              Login sebagai Guru
            </button>
          )}
        </div>
      </main>

      {/* Login Modal */}
      <TeacherLoginModal
        open={showLoginModal}
        onOpenChange={setShowLoginModal}
        onSuccess={() => {
          setIsLoggedIn(true);
          setShowLoginModal(false);
        }}
      />
    </div>
  );
};

export default StudentMonitoring;
