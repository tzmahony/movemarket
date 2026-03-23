import { useRef, useState } from 'react';
import { uploadFile } from '../api';

interface Props {
  value?: string | null;
  onChange: (url: string) => void;
  shape?: 'square' | 'circle';
  label?: string;
  className?: string;
}

export default function ImageUpload({ value, onChange, shape = 'square', label, className }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }
    setError('');
    setUploading(true);
    try {
      const res = await uploadFile(file);
      onChange(res.data.url);
    } catch {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset so the same file can be re-selected if needed
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  if (shape === 'circle') {
    return (
      <div className={className}>
        <div
          className="relative w-24 h-24 rounded-full border-2 border-dashed border-gray-300 overflow-hidden cursor-pointer hover:border-indigo-400 transition-colors group"
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          {value ? (
            <img src={value} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-1">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              {label !== '' && (
                <span className="text-xs text-center px-1 leading-tight">{label || 'Upload'}</span>
              )}
            </div>
          )}
          {uploading && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
            </div>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    );
  }

  return (
    <div className={className}>
      <div
        className="relative w-full h-48 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden cursor-pointer hover:border-indigo-400 transition-colors group"
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {value ? (
          <img src={value} alt="Uploaded" className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <span className="text-sm">{label || 'Click or drag to upload image'}</span>
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
