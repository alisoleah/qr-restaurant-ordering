'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import MenuSection from '../../../components/MenuSection';
import CartSummary from '../../../components/CartSummary';
import { menuItems } from '../../../data/menu';

export default function TablePage() {
  const params = useParams();
  const tableNumber = params.tableNumber as string;
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  useEffect(() => {
    const uniqueCategories = [...new Set(menuItems.map(item => item.category))];
    setCategories(uniqueCategories);
    setSelectedCategory(uniqueCategories[0] || '');
  }, []);

  const filteredItems = menuItems.filter(item => item.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Table {tableNumber}</h1>
              <p className="text-sm text-gray-600">Fine Dining Restaurant</p>
            </div>
            <CartSummary />
          </div>
        </div>
      </header>

      {/* Category Navigation */}
      <div className="bg-white border-b sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 overflow-x-auto py-4">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <MenuSection 
          title={selectedCategory}
          items={filteredItems}
          tableNumber={tableNumber}
        />
      </main>
    </div>
  );
}