import { BookOpen } from "lucide-react";

const Header = () => {
  return (
    <header className="header-islamic text-primary-foreground py-6 px-4 relative overflow-hidden">
      {/* Decorative pattern overlay */}
      <div className="absolute inset-0 islamic-pattern opacity-10" />
      
      <div className="container mx-auto relative z-10">
        <div className="flex flex-col items-center text-center gap-3">
          {/* Logo/Icon */}
          <div className="w-16 h-16 rounded-full bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center animate-float">
            <BookOpen className="w-8 h-8" />
          </div>
          
          {/* School Name */}
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-wide">
              Madrasah Nuurul Qur'an
            </h1>
            <p className="text-primary-foreground/80 text-sm mt-1">
              Program Tahfizh Al-Qur'an • Kelas 8A
            </p>
          </div>

          {/* Decorative line */}
          <div className="geometric-border w-32 mt-2 opacity-60" />
        </div>
      </div>
    </header>
  );
};

export default Header;
