
export interface CategoryNames {
  person1: string;
  person2: string;
  shared: string;
}

const STORAGE_KEY = 'categoryNames';

export const getCategoryNames = (): CategoryNames => {
  const savedNames = localStorage.getItem(STORAGE_KEY);
  if (savedNames) {
    try {
      return JSON.parse(savedNames);
    } catch (error) {
      console.error('Error loading category names:', error);
    }
  }
  
  return {
    person1: 'Person A',
    person2: 'Person B',
    shared: 'Shared'
  };
};

export const setCategoryNames = (names: CategoryNames): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(names));
};

export const getCategoryDisplayName = (category: string): string => {
  if (category === 'UNCLASSIFIED' || !category) {
    return 'Unclassified';
  }
  
  const names = getCategoryNames();
  
  switch (category) {
    case 'personal':
      return names.person1;
    case 'person2':
      return names.person2;
    case 'shared':
      return names.shared;
    default:
      return category;
  }
};
