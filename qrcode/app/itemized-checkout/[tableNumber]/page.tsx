'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ShoppingCart, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string | null;
  orderItemIds: string[]; // Track which OrderItem IDs this represents
}

export default function ItemizedCheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const tableNumber = params.tableNumber as string;
  const [availableItems, setAvailableItems] = useState<CartItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<{ [key: string]: number }>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [restaurant, setRestaurant] = useState<any>(null);

  useEffect(() => {
    // Fetch unpaid items from the database
    fetchUnpaidItems();
    // Fetch restaurant data for tax rates
    fetchRestaurantData();
  }, [tableNumber, router]);

  const fetchUnpaidItems = async () => {
    try {
      const response = await fetch(`/api/tables/${tableNumber}/unpaid-items`);
      if (response.ok) {
        const data = await response.json();
        if (data.items && data.items.length > 0) {
          setAvailableItems(data.items);
        } else {
          // No unpaid items - all items have been paid
          alert('All items have been paid for this table!');
          router.push(`/checkout/${tableNumber}`);
        }
      } else {
        router.push(`/checkout/${tableNumber}`);
      }
    } catch (error) {
      console.error('Error fetching unpaid items:', error);
      router.push(`/checkout/${tableNumber}`);
    }
  };

  const fetchRestaurantData = async () => {
    try {
      const response = await fetch(`/api/tables/${tableNumber}`);
      if (response.ok) {
        const data = await response.json();
        setRestaurant(data.restaurant);
      }
    } catch (error) {
      console.error('Error fetching restaurant data:', error);
    }
  };

  const handleQuantityChange = (menuItemId: string, quantity: number) => {
    setSelectedItems(prev => {
      if (quantity === 0) {
        // Remove item if quantity is 0
        const newSelected = { ...prev };
        delete newSelected[menuItemId];
        return newSelected;
      }
      return { ...prev, [menuItemId]: quantity };
    });
  };

  const calculateTotals = () => {
    const selectedItemsArray = availableItems.filter(item => selectedItems[item.menuItemId] > 0);
    const subtotal = selectedItemsArray.reduce((sum, item) => {
      const quantity = selectedItems[item.menuItemId];
      return sum + (item.price * quantity);
    }, 0);

    const taxRate = restaurant?.taxRate || 0.14;
    const serviceChargeRate = restaurant?.serviceChargeRate || 0.12;

    const tax = subtotal * taxRate;
    const serviceCharge = subtotal * serviceChargeRate;
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

      // Collect the orderItemIds for the selected quantities
      const orderItemIds: string[] = [];
      selectedItemsArray.forEach(item => {
        const selectedQty = selectedItems[item.menuItemId];
        // Take the first 'selectedQty' orderItemIds from this item
        const idsToAdd = item.orderItemIds.slice(0, selectedQty);
        orderItemIds.push(...idsToAdd);
      });

      // Store payment info in sessionStorage for payment page
      sessionStorage.setItem('partialPaymentItemIds', JSON.stringify(orderItemIds));
      sessionStorage.setItem('partialPaymentAmount', JSON.stringify({
        subtotal,
        tax,
        serviceCharge,
        total
      }));
      sessionStorage.setItem('partialPaymentTable', tableNumber);

      // Redirect to payment page with a special ID indicating partial payment
      router.push(`/payment/partial-${tableNumber}`);
    } catch (error) {
      console.error('Payment preparation error:', error);
      alert('Failed to prepare payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const { subtotal, tax, serviceCharge, total, selectedItemsArray } = calculateTotals();

  if (!availableItems.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link
              href={`/checkout/${tableNumber}`}
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Checkout</span>
            </Link>
            <h1 className="ml-8 text-2xl font-bold text-gray-900">Select Items to Pay</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                className={`card transition-all ${
                  isSelected ? 'border-2 border-purple-500 bg-purple-50' : ''
                }`}
              >
                <div className="flex items-center space-x-4">
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
                        Total: EGP {(item.price * selectedQty).toFixed(2)}
                      </p>
                    )}
                  </div>

                  {/* Quantity Dropdown Selector */}
                  <div className="flex flex-col items-end">
                    <label className="text-sm text-gray-600 mb-1">Quantity</label>
                    <select
                      value={selectedQty}
                      onChange={(e) => handleQuantityChange(item.menuItemId, parseInt(e.target.value))}
                      className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-lg font-semibold min-w-[80px]"
                    >
                      {Array.from({ length: item.quantity + 1 }, (_, i) => (
                        <option key={i} value={i}>
                          {i}
                        </option>
                      ))}
                    </select>
                  </div>
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
                <span>Tax ({((restaurant?.taxRate || 0.14) * 100).toFixed(0)}%)</span>
                <span>EGP {tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Service Charge ({((restaurant?.serviceChargeRate || 0.12) * 100).toFixed(0)}%)</span>
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
    </div>
  );
}
