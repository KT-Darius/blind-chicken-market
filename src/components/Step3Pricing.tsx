import { Input } from "@/components/ui/input";

interface Step3PricingProps {
  formData: {
    title: string;
    category: string;
    condition: string;
    description: string;
    startingPrice: string;
    duration: string;
  };
  setFormData: React.Dispatch<
    React.SetStateAction<{
      title: string;
      category: string;
      condition: string;
      description: string;
      startingPrice: string;
      duration: string;
    }>
  >;
}

export default function Step3Pricing({
  formData,
  setFormData,
}: Step3PricingProps) {
  const durations = [
    { label: "3 days", value: "3" },
    { label: "7 days", value: "7" },
    { label: "14 days", value: "14" },
    { label: "30 days", value: "30" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-foreground mb-2 text-2xl font-bold">
          Pricing & Duration
        </h2>
        <p className="text-muted-foreground">
          Set your starting price and auction length
        </p>
      </div>

      <div className="space-y-6">
        {/* Starting Price */}
        <div>
          <label className="text-foreground mb-2 block text-sm font-medium">
            Starting Price *
          </label>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-lg font-semibold">
              $
            </span>
            <Input
              type="number"
              name="startingPrice"
              placeholder="0.00"
              value={formData.startingPrice}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  startingPrice: e.target.value,
                }))
              }
              className="flex-1"
              step="0.01"
              min="0"
            />
          </div>
          <p className="text-muted-foreground mt-2 text-xs">
            Suggested price: Based on similar items, consider starting at
            $50-$200
          </p>
        </div>

        {/* Duration */}
        <div>
          <label className="text-foreground mb-3 block text-sm font-medium">
            Auction Duration
          </label>
          <div className="grid grid-cols-2 gap-3">
            {durations.map((dur) => (
              <button
                key={dur.value}
                onClick={() =>
                  setFormData((prev) => ({ ...prev, duration: dur.value }))
                }
                className={`rounded-lg border-2 p-3 font-medium transition-all ${
                  formData.duration === dur.value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground hover:border-muted-foreground"
                }`}
              >
                {dur.label}
              </button>
            ))}
          </div>
        </div>

        {/* Fee Breakdown */}
        <div className="bg-muted/50 border-border rounded-lg border p-4">
          <h3 className="text-foreground mb-3 font-semibold">
            Fees & Earnings
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Starting Price:</span>
              <span className="text-foreground font-medium">
                ${formData.startingPrice || "0.00"}
              </span>
            </div>
            <div className="border-border mt-2 border-t pt-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Platform Fee (5%):
                </span>
                <span className="text-destructive">
                  -$
                  {(
                    (Number.parseFloat(formData.startingPrice) || 0) * 0.05
                  ).toFixed(2)}
                </span>
              </div>
            </div>
            <div className="border-border mt-2 border-t pt-2">
              <div className="flex justify-between font-semibold">
                <span>Your Earnings:</span>
                <span className="text-foreground">
                  $
                  {(
                    (Number.parseFloat(formData.startingPrice) || 0) * 0.95
                  ).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
