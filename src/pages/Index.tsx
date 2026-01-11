import { students } from "@/data/students";
import Header from "@/components/Header";
import StudentCard from "@/components/StudentCard";
import IslamicQuote from "@/components/IslamicQuote";
import { Users } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background islamic-pattern">
      <Header />

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Islamic Quote */}
        <div className="mb-6 animate-fade-in">
          <IslamicQuote variant="full" />
        </div>

        {/* Student List Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Daftar Peserta Didik</h2>
            <p className="text-sm text-muted-foreground">
              {students.length} santri/santriwati
            </p>
          </div>
        </div>

        {/* Student List */}
        <div className="space-y-3">
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
            Program Tahfizh Al-Qur'an • Kelas 11 A
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Index;
