'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Users, Plus, Minus, QrCode, Download, Edit2, Check, X } from 'lucide-react';
import Link from 'next/link';

interface BillSplit {
  id: string;
  sessionId: string;
  totalPeople: number;
  isActive: boolean;
  persons: Person[];
}

interface Person {
  id: string;
  personNumber: number;
  name: string | null;
  qrCode: string | null;
  totalAmount: number;
  isCompleted: boolean;
}

export default function BillSplitPage() {
  const params = useParams();
  const tableNumber = params.tableId as string; // Changed to use tableId parameter
  const [billSplit, setBillSplit] = useState<BillSplit | null>(null);
  const [totalPeople, setTotalPeople] = useState(2);
  const [loading, setLoading] = useState(true);
  const [editingPerson, setEditingPerson] = useState<string | null>(null);
  const [personName, setPersonName] = useState('');

  useEffect(() => {
    fetchBillSplit();
  }, [tableNumber]);

  const fetchBillSplit = async () => {
    try {
      const response = await fetch(`/api/bill-split/${tableNumber}`);
      if (response.ok) {
        const data = await response.json();
        setBillSplit(data.billSplit);
        if (data.billSplit) {
          setTotalPeople(data.billSplit.totalPeople);
        }
      }
    } catch (error) {
      console.error('Error fetching bill split:', error);
    } finally {
      setLoading(false);
    }
  };

  const createBillSplit = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/bill-split/${tableNumber}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ totalPeople }),
      });

      if (response.ok) {
        const data = await response.json();
        setBillSplit(data.billSplit);
      }
    } catch (error) {
      console.error('Error creating bill split:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePersonCount = async (newCount: number) => {
    if (!billSplit) return;

    try {
      const response = await fetch(`/api/bill-split/${tableNumber}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ totalPeople: newCount }),
      });

      if (response.ok) {
        const data = await response.json();
        setBillSplit(data.billSplit);
        setTotalPeople(newCount);
      }
    } catch (error) {
      console.error('Error updating person count:', error);
    }
  };

  const updatePersonName = async (personId: string, name: string) => {
    try {
      const response = await fetch(`/api/bill-split/person/${personId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });

      if (response.ok) {
        setBillSplit(prev => prev ? {
          ...prev,
          persons: prev.persons.map(person =>
            person.id === personId ? { ...person, name } : person
          )
        } : null);
        setEditingPerson(null);
        setPersonName('');
      }
    } catch (error) {
      console.error('Error updating person name:', error);
    }
  };

  const downloadQRCode = (qrCode: string, personNumber: number, personName: string | null) => {
    const link = document.createElement('a');
    const displayName = personName || `Person ${personNumber}`;
    link.download = `table-${tableNumber}-${displayName.replace(/\s+/g, '-')}-qr.png`;
    link.href = qrCode;
    link.click();
  };

  const downloadAllQRCodes = async () => {
    if (!billSplit) return;

    for (const person of billSplit.persons) {
      if (person.qrCode) {
        await new Promise(resolve => setTimeout(resolve, 100));
        downloadQRCode(person.qrCode, person.personNumber, person.name);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading bill split...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Split Bill - Table {tableNumber}</h1>
            </div>
            <Link href={`/table/${tableNumber}`} className="text-gray-600 hover:text-blue-600">
              Back to Menu
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!billSplit ? (
          /* Setup Bill Split */
          <div className="card text-center max-w-md mx-auto">
            <div className="mb-6">
              <Users className="h-16 w-16 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Set Up Bill Splitting</h2>
              <p className="text-gray-600">
                Create individual QR codes for each person at the table
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                How many people are at the table?
              </label>
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={() => setTotalPeople(Math.max(1, totalPeople - 1))}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                >
                  <Minus className="h-5 w-5" />
                </button>
                <span className="text-2xl font-bold w-12 text-center">{totalPeople}</span>
                <button
                  onClick={() => setTotalPeople(Math.min(10, totalPeople + 1))}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            </div>

            <button
              onClick={createBillSplit}
              className="w-full btn-primary"
            >
              Create Individual QR Codes
            </button>
          </div>
        ) : (
          /* Manage Bill Split */
          <div className="space-y-6">
            {/* Summary Card */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Bill Split Summary</h2>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    {billSplit.persons.filter(p => p.isCompleted).length} of {billSplit.totalPeople} paid
                  </span>
                  <button
                    onClick={downloadAllQRCodes}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download All QR Codes</span>
                  </button>
                </div>
              </div>

              {/* People Count Adjustment */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Number of People
                </label>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => updatePersonCount(Math.max(1, totalPeople - 1))}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                  >
                    <Minus className="h-5 w-5" />
                  </button>
                  <span className="text-lg font-semibold w-12 text-center">{totalPeople}</span>
                  <button
                    onClick={() => updatePersonCount(Math.min(10, totalPeople + 1))}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                  <span className="text-sm text-gray-600">
                    Adjust the number of people as needed
                  </span>
                </div>
              </div>
            </div>

            {/* Individual Person Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {billSplit.persons.map((person) => (
                <div key={person.id} className="card">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      {editingPerson === person.id ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={personName}
                            onChange={(e) => setPersonName(e.target.value)}
                            className="text-lg font-semibold border-b border-blue-500 outline-none bg-transparent"
                            placeholder={`Person ${person.personNumber}`}
                            autoFocus
                          />
                          <button
                            onClick={() => updatePersonName(person.id, personName)}
                            className="p-1 text-green-600 hover:bg-green-100 rounded"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingPerson(null);
                              setPersonName('');
                            }}
                            className="p-1 text-red-600 hover:bg-red-100 rounded"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-semibold">
                            {person.name || `Person ${person.personNumber}`}
                          </h3>
                          <button
                            onClick={() => {
                              setEditingPerson(person.id);
                              setPersonName(person.name || '');
                            }}
                            className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      person.isCompleted 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {person.isCompleted ? 'Paid' : 'Pending'}
                    </div>
                  </div>

                  {person.qrCode && (
                    <div className="text-center mb-4">
                      <img 
                        src={person.qrCode} 
                        alt={`QR Code for ${person.name || `Person ${person.personNumber}`}`}
                        className="mx-auto border rounded-lg mb-3"
                        style={{ maxWidth: '150px' }}
                      />
                      <p className="text-sm text-gray-600 mb-3">
                        Scan to order and pay individually
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Current Total:</span>
                      <span className="font-medium">EGP {person.totalAmount.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex space-x-2">
                      {person.qrCode && (
                        <button
                          onClick={() => downloadQRCode(person.qrCode!, person.personNumber, person.name)}
                          className="flex-1 btn-secondary text-sm py-2"
                        >
                          Download QR
                        </button>
                      )}
                      <Link
                        href={`/person/${billSplit.sessionId}/${person.personNumber}`}
                        className="flex-1 btn-primary text-sm py-2 text-center"
                      >
                        View Menu
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="card mt-8">
          <h3 className="text-lg font-bold mb-4">How Bill Splitting Works</h3>
          <div className="space-y-3 text-gray-700">
            <div className="flex items-start space-x-3">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">1</span>
              <p>Set the number of people at your table and create individual QR codes.</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">2</span>
              <p>Each person scans their own QR code to access a personal menu.</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">3</span>
              <p>Everyone orders and pays for their own items individually.</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">4</span>
              <p>No need to split the bill later - everyone pays as they order!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}