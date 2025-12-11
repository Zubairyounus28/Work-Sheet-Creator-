import React, { useCallback, useState } from 'react';
import { Upload, Link as LinkIcon, AlertCircle, Loader2 } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (base64: string, mimeType: string) => void;
  isLoading: boolean;
  label: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isLoading, label }) => {
  const [dragActive, setDragActive] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (JPEG, PNG, WebP).");
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = (e.target?.result as string).split(',')[1];
      onFileSelect(base64, file.type);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, [onFileSelect]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleUrlSubmit = async () => {
    if(!urlInput) return;
    try {
        setError(null);
        // Note: Direct fetching might fail due to CORS. 
        // In a real production app, use a proxy. 
        // Here we attempt fetch, if fail, warn user.
        const response = await fetch(urlInput);
        const blob = await response.blob();
        if (!blob.type.startsWith('image/')) {
             setError("URL did not return a valid image.");
             return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            const base64 = (e.target?.result as string).split(',')[1];
            onFileSelect(base64, blob.type);
        };
        reader.readAsDataURL(blob);
    } catch (err) {
        setError("Unable to load image from URL due to security/CORS restrictions. Please save the image to your device and upload it.");
    }
  }

  return (
    <div className="w-full max-w-xl mx-auto">
      <div 
        className={`relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${dragActive ? 'border-primary bg-primary/5' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {isLoading ? (
                <div className="flex flex-col items-center">
                    <Loader2 className="w-10 h-10 text-primary animate-spin mb-3" />
                    <p className="text-sm text-gray-500">Processing your worksheet...</p>
                </div>
            ) : (
                <>
                    <Upload className="w-10 h-10 mb-3 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                    <p className="text-xs text-gray-500">PNG, JPG, WebP (MAX. 10MB)</p>
                    <p className="mt-4 text-xs font-semibold text-primary uppercase tracking-wider">{label}</p>
                </>
            )}
        </div>
        <input 
            type="file" 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" 
            onChange={handleChange} 
            accept="image/*"
            disabled={isLoading}
        />
      </div>

      <div className="mt-4">
        <div className="flex items-center gap-2">
            <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <LinkIcon className="w-4 h-4 text-gray-500" />
                </div>
                <input 
                    type="url" 
                    className="block w-full p-2.5 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-primary focus:border-primary" 
                    placeholder="Or paste an image URL here..." 
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    disabled={isLoading}
                />
            </div>
            <button 
                onClick={handleUrlSubmit}
                disabled={!urlInput || isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Load URL
            </button>
        </div>
        {error && (
            <div className="mt-2 flex items-center text-sm text-red-600">
                <AlertCircle className="w-4 h-4 mr-1" />
                {error}
            </div>
        )}
      </div>
    </div>
  );
};
