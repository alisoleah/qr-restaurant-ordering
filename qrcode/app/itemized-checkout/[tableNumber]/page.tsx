'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ShoppingCart, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface CartItem {
  orderItemId: string; // The specific OrderItem ID
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  totalPrice: number;
  image?: string | null;
}

export default function ItemizedCheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const tableNumber = params.tableNumber as string;
  const [availableItems, setAvailableItems] = useState<CartItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<{ [orderItemId: string]: boolean }>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [restaurant, setRestaurant] = useState<any>(null);
  const [tip, setTip] = useState(0);
  const [tipType, setTipType] = useState<'percentage' | 'fixed'>('percentage');
  const [customTip, setCustomTip] = useState('');

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

  const handleItemToggle = (orderItemId: string, isSelected: boolean) => {
    setSelectedItems(prev => ({
      ...prev,
      [orderItemId]: isSelected
    }));
  };

  const handleTipChange = (percentage: number) => {
    setTipType('percentage');
    const selectedItemsArray = availableItems.filter(item => selectedItems[item.orderItemId]);
    const subtotal = selectedItemsArray.reduce((sum, item) => sum + item.totalPrice, 0);
    setTip(subtotal * (percentage / 100));
    setCustomTip('');
  };

  const handleCustomTipChange = (value: string) => {
    setCustomTip(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setTip(numValue);
      setTipType('fixed');
    } else {
      setTip(0);
    }
  };

  const calculateTotals = () => {
    const selectedItemsArray = availableItems.filter(item => selectedItems[item.orderItemId]);
    const subtotal = selectedItemsArray.reduce((sum, item) => sum + item.totalPrice, 0);

    const taxRate = restaurant?.taxRate || 0.14;
    const serviceChargeRate = restaurant?.serviceChargeRate || 0.12;

    const tax = subtotal * taxRate;
    const serviceCharge = subtotal * serviceChargeRate;
    const total = subtotal + tax + serviceCharge + tip;

    return { subtotal, tax, serviceCharge, tip, total, selectedItemsArray };
  };

  const handleProceedToPayment = async () => {
    const { selectedItemsArray, subtotal, tax, serviceCharge, tip: calculatedTip, total } = calculateTotals();

    if (selectedItemsArray.length === 0) {
      alert('Please select at least one item to pay for');
      return;
    }

    try {
      setIsProcessing(true);

      // Collect the orderItemIds for selected items
      const orderItemIds = selectedItemsArray.map(item => item.orderItemId);

      // Store payment info in sessionStorage for payment page
      sessionStorage.setItem('partialPaymentItemIds', JSON.stringify(orderItemIds));
      sessionStorage.setItem('partialPaymentAmount', JSON.stringify({
        subtotal,
        tax,
        serviceCharge,
        tip: calculatedTip,
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
            Select the items you want to pay for from the table's order. Each item can be paid individually.
          </p>
        </div>

        {/* Available Items */}
        <div className="space-y-4 mb-6">
          {availableItems.map((item) => {
            const isSelected = selectedItems[item.orderItemId] || false;

            return (
              <div
                key={item.orderItemId}
                className={`card transition-all ${
                  isSelected ? 'border-2 border-purple-500 bg-purple-50' : ''
                }`}
              >
                <div className="flex items-center space-x-4">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => handleItemToggle(item.orderItemId, e.target.checked)}
                    className="w-6 h-6 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />

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
                      EGP {item.price.toFixed(2)} × {item.quantity}
                    </p>
                    <p className="text-purple-700 font-medium mt-1">
                      Total: EGP {item.totalPrice.toFixed(2)}
                    </p>
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
                <div key={item.orderItemId} className="flex justify-between text-sm">
                  <span>{item.quantity}× {item.name}</span>
                  <span>EGP {item.totalPrice.toFixed(2)}</span>
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
              {tip > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Tip</span>
                  <span>EGP {tip.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total</span>
                <span>EGP {total.toFixed(2)}</span>
              </div>
            </div>

            {/* Tip Section */}
            <div className="border-t pt-4 mt-4">
              <h4 className="font-semibold text-gray-900 mb-3">Add Tip (Optional)</h4>
              <div className="grid grid-cols-4 gap-2 mb-3">
                <button
                  onClick={() => handleTipChange(10)}
                  className={`px-3 py-2 rounded-lg border-2 font-medium transition ${
                    tipType === 'percentage' && tip === subtotal * 0.1
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-300 hover:border-green-500'
                  }`}
                >
                  10%
                </button>
                <button
                  onClick={() => handleTipChange(15)}
                  className={`px-3 py-2 rounded-lg border-2 font-medium transition ${
                    tipType === 'percentage' && tip === subtotal * 0.15
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-300 hover:border-green-500'
                  }`}
                >
                  15%
                </button>
                <button
                  onClick={() => handleTipChange(20)}
                  className={`px-3 py-2 rounded-lg border-2 font-medium transition ${
                    tipType === 'percentage' && tip === subtotal * 0.2
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-300 hover:border-green-500'
                  }`}
                >
                  20%
                </button>
                <button
                  onClick={() => { setTip(0); setCustomTip(''); }}
                  className={`px-3 py-2 rounded-lg border-2 font-medium transition ${
                    tip === 0
                      ? 'border-gray-500 bg-gray-50 text-gray-700'
                      : 'border-gray-300 hover:border-gray-500'
                  }`}
                >
                  None
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Custom Amount (EGP)</label>
                <input
                  type="number"
                  value={customTip}
                  onChange={(e) => handleCustomTipChange(e.target.value)}
                  placeholder="Enter custom tip amount"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  min="0"
                  step="0.01"
                />
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
