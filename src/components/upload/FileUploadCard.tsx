
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload as UploadIcon } from "lucide-react";
import { useRef } from "react";

interface FileUploadCardProps {
  isDragging: boolean;
  isProcessing: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onFileSelection: (files: FileList | null) => void;
}

const FileUploadCard = ({
  isDragging,
  isProcessing,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileSelection
}: FileUploadCardProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChooseFiles = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className={`border-2 border-dashed transition-colors ${
      isDragging ? 'border-blue-400 bg-blue-50' : 'border-blue-200 hover:border-blue-400'
    }`}>
      <CardContent className="p-4">
        <div
          className={`text-center rounded-lg p-4 transition-colors ${
            isDragging ? 'bg-blue-50' : ''
          }`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <UploadIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            Upload Files
          </h3>
          <p className="text-gray-500 mb-3">
            Drop CSV, Excel, or PDF files here or click to upload
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".csv,.xlsx,.xls,.pdf"
            onChange={(e) => onFileSelection(e.target.files)}
            className="hidden"
            disabled={isProcessing}
          />
          <Button 
            onClick={handleChooseFiles}
            className="bg-blue-600 hover:bg-blue-700"
            disabled={isProcessing}
          >
            <UploadIcon className="w-4 h-4 mr-2" />
            Choose Files
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FileUploadCard;
