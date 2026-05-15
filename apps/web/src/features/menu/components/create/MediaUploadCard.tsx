import { useRef } from 'react';
import { Image, CloudUpload, X, Loader2 } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import type { CreateMenuItemFormValues } from '@/features/menu/schemas/menu.schema';
import { useImageUpload } from '@/features/menu/hooks/useImageUpload';

export function MediaUploadCard() {
  const { watch, setValue } = useFormContext<CreateMenuItemFormValues>();
  const { upload, isUploading, uploadError } = useImageUpload('menu-items');
  const inputRef = useRef<HTMLInputElement>(null);
  const imageUrl = watch('imageUrl');

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const url = await upload(file);
    if (url) setValue('imageUrl', url);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="bg-card rounded-3xl p-8 shadow-sm border border-border/50">
      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
        <Image className="h-5 w-5 text-primary" />
        Gallery
      </h3>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleInputChange}
      />

      <div
        onClick={() => !isUploading && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className={`relative aspect-square rounded-2xl overflow-hidden border-2 border-dashed transition-colors ${
          isUploading
            ? 'border-primary/50 bg-primary/5 cursor-wait'
            : 'border-border hover:border-primary cursor-pointer group'
        }`}
      >
        {imageUrl ? (
          <>
            <img
              src={imageUrl}
              alt="Cover"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setValue('imageUrl', ''); }}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-surface-container">
            <div className="w-16 h-16 bg-card rounded-full flex items-center justify-center shadow-md mb-4 text-primary">
              {isUploading ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : (
                <CloudUpload className="h-8 w-8" />
              )}
            </div>
            <p className="font-bold text-foreground">
              {isUploading ? 'Uploading…' : 'Upload Cover Photo'}
            </p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              {isUploading ? 'Please wait' : 'Click or drag a JPG/PNG · Max 5 MB'}
            </p>
          </div>
        )}
      </div>

      {uploadError && (
        <p className="text-xs text-destructive mt-2">{uploadError}</p>
      )}
    </div>
  );
}
