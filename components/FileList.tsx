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

interface FileListProps {
  files: FileItem[];
  onRename: (file: FileItem) => void;
  onDelete: (file: FileItem) => void;
  onFileClick?: (file: FileItem) => void;
  selectionMode?: boolean;
  selectedFiles?: FileItem[];
}

const FileList: React.FC<FileListProps> = ({
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
        return <FileText className="w-5 h-5 text-red-500" />;
      case "PNG":
      case "JPG":
      case "JPEG":
        return <Image className="w-5 h-5 text-blue-500" />;
      case "CSV":
        return <FileSpreadsheet className="w-5 h-5 text-green-500" />;
      case "JSON":
        return <FileJson className="w-5 h-5 text-yellow-500" />;
      default:
        return <File className="w-5 h-5 text-slate-500" />;
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
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const isSelected = (file: FileItem) => {
    return selectedFiles.some((f) => f.id === file.id);
  };

  const handleRowClick = (e: React.MouseEvent, file: FileItem) => {
    // Don't trigger if clicking on menu button
    if ((e.target as HTMLElement).closest(".menu-button")) {
      return;
    }

    if (onFileClick) {
      onFileClick(file);
    }
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b-2 border-slate-200">
            <tr>
              {selectionMode && (
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-12">
                  Select
                </th>
              )}
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Sensor Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Size
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Date
              </th>
              {!selectionMode && (
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-12">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {files.map((file) => (
              <tr
                key={file.id}
                onClick={(e) => handleRowClick(e, file)}
                className={`transition-colors ${
                  selectionMode
                    ? isSelected(file)
                      ? "bg-blue-50 hover:bg-blue-100 cursor-pointer"
                      : "hover:bg-slate-50 cursor-pointer"
                    : "hover:bg-slate-50 cursor-pointer"
                }`}
              >
                {selectionMode && (
                  <td className="px-6 py-4">
                    {isSelected(file) ? (
                      <CheckCircle2 className="w-5 h-5 text-blue-600 fill-blue-100" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-400" />
                    )}
                  </td>
                )}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-slate-50 rounded-lg border border-slate-200">
                      {getFileIcon(file.type)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        {file.name}
                      </p>
                      <p className="text-xs text-slate-500">{file.type}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {file.sensorType && file.sensorType !== "None" ? (
                    <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-md">
                      {file.sensorType}
                    </span>
                  ) : (
                    <span className="text-sm text-slate-400">—</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {formatFileSize(file.size)}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {formatDate(file.uploadedAt)}
                </td>
                {!selectionMode && (
                  <td
                    className="px-6 py-4 relative"
                    ref={openMenuId === file.id ? menuRef : null}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === file.id ? null : file.id);
                      }}
                      className="menu-button p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
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
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FileList;
