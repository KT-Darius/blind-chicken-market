// 상품 등록 페이지
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Upload, ChevronRight, ChevronLeft, Check } from "lucide-react";

export default function CreateProductPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: "",
    category: "electronics",
    condition: "good",
    description: "",
    startingPrice: "",
    duration: "7",
  });
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

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
  const durations = [
    { label: "3 days", value: "3" },
    { label: "7 days", value: "7" },
    { label: "14 days", value: "14" },
    { label: "30 days", value: "30" },
  ];

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImages((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleNextStep = () => {
    if (step < 4) setStep(step + 1);
  };

  const handlePrevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    console.log("Submitting:", { ...formData, images: uploadedImages });
    alert("Product listed successfully!");
  };

  return (
    <main className="bg-background min-h-screen py-12">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-foreground mb-2 text-4xl font-bold md:text-5xl">
            Sell Your Item
          </h1>
          <p className="text-muted-foreground text-lg">
            List your product on Blind Chicken Market in 4 simple steps
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center gap-2 md:gap-4">
            {[1, 2, 3, 4].map((num) => (
              <div
                key={num}
                className="flex flex-1 items-center gap-2 md:gap-4"
              >
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
                    className={`h-1 flex-1 transition-all ${step > num ? "bg-primary" : "bg-border"}`}
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

        {/* Form Steps */}
        <Card className="border-border bg-card border p-6 md:p-8">
          {/* Step 1: Upload Images */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-foreground mb-2 text-2xl font-bold">
                  Upload Photos
                </h2>
                <p className="text-muted-foreground">
                  Add up to 5 photos of your item. First image will be the main
                  photo.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {/* Upload Box */}
                <label className="border-border hover:bg-muted col-span-2 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors md:col-span-1">
                  <Upload className="text-muted-foreground mb-2 h-8 w-8" />
                  <span className="text-foreground text-sm font-medium">
                    Upload Photo
                  </span>
                  <span className="text-muted-foreground text-xs">Max 5MB</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploadedImages.length >= 5}
                  />
                </label>

                {/* Uploaded Images */}
                {uploadedImages.map((img, idx) => (
                  <div key={idx} className="group relative">
                    <img
                      src={img || "/placeholder.svg"}
                      alt={`Upload ${idx + 1}`}
                      className="h-32 w-full rounded-lg object-cover"
                    />
                    <button
                      onClick={() => removeImage(idx)}
                      className="bg-destructive text-primary-foreground absolute top-2 right-2 rounded p-1 opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      ✕
                    </button>
                    {idx === 0 && (
                      <div className="bg-primary text-primary-foreground absolute top-2 left-2 rounded px-2 py-1 text-xs font-medium">
                        Main
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <p className="text-muted-foreground text-xs">
                {uploadedImages.length}/5 photos uploaded
              </p>
            </div>
          )}

          {/* Step 2: Product Details */}
          {step === 2 && (
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
                    onChange={handleInputChange}
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
                      onChange={handleInputChange}
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
                      onChange={handleInputChange}
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
                    onChange={handleInputChange}
                    rows={5}
                    className="border-border bg-background text-foreground focus:ring-primary w-full rounded-md border px-3 py-2 focus:ring-2 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Pricing & Duration */}
          {step === 3 && (
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
                      onChange={handleInputChange}
                      className="flex-1"
                      step="0.01"
                      min="0"
                    />
                  </div>
                  <p className="text-muted-foreground mt-2 text-xs">
                    Suggested price: Based on similar items, consider starting
                    at $50-$200
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
                          setFormData((prev) => ({
                            ...prev,
                            duration: dur.value,
                          }))
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
                      <span className="text-muted-foreground">
                        Starting Price:
                      </span>
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
                            (Number.parseFloat(formData.startingPrice) || 0) *
                            0.05
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
                            (Number.parseFloat(formData.startingPrice) || 0) *
                            0.95
                          ).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
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
                {/* Preview Images */}
                {uploadedImages.length > 0 && (
                  <div>
                    <h3 className="text-foreground mb-3 font-semibold">
                      Photos
                    </h3>
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

                {/* Summary */}
                <div className="border-border space-y-4 border-t pt-6">
                  <div>
                    <p className="text-muted-foreground text-xs">
                      Product Title
                    </p>
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
                      <p className="text-muted-foreground text-xs">
                        Description
                      </p>
                      <p className="text-foreground text-sm">
                        {formData.description}
                      </p>
                    </div>
                  )}
                  <div className="border-border grid grid-cols-2 gap-4 border-t pt-4">
                    <div>
                      <p className="text-muted-foreground text-xs">
                        Starting Price
                      </p>
                      <p className="text-foreground font-semibold">
                        ${formData.startingPrice || "0.00"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Duration</p>
                      <p className="text-foreground font-semibold">
                        {
                          durations.find((d) => d.value === formData.duration)
                            ?.label
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* Terms */}
                <div className="bg-muted/50 border-border text-muted-foreground rounded-lg border p-4 text-xs">
                  <p>
                    By publishing, you agree to our Terms of Service and confirm
                    that this item is authentic and accurately described.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="border-border mt-8 flex justify-between gap-3 border-t pt-6">
            <Button
              variant="outline"
              onClick={handlePrevStep}
              disabled={step === 1}
              className="flex items-center gap-2 bg-transparent"
            >
              <ChevronLeft size={18} />
              Back
            </Button>

            <div className="flex gap-3">
              {step < 4 && (
                <Button
                  onClick={handleNextStep}
                  className="flex items-center gap-2"
                >
                  Next
                  <ChevronRight size={18} />
                </Button>
              )}
              {step === 4 && (
                <Button onClick={handleSubmit} size="lg" className="px-8">
                  Publish Listing
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Helpful Tips */}
        <div className="mt-12 space-y-4">
          <h3 className="text-foreground font-semibold">
            Tips for a Great Listing:
          </h3>
          <ul className="text-muted-foreground grid gap-3 text-sm md:grid-cols-2">
            <li>Use clear, well-lit photos from multiple angles</li>
            <li>Be honest about the condition and any defects</li>
            <li>Set a competitive starting price</li>
            <li>Write a detailed description with specifications</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
