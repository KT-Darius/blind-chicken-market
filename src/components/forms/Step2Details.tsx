import { Input } from "@/components/ui/input";

interface Step2DetailsProps {
  formData: {
    title: string;
    category: string;
    condition: string;
    description: string;
  };
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => void;
}

const categories = [
  { label: "전자기기", value: "ELECTRONICS" },
  { label: "패션", value: "FASHION" },
  { label: "수집품", value: "GOODS" },
  { label: "도서", value: "BOOKS" },
  { label: "홈/가든", value: "HOME" },
  { label: "스포츠", value: "SPORTS" },
  { label: "기타", value: "ETC" },
];

const conditions = [
  { label: "좋음", value: "GOOD" },
  { label: "보통", value: "AVERAGE" },
  { label: "나쁨", value: "BAD" },
];

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
        {/* Title */}
        <div>
          <label className="text-foreground mb-2 block text-sm font-medium">
            상품명 *
          </label>
          <Input
            name="title"
            placeholder="상품명을 입력해주세요 (예: 삼성 갤럭시 버즈 프로)"
            value={formData.title}
            onChange={onChange}
            className="w-full"
          />
        </div>

        {/* Category & Condition */}
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
              {categories.map((cat) => (
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
              name="condition"
              value={formData.condition}
              onChange={onChange}
              className="border-border bg-background text-foreground focus:ring-primary w-full rounded-md border px-3 py-2 focus:ring-2 focus:outline-none"
            >
              {conditions.map((cond) => (
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
