import { Check } from "lucide-react";

interface ProgressIndicatorProps {
  step: number;
}

export default function ProgressIndicator({ step }: ProgressIndicatorProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 md:gap-4">
        {[1, 2, 3, 4].map((num) => (
          <div key={num} className="flex flex-1 items-center gap-2 md:gap-4">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full font-semibold transition-all ${
                step >= num
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground border-border border-2"
              }`}
            >
              {step > num ? <Check size={20} /> : num}
            </div>
            {num < 4 && (
              <div
                className={`h-1 flex-1 transition-all ${
                  step > num ? "bg-primary" : "bg-border"
                }`}
              />
            )}
          </div>
        ))}
      </div>
      <div className="text-muted-foreground mt-4 flex justify-between text-xs font-medium md:text-sm">
        <span>Photos</span>
        <span>Details</span>
        <span>Pricing</span>
        <span>Review</span>
      </div>
    </div>
  );
}
