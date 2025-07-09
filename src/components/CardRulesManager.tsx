
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { cardClassificationService, CardClassificationRule } from "@/services/cardClassificationService";
import { useCategoryNames } from "@/hooks/useCategoryNames";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import CardRulesTable from "./CardRulesTable";
import AddCardRuleDialog from "./AddCardRuleDialog";
import EditCardRuleDialog from "./EditCardRuleDialog";
import DeleteCardRuleDialog from "./DeleteCardRuleDialog";
import MergeCardsDialog from "./MergeCardsDialog";

const CardRulesManager = () => {
  const [rules, setRules] = useState<CardClassificationRule[]>([]);
  const [loading, setLoading] = useState(true);
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
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadRules();
    }
  }, [user]);

  const loadRules = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const rulesData = await cardClassificationService.getAllRules();
      setRules(rulesData);
    } catch (error) {
      console.error('Error loading rules:', error);
      toast({
        title: "Error loading card rules",
        description: "There was an error loading your card classification rules",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddRule = async () => {
    if (!newCardName.trim()) return;

    try {
      const success = await cardClassificationService.saveCardClassification(newCardName.trim(), newClassification);
      if (success) {
        await loadRules();
        setShowAddDialog(false);
        setNewCardName('');
        setNewClassification('person1');
        toast({
          title: "Card rule added",
          description: `${newCardName} will be automatically classified as ${getCategoryDisplay(newClassification)}`,
        });
      }
    } catch (error) {
      console.error('Error adding rule:', error);
      toast({
        title: "Error adding rule",
        description: "There was an error adding the card rule",
        variant: "destructive",
      });
    }
  };

  const handleEditRule = async () => {
    if (!editingRule || !newCardName.trim()) return;

    try {
      const success = await cardClassificationService.updateCardName(editingRule.card_name, newCardName.trim());
      if (success) {
        await cardClassificationService.saveCardClassification(newCardName.trim(), newClassification);
        await loadRules();
        setShowEditDialog(false);
        setEditingRule(null);
        setNewCardName('');
        toast({
          title: "Card rule updated",
          description: `Rule updated successfully. Future transactions from this card will be classified as ${getCategoryDisplay(newClassification)}.`,
        });
      }
    } catch (error) {
      console.error('Error updating rule:', error);
      toast({
        title: "Error updating rule",
        description: "There was an error updating the card rule",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRule = async () => {
    if (!editingRule) return;

    try {
      const success = await cardClassificationService.deleteRule(editingRule.card_name);
      if (success) {
        await loadRules();
        setShowDeleteDialog(false);
        setEditingRule(null);
        toast({
          title: "Card rule deleted",
          description: `Rule for ${editingRule.card_name} has been removed`,
        });
      }
    } catch (error) {
      console.error('Error deleting rule:', error);
      toast({
        title: "Error deleting rule",
        description: "There was an error deleting the card rule",
        variant: "destructive",
      });
    }
  };

  const handleMergeCards = async () => {
    if (!editingRule || !mergeTarget.trim()) return;

    try {
      const success = await cardClassificationService.mergeCards(editingRule.card_name, mergeTarget.trim());
      if (success) {
        await loadRules();
        setShowMergeDialog(false);
        setEditingRule(null);
        setMergeTarget('');
        toast({
          title: "Cards merged",
          description: `${editingRule.card_name} has been merged into ${mergeTarget}`,
        });
      }
    } catch (error) {
      console.error('Error merging cards:', error);
      toast({
        title: "Error merging cards",
        description: "There was an error merging the cards",
        variant: "destructive",
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
    setNewCardName(rule.card_name);
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

  if (!user) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Please log in to manage card classification rules.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading card rules...</p>
      </div>
    );
  }

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
