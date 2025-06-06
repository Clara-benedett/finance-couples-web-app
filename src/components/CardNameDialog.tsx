
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard } from "lucide-react";

interface CardNameDialogProps {
  isOpen: boolean;
  onConfirm: (cardNames: string[]) => void;
  onCancel: () => void;
  fileNames: string[];
}

const CardNameDialog = ({ isOpen, onConfirm, onCancel, fileNames }: CardNameDialogProps) => {
  const [cardNames, setCardNames] = useState<string[]>([]);

  // Initialize card names array when dialog opens
  useState(() => {
    if (isOpen && fileNames.length > 0) {
      setCardNames(new Array(fileNames.length).fill(''));
    }
  });

  const handleCardNameChange = (index: number, value: string) => {
    const newCardNames = [...cardNames];
    newCardNames[index] = value;
    setCardNames(newCardNames);
  };

  const handleConfirm = () => {
    const trimmedNames = cardNames.map(name => name.trim());
    if (trimmedNames.every(name => name.length > 0)) {
      onConfirm(trimmedNames);
      setCardNames([]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Focus next input or submit if it's the last one
      if (index < fileNames.length - 1) {
        const nextInput = document.getElementById(`cardName-${index + 1}`);
        nextInput?.focus();
      } else if (cardNames.every(name => name.trim().length > 0)) {
        handleConfirm();
      }
    }
  };

  const allFieldsFilled = cardNames.length === fileNames.length && 
    cardNames.every(name => name.trim().length > 0);

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-600" />
            Card/Account Names ({fileNames.length} files)
          </DialogTitle>
          <DialogDescription>
            Please provide the card or account name for each file you're uploading.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {fileNames.map((fileName, index) => (
            <div key={index} className="space-y-2">
              <div className="text-sm text-gray-600">
                <strong>File {index + 1}:</strong> {fileName}
              </div>
              <div className="space-y-1">
                <Label htmlFor={`cardName-${index}`}>Card/Account Name</Label>
                <Input
                  id={`cardName-${index}`}
                  placeholder="e.g. Chase Sapphire, Bank of America Checking"
                  value={cardNames[index] || ''}
                  onChange={(e) => handleCardNameChange(index, e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  autoFocus={index === 0}
                />
              </div>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!allFieldsFilled}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Process Files
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CardNameDialog;
