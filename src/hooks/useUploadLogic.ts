
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

        const { transactions: parsedTransactions, detectedFields } = await parseFile(fileUpload.file);
        
        let autoClassifiedCount = 0;
        const processedTransactions = parsedTransactions.map(pt => {
          let category = pt.category || 'UNCLASSIFIED';
          let isClassified = false;
          
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

        if (cardInfo.autoClassification && cardInfo.autoClassification !== 'skip') {
          cardClassificationEngine.saveCardClassification(cardInfo.name, cardInfo.autoClassification);
        }

        transactionStore.addTransactions(processedTransactions);

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
    const files = handleFileSelection(e.dataTransfer.files);
    return files;
  };

  return {
    uploadedFiles,
    isDragging,
    isProcessing,
    pendingFiles,
    handleFileSelection,
    processFiles,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    setPendingFiles
  };
};
