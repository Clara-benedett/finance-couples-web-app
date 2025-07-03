import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabaseTransactionStore } from '@/store/supabaseTransactionStore';
import { getCategoryNames, getCategoryNamesFromProfile, CategoryNames } from '@/utils/categoryNames';

export const useCategoryNames = () => {
  const { user } = useAuth();
  const [categoryNames, setCategoryNamesState] = useState<CategoryNames>(getCategoryNames());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategoryNames = async () => {
      if (user) {
        try {
          const categoryData = await supabaseTransactionStore.getCategoryNames();
          const dbCategoryNames = getCategoryNamesFromProfile(
            categoryData.person1_name,
            categoryData.person2_name,
            categoryData.shared_name
          );
          setCategoryNamesState(dbCategoryNames);
        } catch (error) {
          console.error('Error loading category names:', error);
          setCategoryNamesState(getCategoryNames());
        }
      } else {
        setCategoryNamesState(getCategoryNames());
      }
      setLoading(false);
    };

    loadCategoryNames();
  }, [user]);

  return { categoryNames, loading };
};