import { Upload } from "lucide-react";

interface Step1UploadPhotosProps {
  uploadedImages: string[];
  setUploadedImages: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function Step1UploadPhotos({
  uploadedImages,
  setUploadedImages,
}: Step1UploadPhotosProps) {
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-foreground mb-2 text-2xl font-bold">
          Upload Photos
        </h2>
        <p className="text-muted-foreground">
          Add up to 5 photos of your item. First image will be the main photo.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
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
  );
}
