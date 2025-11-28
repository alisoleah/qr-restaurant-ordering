// 6. Frontend Integration (components/PaymentModal.tsx)
import { useState } from 'react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderData: {
    orderId: string;
    amount: number;
    customerEmail?: string;
    customerPhone?: string;
    items: any[];
  };
}

export default function PaymentModal({ isOpen, onClose, orderData }: PaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);

  const handlePayment = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/payment/paymob', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();
      if (data.success) {
        setPaymentUrl(data.iframeUrl);
      }
    } catch (error) {
      console.error('Payment initiation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">Complete Payment</h2>
        
        {!paymentUrl ? (
          <div>
            <p className="mb-4">Amount: EGP {orderData.amount.toFixed(2)}</p>
            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Pay with Paymob'}
            </button>
          </div>
        ) : (
          <div className="h-96">
            <iframe
              src={paymentUrl}
              width="100%"
              height="100%"
              frameBorder="0"
              title="Payment"
            />
          </div>
        )}
        
        <button
          onClick={onClose}
          className="mt-4 w-full bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400"
        >
          Close
        </button>
      </div>
    </div>
  );
}