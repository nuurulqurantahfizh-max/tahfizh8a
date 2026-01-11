import { Student, regularSurahs, specialSurahs } from "@/data/students";
import { BookOpen, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";

interface StudentCardProps {
  student: Student;
  index: number;
}

const StudentCard = ({ student, index }: StudentCardProps) => {
  const surahs = student.isSpecial ? specialSurahs : regularSurahs;
  
  // Get initials
  const getInitials = (name: string) => {
    const words = name.split(" ");
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div 
      className="card-islamic p-4 animate-slide-up"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Header with avatar and name */}
      <div className="flex items-center gap-3 mb-4">
        {/* Avatar with initials */}
        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center flex-shrink-0 text-primary-foreground font-bold text-sm">
          {getInitials(student.name)}
        </div>

        {/* Name and surah count */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate capitalize">
            {student.name.toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}
          </h3>
          <p className="text-xs text-primary">
            {surahs.length} Surat
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          to={`/student/${student.id}/monitoring`}
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 border-primary/20 bg-white hover:bg-primary/5 transition-colors text-primary font-medium text-sm"
        >
          <BookOpen className="w-4 h-4" />
          Monitoring
        </Link>
        <Link
          to={`/student/${student.id}/murajaah`}
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 border-gold/30 bg-white hover:bg-gold/5 transition-colors text-gold font-medium text-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Murajaah
        </Link>
      </div>
    </div>
  );
};

export default StudentCard;
