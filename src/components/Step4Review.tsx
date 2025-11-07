interface Step4ReviewProps {
  formData: {
    title: string;
    category: string;
    condition: string;
    description: string;
    startingPrice: string;
    duration: string;
  };
  uploadedImages: string[];
}

export default function Step4Review({
  formData,
  uploadedImages,
}: Step4ReviewProps) {
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
          Review Your Listing
        </h2>
        <p className="text-muted-foreground">
          Please review everything before publishing
        </p>
      </div>

      <div className="space-y-6">
        {uploadedImages.length > 0 && (
          <div>
            <h3 className="text-foreground mb-3 font-semibold">Photos</h3>
            <div className="grid grid-cols-3 gap-3">
              {uploadedImages.map((img, idx) => (
                <img
                  key={idx}
                  src={img || "/placeholder.svg"}
                  alt={`Preview ${idx + 1}`}
                  className="border-border h-32 w-full rounded-lg border object-cover"
                />
              ))}
            </div>
          </div>
        )}

        <div className="border-border space-y-4 border-t pt-6">
          <div>
            <p className="text-muted-foreground text-xs">Product Title</p>
            <p className="text-foreground font-semibold">
              {formData.title || "Not provided"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-muted-foreground text-xs">Category</p>
              <p className="text-foreground font-semibold capitalize">
                {formData.category}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Condition</p>
              <p className="text-foreground font-semibold capitalize">
                {formData.condition}
              </p>
            </div>
          </div>

          {formData.description && (
            <div>
              <p className="text-muted-foreground text-xs">Description</p>
              <p className="text-foreground text-sm">{formData.description}</p>
            </div>
          )}

          <div className="border-border grid grid-cols-2 gap-4 border-t pt-4">
            <div>
              <p className="text-muted-foreground text-xs">Starting Price</p>
              <p className="text-foreground font-semibold">
                ${formData.startingPrice || "0.00"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Duration</p>
              <p className="text-foreground font-semibold">
                {durations.find((d) => d.value === formData.duration)?.label}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-muted/50 border-border text-muted-foreground rounded-lg border p-4 text-xs">
          <p>
            By publishing, you agree to our Terms of Service and confirm that
            this item is authentic and accurately described.
          </p>
        </div>
      </div>
    </div>
  );
}
