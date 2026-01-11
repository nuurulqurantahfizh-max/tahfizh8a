import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { students, regularSurahs, specialSurahs } from "@/data/students";
import Header from "@/components/Header";
import IslamicQuote from "@/components/IslamicQuote";
import MonitoringSection from "@/components/MonitoringSection";
import MurajaahSection from "@/components/MurajaahSection";
import TeacherLoginModal from "@/components/TeacherLoginModal";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, BookOpen, RefreshCcw, Lock, LogOut, User, BookMarked } from "lucide-react";
import { toast } from "sonner";

const StudentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const student = students.find((s) => s.id === id);
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  if (!student) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold text-foreground mb-2">Siswa tidak ditemukan</h1>
          <Link to="/" className="text-primary hover:underline">
            Kembali ke halaman utama
          </Link>
        </div>
      </div>
    );
  }

  const surahs = student.isSpecial ? specialSurahs : regularSurahs;

  const handleLogout = () => {
    setIsLoggedIn(false);
    toast.success("Berhasil logout");
  };

  return (
    <div className="min-h-screen bg-background islamic-pattern">
      <Header />

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Kembali</span>
        </Link>

        {/* Student Info Card */}
        <div className="card-islamic p-6 mb-6 animate-slide-up">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-foreground mb-1">
                {student.name}
              </h1>
              <p className="text-sm text-muted-foreground mb-3">
                {student.isSpecial ? "Program Khusus" : "Program Reguler"}
              </p>
              
              {/* Surah List */}
              <div className="flex items-start gap-2">
                <BookMarked className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Surat Hafalan:</p>
                  <div className="flex flex-wrap gap-1">
                    {surahs.map((surah) => (
                      <span
                        key={surah}
                        className="px-2 py-0.5 bg-secondary text-secondary-foreground rounded-full text-xs"
                      >
                        {surah}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Islamic Quote */}
        <div className="mb-6">
          <IslamicQuote variant="compact" />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="monitoring" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="monitoring" className="gap-2">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Monitoring</span>
              <span className="sm:hidden">Setoran</span>
            </TabsTrigger>
            <TabsTrigger value="murajaah" className="gap-2">
              <RefreshCcw className="w-4 h-4" />
              Murajaah
            </TabsTrigger>
          </TabsList>

          <TabsContent value="monitoring" className="mt-0">
            <div className="card-islamic p-4 sm:p-6">
              {/* Login Status */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {isLoggedIn ? "Mode Guru" : "Khusus Guru Pengampu"}
                  </span>
                </div>
                {isLoggedIn ? (
                  <Button variant="ghost" size="sm" onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-1" />
                    Logout
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowLoginModal(true)}
                  >
                    <Lock className="w-4 h-4 mr-1" />
                    Login
                  </Button>
                )}
              </div>

              <MonitoringSection student={student} isLoggedIn={isLoggedIn} />
            </div>
          </TabsContent>

          <TabsContent value="murajaah" className="mt-0">
            <div className="card-islamic p-4 sm:p-6">
              <MurajaahSection student={student} />
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <footer className="mt-8 pb-6 text-center">
          <div className="geometric-border w-16 mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">
            Madrasah Nuurul Qur'an
          </p>
        </footer>
      </main>

      {/* Login Modal */}
      <TeacherLoginModal
        open={showLoginModal}
        onOpenChange={setShowLoginModal}
        onSuccess={() => setIsLoggedIn(true)}
      />
    </div>
  );
};

export default StudentDetail;
