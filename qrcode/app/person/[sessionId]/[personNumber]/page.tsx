'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { User, Users, ArrowLeft } from 'lucide-react';
import MenuSection from '../../../../components/MenuSection';
import PersonCartSummary from '../../../../components/PersonCartSummary';
import Link from 'next/link';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  isAvailable: boolean;
  category: {
    id: string;
    name: string;
  };
}

interface Person {
  id: string;
  personNumber: number;
  name: string | null;
  totalAmount: number;
  isCompleted: boolean;
}

// Updated interface to include all restaurant fields
interface Restaurant {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  taxRate: number;
  serviceChargeRate: number;
}

interface BillSplit {
  id: string;
  sessionId: string;
  totalPeople: number;
  table: {
    id: string;
    number: string;
    restaurant: Restaurant; // Using the complete Restaurant interface
  };
}

export default function PersonMenuPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const personNumber = parseInt(params.personNumber as string);
  
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [person, setPerson] = useState<Person | null>(null);
  const [billSplit, setBillSplit] = useState<BillSplit | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPersonData();
  }, [sessionId, personNumber]);

  const fetchPersonData = async () => {
    try {
      setLoading(true);
      
      const [personResponse, menuResponse] = await Promise.all([
        fetch(`/api/person/${sessionId}/${personNumber}`), // Updated API endpoint
        fetch('/api/menu')
      ]);

      if (!personResponse.ok || !menuResponse.ok) {
        throw new Error('Failed to load data');
      }

      const personData = await personResponse.json();
      const menuData = await menuResponse.json();

      setPerson(personData.person);
      setBillSplit(personData.billSplit);
      setMenuItems(menuData.items);

      // Extract unique categories
      const categoryNames = menuData.items.map((item: MenuItem) => item.category.name);
      const uniqueCategories: string[] = Array.from(new Set(categoryNames));
      setCategories(uniqueCategories);
      setSelectedCategory(uniqueCategories[0] || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your personal menu...</p>
        </div>
      </div>
    );
  }

  if (error || !person || !billSplit) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 p-6 rounded-lg">
            <h1 className="text-xl font-bold text-red-800 mb-2">Error</h1>
            <p className="text-red-600">{error || 'Person not found'}</p>
            <Link href="/" className="mt-4 inline-block btn-primary">
              Go Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (person.isCompleted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <User className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-green-800 mb-2">Payment Complete!</h1>
          <p className="text-green-600 mb-4">
            {person.name || `Person ${person.personNumber}`} has already completed their order and payment.
          </p>
          <p className="text-gray-600 text-sm">
            Total Paid: EGP {person.totalAmount.toFixed(2)}
          </p>
        </div>
      </div>
    );
  }

  const filteredItems = menuItems.filter(item => item.category.name === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <User className="h-6 w-6 text-blue-600" />
                  <h1 className="text-2xl font-bold text-gray-900">
                    {person.name || `Person ${person.personNumber}`}
                  </h1>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                    Individual Order
                  </span>
                </div>
                
                <div className="text-gray-600">
                  <p className="font-medium">{billSplit.table.restaurant.name}</p>
                  <p className="text-sm">{billSplit.table.restaurant.address}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">Table {billSplit.table.number}</span>
                    </div>
                    <div className="text-sm">
                      {person.personNumber} of {billSplit.totalPeople} people
                    </div>
                  </div>
                </div>
              </div>
              
              <PersonCartSummary 
                sessionId={sessionId}
                personNumber={personNumber}
                personId={person.id}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Category Navigation */}
      <div className="bg-white border-b sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 overflow-x-auto py-4">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-3 rounded-full whitespace-nowrap font-medium transition-all duration-200 ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-102'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <User className="h-5 w-5 text-blue-600" />
            <h2 className="font-semibold text-blue-900">Personal Ordering</h2>
          </div>
          <p className="text-blue-800 text-sm">
            You're ordering individually. Only you will pay for the items you select.
            Your current total: <span className="font-bold">EGP {person.totalAmount.toFixed(2)}</span>
          </p>
        </div>

        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No items available in this category</p>
          </div>
        ) : (
          <MenuSection 
            title={selectedCategory}
            items={filteredItems}
            tableNumber={billSplit.table.number}
            tableId={billSplit.table.id} // Changed to use table.id instead of table.number
            personId={person.id}
            sessionId={sessionId}
            personNumber={personNumber}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500">
            <p className="mb-2">🍽️ Ordering individually for {person.name || `Person ${person.personNumber}`}</p>
            <p className="text-sm">
              {/* Fixed: Now safely accessing restaurant.phone with proper typing */}
              Questions? Call {billSplit.table.restaurant.phone || 'the restaurant'} for assistance
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}