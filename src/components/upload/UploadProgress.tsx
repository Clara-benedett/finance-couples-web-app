
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, AlertCircle, FileText, File } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UploadedFile {
  file: File;
  status: 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
  transactionCount?: number;
  cardName?: string;
  autoClassifiedCount?: number;
}

interface UploadProgressProps {
  uploadedFiles: UploadedFile[];
}

const UploadProgress = ({ uploadedFiles }: UploadProgressProps) => {
  const navigate = useNavigate();

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    return extension === 'csv' ? FileText : File;
  };

  const successfulUploads = uploadedFiles.filter(f => f.status === 'success');
  const totalTransactions = successfulUploads.reduce((sum, f) => sum + (f.transactionCount || 0), 0);
  const totalAutoClassified = successfulUploads.reduce((sum, f) => sum + (f.autoClassifiedCount || 0), 0);

  if (uploadedFiles.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg text-gray-900">Upload Progress</CardTitle>
        <CardDescription>
          Files being processed
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {uploadedFiles.map((fileUpload, index) => {
            const FileIcon = getFileIcon(fileUpload.file.name);
            return (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <FileIcon className="w-5 h-5 text-gray-600 mr-3" />
                    <div>
                      <span className="font-medium text-gray-900">{fileUpload.file.name}</span>
                      {fileUpload.cardName && (
                        <div className="text-sm text-blue-600">Card: {fileUpload.cardName}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center">
                    {fileUpload.status === 'success' && (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                    {fileUpload.status === 'error' && (
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                </div>
                
                {fileUpload.status === 'uploading' && (
                  <Progress value={fileUpload.progress} className="w-full mb-2" />
                )}
                
                <div className="text-sm text-gray-500">
                  {fileUpload.status === 'success' && (
                    <div className="space-y-1">
                      <span className="text-green-600">
                        ✓ {fileUpload.transactionCount} transactions imported
                      </span>
                      {fileUpload.autoClassifiedCount !== undefined && fileUpload.autoClassifiedCount > 0 && (
                        <div className="text-purple-600">
                          🏷️ {fileUpload.autoClassifiedCount} transactions auto-classified
                        </div>
                      )}
                    </div>
                  )}
                  {fileUpload.status === 'error' && (
                    <span className="text-red-600">
                      ✗ {fileUpload.error}
                    </span>
                  )}
                  {fileUpload.status === 'uploading' && (
                    <span>Processing... {fileUpload.progress}%</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {successfulUploads.length > 0 && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-green-900">
                  {totalTransactions} transactions ready for categorization
                </h4>
                <div className="text-sm text-green-700 space-y-1">
                  <p>Files processed successfully. Ready to categorize expenses.</p>
                  {totalAutoClassified > 0 && (
                    <p className="text-purple-700">
                      🏷️ {totalAutoClassified} transactions were automatically classified by card rules
                    </p>
                  )}
                </div>
              </div>
              <Button 
                onClick={() => navigate('/app/categorize')}
                className="bg-green-600 hover:bg-green-700"
              >
                Categorize Expenses
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UploadProgress;
