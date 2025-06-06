
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
import { Zap } from "lucide-react";

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
            <Zap className="w-5 h-5 text-yellow-500" />
            Auto-categorize future transactions?
          </DialogTitle>
          <DialogDescription>
            Auto-categorize <strong>{merchantName}</strong> as <strong>{categoryName}</strong>? 
            You can always change individual transactions manually.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onDecline}>
            Not now
          </Button>
          <Button 
            onClick={onAccept}
            className="bg-yellow-500 hover:bg-yellow-600 text-white"
          >
            <Zap className="w-4 h-4 mr-2" />
            Create rule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RuleSuggestionDialog;
