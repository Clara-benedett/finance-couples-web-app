
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
import { Lightning } from "lucide-react";

interface RuleSuggestionDialogProps {
  isOpen: boolean;
  merchantName: string;
  categoryName: string;
  onAccept: () => void;
  onDecline: () => void;
}

const RuleSuggestionDialog = ({ 
  isOpen, 
  merchantName, 
  categoryName, 
  onAccept, 
  onDecline 
}: RuleSuggestionDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onDecline}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lightning className="w-5 h-5 text-yellow-500" />
            Create Auto-Categorization Rule?
          </DialogTitle>
          <DialogDescription>
            You've categorized <strong>{merchantName}</strong> as <strong>{categoryName}</strong> multiple times.
            Would you like to automatically categorize all future {merchantName} transactions as {categoryName}?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onDecline}>
            No, not now
          </Button>
          <Button 
            onClick={onAccept}
            className="bg-yellow-500 hover:bg-yellow-600 text-white"
          >
            <Lightning className="w-4 h-4 mr-2" />
            Yes, create rule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RuleSuggestionDialog;
