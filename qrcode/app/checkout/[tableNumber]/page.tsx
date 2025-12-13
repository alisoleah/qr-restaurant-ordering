'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Heart, Users, Wallet } from 'lucide-react';
import { useOrder } from '../../../context/OrderContext';
import { restaurant } from '../../../data/menu';
import Link from 'next/link';
import Navigation from '../../../components/Navigation';
import SplitBillModal from '../../../components/SplitBillModal';

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const tableNumber = params.tableNumber as string;
  const { state, dispatch } = useOrder();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [tableData, setTableData] = useState<any>(null);

  // Tip state
  const [tipType, setTipType] = useState<'percentage' | 'custom' | 'none'>('none');
  const [tipPercentage, setTipPercentage] = useState<number>(0);
  const [customTipAmount, setCustomTipAmount] = useState<string>('');

  // Fetch table data for capacity
  useEffect(() => {
    const fetchTableData = async () => {
      try {
        const response = await fetch(`/api/tables/${tableNumber}`);
        if (response.ok) {
          const data = await response.json();
          setTableData(data);
        }
      } catch (error) {
        console.error('Error fetching table data:', error);
      }
    };
    fetchTableData();
  }, [tableNumber]);

  const subtotal = state.items.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);
  const tax = subtotal * restaurant.taxRate;
  const serviceCharge = subtotal * restaurant.serviceChargeRate;

  // Calculate tip
  let tipAmount = 0;
  if (tipType === 'percentage' && tipPercentage > 0) {
    tipAmount = subtotal * (tipPercentage / 100);
  } else if (tipType === 'custom' && customTipAmount) {
    tipAmount = parseFloat(customTipAmount) || 0;
  }

  const total = subtotal + tax + serviceCharge + tipAmount;

  const handleTipPercentage = (percentage: number) => {
    setTipType('percentage');
    setTipPercentage(percentage);
    setCustomTipAmount('');
  };

  const handleCustomTip = (amount: string) => {
    setTipType('custom');
    setCustomTipAmount(amount);
    setTipPercentage(0);
  };

  const handleNoTip = () => {
    setTipType('none');
    setTipPercentage(0);
    setCustomTipAmount('');
  };

  const handleFullPayment = async () => {
    setIsProcessing(true);

    try {
      // Create order with tip
      const orderData = {
        tableNumber,
        items: state.items,
        subtotal,
        tax,
        serviceCharge,
        tip: tipAmount,
        tipType: tipType === 'none' ? null : tipType,
        tipPercentage: tipType === 'percentage' ? tipPercentage : null,
        total,
        customerEmail: null,
        paymentMethod: 'CARD'
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const order = await response.json();

      // Clear cart and redirect to payment page
      dispatch({ type: 'CLEAR_ORDER' });
      router.push(`/payment/${order.id}`);
    } catch (error) {
      console.error('Order creation error:', error);
      alert('Failed to create order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEqualSplit = async (numPeople: number) => {
    try {
      setIsProcessing(true);

      // First create the bill split session
      const response = await fetch(`/api/bill-split/${tableData.table.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          totalPeople: numPeople,
          orderData: {
            items: state.items,
            subtotal,
            tax,
            serviceCharge,
            tip: tipAmount,
            tipType: tipType === 'none' ? null : tipType,
            tipPercentage: tipType === 'percentage' ? tipPercentage : null,
            total
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create bill split');
      }

      const billSplit = await response.json();

      // Redirect to QR codes display page
      router.push(`/bill-split/${tableData.table.id}`);
    } catch (error) {
      console.error('Split bill error:', error);
      alert('Failed to create bill split. Please try again.');
    } finally {
      setIsProcessing(false);
      setShowSplitModal(false);
    }
  };

  const handleItemizedSplit = async () => {
    setShowSplitModal(false);
    setIsProcessing(true);

    try {
      // Create order first, so items are in the database for itemized checkout to fetch
      const orderData = {
        tableNumber,
        items: state.items,
        subtotal,
        tax,
        serviceCharge,
        tip: tipAmount,
        tipType: tipType === 'none' ? null : tipType,
        tipPercentage: tipType === 'percentage' ? tipPercentage : null,
        total,
        customerEmail: null,
        paymentMethod: 'CARD'
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const order = await response.json();

      // Clear cart and redirect to itemized selection page
      dispatch({ type: 'CLEAR_ORDER' });
      router.push(`/itemized-checkout/${tableNumber}`);
    } catch (error) {
      console.error('Order creation error:', error);
      alert('Failed to create order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (state.items.length === 0) {
    return (
      <>
        <Navigation currentPage="checkout" />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
            <Link href={`/table/${tableNumber}`} className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors">
              Back to Menu
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation currentPage="checkout" />
      <div className="min-h-screen bg-gray-50 pt-16">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16">
              <Link
                href={`/table/${tableNumber}`}
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Menu</span>
              </Link>
              <h1 className="ml-8 text-2xl font-bold text-gray-900">Checkout</h1>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Payment Type Selection */}
          <div className="mb-8 grid md:grid-cols-2 gap-4">
            <button
              onClick={handleFullPayment}
              disabled={isProcessing}
              className="relative bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Wallet className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Pay Full Amount</h2>
                <p className="text-blue-100 text-sm mb-4">Complete payment now</p>
                <div className="text-3xl font-bold">
                  EGP {total.toFixed(2)}
                </div>
              </div>
            </button>

            <button
              onClick={() => setShowSplitModal(true)}
              disabled={isProcessing || !tableData}
              className="relative bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Users className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Split Bill</h2>
                <p className="text-purple-100 text-sm mb-4">Divide payment among friends</p>
                <div className="text-lg font-semibold">
                  {tableData?.table?.capacity ? `Table for ${tableData.table.capacity}` : 'Loading...'}
                </div>
              </div>
            </button>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Order Details */}
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {state.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center py-2 border-b">
                      <div>
                        <h3 className="font-medium">{item.menuItem.name}</h3>
                        <p className="text-sm text-gray-600">
                          EGP {item.menuItem.price.toFixed(2)} × {item.quantity}
                        </p>
                      </div>
                      <span className="font-medium">
                        EGP {(item.menuItem.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tip Selection */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Heart className="h-5 w-5 text-red-500" />
                  <h2 className="text-xl font-bold">Add Tip</h2>
                  <span className="text-sm text-gray-500">(Optional)</span>
                </div>

                {/* Percentage Tips */}
                <div className="mb-4">
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    <button
                      onClick={handleNoTip}
                      className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                        tipType === 'none'
                          ? 'bg-gray-500 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      No Tip
                    </button>
                    <button
                      onClick={() => handleTipPercentage(5)}
                      className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                        tipType === 'percentage' && tipPercentage === 5
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      5%
                    </button>
                    <button
                      onClick={() => handleTipPercentage(10)}
                      className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                        tipType === 'percentage' && tipPercentage === 10
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      10%
                    </button>
                    <button
                      onClick={() => handleTipPercentage(20)}
                      className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                        tipType === 'percentage' && tipPercentage === 20
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      20%
                    </button>
                  </div>

                  {tipType === 'percentage' && tipPercentage > 0 && (
                    <div className="text-sm text-gray-600 bg-blue-50 p-2 rounded">
                      {tipPercentage}% tip: EGP {tipAmount.toFixed(2)}
                    </div>
                  )}
                </div>

                {/* Custom Tip */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Tip Amount
                  </label>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500">EGP</span>
                    <input
                      type="number"
                      value={customTipAmount}
                      onChange={(e) => handleCustomTip(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  {tipType === 'custom' && tipAmount > 0 && (
                    <div className="text-sm text-gray-600 bg-green-50 p-2 rounded mt-2">
                      Custom tip: EGP {tipAmount.toFixed(2)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Payment */}
            <div className="space-y-6">
              {/* Total Summary */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold mb-4">Total</h2>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>EGP {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (14%)</span>
                    <span>EGP {tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service Charge (12%)</span>
                    <span>EGP {serviceCharge.toFixed(2)}</span>
                  </div>
                  {tipAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>
                        Tip {tipType === 'percentage' ? `(${tipPercentage}%)` : '(Custom)'}
                      </span>
                      <span>EGP {tipAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total</span>
                    <span>EGP {total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Split Bill Modal */}
        <SplitBillModal
          isOpen={showSplitModal}
          onClose={() => setShowSplitModal(false)}
          tableCapacity={tableData?.table?.capacity || 4}
          totalAmount={total}
          onEqualSplit={handleEqualSplit}
          onItemizedSplit={handleItemizedSplit}
        />
      </div>
    </>
  );
}
