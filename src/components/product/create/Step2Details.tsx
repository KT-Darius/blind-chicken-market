import { Input } from "@/components/ui/input";
import { ProductFormData } from "@/types";
import { PRODUCT_CATEGORIES, PRODUCT_STATUS } from "@/lib/constants";

interface Step2DetailsProps {
  formData: Pick<
    ProductFormData,
    "name" | "category" | "productStatus" | "description"
  >;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => void;
}

export default function Step2Details({
  formData,
  onChange,
}: Step2DetailsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-foreground mb-2 text-2xl font-bold">상품 정보</h2>
        <p className="text-muted-foreground">판매하실 상품에 대해 알려주세요</p>
      </div>

      <div className="space-y-4">
        {/* name */}
        <div>
          <label className="text-foreground mb-2 block text-sm font-medium">
            상품명 *
          </label>
          <Input
            name="name"
            placeholder="상품명을 입력해주세요 (예: 삼성 갤럭시 버즈 프로)"
            value={formData.name}
            onChange={onChange}
            className="w-full"
          />
        </div>

        {/* Category & productStatus */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-foreground mb-2 block text-sm font-medium">
              카테고리 *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={onChange}
              className="border-border bg-background text-foreground focus:ring-primary w-full rounded-md border px-3 py-2 focus:ring-2 focus:outline-none"
            >
              {PRODUCT_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-foreground mb-2 block text-sm font-medium">
              상태 *
            </label>
            <select
              name="productStatus"
              value={formData.productStatus}
              onChange={onChange}
              className="border-border bg-background text-foreground focus:ring-primary w-full rounded-md border px-3 py-2 focus:ring-2 focus:outline-none"
            >
              {PRODUCT_STATUS.map((cond) => (
                <option key={cond.value} value={cond.value}>
                  {cond.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="text-foreground mb-2 block text-sm font-medium">
            상세 설명
          </label>
          <textarea
            name="description"
            placeholder="상품의 상태, 특징, 결함 등을 자세히 설명해주세요..."
            value={formData.description}
            onChange={onChange}
            rows={5}
            className="border-border bg-background text-foreground focus:ring-primary w-full rounded-md border px-3 py-2 focus:ring-2 focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}
