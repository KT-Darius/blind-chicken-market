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

export default function Step2Details({
  formData,
  onChange,
}: Step2DetailsProps) {
  const categories = [
    "Electronics",
    "Fashion",
    "Collectibles",
    "Books",
    "Home & Garden",
    "Sports",
    "Other",
  ];
  const conditions = ["Like New", "Good", "Fair", "Poor"];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-foreground mb-2 text-2xl font-bold">
          Product Details
        </h2>
        <p className="text-muted-foreground">
          Tell us about what you are selling
        </p>
      </div>

      <div className="space-y-4">
        {/* Title */}
        <div>
          <label className="text-foreground mb-2 block text-sm font-medium">
            Product Title *
          </label>
          <Input
            name="title"
            placeholder="Be specific and clear (e.g., Sony WH-1000XM4 Wireless Headphones)"
            value={formData.title}
            onChange={onChange}
            className="w-full"
          />
        </div>

        {/* Category & Condition */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-foreground mb-2 block text-sm font-medium">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={onChange}
              className="border-border bg-background text-foreground focus:ring-primary w-full rounded-md border px-3 py-2 focus:ring-2 focus:outline-none"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat.toLowerCase()}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-foreground mb-2 block text-sm font-medium">
              Condition *
            </label>
            <select
              name="condition"
              value={formData.condition}
              onChange={onChange}
              className="border-border bg-background text-foreground focus:ring-primary w-full rounded-md border px-3 py-2 focus:ring-2 focus:outline-none"
            >
              {conditions.map((cond) => (
                <option key={cond} value={cond.toLowerCase()}>
                  {cond}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="text-foreground mb-2 block text-sm font-medium">
            Description
          </label>
          <textarea
            name="description"
            placeholder="Describe the item condition, features, and any defects..."
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
