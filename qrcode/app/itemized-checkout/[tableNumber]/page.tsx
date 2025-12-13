'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ShoppingCart, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface CartItem {
  orderItemId: string;
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
  const [selectedQuantities, setSelectedQuantities] = useState<{ [orderItemId: string]: number }>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [restaurant, setRestaurant] = useState<any>(null);

  useEffect(() => {
    fetchUnpaidItems();
    fetchRestaurantData();
  }, [tableNumber]);

  const fetchUnpaidItems = async () => {
    try {
      const response = await fetch(`/api/tables/${tableNumber}/unpaid-items`);
      if (response.ok) {
        const data = await response.json();
        if (data.items && data.items.length > 0) {
          setAvailableItems(data.items);
          // Initialize all quantities to 0
          const initialQuantities: { [key: string]: number } = {};
          data.items.forEach((item: CartItem) => {
            initialQuantities[item.orderItemId] = 0;
          });
          setSelectedQuantities(initialQuantities);
        } else {
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

  const handleQuantityChange = (orderItemId: string, quantity: number) => {
    setSelectedQuantities(prev => ({
      ...prev,
      [orderItemId]: quantity
    }));
  };

  const calculateTotals = () => {
    let subtotal = 0;

    availableItems.forEach(item => {
      const selectedQty = selectedQuantities[item.orderItemId] || 0;
      if (selectedQty > 0) {
        // Calculate based on unit price and selected quantity
        subtotal += item.price * selectedQty;
      }
    });

    const taxRate = restaurant?.taxRate || 0.14;
    const serviceChargeRate = restaurant?.serviceChargeRate || 0.12;
    const tax = subtotal * taxRate;
    const serviceCharge = subtotal * serviceChargeRate;
    const total = subtotal + tax + serviceCharge;

    return { subtotal, tax, serviceCharge, total };
  };

  const handleProceedToPayment = () => {
    const { subtotal, tax, serviceCharge, total } = calculateTotals();

    if (subtotal === 0) {
      alert('Please select at least one item to pay for');
      return;
    }

    setIsProcessing(true);

    try {
      // Collect orderItemIds based on selected quantities
      // If item has quantity 4 and user selected 2, we need to mark 2 of them as paid
      // Since each OrderItem already has quantity stored, we just need to collect the orderItemId and quantity
      const selectedItems = availableItems
        .filter(item => (selectedQuantities[item.orderItemId] || 0) > 0)
        .map(item => ({
          orderItemId: item.orderItemId,
          selectedQuantity: selectedQuantities[item.orderItemId]
        }));

      // For partial payment with quantities, we need to handle this differently
      // We'll pass the orderItemIds and quantities to the payment page
      sessionStorage.setItem('partialPaymentItems', JSON.stringify(selectedItems));
      sessionStorage.setItem('partialPaymentAmount', JSON.stringify({
        subtotal,
        tax,
        serviceCharge,
        total
      }));
      sessionStorage.setItem('partialPaymentTable', tableNumber);

      router.push(`/payment/partial-${tableNumber}`);
    } catch (error) {
      console.error('Payment preparation error:', error);
      alert('Failed to prepare payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const { subtotal, tax, serviceCharge, total } = calculateTotals();

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
            Choose how many of each item you want to pay for using the dropdown menus.
          </p>
        </div>

        {/* Available Items */}
        <div className="space-y-4 mb-6">
          {availableItems.map((item) => {
            const selectedQty = selectedQuantities[item.orderItemId] || 0;
            const isSelected = selectedQty > 0;

            return (
              <div
                key={item.orderItemId}
                className={`card transition-all ${
                  isSelected ? 'border-2 border-purple-500 bg-purple-50' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-600">
                        EGP {item.price.toFixed(2)} × {item.quantity}
                      </p>
                      <p className="text-purple-600 font-semibold mt-1">
                        Total: EGP {item.totalPrice.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Quantity Dropdown */}
                  <div className="flex flex-col items-end space-y-2">
                    <label className="text-sm font-medium text-gray-700">Pay for:</label>
                    <select
                      value={selectedQty}
                      onChange={(e) => handleQuantityChange(item.orderItemId, parseInt(e.target.value))}
                      className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none min-w-[100px]"
                    >
                      {Array.from({ length: item.quantity + 1 }, (_, i) => (
                        <option key={i} value={i}>
                          {i} {i === 1 ? 'item' : 'items'}
                        </option>
                      ))}
                    </select>
                    {selectedQty > 0 && (
                      <p className="text-sm text-purple-600 font-medium">
                        EGP {(item.price * selectedQty).toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bill Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Your Bill Summary</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>EGP {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax (14%)</span>
              <span>EGP {tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Service Charge (12%)</span>
              <span>EGP {serviceCharge.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
              <span>Total</span>
              <span>EGP {total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Proceed Button */}
        <button
          onClick={handleProceedToPayment}
          disabled={isProcessing || subtotal === 0}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-4 rounded-lg hover:from-purple-700 hover:to-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? 'Processing...' : `Proceed to Payment - EGP ${total.toFixed(2)}`}
        </button>
      </div>
    </div>
  );
}
