'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CreditCard, Smartphone, ArrowLeft, Heart } from 'lucide-react';
import { useOrder } from '../../../context/OrderContext';
import { restaurant } from '../../../data/menu';
import Link from 'next/link';

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const tableNumber = params.tableNumber as string;
  const { state, dispatch } = useOrder();
  const [email, setEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'apple_pay'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Tip state
  const [tipType, setTipType] = useState<'percentage' | 'custom' | 'none'>('none');
  const [tipPercentage, setTipPercentage] = useState<number>(0);
  const [customTipAmount, setCustomTipAmount] = useState<string>('');

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

  const handlePayment = async () => {
    if (!email) {
      alert('Please enter your email address');
      return;
    }

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
        customerEmail: email,
        paymentMethod
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

      // Process payment
      const paymentResponse = await fetch('/api/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: order.id,
          amount: total,
          paymentMethod,
          customerEmail: email
        }),
      });

      if (!paymentResponse.ok) {
        throw new Error('Payment failed');
      }

      const paymentResult = await paymentResponse.json();

      if (paymentResult.success) {
        // Clear cart and redirect to receipt
        dispatch({ type: 'CLEAR_ORDER' });
        router.push(`/receipt/${order.id}`);
      } else {
        throw new Error(paymentResult.error || 'Payment failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
          <Link href={`/table/${tableNumber}`} className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors">
            Back to Menu
          </Link>
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
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Order Details */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              <div className="space-y-3">
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

            {/* Payment Form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold mb-4">Payment Details</h2>
              
              {/* Email Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address (for receipt)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="your@email.com"
                  required
                />
              </div>

              {/* Payment Methods */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Payment Method
                </label>
                
                <div className="space-y-3">
                  <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={(e) => setPaymentMethod(e.target.value as 'card')}
                      className="mr-3"
                    />
                    <CreditCard className="h-5 w-5 mr-2" />
                    <span>Credit/Debit Card</span>
                  </label>
                  
                  <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="apple_pay"
                      checked={paymentMethod === 'apple_pay'}
                      onChange={(e) => setPaymentMethod(e.target.value as 'apple_pay')}
                      className="mr-3"
                    />
                    <Smartphone className="h-5 w-5 mr-2" />
                    <span>Apple Pay</span>
                  </label>
                </div>
              </div>

              {/* Payment Button */}
              <button
                onClick={handlePayment}
                disabled={isProcessing || !email}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing...' : `Pay EGP ${total.toFixed(2)}`}
              </button>
              
              {tipAmount > 0 && (
                <p className="text-center text-sm text-gray-500 mt-2">
                  Thank you for your generosity! 💝
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}