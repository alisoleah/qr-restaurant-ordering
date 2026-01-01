'use client';

import { useState, useEffect } from 'react';
import { Eye, Clock, CheckCircle, Utensils, Users, DollarSign } from 'lucide-react';
import { Order } from '../../types';
import Link from 'next/link';
import Navigation from '../../components/Navigation';

interface TableWithOrders {
  id: string;
  number: number;
  capacity: number;
  status: string;
  orders: Order[];
  totalAmount: number;
  isPaid: boolean;
}

export default function AdminPage() {
  const [tables, setTables] = useState<TableWithOrders[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'occupied' | 'available'>('all');

  useEffect(() => {
    fetchTablesWithOrders();

    // Poll for new orders every 30 seconds
    const interval = setInterval(fetchTablesWithOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchTablesWithOrders = async () => {
    try {
      const response = await fetch('/api/admin/tables-with-orders');
      if (response.ok) {
        const tablesData = await response.json();
        setTables(tablesData);
      }
    } catch (error) {
      console.error('Failed to fetch tables:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTables = tables.filter(table => {
    if (filter === 'all') return true;
    if (filter === 'occupied') return table.orders.length > 0;
    if (filter === 'available') return table.orders.length === 0;
    return true;
  });

  const occupiedTables = tables.filter(t => t.orders.length > 0).length;
  const totalRevenue = tables.reduce((sum, t) => sum + t.totalAmount, 0);

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'text-white';
      case 'preparing': return 'text-white';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBgColor = (status: Order['status']) => {
    switch (status) {
      case 'confirmed': return { backgroundColor: '#00C2CB' };
      case 'preparing': return { backgroundColor: '#FF6B6B' };
      default: return {};
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending': return Clock;
      case 'confirmed': return CheckCircle;
      case 'preparing': return Utensils;
      case 'ready': return CheckCircle;
      default: return Clock;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F8F9FA' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#00C2CB' }}></div>
          <p style={{ color: '#2E3A45' }}>Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8F9FA' }}>
      <Navigation currentPage="admin" />

      {/* Header */}
      <header className="bg-white shadow-sm mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8" style={{ color: '#00C2CB' }} />
              <h1 className="text-2xl font-bold" style={{ color: '#2E3A45' }}>Restaurant Admin</h1>
            </div>
            <div className="flex space-x-4">
              <Link href="/admin/tables" className="hover:underline" style={{ color: '#6e7c8b' }}>
                Manage Tables
              </Link>
              <Link href="/qr-generator" className="hover:underline" style={{ color: '#6e7c8b' }}>
                QR Generator
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card text-center">
            <div className="text-3xl font-bold mb-2" style={{ color: '#00C2CB' }}>
              {tables.length}
            </div>
            <div style={{ color: '#6e7c8b' }}>Total Tables</div>
          </div>

          <div className="card text-center">
            <div className="text-3xl font-bold mb-2" style={{ color: '#FF6B6B' }}>
              {occupiedTables}
            </div>
            <div style={{ color: '#6e7c8b' }}>Occupied Tables</div>
          </div>

          <div className="card text-center">
            <div className="text-3xl font-bold mb-2" style={{ color: '#00C2CB' }}>
              {tables.length - occupiedTables}
            </div>
            <div style={{ color: '#6e7c8b' }}>Available Tables</div>
          </div>

          <div className="card text-center">
            <div className="text-3xl font-bold mb-2" style={{ color: '#2E3A45' }}>
              EGP {totalRevenue.toFixed(2)}
            </div>
            <div style={{ color: '#6e7c8b' }}>Total Revenue</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="card mb-8">
          <div className="flex space-x-1">
            {['all', 'occupied', 'available'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status as any)}
                className="px-4 py-2 rounded-lg capitalize transition-colors"
                style={filter === status
                  ? { backgroundColor: '#00C2CB', color: '#FFFFFF' }
                  : { backgroundColor: '#F8F9FA', color: '#2E3A45' }}
                onMouseEnter={(e) => {
                  if (filter !== status) {
                    e.currentTarget.style.backgroundColor = '#e8e9ea';
                  }
                }}
                onMouseLeave={(e) => {
                  if (filter !== status) {
                    e.currentTarget.style.backgroundColor = '#F8F9FA';
                  }
                }}
              >
                {status} {status === 'occupied' && `(${occupiedTables})`}
                {status === 'available' && `(${tables.length - occupiedTables})`}
              </button>
            ))}
          </div>
        </div>

        {/* Tables List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTables.length === 0 ? (
            <div className="card text-center py-8 col-span-2">
              <p style={{ color: '#6e7c8b' }}>No tables found</p>
            </div>
          ) : (
            filteredTables.map((table) => (
              <div key={table.id} className="card">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 rounded-full" style={table.orders.length > 0
                      ? { backgroundColor: 'rgba(255, 107, 107, 0.15)' }
                      : { backgroundColor: 'rgba(0, 194, 203, 0.15)' }}>
                      <Users className="h-6 w-6" style={{ color: table.orders.length > 0 ? '#FF6B6B' : '#00C2CB' }} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-xl" style={{ color: '#2E3A45' }}>
                        Table {table.number}
                      </h3>
                      <p className="text-sm" style={{ color: '#6e7c8b' }}>
                        Capacity: {table.capacity} people
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end space-y-1">
                    <span className="px-3 py-1 rounded-full text-sm font-medium capitalize" style={table.orders.length > 0
                      ? { backgroundColor: 'rgba(255, 107, 107, 0.15)', color: '#FF6B6B' }
                      : { backgroundColor: 'rgba(0, 194, 203, 0.15)', color: '#00C2CB' }}>
                      {table.orders.length > 0 ? 'Occupied' : 'Available'}
                    </span>
                    {table.orders.length > 0 && (
                      <span className="px-3 py-1 rounded-full text-sm font-medium" style={table.isPaid
                        ? { backgroundColor: 'rgba(0, 194, 203, 0.15)', color: '#00C2CB' }
                        : { backgroundColor: '#fef3c7', color: '#92400e' }}>
                        {table.isPaid ? 'Paid' : 'Unpaid'}
                      </span>
                    )}
                  </div>
                </div>

                {table.orders.length > 0 ? (
                  <>
                    {/* Orders Summary */}
                    <div className="rounded-lg p-4 mb-3" style={{ backgroundColor: '#F8F9FA' }}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium" style={{ color: '#2E3A45' }}>
                          Active Orders: {table.orders.length}
                        </span>
                        <span className="text-lg font-bold" style={{ color: '#2E3A45' }}>
                          EGP {table.totalAmount.toFixed(2)}
                        </span>
                      </div>

                      {/* Order Items Summary */}
                      <div className="space-y-1 mt-3">
                        {table.orders.map((order) => (
                          <div key={order.id} className="text-xs">
                            <div className="flex justify-between items-center">
                              <span style={{ color: '#6e7c8b' }}>Order #{order.id.slice(0, 8)}...</span>
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(order.status)}`} style={getStatusBgColor(order.status)}>
                                {order.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <Link
                        href={`/table/${table.number}`}
                        className="flex-1 btn-secondary text-sm px-4 py-2 text-center flex items-center justify-center space-x-1"
                      >
                        <Eye className="h-4 w-4" />
                        <span>View Table</span>
                      </Link>
                      {table.orders.length > 0 && (
                        <Link
                          href={`/receipt/${table.orders[0].id}`}
                          className="flex-1 btn-primary text-sm px-4 py-2 text-center flex items-center justify-center space-x-1"
                        >
                          <DollarSign className="h-4 w-4" />
                          <span>View Bill</span>
                        </Link>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-6" style={{ color: '#6e7c8b' }}>
                    <p className="text-sm">No active orders</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}