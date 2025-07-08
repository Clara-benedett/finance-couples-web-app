
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { unifiedTransactionStore } from "@/store/unifiedTransactionStore";
import { getCategoryNames } from "@/utils/categoryNames";
import { DuplicateReviewDecision } from "@/types/duplicateDetection";
import { UploadedFile, CardInfo, DuplicateReviewState } from "@/types/upload";
import { 
  parseAllFiles, 
  processTransactions, 
  saveCardClassificationRules, 
  updateFileStatuses 
} from "@/utils/fileProcessing";
import { handleDuplicateDetection, processDuplicateDecisions } from "@/utils/duplicateHandling";
import { validateFiles, createUploadFiles, handleFileError } from "@/utils/fileUpload";

export const useUploadLogic = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [duplicateReview, setDuplicateReview] = useState<DuplicateReviewState | null>(null);
  const { toast } = useToast();

  const handleFileSelection = (files: FileList | null) => {
    const validation = validateFiles(files);
    
    if (!validation.valid) {
      if (validation.error) {
        toast({
          title: "Invalid file format",
          description: validation.error,
          variant: "destructive"
        });
      }
      return;
    }

    setPendingFiles(validation.files);
    return validation.files;
  };

  const updateFileProgress = (fileIndex: number, progress: number) => {
    setUploadedFiles(prev => 
      prev.map((f, index) => 
        index >= prev.length - pendingFiles.length + fileIndex
          ? { ...f, progress }
          : f
      )
    );
  };

  const processFiles = async (files: File[], cardInfos: CardInfo[]) => {
    const cardNames = cardInfos.map(ci => ci.name);
    const newFiles = createUploadFiles(files, cardNames);

    setUploadedFiles(prev => [...prev, ...newFiles]);
    setIsProcessing(true);

    try {
      const allParsedTransactions = await parseAllFiles(files, cardInfos, updateFileProgress);
      
      // Check for duplicates
      const { hasDuplicates, duplicateResult } = handleDuplicateDetection(allParsedTransactions, cardInfos);
      
      if (hasDuplicates) {
        setDuplicateReview(duplicateResult);
        setIsProcessing(false);
        return;
      }

      // No duplicates, proceed with normal upload
      await finishUpload(allParsedTransactions, cardInfos, newFiles);
    } catch (error) {
      const errorMessage = handleFileError(newFiles[0], error as Error, setUploadedFiles);
      
      toast({
        title: "Upload failed",
        description: errorMessage,
        variant: "destructive"
      });
      
      setIsProcessing(false);
    }
  };

  const finishUpload = async (transactions: any[], cardInfos: CardInfo[], fileUploads: UploadedFile[]) => {
    const { processedTransactions, totalAutoClassified } = processTransactions(transactions, cardInfos);

    // Save card classification rules
    saveCardClassificationRules(cardInfos);

    // Add transactions to unified store
    await unifiedTransactionStore.addTransactions(processedTransactions, true);
    console.log(`[Upload] Added ${processedTransactions.length} transactions to unified store`);

    // Update file statuses
    updateFileStatuses(fileUploads, processedTransactions, cardInfos, setUploadedFiles);

    toast({
      title: "Files uploaded successfully",
      description: `${processedTransactions.length} transactions imported${totalAutoClassified > 0 ? `, ${totalAutoClassified} auto-classified` : ''}`,
    });

    setIsProcessing(false);
  };

  const handleDuplicateReview = async (decisions: DuplicateReviewDecision[]) => {
    if (!duplicateReview) return;
    
    const { transactionsToUpload, skippedCount, totalDuplicates } = processDuplicateDecisions(decisions, duplicateReview);
    
    // Show summary
    if (skippedCount > 0) {
      toast({
        title: "Duplicate transactions skipped",
        description: `${skippedCount} of ${totalDuplicates} duplicate transactions were skipped to avoid duplication`,
      });
    }
    
    setDuplicateReview(null);
    
    if (transactionsToUpload.length > 0) {
      setIsProcessing(true);
      const fileUploads = uploadedFiles.filter(f => f.status === 'uploading');
      await finishUpload(transactionsToUpload, duplicateReview.cardInfos, fileUploads);
    } else {
      // All transactions were duplicates and user chose not to include any
      setUploadedFiles(prev => prev.filter(f => f.status !== 'uploading'));
      setIsProcessing(false);
    }
  };

  const handleDuplicateCancel = () => {
    setDuplicateReview(null);
    setUploadedFiles(prev => prev.filter(f => f.status !== 'uploading'));
    setIsProcessing(false);
    
    toast({
      title: "Upload cancelled",
      description: "No transactions were uploaded",
    });
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
    const files = handleFileSelection(e.dataTransfer.files);
    return files;
  };

  return {
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
  };
};
