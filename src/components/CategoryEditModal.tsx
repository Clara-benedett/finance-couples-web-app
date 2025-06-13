
import CategorySetup from "@/components/CategorySetup";

interface CategoryEditModalProps {
  isOpen: boolean;
  onComplete: (names: any) => void;
  onCancel: () => void;
}

const CategoryEditModal = ({ isOpen, onComplete, onCancel }: CategoryEditModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="max-w-2xl w-full">
        <CategorySetup
          onComplete={onComplete}
          isEditing={true}
          onCancel={onCancel}
        />
      </div>
    </div>
  );
};

export default CategoryEditModal;
