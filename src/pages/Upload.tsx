
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload as UploadIcon, FileText, CheckCircle, AlertCircle, File } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { parseFile } from "@/utils/fileParser";
import { transactionStore } from "@/store/transactionStore";
import { Transaction } from "@/types/transaction";

interface UploadedFile {
  file: File;
  status: 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
  transactionCount?: number;
}

const Upload = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files) return;

    const newFiles: UploadedFile[] = Array.from(files)
      .filter(file => {
        const extension = file.name.split('.').pop()?.toLowerCase();
        return ['csv', 'xlsx', 'xls'].includes(extension || '');
      })
      .map(file => ({
        file,
        status: 'uploading' as const,
        progress: 0
      }));

    if (newFiles.length === 0) {
      toast({
        title: "Invalid file format",
        description: "Please upload CSV or Excel files only.",
        variant: "destructive"
      });
      return;
    }

    setUploadedFiles(prev => [...prev, ...newFiles]);
    setIsProcessing(true);

    // Process each file
    for (let i = 0; i < newFiles.length; i++) {
      const fileUpload = newFiles[i];
      
      try {
        // Simulate progress
        for (let progress = 0; progress <= 100; progress += 20) {
          await new Promise(resolve => setTimeout(resolve, 100));
          setUploadedFiles(prev => 
            prev.map(f => 
              f.file === fileUpload.file 
                ? { ...f, progress }
                : f
            )
          );
        }

        // Parse the file
        const parsedTransactions = await parseFile(fileUpload.file);
        
        // Convert to Transaction objects
        const transactions: Transaction[] = parsedTransactions.map(pt => ({
          id: generateId(),
          date: pt.date,
          amount: pt.amount,
          description: pt.description,
          category: pt.category || 'UNCLASSIFIED',
          isClassified: false
        }));

        // Add to store
        transactionStore.addTransactions(transactions);

        // Update file status
        setUploadedFiles(prev => 
          prev.map(f => 
            f.file === fileUpload.file 
              ? { ...f, status: 'success' as const, transactionCount: transactions.length }
              : f
          )
        );

        toast({
          title: "File uploaded successfully",
          description: `${transactions.length} transactions imported from ${fileUpload.file.name}`,
        });

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        
        setUploadedFiles(prev => 
          prev.map(f => 
            f.file === fileUpload.file 
              ? { ...f, status: 'error' as const, error: errorMessage }
              : f
          )
        );

        toast({
          title: "Upload failed",
          description: errorMessage,
          variant: "destructive"
        });
      }
    }

    setIsProcessing(false);
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

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    return extension === 'csv' ? FileText : File;
  };

  const successfulUploads = uploadedFiles.filter(f => f.status === 'success');
  const totalTransactions = successfulUploads.reduce((sum, f) => sum + (f.transactionCount || 0), 0);

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
      <Card className={`border-2 border-dashed transition-colors ${
        isDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
      }`}>
        <CardContent className="p-8">
          <div
            className={`text-center rounded-lg p-8 transition-colors ${
              isDragging ? 'bg-blue-50' : ''
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <UploadIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Drop files here or click to upload
            </h3>
            <p className="text-gray-500 mb-4">
              Support for CSV and Excel files (.csv, .xlsx, .xls) up to 10MB each
            </p>
            <input
              type="file"
              multiple
              accept=".csv,.xlsx,.xls"
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
              id="file-upload"
              disabled={isProcessing}
            />
            <label htmlFor="file-upload">
              <Button 
                className="bg-blue-600 hover:bg-blue-700 cursor-pointer"
                disabled={isProcessing}
              >
                <UploadIcon className="w-4 h-4 mr-2" />
                Choose Files
              </Button>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* File Format Instructions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-600" />
              Required Columns
            </CardTitle>
            <CardDescription>
              Your file must contain these columns (names can vary):
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li><strong>Date:</strong> Transaction date (various formats supported)</li>
              <li><strong>Amount:</strong> Transaction amount (positive numbers)</li>
              <li><strong>Description:</strong> Merchant or transaction description</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
              Supported Formats
            </CardTitle>
            <CardDescription>
              We support common column name variations:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li><strong>Date:</strong> Date, Data, Transaction Date</li>
              <li><strong>Amount:</strong> Amount, Valor, Value, Price</li>
              <li><strong>Description:</strong> Description, Descrição, Merchant</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
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
                        <span className="font-medium text-gray-900">{fileUpload.file.name}</span>
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
                        <span className="text-green-600">
                          ✓ {fileUpload.transactionCount} transactions imported
                        </span>
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
                    <p className="text-sm text-green-700">
                      Files processed successfully. Ready to categorize expenses.
                    </p>
                  </div>
                  <Button 
                    onClick={() => navigate('/categorize')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Categorize Expenses
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Upload;
