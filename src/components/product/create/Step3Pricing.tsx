import { Input } from "@/components/ui/input";
import { ProductFormData } from "@/types";

interface Step3PricingProps {
  formData: ProductFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>;
}

export default function Step3Pricing({
  formData,
  setFormData,
}: Step3PricingProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-foreground mb-2 text-2xl font-bold">가격 설정</h2>
        <p className="text-muted-foreground">
          시작 가격과 경매 기간을 설정해주세요
        </p>
      </div>

      <div className="space-y-6">
        {/* Starting Price */}
        <div>
          <label className="text-foreground mb-2 block text-sm font-medium">
            시작 가격 *
          </label>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-lg font-semibold">
              ₩
            </span>
            <Input
              type="number"
              name="startPrice"
              placeholder="0"
              value={formData.startPrice}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  startPrice: e.target.value,
                }))
              }
              className="flex-1"
              step="1000"
              min="0"
            />
          </div>
        </div>

        {/* Auction end date */}
        <div>
          <label className="text-foreground mb-2 block text-sm font-medium">
            경매 종료 날짜 *
          </label>
          <Input
            type="date"
            name="bidEndDate"
            value={formData.bidEndDate || ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, bidEndDate: e.target.value }))
            }
            className="max-w-xs"
          />
        </div>
      </div>
    </div>
  );
}
