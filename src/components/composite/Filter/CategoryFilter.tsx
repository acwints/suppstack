'use client';

import { FaFilter } from 'react-icons/fa';
import { Select } from '@/components/ui';
import type { Supplement } from '@/types';
import { SUPPLEMENT_CATEGORIES } from '@/types';
import { groupSupplementsForBrowse } from '@/lib/catalog/supplement-families';

export interface CategoryFilterProps {
  supplements: Supplement[];
  value: string;
  onChange: (value: string) => void;
}

export function CategoryFilter({ supplements, value, onChange }: CategoryFilterProps) {
  // Counts reflect browse tiles: an ingredient family (e.g. Creatine with
  // Monohydrate and HCl forms) counts once, matching the visible grid.
  const countForCategory = (categoryId: string) => {
    if (categoryId === 'all') return groupSupplementsForBrowse(supplements).length;

    const category = SUPPLEMENT_CATEGORIES.find((item) => item.id === categoryId);
    if (!category) return 0;

    const matching = supplements.filter((supplement) => {
      const name = supplement.supplement_name.toLowerCase();
      const categoryName = supplement.category?.toLowerCase() ?? '';

      return (
        categoryName === category.name.toLowerCase() ||
        category.keywords.some((keyword) => name.includes(keyword) || categoryName.includes(keyword))
      );
    });

    return groupSupplementsForBrowse(matching).length;
  };

  // Full health & wellness range in the dropdown, hiding empty categories.
  const categories = SUPPLEMENT_CATEGORIES.map((category) => ({
    id: category.id,
    name: category.name,
    count: countForCategory(category.id),
  })).filter((category) => category.id === 'all' || category.count > 0);

  const options = categories.map(cat => ({
    value: cat.id,
    label: `${cat.name} (${cat.count})`,
  }));

  return (
    <div className="flex items-center gap-3">
      <FaFilter className="text-gray-400" />
      <Select
        options={options}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        selectSize="md"
        fullWidth={false}
      />
    </div>
  );
}

export default CategoryFilter;
