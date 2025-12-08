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

  useEffect(() => {
    fetchOrder();
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

  const handlePayment = async () => {
    if (!email) {
      alert('Please enter your email address');
      return;
    }

    setIsProcessing(true);

    try {
      // Process payment
      const paymentResponse = await fetch('/api/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: order.id,
          amount: order.total,
          paymentMethod,
          customerEmail: email,
          provider: provider
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
        } else {
          // Redirect to receipt for other payment methods
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
                {order.tip > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Tip</span>
                    <span>EGP {order.tip.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total</span>
                  <span>EGP {order.total.toFixed(2)}</span>
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

              {/* Pay Button */}
              <button
                onClick={handlePayment}
                disabled={isProcessing || !email}
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
                    <span>Pay EGP {order.total.toFixed(2)}</span>
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
