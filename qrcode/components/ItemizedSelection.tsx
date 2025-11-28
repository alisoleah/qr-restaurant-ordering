'use client';

import { useState } from 'react';
import { Check, ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface ItemizedSelectionProps {
  availableItems: CartItem[];
  sessionId: string;
  personNumber: number;
  personId: string;
  tableNumber: string;
  restaurant: {
    taxRate: number;
    serviceChargeRate: number;
  };
}

export default function ItemizedSelection({
  availableItems,
  sessionId,
  personNumber,
  personId,
  tableNumber,
  restaurant
}: ItemizedSelectionProps) {
  const router = useRouter();
  const [selectedItems, setSelectedItems] = useState<{ [key: string]: number }>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const handleItemToggle = (menuItemId: string, maxQuantity: number) => {
    setSelectedItems(prev => {
      const current = prev[menuItemId] || 0;
      if (current === 0) {
        // Select item with quantity 1
        return { ...prev, [menuItemId]: 1 };
      } else if (current < maxQuantity) {
        // Increase quantity
        return { ...prev, [menuItemId]: current + 1 };
      } else {
        // Deselect item
        const newSelected = { ...prev };
        delete newSelected[menuItemId];
        return newSelected;
      }
    });
  };

  const calculateTotals = () => {
    const selectedItemsArray = availableItems.filter(item => selectedItems[item.menuItemId] > 0);
    const subtotal = selectedItemsArray.reduce((sum, item) => {
      const quantity = selectedItems[item.menuItemId];
      return sum + (item.price * quantity);
    }, 0);

    const tax = subtotal * restaurant.taxRate;
    const serviceCharge = subtotal * restaurant.serviceChargeRate;
    const total = subtotal + tax + serviceCharge;

    return { subtotal, tax, serviceCharge, total, selectedItemsArray };
  };

  const handleProceedToPayment = async () => {
    const { selectedItemsArray, subtotal, tax, serviceCharge, total } = calculateTotals();

    if (selectedItemsArray.length === 0) {
      alert('Please select at least one item to pay for');
      return;
    }

    try {
      setIsProcessing(true);

      // Create order with selected items
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tableNumber,
          personId,
          billSplitId: sessionId,
          items: selectedItemsArray.map(item => ({
            menuItemId: item.menuItemId,
            quantity: selectedItems[item.menuItemId],
            unitPrice: item.price,
            totalPrice: item.price * selectedItems[item.menuItemId]
          })),
          subtotal,
          tax,
          serviceCharge,
          tip: 0,
          total,
          paymentMethod: 'card'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const data = await response.json();
      router.push(`/payment/${data.order.id}`);
    } catch (error) {
      console.error('Order creation error:', error);
      alert('Failed to create order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const { subtotal, tax, serviceCharge, total, selectedItemsArray } = calculateTotals();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6 p-6 bg-purple-50 rounded-lg border border-purple-200">
        <div className="flex items-center space-x-2 mb-2">
          <ShoppingCart className="h-6 w-6 text-purple-600" />
          <h2 className="font-semibold text-xl text-purple-900">Select Items to Pay For</h2>
        </div>
        <p className="text-purple-800 text-sm">
          Choose which items you want to pay for from the table's order. You can select multiple quantities of each item.
        </p>
      </div>

      {/* Available Items */}
      <div className="space-y-4 mb-6">
        {availableItems.map((item) => {
          const selectedQty = selectedItems[item.menuItemId] || 0;
          const isSelected = selectedQty > 0;

          return (
            <div
              key={item.menuItemId}
              onClick={() => handleItemToggle(item.menuItemId, item.quantity)}
              className={`card cursor-pointer transition-all ${
                isSelected ? 'border-2 border-purple-500 bg-purple-50' : 'hover:shadow-lg'
              }`}
            >
              <div className="flex items-center space-x-4">
                {/* Checkbox */}
                <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                  isSelected ? 'bg-purple-600 border-purple-600' : 'border-gray-300'
                }`}>
                  {isSelected && <Check className="w-4 h-4 text-white" />}
                </div>

                {/* Item Image */}
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                )}

                {/* Item Details */}
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900">{item.name}</h3>
                  <p className="text-gray-600 text-sm">
                    EGP {item.price.toFixed(2)} each × Available: {item.quantity}
                  </p>
                  {isSelected && (
                    <p className="text-purple-700 font-medium mt-1">
                      Selected: {selectedQty} × EGP {item.price.toFixed(2)} = EGP {(item.price * selectedQty).toFixed(2)}
                    </p>
                  )}
                </div>

                {/* Quantity Selector */}
                {isSelected && (
                  <div className="text-2xl font-bold text-purple-600">
                    {selectedQty}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      {selectedItemsArray.length > 0 && (
        <div className="card bg-gray-50 mb-6">
          <h3 className="font-semibold text-lg mb-4">Your Bill Summary</h3>

          <div className="space-y-2 mb-4">
            {selectedItemsArray.map((item) => (
              <div key={item.menuItemId} className="flex justify-between text-sm">
                <span>{selectedItems[item.menuItemId]}× {item.name}</span>
                <span>EGP {(item.price * selectedItems[item.menuItemId]).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="border-t pt-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>EGP {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax ({(restaurant.taxRate * 100).toFixed(0)}%)</span>
              <span>EGP {tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Service Charge ({(restaurant.serviceChargeRate * 100).toFixed(0)}%)</span>
              <span>EGP {serviceCharge.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total</span>
              <span>EGP {total.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={handleProceedToPayment}
            disabled={isProcessing}
            className="w-full mt-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium py-4 rounded-lg hover:from-purple-700 hover:to-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Processing...' : `Proceed to Payment - EGP ${total.toFixed(2)}`}
          </button>
        </div>
      )}

      {selectedItemsArray.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-gray-500">No items selected yet. Click on items above to select them.</p>
        </div>
      )}
    </div>
  );
}
