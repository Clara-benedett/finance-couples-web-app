import { useState } from "react";
import { useCategoryNames } from "@/hooks/useCategoryNames";
import CategorySetup from "@/components/CategorySetup";
import CardNameDialog from "@/components/CardNameDialog";
import ManualExpenseDialog from "@/components/ManualExpenseDialog";
import UploadHeader from "@/components/upload/UploadHeader";
import CategoryDisplay from "@/components/upload/CategoryDisplay";
import FileUploadCard from "@/components/upload/FileUploadCard";
import ManualEntryCard from "@/components/upload/ManualEntryCard";
import FormatInstructions from "@/components/upload/FormatInstructions";
import UploadProgress from "@/components/upload/UploadProgress";
import DuplicateReviewModal from "@/components/DuplicateReviewModal";
import { useUploadLogic } from "@/hooks/useUploadLogic";
import { CardInfo } from "@/types/upload";

const Upload = () => {
  const { categoryNames, loading: categoryNamesLoading } = useCategoryNames();
  const [showCardNameDialog, setShowCardNameDialog] = useState(false);
  const [showCategorySetup, setShowCategorySetup] = useState(false);
  const [showManualExpense, setShowManualExpense] = useState(false);

  const {
    uploadedFiles,
    isDragging,
    isProcessing,
    pendingFiles,
    duplicateReview,
    handleFileSelection,
    processFiles,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    setPendingFiles,
    handleDuplicateReview,
    handleDuplicateCancel
  } = useUploadLogic();

  const handleFileSelectionWithDialog = (files: FileList | null) => {
    const validFiles = handleFileSelection(files);
    if (validFiles && validFiles.length > 0) {
      setShowCardNameDialog(true);
    }
  };

  const handleCardNameConfirm = async (cardInfos: any[]) => {
    setShowCardNameDialog(false);
    await processFiles(pendingFiles, cardInfos);
    setPendingFiles([]);
  };

  const handleCardNameCancel = () => {
    setShowCardNameDialog(false);
    setPendingFiles([]);
  };

  const handleCategorySetupComplete = () => {
    setShowCategorySetup(false);
  };

  const handleEditCategories = () => {
    setShowCategorySetup(true);
  };

  const handleDropWithDialog = (e: React.DragEvent) => {
    const files = handleDrop(e);
    if (files && files.length > 0) {
      setShowCardNameDialog(true);
    }
  };

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
          isEditing={true}
          onCancel={() => setShowCategorySetup(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <UploadHeader onEditCategories={handleEditCategories} />

      <CategoryDisplay categoryNames={categoryNames} loading={categoryNamesLoading} />

      {/* File Upload Section */}
      <div className="space-y-3">
        <FileUploadCard
          isDragging={isDragging}
          isProcessing={isProcessing}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDropWithDialog}
          onFileSelection={handleFileSelectionWithDialog}
        />
        
        {/* Upload Progress - moved up to be more visible */}
        <UploadProgress uploadedFiles={uploadedFiles} />
        
        <FormatInstructions />
      </div>

      {/* Manual Entry Section */}
      <ManualEntryCard
        onAddManualExpense={() => setShowManualExpense(true)}
      />

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

      <DuplicateReviewModal
        open={!!duplicateReview}
        onOpenChange={() => {}}
        duplicates={duplicateReview?.duplicates || []}
        totalTransactions={duplicateReview?.totalTransactions || 0}
        uniqueTransactions={duplicateReview?.uniqueTransactions || 0}
        onConfirm={handleDuplicateReview}
        onCancel={handleDuplicateCancel}
      />
    </div>
  );
};

export default Upload;
