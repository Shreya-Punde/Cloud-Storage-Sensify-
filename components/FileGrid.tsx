import React from "react";
import type { FileItem } from "../types";
import {
  FileText,
  Image,
  FileSpreadsheet,
  FileJson,
  File,
  MoreVertical,
  Edit2,
  Trash2,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface FileGridProps {
  files: FileItem[];
  onRename: (file: FileItem) => void;
  onDelete: (file: FileItem) => void;
  onFileClick?: (file: FileItem) => void;
  selectionMode?: boolean;
  selectedFiles?: FileItem[];
}

const FileGrid: React.FC<FileGridProps> = ({
  files,
  onRename,
  onDelete,
  onFileClick,
  selectionMode = false,
  selectedFiles = [],
}) => {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getFileIcon = (type: string) => {
    switch (type) {
      case "PDF":
        return <FileText className="w-8 h-8 text-red-500" />;
      case "PNG":
      case "JPG":
      case "JPEG":
        return <Image className="w-8 h-8 text-blue-500" />;
      case "CSV":
        return <FileSpreadsheet className="w-8 h-8 text-green-500" />;
      case "JSON":
        return <FileJson className="w-8 h-8 text-yellow-500" />;
      default:
        return <File className="w-8 h-8 text-slate-500" />;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  const isSelected = (file: FileItem) => {
    return selectedFiles.some((f) => f.id === file.id);
  };

  const handleCardClick = (e: React.MouseEvent, file: FileItem) => {
    // Don't trigger if clicking on menu button
    if ((e.target as HTMLElement).closest(".menu-button")) {
      return;
    }

    if (onFileClick) {
      onFileClick(file);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {files.map((file) => (
        <div
          key={file.id}
          onClick={(e) => handleCardClick(e, file)}
          className={`relative bg-white rounded-2xl border-2 transition-all hover:shadow-lg group ${
            selectionMode
              ? isSelected(file)
                ? "border-blue-500 shadow-md cursor-pointer"
                : "border-slate-200 hover:border-blue-300 cursor-pointer"
              : "border-slate-200 cursor-pointer"
          }`}
        >
          {/* Selection Indicator */}
          {selectionMode && (
            <div className="absolute top-3 left-3 z-10">
              {isSelected(file) ? (
                <CheckCircle2 className="w-6 h-6 text-blue-600 fill-blue-100" />
              ) : (
                <Circle className="w-6 h-6 text-slate-400" />
              )}
            </div>
          )}

          {/* Menu Button - Only show when not in selection mode */}
          {!selectionMode && (
            <div
              className="absolute top-3 right-3 z-10"
              ref={openMenuId === file.id ? menuRef : null}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenMenuId(openMenuId === file.id ? null : file.id);
                }}
                className="menu-button p-1.5 rounded-lg bg-white border border-slate-200 opacity-0 group-hover:opacity-100 hover:bg-slate-50 transition-opacity"
                aria-label="File options"
              >
                <MoreVertical className="w-4 h-4 text-slate-600" />
              </button>
              {openMenuId === file.id && (
                <div className="absolute right-0 mt-1 w-40 rounded-lg bg-white shadow-lg ring-1 ring-slate-200 z-20 py-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRename(file);
                      setOpenMenuId(null);
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                  >
                    <Edit2 className="w-4 h-4" />
                    Rename
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(file);
                      setOpenMenuId(null);
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="p-6">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-slate-50 rounded-xl border border-slate-200">
              {getFileIcon(file.type)}
            </div>
            <h3 className="text-center text-sm font-semibold text-slate-800 mb-1 truncate px-2">
              {file.name}
            </h3>
            <p className="text-center text-xs text-slate-500 mb-3">
              {formatFileSize(file.size)}
            </p>
            {file.sensorType && file.sensorType !== "None" && (
              <div className="flex justify-center mb-3">
                <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-md">
                  {file.sensorType}
                </span>
              </div>
            )}
            <div className="pt-3 border-t border-slate-200">
              <p className="text-center text-xs text-slate-400">
                {formatDate(file.uploadedAt)}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FileGrid;
