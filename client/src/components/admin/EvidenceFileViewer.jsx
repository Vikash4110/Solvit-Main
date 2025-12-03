// components/admin/EvidenceFileViewer.jsx

import { useState } from 'react';
import {
  X,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

const EvidenceFileViewer = ({ files, initialIndex = 0, isOpen, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

  if (!files || files.length === 0) return null;

  const currentFile = files[currentIndex];

  const getFileType = (fileType) => {
    if (fileType.startsWith('image/')) return 'image';
    if (fileType.startsWith('video/')) return 'video';
    if (fileType.startsWith('audio/')) return 'audio';
    if (fileType === 'application/pdf' || fileType === 'pdf') return 'pdf';
    if (
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      fileType === 'docx'
    )
      return 'docx';
    return 'unknown';
  };

  const fileType = getFileType(currentFile.fileType);

  const handleNext = () => {
    if (currentIndex < files.length - 1) {
      setCurrentIndex(currentIndex + 1);
      resetView();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      resetView();
    }
  };

  const resetView = () => {
    setZoom(100);
    setRotation(0);
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 50));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = currentFile.fileUrl;
    link.download = currentFile.fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="w-5 h-5 text-blue-600" />;
      case 'video':
        return <Video className="w-5 h-5 text-purple-600" />;
      case 'audio':
        return <Music className="w-5 h-5 text-green-600" />;
      case 'pdf':
      case 'docx':
        return <FileText className="w-5 h-5 text-red-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] p-0 overflow-hidden flex flex-col">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b bg-slate-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getFileIcon(fileType)}
              <div>
                <DialogTitle className="text-lg font-semibold">
                  {currentFile.fileName}
                </DialogTitle>
                <div className="flex items-center gap-3 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {fileType.toUpperCase()}
                  </Badge>
                  <span className="text-xs text-slate-500">
                    {formatFileSize(currentFile.fileSize)}
                  </span>
                  <span className="text-xs text-slate-500">
                    {currentIndex + 1} of {files.length}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Zoom Controls (for images only) */}
              {fileType === 'image' && (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleZoomOut}
                    disabled={zoom <= 50}
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-slate-600 min-w-[45px] text-center">
                    {zoom}%
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleZoomIn}
                    disabled={zoom >= 200}
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={handleRotate}>
                    <RotateCw className="w-4 h-4" />
                  </Button>
                </>
              )}

              <Button size="sm" variant="ghost" onClick={handleDownload}>
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* File Content */}
        <div className="flex-1 overflow-auto bg-slate-900 relative">
          <div className="flex items-center justify-center min-h-full p-4">
            {/* IMAGE */}
            {fileType === 'image' && (
              <img
                src={currentFile.fileUrl}
                alt={currentFile.fileName}
                className="max-w-full max-h-full object-contain transition-transform duration-200"
                style={{
                  transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                }}
              />
            )}

            {/* VIDEO */}
            {fileType === 'video' && (
              <video
                src={currentFile.fileUrl}
                controls
                className="max-w-full max-h-[70vh] rounded-lg"
              >
                Your browser does not support the video tag.
              </video>
            )}

            {/* AUDIO */}
            {fileType === 'audio' && (
              <div className="bg-white rounded-lg p-8 w-full max-w-md">
                <div className="flex items-center justify-center mb-6">
                  <Music className="w-16 h-16 text-green-600" />
                </div>
                <audio src={currentFile.fileUrl} controls className="w-full">
                  Your browser does not support the audio tag.
                </audio>
                <p className="text-center text-sm text-slate-600 mt-4">
                  {currentFile.fileName}
                </p>
              </div>
            )}

            {/* PDF */}
            {fileType === 'pdf' && (
              <iframe
                src={`${currentFile.fileUrl}#toolbar=1`}
                className="w-full h-[75vh] rounded-lg bg-white"
                title={currentFile.fileName}
              />
            )}

            {/* DOCX or Unknown */}
            {(fileType === 'docx' || fileType === 'unknown') && (
              <div className="bg-white rounded-lg p-8 text-center max-w-md">
                <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-700 font-medium mb-2">
                  {currentFile.fileName}
                </p>
                <p className="text-sm text-slate-500 mb-6">
                  This file type cannot be previewed in browser
                </p>
                <Button onClick={handleDownload} className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Download to View
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Footer */}
        {files.length > 1 && (
          <div className="px-6 py-4 border-t bg-slate-50 flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>

            <div className="text-sm text-slate-600">
              File {currentIndex + 1} of {files.length}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              disabled={currentIndex === files.length - 1}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EvidenceFileViewer;
