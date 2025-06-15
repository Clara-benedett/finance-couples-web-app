import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { parseFile } from "@/utils/fileParser";
import { transactionStore } from "@/store/transactionStore";
import { getCategoryNames } from "@/utils/categoryNames";
import { cardClassificationEngine } from "@/utils/cardClassificationRules";

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

export const useUploadLogic = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [duplicateReview, setDuplicateReview] = useState<{
    duplicates: any[];
    pendingTransactions: any[];
    cardInfos: CardInfo[];
  } | null>(null);
  const { toast } = useToast();

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

    if (validFiles.length > 5) {
      toast({
        title: "Too many files",
        description: "Please upload a maximum of 5 files at once.",
        variant: "destructive"
      });
      return;
    }

    setPendingFiles(validFiles);
    return validFiles;
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

    // Parse all files first
    let allParsedTransactions: any[] = [];
    
    for (let i = 0; i < newFiles.length; i++) {
      const fileUpload = newFiles[i];
      const cardInfo = cardInfos[i];
      
      try {
        // Simulate progress for parsing
        for (let progress = 0; progress <= 50; progress += 10) {
          await new Promise(resolve => setTimeout(resolve, 100));
          setUploadedFiles(prev => 
            prev.map(f => 
              f.file === fileUpload.file 
                ? { ...f, progress }
                : f
            )
          );
        }

        const { transactions: parsedTransactions } = await parseFile(fileUpload.file);
        
        // Add card info to each transaction
        const transactionsWithCardInfo = parsedTransactions.map(pt => ({
          ...pt,
          cardName: cardInfo.name,
          paidBy: cardInfo.paidBy,
          autoClassification: cardInfo.autoClassification
        }));
        
        allParsedTransactions.push(...transactionsWithCardInfo);
        
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
        
        setIsProcessing(false);
        return;
      }
    }

    // Check for duplicates
    const duplicateResult = transactionStore.checkForDuplicates(allParsedTransactions);
    
    if (duplicateResult.duplicates.length > 0) {
      // Show duplicate review modal
      setDuplicateReview({
        duplicates: duplicateResult.duplicates,
        pendingTransactions: allParsedTransactions,
        cardInfos
      });
      setIsProcessing(false);
      return;
    }

    // No duplicates, proceed with normal upload
    await finishUpload(allParsedTransactions, cardInfos, newFiles);
  };

  const finishUpload = async (transactions: any[], cardInfos: CardInfo[], fileUploads: UploadedFile[]) => {
    let totalAutoClassified = 0;
    
    const processedTransactions = transactions.map(tx => {
      const cardInfo = cardInfos.find(ci => ci.name === tx.cardName) || cardInfos[0];
      let category = tx.category || 'UNCLASSIFIED';
      let isClassified = false;
      
      if (cardInfo.autoClassification && cardInfo.autoClassification !== 'skip') {
        category = cardInfo.autoClassification;
        isClassified = true;
        totalAutoClassified++;
      }
      
      return {
        id: generateId(),
        date: tx.date,
        amount: tx.amount,
        description: tx.description,
        category,
        cardName: cardInfo.name,
        paidBy: cardInfo.paidBy,
        isClassified,
        mccCode: tx.mccCode,
        transactionType: tx.transactionType,
        location: tx.location,
        referenceNumber: tx.referenceNumber,
        autoAppliedRule: isClassified
      };
    });

    // Save card classification rules
    cardInfos.forEach(cardInfo => {
      if (cardInfo.autoClassification && cardInfo.autoClassification !== 'skip') {
        cardClassificationEngine.saveCardClassification(cardInfo.name, cardInfo.autoClassification);
      }
    });

    // Add transactions to store
    transactionStore.addTransactions(processedTransactions, true); // Skip duplicate check since we already did it

    // Update file statuses
    fileUploads.forEach(fileUpload => {
      const fileTransactions = processedTransactions.filter(t => 
        cardInfos.find(ci => ci.name === fileUpload.cardName)
      );
      
      setUploadedFiles(prev => 
        prev.map(f => 
          f.file === fileUpload.file 
            ? { 
                ...f, 
                status: 'success' as const, 
                progress: 100,
                transactionCount: fileTransactions.length,
                autoClassifiedCount: fileTransactions.filter(t => t.autoAppliedRule).length
              }
              : f
        )
      );
    });

    const categoryNames = getCategoryNames();
    
    toast({
      title: "Files uploaded successfully",
      description: `${processedTransactions.length} transactions imported${totalAutoClassified > 0 ? `, ${totalAutoClassified} auto-classified` : ''}`,
    });

    setIsProcessing(false);
  };

  const handleDuplicateReview = async (decisions: any[]) => {
    if (!duplicateReview) return;
    
    const { duplicates, pendingTransactions, cardInfos } = duplicateReview;
    
    // Include selected duplicates with the unique transactions
    const selectedDuplicateTransactions = decisions
      .filter(decision => decision.shouldInclude)
      .map(decision => pendingTransactions[duplicates[decision.duplicateIndex].newTransaction.index]);
    
    // Get unique transactions (non-duplicates)
    const uniqueTransactions = pendingTransactions.filter((_, index) => 
      !duplicates.some(dup => dup.newTransaction.index === index)
    );
    
    const transactionsToUpload = [...uniqueTransactions, ...selectedDuplicateTransactions];
    
    // Show summary
    const skippedCount = duplicates.length - selectedDuplicateTransactions.length;
    if (skippedCount > 0) {
      toast({
        title: "Duplicate transactions skipped",
        description: `${skippedCount} of ${duplicates.length} duplicate transactions were skipped to avoid duplication`,
      });
    }
    
    setDuplicateReview(null);
    
    if (transactionsToUpload.length > 0) {
      setIsProcessing(true);
      const fileUploads = uploadedFiles.filter(f => f.status === 'uploading');
      await finishUpload(transactionsToUpload, cardInfos, fileUploads);
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
