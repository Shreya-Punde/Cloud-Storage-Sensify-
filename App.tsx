import React, { useState, useEffect } from "react";
import { Search, Brain } from "lucide-react";
import Dashboard from "./components/Dashboard";
import { getFiles } from "./services/fileService";
import type { FileItem } from "./types";

function App() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Selection mode
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileItem[]>([]);

  const fetchFiles = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedFiles = await getFiles();
      setFiles(fetchedFiles);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load files");
      console.error("Error fetching files:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleAIAnalyticsClick = () => {
    setSelectionMode(true);
    setSelectedFiles([]);
  };

  // FIX: Auto-append .csv for Cloudinary fetch
  const ensureCSV = (url: string) => {
    return url.endsWith(".csv") ? url : `${url}`;
  };

  const handleSelectionComplete = () => {
    if (selectedFiles.length === 0) return;

    // Encode URLs + fix CSV extension
    const fileUrls = selectedFiles
      .map((f) => encodeURIComponent(ensureCSV(f.url)))
      .join(",");

    const fileNames = selectedFiles
      .map((f) => encodeURIComponent(f.name))
      .join(",");

    window.location.href = `https://giri-shankar.github.io/ai-analytics-v2/?files=${fileUrls}&names=${fileNames}`;
  };

  const handleCancelSelection = () => {
    setSelectionMode(false);
    setSelectedFiles([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b-2 border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg">
                {/* <svg
                  className="w-7 h-7 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                  />
                </svg> */}
                <img className="z-100 h-10 w-10" src="./components/icons/goobe.PNG" alt="" />
              </div>

              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  SENSIFY
                </h1>
                <p className="text-sm text-slate-500">
                  Smart Sensing. Sharper Decisions
                </p>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-2">
              <button
                onClick={() => selectionMode && handleCancelSelection()}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  !selectionMode
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                Dashboard
              </button>

              <button
                onClick={handleAIAnalyticsClick}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  selectionMode
                    ? "bg-blue-100 text-blue-700"
                    : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                <Brain className="w-4 h-4" />
                AI Analytics
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!selectionMode && (
          <div className="mb-8">
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search files by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 transition-colors text-slate-800 placeholder-slate-400 shadow-sm"
              />
            </div>
          </div>
        )}

        <Dashboard
          files={files}
          setFiles={setFiles}
          isLoading={isLoading}
          error={error}
          refreshFiles={fetchFiles}
          searchTerm={searchTerm}
          selectionMode={selectionMode}
          selectedFiles={selectedFiles}
          onSelectionChange={setSelectedFiles}
          onSelectionComplete={handleSelectionComplete}
        />
      </main>
    </div>
  );
}

export default App;
