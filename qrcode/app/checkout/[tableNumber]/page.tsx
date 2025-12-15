'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Users, Wallet } from 'lucide-react';
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
  const total = subtotal + tax + serviceCharge;

  const handleFullPayment = async () => {
    setIsProcessing(true);

    try {
      // Check if items already have an ID (meaning they're unpaid items from database)
      const hasExistingItems = state.items.some(item => item.id && item.id.startsWith('cmj'));

      if (hasExistingItems) {
        // Items already exist in database, redirect directly to itemized checkout
        // User should pay for these items from there instead
        console.log('Items already exist in database, redirecting to itemized checkout');
        router.push(`/itemized-checkout/${tableNumber}`);
        setIsProcessing(false);
        return;
      }

      // Create order
      const orderData = {
        tableNumber,
        items: state.items,
        subtotal,
        tax,
        serviceCharge,
        tip: 0,
        tipType: null,
        tipPercentage: null,
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
      if (!tableData?.table?.id) {
        alert('Table data not loaded yet. Please try again.');
        return;
      }

      setIsProcessing(true);

      // Check if items already have an ID (meaning they're unpaid items from database)
      const hasExistingItems = state.items.some(item => item.id && item.id.startsWith('cmj'));

      if (hasExistingItems) {
        // Items already exist in database, redirect to itemized checkout instead
        console.log('Items already exist in database, redirecting to itemized checkout for equal split');
        router.push(`/itemized-checkout/${tableNumber}`);
        setIsProcessing(false);
        setShowSplitModal(false);
        return;
      }

      // First create an order
      const orderData = {
        tableNumber,
        items: state.items,
        subtotal,
        tax,
        serviceCharge,
        tip: 0,
        tipType: null,
        tipPercentage: null,
        total,
        customerEmail: null,
        paymentMethod: 'CARD'
      };

      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!orderResponse.ok) {
        throw new Error('Failed to create order');
      }

      const order = await orderResponse.json();

      // Then create the bill split session
      const response = await fetch(`/api/bill-split/${tableData.table.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          totalPeople: numPeople,
          orderId: order.id,
          orderData: {
            items: state.items,
            subtotal,
            tax,
            serviceCharge,
            tip: 0,
            tipType: null,
            tipPercentage: null,
            total
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create bill split');
      }

      const billSplit = await response.json();

      // Clear cart
      dispatch({ type: 'CLEAR_ORDER' });

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
      // Check if items already have an ID (meaning they're unpaid items from database)
      const hasExistingItems = state.items.some(item => item.id && item.id.startsWith('cmj'));

      if (hasExistingItems) {
        // Items already exist in database, skip creating order and go directly to itemized checkout
        console.log('Items already exist in database, skipping order creation');
        router.push(`/itemized-checkout/${tableNumber}`);
        setIsProcessing(false);
        return;
      }

      // Create order first, so items are in the database for itemized checkout to fetch
      const orderData = {
        tableNumber,
        items: state.items,
        subtotal,
        tax,
        serviceCharge,
        tip: 0,
        tipType: null,
        tipPercentage: null,
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
