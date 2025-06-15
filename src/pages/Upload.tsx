import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload as UploadIcon, FileText, CheckCircle, AlertCircle, File, Plus } from "lucide-react";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { parseFile } from "@/utils/fileParser";
import { transactionStore } from "@/store/transactionStore";
import { Transaction } from "@/types/transaction";
import CardNameDialog from "@/components/CardNameDialog";
import CategorySetup from "@/components/CategorySetup";
import ManualExpenseDialog from "@/components/ManualExpenseDialog";
import { CategoryNames, getCategoryNames } from "@/utils/categoryNames";
import { cardClassificationEngine } from "@/utils/cardClassificationRules";
import { Settings, User, Share } from "lucide-react";

interface UploadedFile {
  file: File;
  status: 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
  transactionCount?: number;
  cardName?: string;
  autoClassifiedCount?: number;
}

interface CardInfo {
  name: string;
  paidBy: 'person1' | 'person2';
  autoClassification?: 'person1' | 'person2' | 'shared' | 'skip';
}

const Upload = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [showCardNameDialog, setShowCardNameDialog] = useState(false);
  const [showCategorySetup, setShowCategorySetup] = useState(true);
  const [categoryNames, setCategoryNames] = useState<CategoryNames | null>(null);
  const [showManualExpense, setShowManualExpense] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const handleFileSelection = (files: FileList | null) => {
    if (!files) return;

    const validFiles = Array.from(files).filter(file => {
      const extension = file.name.split('.').pop()?.toLowerCase();
      return ['csv', 'xlsx', 'xls'].includes(extension || '');
    });

    if (validFiles.length === 0) {
      toast({
        title: "Invalid file format",
        description: "Please upload CSV or Excel files only.",
        variant: "destructive"
      });
      return;
    }

    // Limit to 5 files maximum
    if (validFiles.length > 5) {
      toast({
        title: "Too many files",
        description: "Please upload a maximum of 5 files at once.",
        variant: "destructive"
      });
      return;
    }

    setPendingFiles(validFiles);
    setShowCardNameDialog(true);
  };

  const handleCardNameConfirm = async (cardInfos: CardInfo[]) => {
    setShowCardNameDialog(false);
    await processFiles(pendingFiles, cardInfos);
    setPendingFiles([]);
  };

  const handleCardNameCancel = () => {
    setShowCardNameDialog(false);
    setPendingFiles([]);
  };

  const handleCategorySetupComplete = (names: CategoryNames) => {
    setCategoryNames(names);
    setShowCategorySetup(false);
  };

  const handleEditCategories = () => {
    setShowCategorySetup(true);
  };

  const processFiles = async (files: File[], cardInfos: CardInfo[]) => {
    const newFiles: UploadedFile[] = files.map((file, index) => ({
      file,
      status: 'uploading' as const,
      progress: 0,
      cardName: cardInfos[index].name
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
    setIsProcessing(true);

    // Process each file
    for (let i = 0; i < newFiles.length; i++) {
      const fileUpload = newFiles[i];
      const cardInfo = cardInfos[i];
      
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

        // Parse the file with new return format
        const { transactions: parsedTransactions, detectedFields } = await parseFile(fileUpload.file);
        
        // Apply auto-classification if specified
        let autoClassifiedCount = 0;
        const processedTransactions = parsedTransactions.map(pt => {
          let category = pt.category || 'UNCLASSIFIED';
          let isClassified = false;
          
          // Apply card-level auto-classification
          if (cardInfo.autoClassification && cardInfo.autoClassification !== 'skip') {
            category = cardInfo.autoClassification;
            isClassified = true;
            autoClassifiedCount++;
          }
          
          return {
            id: generateId(),
            date: pt.date,
            amount: pt.amount,
            description: pt.description,
            category,
            cardName: cardInfo.name,
            paidBy: cardInfo.paidBy,
            isClassified,
            mccCode: pt.mccCode,
            transactionType: pt.transactionType,
            location: pt.location,
            referenceNumber: pt.referenceNumber,
            autoAppliedRule: isClassified
          };
        });

        // Save card classification rule for future uploads
        if (cardInfo.autoClassification && cardInfo.autoClassification !== 'skip') {
          cardClassificationEngine.saveCardClassification(cardInfo.name, cardInfo.autoClassification);
        }

        // Add to store
        transactionStore.addTransactions(processedTransactions);

        // Update file status
        setUploadedFiles(prev => 
          prev.map(f => 
            f.file === fileUpload.file 
              ? { 
                  ...f, 
                  status: 'success' as const, 
                  transactionCount: processedTransactions.length,
                  autoClassifiedCount 
                }
              : f
          )
        );

        // Enhanced toast message with auto-classification info
        const detectedFieldsText = detectedFields.length > 0 
          ? ` | Detected fields: ${detectedFields.join(', ')}`
          : '';

        const categoryNames = getCategoryNames();
        const paidByName = cardInfo.paidBy === 'person1' ? categoryNames.person1 : categoryNames.person2;
        
        let autoClassificationText = '';
        if (autoClassifiedCount > 0) {
          const categoryName = cardInfo.autoClassification === 'person1' ? categoryNames.person1 :
                              cardInfo.autoClassification === 'person2' ? categoryNames.person2 :
                              categoryNames.shared;
          autoClassificationText = ` | Applied ${categoryName} to ${autoClassifiedCount} transactions`;
        }

        toast({
          title: "File uploaded successfully",
          description: `${processedTransactions.length} transactions imported from ${cardInfo.name} (paid by ${paidByName})${autoClassificationText}${detectedFieldsText}`,
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
    handleFileSelection(e.dataTransfer.files);
  };

  const handleChooseFiles = () => {
    fileInputRef.current?.click();
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    return extension === 'csv' ? FileText : File;
  };

  const successfulUploads = uploadedFiles.filter(f => f.status === 'success');
  const totalTransactions = successfulUploads.reduce((sum, f) => sum + (f.transactionCount || 0), 0);
  const totalAutoClassified = successfulUploads.reduce((sum, f) => sum + (f.autoClassifiedCount || 0), 0);

  // Show category setup first if not completed
  if (showCategorySetup) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Expense Files</h1>
          <p className="text-gray-600">
            First, let's set up your expense categories
          </p>
        </div>
        
        <CategorySetup 
          onComplete={handleCategorySetupComplete}
          isEditing={categoryNames !== null}
          onCancel={categoryNames ? () => setShowCategorySetup(false) : undefined}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Edit Categories button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Expense Files</h1>
          <p className="text-gray-600">
            Upload CSV or Excel files, or add manual expenses
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleEditCategories}
          className="flex items-center gap-2"
        >
          <Settings className="w-4 h-4" />
          Edit Categories
        </Button>
      </div>

      {/* Category Names Display */}
      {categoryNames && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-blue-900">Categories:</span>
              <div className="flex items-center gap-4 text-sm text-blue-700">
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {categoryNames.person1}
                </span>
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {categoryNames.person2}
                </span>
                <span className="flex items-center gap-1">
                  <Share className="w-3 h-3" />
                  {categoryNames.shared}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* File Upload */}
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
                Upload Files
              </h3>
              <p className="text-gray-500 mb-4">
                Drop CSV or Excel files here or click to upload
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".csv,.xlsx,.xls"
                onChange={(e) => handleFileSelection(e.target.files)}
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

        {/* Manual Entry */}
        <Card className="border-2 border-dashed border-purple-300 hover:border-purple-400 transition-colors">
          <CardContent className="p-8">
            <div className="text-center rounded-lg p-8">
              <Plus className="mx-auto h-12 w-12 text-purple-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Add Manual Expense
              </h3>
              <p className="text-gray-500 mb-4">
                Add cash, PIX, Venmo, or other manual expenses
              </p>
              <Button 
                onClick={() => setShowManualExpense(true)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Expense
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

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
              <li><strong>Amount:</strong> Amount, Valor, Value, Price, Debit</li>
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

      <ManualExpenseDialog
        open={showManualExpense}
        onOpenChange={setShowManualExpense}
      />

      <CardNameDialog
        isOpen={showCardNameDialog}
        onConfirm={handleCardNameConfirm}
        onCancel={handleCardNameCancel}
        fileNames={pendingFiles.map(f => f.name)}
      />
    </div>
  );
};

export default Upload;
