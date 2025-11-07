"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

import ProgressIndicator from "@/components/ProgressIndicator";
import Step1UploadPhotos from "@/components/Step1UploadPhotos";
import Step2Details from "@/components/Step2Details";
import Step3Pricing from "@/components/Step3Pricing";
import Step4Review from "@/components/Step4Review";

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

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNextStep = () => step < 4 && setStep(step + 1);
  const handlePrevStep = () => step > 1 && setStep(step - 1);

  const handleSubmit = () => {
    console.log("Submitting:", { ...formData, images: uploadedImages });
    alert("Product listed successfully!");
  };

  return (
    <main className="bg-background min-h-screen py-12">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-foreground mb-2 text-4xl font-bold md:text-5xl">
            Sell Your Item
          </h1>
          <p className="text-muted-foreground text-lg">
            List your product on Blind Chicken Market in 4 simple steps
          </p>
        </div>

        <ProgressIndicator step={step} />

        <Card className="border-border bg-card border p-6 md:p-8">
          {step === 1 && (
            <Step1UploadPhotos
              uploadedImages={uploadedImages}
              setUploadedImages={setUploadedImages}
            />
          )}
          {step === 2 && (
            <Step2Details formData={formData} onChange={handleInputChange} />
          )}
          {step === 3 && (
            <Step3Pricing formData={formData} setFormData={setFormData} />
          )}
          {step === 4 && (
            <Step4Review formData={formData} uploadedImages={uploadedImages} />
          )}

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
      </div>
    </main>
  );
}
