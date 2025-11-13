import { InputHTMLAttributes } from "react";

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function FormInput({ label, error, ...props }: FormInputProps) {
  return (
    <div>
      <label className="text-foreground mb-2 block text-sm font-medium">
        {label}
      </label>
      <input
        {...props}
        className={`bg-background text-foreground w-full rounded-lg border px-4 py-3 transition-all focus:ring-2 focus:outline-none ${
          error
            ? "border-destructive focus:ring-destructive"
            : "border-border focus:ring-primary"
        }`}
      />
      {error && <p className="text-destructive mt-1 text-xs">{error}</p>}
    </div>
  );
}
