
import { parseFile } from "@/utils/fileParser";
import { transactionStore } from "@/store/transactionStore";
import { getCategoryNames } from "@/utils/categoryNames";
import { cardClassificationEngine } from "@/utils/cardClassificationRules";
import { UploadedFile, CardInfo } from "@/types/upload";

export const generateId = () => Math.random().toString(36).substr(2, 9);

export const parseAllFiles = async (
  files: File[], 
  cardInfos: CardInfo[],
  updateProgress: (fileIndex: number, progress: number) => void
): Promise<any[]> => {
  let allParsedTransactions: any[] = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const cardInfo = cardInfos[i];
    
    try {
      console.log(`Processing file ${i + 1}/${files.length}: ${file.name}`);
      
      // Update progress for parsing phase (0-60%)
      updateProgress(i, 10);
      
      const parseResult = await parseFile(file);
      console.log(`Successfully parsed file ${file.name}:`, parseResult);
      
      // Update progress after parsing (60%)
      updateProgress(i, 60);
      
      // Add card info to each transaction
      const transactionsWithCardInfo = parseResult.transactions.map(pt => ({
        ...pt,
        cardName: cardInfo.name,
        paidBy: cardInfo.paidBy,
        autoClassification: cardInfo.autoClassification
      }));
      
      // Update progress after processing (80%)
      updateProgress(i, 80);
      
      allParsedTransactions.push(...transactionsWithCardInfo);
      
      // Complete this file (100%)
      updateProgress(i, 100);
      
      console.log(`Completed processing file ${file.name}, added ${transactionsWithCardInfo.length} transactions`);
    } catch (error) {
      console.error(`Error processing file ${file.name}:`, error);
      throw new Error(`Failed to process ${file.name}: ${(error as Error).message}`);
    }
  }
  
  console.log(`All files processed successfully. Total transactions: ${allParsedTransactions.length}`);
  return allParsedTransactions;
};

export const processTransactions = (transactions: any[], cardInfos: CardInfo[]) => {
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

  return { processedTransactions, totalAutoClassified };
};

export const saveCardClassificationRules = (cardInfos: CardInfo[]) => {
  cardInfos.forEach(cardInfo => {
    if (cardInfo.autoClassification && cardInfo.autoClassification !== 'skip') {
      cardClassificationEngine.saveCardClassification(cardInfo.name, cardInfo.autoClassification);
    }
  });
};

export const updateFileStatuses = (
  fileUploads: UploadedFile[],
  processedTransactions: any[],
  cardInfos: CardInfo[],
  setUploadedFiles: (updater: (prev: UploadedFile[]) => UploadedFile[]) => void
) => {
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
};
