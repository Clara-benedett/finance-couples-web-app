import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, Edit, Trash2, Merge, User, Share } from "lucide-react";
import { cardClassificationEngine, CardClassificationRule } from "@/utils/cardClassificationRules";
import { getCategoryNames } from "@/utils/categoryNames";
import { useToast } from "@/hooks/use-toast";
import SmartCardInput from "./SmartCardInput";
import { Info } from "lucide-react";

const CardRulesManager = () => {
  const [rules, setRules] = useState<CardClassificationRule[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showMergeDialog, setShowMergeDialog] = useState(false);
  const [editingRule, setEditingRule] = useState<CardClassificationRule | null>(null);
  const [newCardName, setNewCardName] = useState('');
  const [newClassification, setNewClassification] = useState<'person1' | 'person2' | 'shared'>('person1');
  const [mergeTarget, setMergeTarget] = useState('');
  
  const categoryNames = getCategoryNames();
  const { toast } = useToast();

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = () => {
    setRules(cardClassificationEngine.getAllRules());
  };

  const handleAddRule = () => {
    if (newCardName.trim()) {
      cardClassificationEngine.saveCardClassification(newCardName.trim(), newClassification);
      loadRules();
      setShowAddDialog(false);
      setNewCardName('');
      setNewClassification('person1');
      toast({
        title: "Card rule added",
        description: `${newCardName} will be automatically classified as ${getCategoryDisplay(newClassification)}`,
      });
    }
  };

  const handleEditRule = () => {
    if (editingRule && newCardName.trim()) {
      cardClassificationEngine.updateCardName(editingRule.cardName, newCardName.trim());
      cardClassificationEngine.saveCardClassification(newCardName.trim(), newClassification);
      loadRules();
      setShowEditDialog(false);
      setEditingRule(null);
      setNewCardName('');
      toast({
        title: "Card rule updated",
        description: `Rule updated successfully. Future transactions from this card will be classified as ${getCategoryDisplay(newClassification)}.`,
      });
    }
  };

  const handleDeleteRule = () => {
    if (editingRule) {
      cardClassificationEngine.deleteRule(editingRule.cardName);
      loadRules();
      setShowDeleteDialog(false);
      setEditingRule(null);
      toast({
        title: "Card rule deleted",
        description: `Rule for ${editingRule.cardName} has been removed`,
      });
    }
  };

  const handleMergeCards = () => {
    if (editingRule && mergeTarget.trim()) {
      cardClassificationEngine.mergeCards(editingRule.cardName, mergeTarget.trim());
      loadRules();
      setShowMergeDialog(false);
      setEditingRule(null);
      setMergeTarget('');
      toast({
        title: "Cards merged",
        description: `${editingRule.cardName} has been merged into ${mergeTarget}`,
      });
    }
  };

  const getCategoryDisplay = (classification: string) => {
    switch (classification) {
      case 'person1': return categoryNames.person1;
      case 'person2': return categoryNames.person2;
      case 'shared': return categoryNames.shared;
      default: return classification;
    }
  };

  const getCategoryIcon = (classification: string) => {
    switch (classification) {
      case 'person1': return <User className="w-4 h-4 text-blue-600" />;
      case 'person2': return <User className="w-4 h-4 text-green-600" />;
      case 'shared': return <Share className="w-4 h-4 text-purple-600" />;
      default: return null;
    }
  };

  const openEditDialog = (rule: CardClassificationRule) => {
    setEditingRule(rule);
    setNewCardName(rule.cardName);
    setNewClassification(rule.classification as 'person1' | 'person2' | 'shared');
    setShowEditDialog(true);
  };

  const openDeleteDialog = (rule: CardClassificationRule) => {
    setEditingRule(rule);
    setShowDeleteDialog(true);
  };

  const openMergeDialog = (rule: CardClassificationRule) => {
    setEditingRule(rule);
    setMergeTarget('');
    setShowMergeDialog(true);
  };

  return (
    <div className="space-y-4">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Card Classification Rules</h3>
          <p className="text-sm text-gray-600">
            {rules.length} {rules.length === 1 ? 'rule' : 'rules'} configured
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Rule
        </Button>
      </div>

      {/* Rules Table */}
      {rules.length > 0 ? (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Card Name</TableHead>
                <TableHead>Auto-Classification</TableHead>
                <TableHead>Last Used</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.map((rule) => (
                <TableRow key={rule.cardName}>
                  <TableCell className="font-medium">{rule.cardName}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(rule.classification)}
                      {getCategoryDisplay(rule.classification)}
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-500">
                    {new Date(rule.lastUsed).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(rule)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openMergeDialog(rule)}
                      >
                        <Merge className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDeleteDialog(rule)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>No card rules configured yet.</p>
          <p className="text-sm">Add your first rule to automatically classify transactions.</p>
        </div>
      )}

      {/* Add Rule Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Card Rule</DialogTitle>
            <DialogDescription>
              Create an automatic classification rule for a card or account.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <SmartCardInput
              value={newCardName}
              onChange={setNewCardName}
              placeholder="Enter card or account name"
            />

            <div className="space-y-3">
              <Label>Automatically classify as:</Label>
              <RadioGroup
                value={newClassification}
                onValueChange={(value: 'person1' | 'person2' | 'shared') => setNewClassification(value)}
                className="grid grid-cols-1 gap-3"
              >
                <Label htmlFor="add-person1" className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-blue-50 cursor-pointer">
                  <RadioGroupItem value="person1" id="add-person1" />
                  <User className="w-4 h-4 text-blue-600" />
                  <span className="font-normal text-blue-600">{categoryNames.person1}</span>
                </Label>
                <Label htmlFor="add-person2" className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-green-50 cursor-pointer">
                  <RadioGroupItem value="person2" id="add-person2" />
                  <User className="w-4 h-4 text-green-600" />
                  <span className="font-normal text-green-600">{categoryNames.person2}</span>
                </Label>
                <Label htmlFor="add-shared" className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-purple-50 cursor-pointer">
                  <RadioGroupItem value="shared" id="add-shared" />
                  <Share className="w-4 h-4 text-purple-600" />
                  <span className="font-normal text-purple-600">{categoryNames.shared}</span>
                </Label>
              </RadioGroup>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddRule} disabled={!newCardName.trim()}>
              Add Rule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Rule Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Card Rule</DialogTitle>
            <DialogDescription>
              Update the card name and classification rule. This will only affect future transactions from this card - your existing transactions will keep their current categories.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Informational Alert */}
            <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-700">
                <p className="font-medium">Important:</p>
                <p>Changing this rule will only affect new transactions. Previously categorized transactions will remain unchanged to protect your existing work.</p>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit-card-name">Card Name</Label>
              <Input
                id="edit-card-name"
                value={newCardName}
                onChange={(e) => setNewCardName(e.target.value)}
                placeholder="Enter card or account name"
              />
            </div>

            <div className="space-y-3">
              <Label>Automatically classify as:</Label>
              <RadioGroup
                value={newClassification}
                onValueChange={(value: 'person1' | 'person2' | 'shared') => setNewClassification(value)}
                className="grid grid-cols-1 gap-3"
              >
                <Label htmlFor="edit-person1" className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-blue-50 cursor-pointer">
                  <RadioGroupItem value="person1" id="edit-person1" />
                  <User className="w-4 h-4 text-blue-600" />
                  <span className="font-normal text-blue-600">{categoryNames.person1}</span>
                </Label>
                <Label htmlFor="edit-person2" className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-green-50 cursor-pointer">
                  <RadioGroupItem value="person2" id="edit-person2" />
                  <User className="w-4 h-4 text-green-600" />
                  <span className="font-normal text-green-600">{categoryNames.person2}</span>
                </Label>
                <Label htmlFor="edit-shared" className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-purple-50 cursor-pointer">
                  <RadioGroupItem value="shared" id="edit-shared" />
                  <Share className="w-4 h-4 text-purple-600" />
                  <span className="font-normal text-purple-600">{categoryNames.shared}</span>
                </Label>
              </RadioGroup>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditRule} disabled={!newCardName.trim()}>
              Update Rule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Card Rule</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the rule for "{editingRule?.cardName}"? 
              This action cannot be undone and future transactions from this card will not be automatically classified.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRule} className="bg-red-600 hover:bg-red-700">
              Delete Rule
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Merge Cards Dialog */}
      <Dialog open={showMergeDialog} onOpenChange={setShowMergeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Merge Card Rules</DialogTitle>
            <DialogDescription>
              Merge "{editingRule?.cardName}" into another card. The rule for "{editingRule?.cardName}" will be deleted.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <SmartCardInput
              value={mergeTarget}
              onChange={setMergeTarget}
              placeholder="Select target card to merge into"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMergeDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleMergeCards} disabled={!mergeTarget.trim()}>
              Merge Cards
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CardRulesManager;
