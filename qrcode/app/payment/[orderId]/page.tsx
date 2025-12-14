'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CreditCard, Smartphone, CheckCircle } from 'lucide-react';

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;
  const [order, setOrder] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'apple_pay' | 'google_pay'>('card');
  const [provider, setProvider] = useState<'paymob' | 'stripe' | 'paypal' | 'mock'>('mock');
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);

  // For partial payments
  const [isPartialPayment, setIsPartialPayment] = useState(false);
  const [partialPaymentItemIds, setPartialPaymentItemIds] = useState<string[]>([]);
  const [partialPaymentAmount, setPartialPaymentAmount] = useState<any>(null);

  // Card details for test card payment
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVC, setCardCVC] = useState('');
  const [cardName, setCardName] = useState('');

  // Tip state
  const [tipType, setTipType] = useState<'percentage' | 'custom' | 'none'>('none');
  const [tipPercentage, setTipPercentage] = useState<number>(0);
  const [customTipAmount, setCustomTipAmount] = useState<string>('');

  useEffect(() => {
    // Check if this is a partial payment
    if (orderId.startsWith('partial-')) {
      const itemIds = sessionStorage.getItem('partialPaymentItemIds');
      const amount = sessionStorage.getItem('partialPaymentAmount');
      const tableNumber = sessionStorage.getItem('partialPaymentTable');

      if (itemIds && amount && tableNumber) {
        setIsPartialPayment(true);
        setPartialPaymentItemIds(JSON.parse(itemIds));
        setPartialPaymentAmount(JSON.parse(amount));

        // Create a mock order object for display
        const mockOrder = {
          id: `partial-${tableNumber}`,
          orderNumber: `PARTIAL-${Date.now()}`,
          tableNumber,
          items: [],
          ...JSON.parse(amount)
        };
        setOrder(mockOrder);
        setLoading(false);
      } else {
        alert('Invalid partial payment session');
        router.push('/');
      }
    } else {
      fetchOrder();
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      if (response.ok) {
        const data = await response.json();
        setOrder(data);
      } else {
        alert('Order not found');
        router.push('/');
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      alert('Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  // Calculate tip amount
  const calculateTip = () => {
    if (tipType === 'percentage') {
      return order.subtotal * (tipPercentage / 100);
    } else if (tipType === 'custom') {
      return parseFloat(customTipAmount) || 0;
    }
    return 0;
  };

  // Calculate total with tip
  const calculateTotalWithTip = () => {
    const tipAmount = calculateTip();
    return order.total + tipAmount;
  };

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
    // Email is now optional

    // Validate card details if provider is mock and payment method is card
    if (provider === 'mock' && paymentMethod === 'card') {
      if (!cardNumber || !cardExpiry || !cardCVC || !cardName) {
        alert('Please fill in all card details');
        return;
      }
      // Basic card number validation (remove spaces)
      const cleanCardNumber = cardNumber.replace(/\s/g, '');
      if (cleanCardNumber.length < 13 || cleanCardNumber.length > 19) {
        alert('Please enter a valid card number');
        return;
      }
    }

    setIsProcessing(true);

    try {
      const tipAmount = calculateTip();
      const totalWithTip = calculateTotalWithTip();

      // Process payment
      const paymentResponse = await fetch('/api/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: order.id,
          amount: totalWithTip,
          paymentMethod,
          customerEmail: email,
          provider: provider,
          itemIds: isPartialPayment ? partialPaymentItemIds : undefined,
          tip: tipAmount,
          tipType: tipType !== 'none' ? tipType : null,
          tipPercentage: tipType === 'percentage' ? tipPercentage : null,
          cardDetails: provider === 'mock' && paymentMethod === 'card' ? {
            number: cardNumber.replace(/\s/g, ''),
            expiry: cardExpiry,
            cvc: cardCVC,
            name: cardName
          } : undefined
        }),
      });

      if (!paymentResponse.ok) {
        throw new Error('Payment failed');
      }

      const paymentResult = await paymentResponse.json();

      if (paymentResult.success) {
        // Check if PayPal requires redirect
        if (paymentResult.redirectRequired && paymentResult.approvalUrl) {
          // Redirect to PayPal for payment approval
          window.location.href = paymentResult.approvalUrl;
        } else if (isPartialPayment) {
          // For partial payments, use the orderId returned from payment API
          // (which is the newly created partial payment order)
          const receiptOrderId = paymentResult.orderId || order.id;
          // Keep sessionStorage for receipt page (will be cleared by receipt page after reading)
          router.push(`/receipt/${receiptOrderId}`);
        } else {
          // Clear any partial payment data for full payments
          sessionStorage.removeItem('partialPaymentItemIds');
          sessionStorage.removeItem('partialPaymentAmount');
          sessionStorage.removeItem('partialPaymentTable');

          // Redirect to receipt for full order payments
          router.push(`/receipt/${order.id}`);
        }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Order not found</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Complete Payment</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              <div className="space-y-3">
                {order.items && order.items.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center py-2 border-b">
                    <div>
                      <h3 className="font-medium">{item.menuItem?.name || 'Item'}</h3>
                      <p className="text-sm text-gray-600">
                        EGP {item.unitPrice.toFixed(2)} × {item.quantity}
                      </p>
                    </div>
                    <span className="font-medium">
                      EGP {item.totalPrice.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>EGP {order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>EGP {order.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Service Charge</span>
                  <span>EGP {order.serviceCharge.toFixed(2)}</span>
                </div>
                {calculateTip() > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Tip</span>
                    <span>EGP {calculateTip().toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total</span>
                  <span>EGP {calculateTotalWithTip().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold mb-4">Payment Details</h2>

              {/* Email Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address (optional - for receipt)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="your@email.com (optional)"
                />
              </div>

              {/* Tip Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Add a Tip (Optional)
                </label>

                <div className="grid grid-cols-4 gap-2 mb-3">
                  <button
                    onClick={() => handleTipPercentage(5)}
                    className={`px-4 py-3 rounded-lg font-medium transition ${
                      tipType === 'percentage' && tipPercentage === 5
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    5%
                  </button>
                  <button
                    onClick={() => handleTipPercentage(10)}
                    className={`px-4 py-3 rounded-lg font-medium transition ${
                      tipType === 'percentage' && tipPercentage === 10
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    10%
                  </button>
                  <button
                    onClick={() => handleTipPercentage(15)}
                    className={`px-4 py-3 rounded-lg font-medium transition ${
                      tipType === 'percentage' && tipPercentage === 15
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    15%
                  </button>
                  <button
                    onClick={() => handleTipPercentage(20)}
                    className={`px-4 py-3 rounded-lg font-medium transition ${
                      tipType === 'percentage' && tipPercentage === 20
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    20%
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={customTipAmount}
                      onChange={(e) => handleCustomTip(e.target.value)}
                      placeholder="Custom amount"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    />
                    <button
                      onClick={handleNoTip}
                      className={`px-6 py-3 rounded-lg font-medium transition ${
                        tipType === 'none'
                          ? 'bg-gray-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      No Tip
                    </button>
                  </div>
                  {calculateTip() > 0 && (
                    <p className="text-sm text-green-600 font-medium">
                      Tip amount: EGP {calculateTip().toFixed(2)}
                    </p>
                  )}
                </div>
              </div>

              {/* Payment Provider Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Payment Provider
                </label>

                <div className="space-y-3">
                  <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors" style={{borderColor: provider === 'paymob' ? '#3B82F6' : '#E5E7EB'}}>
                    <input
                      type="radio"
                      name="provider"
                      value="paymob"
                      checked={provider === 'paymob'}
                      onChange={(e) => setProvider(e.target.value as any)}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">Paymob (Egypt) 🇪🇬</div>
                      <div className="text-sm text-gray-600">Egyptian cards, Vodafone Cash, Orange Cash</div>
                    </div>
                  </label>

                  <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors" style={{borderColor: provider === 'stripe' ? '#3B82F6' : '#E5E7EB'}}>
                    <input
                      type="radio"
                      name="provider"
                      value="stripe"
                      checked={provider === 'stripe'}
                      onChange={(e) => setProvider(e.target.value as any)}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">Stripe (International) 🌍</div>
                      <div className="text-sm text-gray-600">International cards, Apple Pay, Google Pay</div>
                    </div>
                  </label>

                  <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors" style={{borderColor: provider === 'paypal' ? '#3B82F6' : '#E5E7EB'}}>
                    <input
                      type="radio"
                      name="provider"
                      value="paypal"
                      checked={provider === 'paypal'}
                      onChange={(e) => setProvider(e.target.value as any)}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">PayPal (Sandbox) 💳</div>
                      <div className="text-sm text-gray-600">PayPal account or credit/debit card via PayPal</div>
                    </div>
                  </label>

                  <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors" style={{borderColor: provider === 'mock' ? '#3B82F6' : '#E5E7EB'}}>
                    <input
                      type="radio"
                      name="provider"
                      value="mock"
                      checked={provider === 'mock'}
                      onChange={(e) => setProvider(e.target.value as any)}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">Demo Payment (Testing) 🧪</div>
                      <div className="text-sm text-gray-600">No real payment - for demo purposes</div>
                    </div>
                  </label>
                </div>
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

                  <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="google_pay"
                      checked={paymentMethod === 'google_pay'}
                      onChange={(e) => setPaymentMethod(e.target.value as 'google_pay')}
                      className="mr-3"
                    />
                    <Smartphone className="h-5 w-5 mr-2 text-blue-600" />
                    <span>Google Pay</span>
                  </label>
                </div>
              </div>

              {/* Card Details - Show only if provider is mock and payment method is card */}
              {provider === 'mock' && paymentMethod === 'card' && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3">Test Card Details</h3>
                  <p className="text-sm text-blue-600 mb-4">Use test card: 4032032529364793</p>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Card Number
                      </label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ');
                          setCardNumber(formatted);
                        }}
                        placeholder="4032 0325 2936 4793"
                        maxLength={19}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => {
                            let value = e.target.value.replace(/\D/g, '');
                            if (value.length >= 2) {
                              value = value.slice(0, 2) + '/' + value.slice(2, 4);
                            }
                            setCardExpiry(value);
                          }}
                          placeholder="MM/YY"
                          maxLength={5}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          CVC
                        </label>
                        <input
                          type="text"
                          value={cardCVC}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            setCardCVC(value.slice(0, 4));
                          }}
                          placeholder="123"
                          maxLength={4}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value.toUpperCase())}
                        placeholder="JOHN DOE"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Pay Button */}
              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium py-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    <span>Pay EGP {calculateTotalWithTip().toFixed(2)}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
