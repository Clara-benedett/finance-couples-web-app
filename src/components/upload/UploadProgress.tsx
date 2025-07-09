
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, AlertCircle, FileText, File, ArrowRight } from "lucide-react";
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
          <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
            <div className="flex flex-col space-y-4">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
                  <h3 className="text-xl font-semibold text-green-900">
                    Upload Complete!
                  </h3>
                </div>
                <p className="text-green-700 mb-1">
                  {totalTransactions} transactions ready for categorization
                </p>
                {totalAutoClassified > 0 && (
                  <p className="text-purple-700 text-sm">
                    🏷️ {totalAutoClassified} transactions were automatically classified
                  </p>
                )}
              </div>
              
              <div className="flex justify-center">
                <Button 
                  onClick={() => navigate('/app/categorize')}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium px-8 py-3 text-lg flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
                  size="lg"
                >
                  Categorize Expenses
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UploadProgress;
