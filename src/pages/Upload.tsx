
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload as UploadIcon, FileText, CheckCircle } from "lucide-react";
import { useState } from "react";

const Upload = () => {
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileUpload = (files: FileList | null) => {
    if (files) {
      const fileNames = Array.from(files).map(file => file.name);
      setUploadedFiles(prev => [...prev, ...fileNames]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Expenses</h1>
        <p className="text-gray-600">
          Upload your credit card statements and receipts to automatically categorize expenses
        </p>
      </div>

      {/* Upload Area */}
      <Card className="border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
        <CardContent className="p-8">
          <div
            className={`text-center ${isDragging ? 'bg-blue-50' : ''} rounded-lg p-8 transition-colors`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <UploadIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Drop files here or click to upload
            </h3>
            <p className="text-gray-500 mb-4">
              Support for PDF, CSV, and image files up to 10MB each
            </p>
            <input
              type="file"
              multiple
              accept=".pdf,.csv,.jpg,.jpeg,.png"
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button className="bg-blue-600 hover:bg-blue-700 cursor-pointer">
                <UploadIcon className="w-4 h-4 mr-2" />
                Choose Files
              </Button>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Upload Instructions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-600" />
              Credit Card Statements
            </CardTitle>
            <CardDescription>
              Upload monthly statements in PDF or CSV format
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <UploadIcon className="w-5 h-5 mr-2 text-green-600" />
              Receipt Photos
            </CardTitle>
            <CardDescription>
              Take photos of receipts for detailed expense tracking
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-purple-600" />
              Auto-Processing
            </CardTitle>
            <CardDescription>
              We'll automatically extract and categorize your expenses
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-gray-900">Uploaded Files</CardTitle>
            <CardDescription>
              Files ready for processing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {uploadedFiles.map((fileName, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                    <span className="font-medium text-gray-900">{fileName}</span>
                  </div>
                  <span className="text-sm text-green-600">Uploaded</span>
                </div>
              ))}
            </div>
            <Button className="w-full mt-4 bg-green-600 hover:bg-green-700">
              Process Files
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Upload;
