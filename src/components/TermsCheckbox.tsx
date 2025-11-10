import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";

interface TermsCheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  error?: string;
}

export function TermsCheckbox({
  checked,
  onCheckedChange,
  error,
}: TermsCheckboxProps) {
  return (
    <div>
      <div className="bg-muted/50 flex items-start gap-3 rounded-lg p-3">
        <Checkbox
          id="terms"
          checked={checked}
          onCheckedChange={onCheckedChange}
        />
        <label
          htmlFor="terms"
          className="text-foreground cursor-pointer text-sm"
        >
          <Link href="#" className="text-primary hover:underline">
            서비스 약관
          </Link>
          과{" "}
          <Link href="#" className="text-primary hover:underline">
            개인정보처리방침
          </Link>
          에 동의합니다
        </label>
      </div>
      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  );
}
