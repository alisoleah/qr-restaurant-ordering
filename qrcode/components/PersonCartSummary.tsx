'use client';

import { useState, useEffect } from 'react';
import { ShoppingCart, X, Plus, Minus, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CartItem {
  id: string;
  menuItemId: string;
  menuItemName: string;
  price: number;
  quantity: number;
  notes?: string;
}

interface PersonCartSummaryProps {
  sessionId: string;
  personNumber: number;
  personId: string;
}

export default function PersonCartSummary({ sessionId, personNumber, personId }: PersonCartSummaryProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCart();
  }, [personId]);

  const fetchCart = async () => {
    try {
      const response = await fetch(`/api/bill-split/cart/${personId}`);
      if (response.ok) {
        const data = await response.json();
        setCartItems(data.items || []);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      const response = await fetch(`/api/bill-split/cart/${personId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemId, quantity }),
      });

      if (response.ok) {
        fetchCart(); // Refresh cart
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/bill-split/cart/${personId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemId }),
      });

      if (response.ok) {
        fetchCart(); // Refresh cart
      }
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const proceedToCheckout = () => {
    setIsOpen(false);
    router.push(`/person-checkout/${sessionId}/${personNumber}`);
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      {/* Cart Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="relative p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-lg"
      >
        <ShoppingCart className="h-6 w-6" />
        {totalItems > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
            {totalItems}
          </span>
        )}
      </button>

      {/* Cart Sidebar */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsOpen(false)} />
          
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b bg-blue-50">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-blue-600" />
                  <h2 className="text-lg font-semibold">Your Personal Order</h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-blue-100 rounded-full"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-4">
                {cartItems.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Your cart is empty</p>
                    <p className="text-sm">Add items from the menu</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center space-x-3 p-3 border rounded-lg bg-gray-50">
                        <div className="flex-1">
                          <h3 className="font-medium text-sm">{item.menuItemName}</h3>
                          <p className="text-gray-600 text-xs">EGP {item.price.toFixed(2)} each</p>
                          {item.notes && (
                            <p className="text-gray-500 text-xs italic">Note: {item.notes}</p>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          
                          <span className="text-sm font-medium w-6 text-center">
                            {item.quantity}
                          </span>
                          
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-1 hover:bg-red-100 text-red-600 rounded"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Order Summary */}
              {cartItems.length > 0 && (
                <div className="border-t p-4 bg-gray-50">
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal ({totalItems} items)</span>
                      <span>EGP {subtotal.toFixed(2)}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      * Tax and service charge will be calculated at checkout
                    </div>
                  </div>
                  
                  <button
                    onClick={proceedToCheckout}
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Processing...' : `Proceed to Checkout - EGP ${subtotal.toFixed(2)}`}
                  </button>
                  
                  <p className="text-xs text-center text-gray-500 mt-2">
                    You'll only pay for your own items
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}