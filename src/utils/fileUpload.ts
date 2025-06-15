
import { UploadedFile } from "@/types/upload";

export const validateFiles = (files: FileList | null) => {
  if (!files) return { valid: false, files: [] };

  const validFiles = Array.from(files).filter(file => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    return ['csv', 'xlsx', 'xls'].includes(extension || '');
  });

  if (validFiles.length === 0) {
    return { valid: false, files: [], error: "Please upload CSV or Excel files only." };
  }

  if (validFiles.length > 5) {
    return { valid: false, files: [], error: "Please upload a maximum of 5 files at once." };
  }

  return { valid: true, files: validFiles };
};

export const createUploadFiles = (files: File[], cardNames: string[]): UploadedFile[] => {
  return files.map((file, index) => ({
    file,
    status: 'uploading' as const,
    progress: 0,
    cardName: cardNames[index]
  }));
};

export const handleFileError = (
  fileUpload: UploadedFile,
  error: Error,
  setUploadedFiles: (updater: (prev: UploadedFile[]) => UploadedFile[]) => void
) => {
  const errorMessage = error.message || 'Unknown error occurred';
  
  setUploadedFiles(prev => 
    prev.map(f => 
      f.file === fileUpload.file 
        ? { ...f, status: 'error' as const, error: errorMessage }
        : f
    )
  );
  
  return errorMessage;
};
