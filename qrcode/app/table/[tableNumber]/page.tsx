'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Star, Clock, Users } from 'lucide-react';
import MenuSection from '../../../components/MenuSection';
import CartSummary from '../../../components/CartSummary';
import { useOrder } from '../../../context/OrderContext';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  isAvailable: boolean;
  category: {
    id: string;
    name: string;
  };
}

interface Restaurant {
  id: string;
  name: string;
  address: string;
  phone: string;
}

interface Table {
  id: string;
  number: string;
  capacity: number;
  status: string;
}

export default function TablePage() {
  const params = useParams();
  const tableNumber = params.tableNumber as string;
  const { dispatch } = useOrder();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [table, setTable] = useState<Table | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTableData();
    loadUnpaidItems();
  }, [tableNumber]);

  const loadUnpaidItems = async () => {
    try {
      // First, clear the cart
      dispatch({ type: 'CLEAR_ORDER' });
      dispatch({ type: 'SET_TABLE', payload: tableNumber });

      // Fetch unpaid items for this table
      const response = await fetch(`/api/tables/${tableNumber}/unpaid-items`);
      if (response.ok) {
        const data = await response.json();
        if (data.items && data.items.length > 0) {
          // Convert unpaid items to OrderItem format
          const orderItems = data.items.map((item: any) => ({
            id: item.orderItemId,
            menuItem: {
              id: item.menuItemId,
              name: item.name,
              price: item.price,
              image: item.image
            },
            quantity: item.quantity,
            notes: ''
          }));

          // Load items into cart (replaces existing items)
          dispatch({ type: 'LOAD_ITEMS', payload: orderItems });
        }
      }
    } catch (err) {
      console.error('Error loading unpaid items:', err);
    }
  };

  const fetchTableData = async () => {
    try {
      setLoading(true);

      // Fetch table info and menu items
      const [tableResponse, menuResponse] = await Promise.all([
        fetch(`/api/tables/${tableNumber}`),
        fetch('/api/menu')
      ]);

      if (!tableResponse.ok || !menuResponse.ok) {
        throw new Error('Failed to load table data');
      }

      const tableData = await tableResponse.json();
      const menuData = await menuResponse.json();

      setTable(tableData.table);
      setRestaurant(tableData.restaurant);
      setMenuItems(menuData.items);

      // Extract unique categories with explicit typing
      const categoryNames = menuData.items.map((item: MenuItem) => item.category.name);
      const uniqueCategories: string[] = Array.from(new Set(categoryNames));
      setCategories(uniqueCategories);
      setSelectedCategory(uniqueCategories[0] || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 p-6 rounded-lg">
            <h1 className="text-xl font-bold text-red-800 mb-2">Error</h1>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const filteredItems = menuItems.filter(item => item.category.name === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Restaurant Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900">{restaurant?.name}</h1>
                <p className="text-gray-600 mt-1">{restaurant?.address}</p>
                
                <div className="flex items-center space-x-4 mt-3">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium">4.8</span>
                    <span className="text-sm text-gray-500">(324 reviews)</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">25-35 min</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Table {table?.number}</span>
                    <span className="text-xs text-gray-500">({table?.capacity} seats)</span>
                  </div>
                </div>
              </div>
              
              <CartSummary />
            </div>
          </div>
        </div>
      </header>

      {/* Category Navigation */}
      <div className="bg-white border-b sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 overflow-x-auto py-4">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-3 rounded-full whitespace-nowrap font-medium transition-all duration-200 ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-102'
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
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No items available in this category</p>
          </div>
        ) : (
          <MenuSection 
            title={selectedCategory}
            items={filteredItems}
            tableNumber={tableNumber}
            tableId={table?.id || ''}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500">
            <p className="mb-2">🍽️ Enjoying your meal?</p>
            <p className="text-sm">
              Call <a href={`tel:${restaurant?.phone}`} className="text-blue-600 hover:underline">
                {restaurant?.phone}
              </a> for assistance
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}