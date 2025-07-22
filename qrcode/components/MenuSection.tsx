'use client';

import { useState } from 'react';
import { Plus, Minus, ShoppingCart, Heart } from 'lucide-react';
import { useOrder } from '../context/OrderContext';
import Image from 'next/image';

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

interface MenuSectionProps {
  title: string;
  items: MenuItem[];
  tableNumber: string;
  tableId: string;
}

export default function MenuSection({ title, items, tableNumber, tableId }: MenuSectionProps) {
  const { dispatch } = useOrder();
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const updateQuantity = (itemId: string, quantity: number) => {
    setQuantities(prev => ({
      ...prev,
      [itemId]: Math.max(0, quantity)
    }));
  };

  const toggleFavorite = (itemId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(itemId)) {
        newFavorites.delete(itemId);
      } else {
        newFavorites.add(itemId);
      }
      return newFavorites;
    });
  };

  const addToCart = (menuItem: MenuItem) => {
    const quantity = quantities[menuItem.id] || 1;
    dispatch({ 
      type: 'ADD_ITEM', 
      payload: { 
        menuItem: {
          id: menuItem.id,
          name: menuItem.name,
          description: menuItem.description,
          price: menuItem.price,
          category: menuItem.category.name,
          image: menuItem.image,
          available: menuItem.isAvailable
        }, 
        quantity 
      } 
    });
    dispatch({ type: 'SET_TABLE', payload: tableNumber });
    
    // Reset quantity after adding to cart
    setQuantities(prev => ({
      ...prev,
      [menuItem.id]: 0
    }));

    // Show success feedback
    const button = document.querySelector(`[data-item-id="${menuItem.id}"]`);
    if (button) {
      button.classList.add('animate-pulse');
      setTimeout(() => {
        button.classList.remove('animate-pulse');
      }, 500);
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <ShoppingCart className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No items available</h3>
        <p className="text-gray-500">Check back later for new items in this category.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <span className="text-sm text-gray-500">{items.length} items</span>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 group">
            {/* Image */}
            <div className="relative h-48 bg-gray-100">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <ShoppingCart className="h-12 w-12 text-gray-300" />
                </div>
              )}
              
              {/* Favorite Button */}
              <button
                onClick={() => toggleFavorite(item.id)}
                className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors"
              >
                <Heart 
                  className={`h-4 w-4 transition-colors ${
                    favorites.has(item.id) 
                      ? 'text-red-500 fill-current' 
                      : 'text-gray-400'
                  }`} 
                />
              </button>

              {/* Availability Badge */}
              {!item.isAvailable && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Out of Stock
                  </span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {item.name}
                </h3>
                <span className="text-xl font-bold text-blue-600 ml-2">
                  EGP {item.price.toFixed(2)}
                </span>
              </div>
              
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {item.description}
              </p>

              {/* Add to Cart Section */}
              {item.isAvailable ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 bg-gray-50 rounded-lg p-1">
                    <button
                      onClick={() => updateQuantity(item.id, (quantities[item.id] || 1) - 1)}
                      className="p-2 hover:bg-white rounded-md transition-colors disabled:opacity-50"
                      disabled={!quantities[item.id] || quantities[item.id] <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    
                    <span className="w-8 text-center font-semibold">
                      {quantities[item.id] || 1}
                    </span>
                    
                    <button
                      onClick={() => updateQuantity(item.id, (quantities[item.id] || 1) + 1)}
                      className="p-2 hover:bg-white rounded-md transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <button
                    data-item-id={item.id}
                    onClick={() => addToCart(item)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    <span>Add</span>
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <span className="text-red-500 font-medium">Currently Unavailable</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}