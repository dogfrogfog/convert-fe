"use client";

import { useState, useCallback } from "react";

const supportedFormats = ["webp", "avif", "jpg", "png"] as const;
type SupportedFormat = (typeof supportedFormats)[number];

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [targetFormat, setTargetFormat] = useState<SupportedFormat>("webp");
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // File validation function
  const validateFiles = (fileList: File[]): File[] => {
    return fileList.filter((file) => {
      const isImage = file.type.startsWith("image/");
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit

      if (!isImage) {
        setError(`${file.name} is not an image file`);
        return false;
      }
      if (!isValidSize) {
        setError(`${file.name} is too large (max 10MB)`);
        return false;
      }
      return true;
    });
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    setError(null);

    const droppedFiles = Array.from(e.dataTransfer.files);
    const validFiles = validateFiles(droppedFiles);
    setFiles((prevFiles) => [...prevFiles, ...validFiles]);
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setError(null);
      if (e.target.files) {
        const selectedFiles = Array.from(e.target.files);
        const validFiles = validateFiles(selectedFiles);
        setFiles((prevFiles) => [...prevFiles, ...validFiles]);
      }
    },
    []
  );

  const removeFile = useCallback((index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Image Converter</h1>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div
            className={`border-2 border-dashed rounded-lg p-8 mb-4 text-center transition-colors
              ${dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"}
              ${error ? "border-red-500 bg-red-50" : ""}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer text-blue-600 hover:text-blue-800"
            >
              Click to upload
            </label>
            <p className="text-gray-500 mt-2">or drag and drop images here</p>
            {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Convert to:
            </label>
            <select
              value={targetFormat}
              onChange={(e) =>
                setTargetFormat(e.target.value as SupportedFormat)
              }
              className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              {supportedFormats.map((format) => (
                <option key={format} value={format}>
                  {format.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {files.length > 0 && (
            <div className="mb-4">
              <h3 className="font-medium text-gray-700 mb-2">
                Selected Files:
              </h3>
              <ul className="space-y-2">
                {files.map((file, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between bg-gray-50 p-2 rounded"
                  >
                    <span className="truncate">{file.name}</span>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            type="button"
            disabled={uploading || files.length === 0}
            className="w-full bg-blue-500 text-white p-3 rounded-md
              hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed
              transition-colors"
          >
            {uploading ? "Converting..." : "Convert Files"}
          </button>
        </div>
      </div>
    </main>
  );
}
