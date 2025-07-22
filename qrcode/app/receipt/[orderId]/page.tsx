'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Check, Download, Share2, Home } from 'lucide-react';
import { Order } from '../../../types';
import Link from 'next/link';

export default function ReceiptPage() {
  const params = useParams();
  const orderId = params.orderId as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      if (response.ok) {
        const orderData = await response.json();
        setOrder(orderData);
      }
    } catch (error) {
      console.error('Failed to fetch order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Restaurant Receipt',
          text: `Order #${orderId} - Total: EGP ${order?.total.toFixed(2)}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Receipt link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading receipt...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Receipt not found</h1>
          <Link href="/" className="btn-primary">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto px-4">
        {/* Success Message */}
        <div className="text-center mb-8">
          <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-gray-600">Your order has been placed and is being prepared.</p>
        </div>

        {/* Receipt */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold">Table {order.tableNumber} - Receipt</h2>
            <p className="text-sm text-gray-600">Order #{orderId}</p>
            <p className="text-sm text-gray-600">
              {new Date(order.createdAt).toLocaleDateString()} at{' '}
              {new Date(order.createdAt).toLocaleTimeString()}
            </p>
          </div>

          {/* Order Items */}
          <div className="space-y-3 mb-6">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between items-center">
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

          {/* Totals */}
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>EGP {order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (14%)</span>
              <span>EGP {order.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Service Charge (12%)</span>
              <span>EGP {order.serviceCharge.toFixed(2)}</span>
            </div>
            {order.tip && order.tip > 0 && (
              <div className="flex justify-between text-green-600">
                <span>
                  Tip {order.tipType === 'percentage' ? `(${order.tipPercentage}%)` : '(Custom)'}
                </span>
                <span>EGP {order.tip.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total</span>
              <span>EGP {order.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Method */}
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between text-sm">
              <span>Payment Method</span>
              <span className="capitalize">
                {order.paymentMethod?.replace('_', ' ')}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Status</span>
              <span className="text-green-600 font-medium">Paid</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleShare}
              className="flex items-center justify-center space-x-2 btn-secondary"
            >
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </button>
            
            <button
              onClick={() => window.print()}
              className="flex items-center justify-center space-x-2 btn-secondary"
            >
              <Download className="h-4 w-4" />
              <span>Print</span>
            </button>
          </div>
          
          <Link 
            href="/"
            className="w-full flex items-center justify-center space-x-2 btn-primary"
          >
            <Home className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Order Status */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 mb-2">
            A receipt has been sent to your email address.
          </p>
          <p className="text-sm text-gray-600">
            Your order is being prepared and will be served shortly.
          </p>
        </div>
      </div>
    </div>
  );
}