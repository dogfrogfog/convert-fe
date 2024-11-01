"use client";

import { useState, useCallback, useEffect } from "react";
import JSZip from "jszip";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, Download, X } from "lucide-react";

const supportedFormats = ["webp", "avif", "jpg", "png"] as const;
type SupportedFormat = (typeof supportedFormats)[number];

interface ConvertedFile {
  name: string;
  buffer: string;
  type: string;
  metadata: {
    original: {
      format: string;
      size: number;
    };
    converted: {
      format: string;
      size: number;
    };
  };
}

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [targetFormat, setTargetFormat] = useState<SupportedFormat>("webp");
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [convertedFiles, setConvertedFiles] = useState<ConvertedFile[]>([]);
  const [totalUploaded, setTotalUploaded] = useState({ count: 0, size: 0 });

  // Update total uploaded stats
  useEffect(() => {
    const totalSize = files.reduce((acc, file) => acc + file.size, 0);
    setTotalUploaded({ count: files.length, size: totalSize });
  }, [files]);

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

  const downloadFile = useCallback((file: ConvertedFile) => {
    try {
      // Convert base64 to Blob
      const binaryString = window.atob(file.buffer);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: file.type });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading file:", error);
      setError("Failed to download file");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) return;

    setUploading(true);
    setError(null);
    setConvertedFiles([]);

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    formData.append("targetFormat", targetFormat);

    try {
      const response = await fetch("http://localhost:4444/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const data = await response.json();
      setConvertedFiles(data.files);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const downloadAllFiles = useCallback(async () => {
    try {
      const zip = new JSZip();

      // Add each file to the zip
      convertedFiles.forEach((file) => {
        // Convert base64 to binary
        const binaryString = window.atob(file.buffer);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        // Add file to zip
        zip.file(file.name, bytes, { binary: true });
      });

      // Generate zip file
      const zipBlob = await zip.generateAsync({ type: "blob" });

      // Create download link for zip
      const url = window.URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `converted_images.zip`;
      document.body.appendChild(a);
      a.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error creating zip file:", error);
      setError("Failed to create zip file");
    }
  }, [convertedFiles]);

  const resetFiles = useCallback(() => {
    setFiles([]);
    setConvertedFiles([]);
    setError(null);
  }, []);

  return (
    <main className="min-h-screen bg-white p-8">
      {/* Stats Bar */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-100 p-4 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-sm text-gray-500">
          <span>Files uploaded: {totalUploaded.count}</span>
          <span>Total size: {formatBytes(totalUploaded.size)}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-16">
        {/* Main Content */}
        <div className="grid grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="space-y-4">
            <Card className="border-gray-200">
              <CardContent className="p-6">
                {/* Upload Area */}
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-all
                    ${
                      dragActive
                        ? "border-blue-500 bg-gray-50"
                        : "border-gray-200"
                    }
                    ${error ? "border-red-500" : ""}
                    hover:border-gray-400`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  <Upload className="w-8 h-8 mx-auto mb-3 text-gray-400" />
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
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer"
                  >
                    Select Files
                  </label>
                  <p className="text-sm text-gray-400 mt-2">
                    or drag files here
                  </p>
                </div>

                {/* Format Selection */}
                <div className="mt-4">
                  <Select
                    value={targetFormat}
                    onValueChange={(value) =>
                      setTargetFormat(value as SupportedFormat)
                    }
                  >
                    <SelectTrigger className="w-full border-gray-200">
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      {supportedFormats.map((format) => (
                        <SelectItem key={format} value={format}>
                          {format.toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Selected Files */}
                {files.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {files.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded-md text-sm"
                      >
                        <span className="truncate flex-1">{file.name}</span>
                        <button
                          onClick={() => removeFile(index)}
                          className="ml-2 text-gray-400 hover:text-gray-600"
                          disabled={uploading}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <Button
                  onClick={handleSubmit}
                  disabled={uploading || files.length === 0}
                  className="w-full mt-4 bg-blue-500 hover:bg-blue-600"
                >
                  {uploading ? "Converting..." : "Convert"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <div>
            {convertedFiles.length > 0 && (
              <Card className="border-gray-200">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {convertedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-sm">{file.name}</p>
                          <div className="text-xs text-gray-500 mt-1 space-y-1">
                            <p>
                              Original:{" "}
                              {formatBytes(file.metadata.original.size)}
                            </p>
                            <p>
                              Converted:{" "}
                              {formatBytes(file.metadata.converted.size)}
                            </p>
                            <p className="text-blue-500">
                              {calculateSavings(
                                file.metadata.original.size,
                                file.metadata.converted.size
                              )}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadFile(file)}
                          className="ml-4"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      onClick={downloadAllFiles}
                      className="w-full mt-4 bg-gray-900 hover:bg-gray-800"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download All
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

// Helper functions
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function calculateSavings(originalSize: number, convertedSize: number): string {
  const difference = originalSize - convertedSize;
  const percentage = ((difference / originalSize) * 100).toFixed(1);
  return difference > 0
    ? `Saved ${formatBytes(difference)} (${percentage}%)`
    : `Increased by ${formatBytes(Math.abs(difference))}`;
}
