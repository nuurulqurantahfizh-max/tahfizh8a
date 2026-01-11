import { Student } from "@/data/students";
import { ChevronRight, User } from "lucide-react";
import { Link } from "react-router-dom";

interface StudentCardProps {
  student: Student;
  index: number;
}

const StudentCard = ({ student, index }: StudentCardProps) => {
  return (
    <Link 
      to={`/student/${student.id}`}
      className="card-islamic p-4 flex items-center gap-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-elevated group animate-slide-up"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Avatar */}
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
        <User className="w-6 h-6 text-primary" />
      </div>

      {/* Name */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
          {student.name}
        </h3>
        <p className="text-xs text-muted-foreground">
          {student.isSpecial ? "Program Khusus" : "Program Reguler"}
        </p>
      </div>

      {/* Arrow */}
      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
    </Link>
  );
};

export default StudentCard;
