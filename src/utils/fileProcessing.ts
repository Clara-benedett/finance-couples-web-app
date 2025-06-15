
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
    
    // Simulate progress for parsing
    for (let progress = 0; progress <= 50; progress += 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      updateProgress(i, progress);
    }

    const { transactions: parsedTransactions } = await parseFile(file);
    
    // Add card info to each transaction
    const transactionsWithCardInfo = parsedTransactions.map(pt => ({
      ...pt,
      cardName: cardInfo.name,
      paidBy: cardInfo.paidBy,
      autoClassification: cardInfo.autoClassification
    }));
    
    allParsedTransactions.push(...transactionsWithCardInfo);
  }
  
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
