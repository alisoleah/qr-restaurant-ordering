'use client';

import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { MenuItem } from '../types';
import { useOrder } from '../context/OrderContext';

interface MenuSectionProps {
  title: string;
  items: MenuItem[];
  tableNumber: string;
}

export default function MenuSection({ title, items, tableNumber }: MenuSectionProps) {
  const { dispatch } = useOrder();
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const updateQuantity = (itemId: string, quantity: number) => {
    setQuantities(prev => ({
      ...prev,
      [itemId]: Math.max(0, quantity)
    }));
  };

  const addToCart = (menuItem: MenuItem) => {
    const quantity = quantities[menuItem.id] || 1;
    dispatch({ 
      type: 'ADD_ITEM', 
      payload: { menuItem, quantity } 
    });
    dispatch({ type: 'SET_TABLE', payload: tableNumber });
    
    // Reset quantity after adding to cart
    setQuantities(prev => ({
      ...prev,
      [menuItem.id]: 0
    }));
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-900">{title}</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div key={item.id} className="card hover:shadow-md transition-shadow">
            {item.image && (
              <img 
                src={item.image} 
                alt={item.name}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
            )}
            
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">{item.name}</h3>
              <p className="text-gray-600 text-sm mb-4">{item.description}</p>
              
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-gray-900">
                  EGP {item.price.toFixed(2)}
                </span>
                
                {!item.available && (
                  <span className="text-red-500 font-medium">Unavailable</span>
                )}
              </div>
            </div>
            
            {item.available && (
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => updateQuantity(item.id, (quantities[item.id] || 1) - 1)}
                    className="p-1 rounded-full border hover:bg-gray-100"
                    disabled={!quantities[item.id]}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  
                  <span className="w-8 text-center font-medium">
                    {quantities[item.id] || 1}
                  </span>
                  
                  <button
                    onClick={() => updateQuantity(item.id, (quantities[item.id] || 1) + 1)}
                    className="p-1 rounded-full border hover:bg-gray-100"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                
                <button
                  onClick={() => addToCart(item)}
                  className="btn-primary text-sm px-4 py-2"
                >
                  Add to Cart
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}