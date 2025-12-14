'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Check, Download, Share2, Home, Receipt as ReceiptIcon, List, Receipt } from 'lucide-react';
import { Order } from '../../../types';
import Link from 'next/link';

type ViewMode = 'this-payment' | 'all-paid' | 'summary';

export default function ReceiptPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('this-payment');
  const [tableData, setTableData] = useState<any>(null);
  const [isPartialPayment, setIsPartialPayment] = useState(false);
  const [paidItemsInThisTransaction, setPaidItemsInThisTransaction] = useState<any[]>([]);
  const [allPaidItems, setAllPaidItems] = useState<any[]>([]);
  const [unpaidItems, setUnpaidItems] = useState<any[]>([]);

  useEffect(() => {
    fetchOrder();
    checkForPartialPayment();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      if (response.ok) {
        const orderData = await response.json();
        setOrder(orderData);

        // Fetch table data for remaining items
        const tableNum = orderData.table?.number || orderData.tableNumber;
        if (tableNum) {
          fetchTableData(tableNum);
        }
      }
    } catch (error) {
      console.error('Failed to fetch order:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkForPartialPayment = () => {
    // Check if this was a partial payment from sessionStorage
    const partialItemIds = sessionStorage.getItem('partialPaymentItemIds');
    if (partialItemIds) {
      setIsPartialPayment(true);
      try {
        const itemIds = JSON.parse(partialItemIds);
        setPaidItemsInThisTransaction(itemIds);
        // Clear session storage after reading
        sessionStorage.removeItem('partialPaymentItemIds');
        sessionStorage.removeItem('partialPaymentAmount');
        sessionStorage.removeItem('partialPaymentTable');
      } catch (e) {
        console.error('Error parsing partial payment data:', e);
      }
    }
  };

  const fetchTableData = async (tableNumber: string) => {
    try {
      // Fetch all paid items for this table
      const paidResponse = await fetch(`/api/tables/${tableNumber}/paid-items`);
      if (paidResponse.ok) {
        const paidData = await paidResponse.json();
        setAllPaidItems(paidData.items || []);
      }

      // Fetch unpaid items
      const unpaidResponse = await fetch(`/api/tables/${tableNumber}/unpaid-items`);
      if (unpaidResponse.ok) {
        const unpaidData = await unpaidResponse.json();
        setUnpaidItems(unpaidData.items || []);
      }
    } catch (error) {
      console.error('Error fetching table data:', error);
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

        {/* View Toggle Buttons (only show for partial payments) */}
        {isPartialPayment && (unpaidItems.length > 0 || allPaidItems.length > 0) && (
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setViewMode('this-payment')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  viewMode === 'this-payment'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <ReceiptIcon className="h-4 w-4 mx-auto mb-1" />
                <span className="text-xs">This Payment</span>
              </button>
              <button
                onClick={() => setViewMode('all-paid')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  viewMode === 'all-paid'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Check className="h-4 w-4 mx-auto mb-1" />
                <span className="text-xs">All Paid</span>
              </button>
              <button
                onClick={() => setViewMode('summary')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  viewMode === 'summary'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <List className="h-4 w-4 mx-auto mb-1" />
                <span className="text-xs">Summary</span>
              </button>
            </div>
          </div>
        )}

        {/* Receipt */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold">Table {order.table?.number || order.tableNumber} - Receipt</h2>
            <p className="text-sm text-gray-600">Order #{orderId}</p>
            <p className="text-sm text-gray-600">
              {new Date(order.createdAt).toLocaleDateString()} at{' '}
              {new Date(order.createdAt).toLocaleTimeString()}
            </p>
          </div>

          {/* This Payment View */}
          {viewMode === 'this-payment' && (
            <>
              <h3 className="font-semibold text-lg mb-4 text-green-600">Items Paid in This Transaction</h3>
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
                  <span>Total Paid</span>
                  <span>EGP {order.total.toFixed(2)}</span>
                </div>
              </div>
            </>
          )}

          {/* All Paid Items View */}
          {viewMode === 'all-paid' && allPaidItems.length > 0 && (
            <>
              <h3 className="font-semibold text-lg mb-4 text-blue-600">All Paid Items for This Table</h3>
              <div className="space-y-3 mb-6">
                {allPaidItems.map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-gray-600">
                        EGP {item.price.toFixed(2)} × {item.quantity}
                      </p>
                    </div>
                    <span className="font-medium">
                      EGP {item.totalPrice.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total Paid So Far</span>
                  <span>EGP {allPaidItems.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2)}</span>
                </div>
              </div>
            </>
          )}

          {/* Summary View */}
          {viewMode === 'summary' && (
            <>
              <h3 className="font-semibold text-lg mb-4">Table Summary</h3>

              {/* Paid Items Summary */}
              {allPaidItems.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-green-600 mb-2">Paid Items ({allPaidItems.length})</h4>
                  <div className="bg-green-50 rounded-lg p-4">
                    {allPaidItems.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm mb-1">
                        <span>{item.name} × {item.quantity}</span>
                        <span>EGP {item.totalPrice.toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="border-t border-green-200 mt-2 pt-2">
                      <div className="flex justify-between font-bold">
                        <span>Paid Subtotal</span>
                        <span>EGP {allPaidItems.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Unpaid Items Summary */}
              {unpaidItems.length > 0 ? (
                <div className="mb-6">
                  <h4 className="font-medium text-orange-600 mb-2">Remaining Items ({unpaidItems.length})</h4>
                  <div className="bg-orange-50 rounded-lg p-4">
                    {unpaidItems.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm mb-1">
                        <span>{item.name} × {item.quantity}</span>
                        <span>EGP {item.totalPrice.toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="border-t border-orange-200 mt-2 pt-2">
                      <div className="flex justify-between font-bold">
                        <span>Remaining Subtotal</span>
                        <span>EGP {unpaidItems.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Button to pay remaining */}
                  <button
                    onClick={() => router.push(`/table/${order.table?.number || order.tableNumber}`)}
                    className="w-full mt-4 bg-orange-600 text-white font-medium py-3 rounded-lg hover:bg-orange-700 transition"
                  >
                    View Table & Pay Remaining Items
                  </button>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <Check className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-green-800 font-medium">All items have been paid!</p>
                  <p className="text-sm text-green-700 mt-1">Thank you for your payment.</p>
                </div>
              )}
            </>
          )}

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

          {/* Conditionally redirect based on partial payment */}
          {isPartialPayment ? (
            <Link
              href={`/table/${order.table?.number || order.tableNumber}`}
              className="w-full flex items-center justify-center space-x-2 btn-primary"
            >
              <Receipt className="h-4 w-4" />
              <span>
                {unpaidItems.length > 0 ? 'Back to Table - View Remaining Items' : 'Back to Table'}
              </span>
            </Link>
          ) : (
            <Link
              href="/"
              className="w-full flex items-center justify-center space-x-2 btn-primary"
            >
              <Home className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>
          )}
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