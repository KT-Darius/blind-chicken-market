import { Check } from "lucide-react";

interface ProgressIndicatorProps {
  step: number;
}

export default function ProgressIndicator({ step }: ProgressIndicatorProps) {
  const steps = [
    { num: 1, label: "사진" },
    { num: 2, label: "정보" },
    { num: 3, label: "가격" },
    { num: 4, label: "확인" },
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center">
        {steps.map(({ num, label }, index) => (
          <div
            key={num}
            className={`flex items-center ${index === steps.length - 1 ? "" : "flex-1"}`}
          >
            {/* 단계 번호와 라벨 */}
            <div className="flex flex-col items-center">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-semibold transition-all ${
                  step >= num
                    ? "bg-primary text-primary-foreground"
                    : "border-border bg-muted text-muted-foreground border-2"
                }`}
              >
                {step > num ? <Check size={20} /> : num}
              </div>
              <span className="text-muted-foreground mt-3 text-xs font-medium whitespace-nowrap md:text-sm">
                {label}
              </span>
            </div>

            {/* 연결선 */}
            {index < steps.length - 1 && (
              <div
                className={`mx-2 h-1 flex-1 transition-all md:mx-4 ${
                  step > num ? "bg-primary" : "bg-border"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
