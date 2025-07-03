
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { cardClassificationEngine, CardClassificationRule } from "@/utils/cardClassificationRules";
import { useCategoryNames } from "@/hooks/useCategoryNames";
import { useToast } from "@/hooks/use-toast";
import CardRulesTable from "./CardRulesTable";
import AddCardRuleDialog from "./AddCardRuleDialog";
import EditCardRuleDialog from "./EditCardRuleDialog";
import DeleteCardRuleDialog from "./DeleteCardRuleDialog";
import MergeCardsDialog from "./MergeCardsDialog";

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
  
  const { categoryNames } = useCategoryNames();
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
      <CardRulesTable
        rules={rules}
        onEdit={openEditDialog}
        onDelete={openDeleteDialog}
        onMerge={openMergeDialog}
      />

      {/* Add Rule Dialog */}
      <AddCardRuleDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        cardName={newCardName}
        onCardNameChange={setNewCardName}
        classification={newClassification}
        onClassificationChange={setNewClassification}
        onAdd={handleAddRule}
      />

      {/* Edit Rule Dialog */}
      <EditCardRuleDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        cardName={newCardName}
        onCardNameChange={setNewCardName}
        classification={newClassification}
        onClassificationChange={setNewClassification}
        onUpdate={handleEditRule}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteCardRuleDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        rule={editingRule}
        onDelete={handleDeleteRule}
      />

      {/* Merge Cards Dialog */}
      <MergeCardsDialog
        open={showMergeDialog}
        onOpenChange={setShowMergeDialog}
        rule={editingRule}
        mergeTarget={mergeTarget}
        onMergeTargetChange={setMergeTarget}
        onMerge={handleMergeCards}
      />
    </div>
  );
};

export default CardRulesManager;
