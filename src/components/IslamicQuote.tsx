import { islamicQuotes } from "@/data/students";
import { Sparkles } from "lucide-react";

interface IslamicQuoteProps {
  variant?: "compact" | "full";
}

const IslamicQuote = ({ variant = "compact" }: IslamicQuoteProps) => {
  const randomQuote = islamicQuotes[Math.floor(Math.random() * islamicQuotes.length)];

  if (variant === "compact") {
    return (
      <div className="bg-secondary/50 rounded-lg p-4 border border-border/50">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
          <div>
            <p className="font-arabic text-lg text-foreground leading-relaxed">
              {randomQuote.arabic}
            </p>
            <p className="text-sm text-muted-foreground mt-2 italic">
              "{randomQuote.translation}"
            </p>
            <p className="text-xs text-accent mt-1 font-medium">
              — {randomQuote.source}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card-islamic p-6 text-center">
      <Sparkles className="w-8 h-8 text-accent mx-auto mb-4" />
      <p className="font-arabic text-2xl md:text-3xl text-foreground leading-relaxed mb-4">
        {randomQuote.arabic}
      </p>
      <div className="geometric-border w-24 mx-auto mb-4" />
      <p className="text-muted-foreground italic">
        "{randomQuote.translation}"
      </p>
      <p className="text-accent mt-2 font-semibold text-sm">
        — {randomQuote.source}
      </p>
    </div>
  );
};

export default IslamicQuote;
