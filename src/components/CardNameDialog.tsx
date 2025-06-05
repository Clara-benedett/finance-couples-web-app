
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
  onConfirm: (cardName: string) => void;
  onCancel: () => void;
  fileNames: string[];
}

const CardNameDialog = ({ isOpen, onConfirm, onCancel, fileNames }: CardNameDialogProps) => {
  const [cardName, setCardName] = useState('');

  const handleConfirm = () => {
    if (cardName.trim()) {
      onConfirm(cardName.trim());
      setCardName('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && cardName.trim()) {
      handleConfirm();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-600" />
            Card/Account Name
          </DialogTitle>
          <DialogDescription>
            What's the name of the card or account for these transactions?
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            <strong>Files to process:</strong>
            <ul className="mt-1 ml-4 list-disc">
              {fileNames.map((name, index) => (
                <li key={index}>{name}</li>
              ))}
            </ul>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="cardName">Card/Account Name</Label>
            <Input
              id="cardName"
              placeholder="e.g. Chase Sapphire, Bank of America Checking"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              onKeyPress={handleKeyPress}
              autoFocus
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!cardName.trim()}
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
