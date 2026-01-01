'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  Edit2,
  Trash2,
  RefreshCw,
  Download,
  CheckCircle2,
  AlertCircle,
  Users,
  QrCode,
  Eye,
  XCircle
} from 'lucide-react';
import Link from 'next/link';
import Navigation from '../../../components/Navigation';

interface TableData {
  id: string;
  number: string;
  capacity: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'OUT_OF_SERVICE';
  qrCode: string | null;
  hasQrCode: boolean;
  orderCount: number;
  createdAt: string;
  updatedAt: string;
}

interface TableSummary {
  total: number;
  withQrCodes: number;
  withoutQrCodes: number;
  byStatus: {
    available: number;
    occupied: number;
    reserved: number;
    outOfService: number;
  };
}

export default function TablesManagementPage() {
  const [tables, setTables] = useState<TableData[]>([]);
  const [summary, setSummary] = useState<TableSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedTables, setSelectedTables] = useState<Set<string>>(new Set());
  const [editingTable, setEditingTable] = useState<TableData | null>(null);
  const [editForm, setEditForm] = useState({ number: '', capacity: 4, status: 'AVAILABLE' as TableData['status'] });

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/tables');
      if (response.ok) {
        const data = await response.json();
        setTables(data.tables || []);
        setSummary(data.summary || null);
      } else {
        setMessage({ type: 'error', text: 'Failed to fetch tables' });
      }
    } catch (error) {
      console.error('Failed to fetch tables:', error);
      setMessage({ type: 'error', text: 'Failed to fetch tables' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTable = async (tableId: string) => {
    if (!confirm('Are you sure you want to delete this table?')) return;

    try {
      const response = await fetch(`/api/admin/tables/${tableId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Table deleted successfully' });
        await fetchTables();
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.error || 'Failed to delete table' });
      }
    } catch (error) {
      console.error('Failed to delete table:', error);
      setMessage({ type: 'error', text: 'Failed to delete table' });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTables.size === 0) {
      setMessage({ type: 'error', text: 'No tables selected' });
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedTables.size} table(s)?`)) return;

    try {
      const deletePromises = Array.from(selectedTables).map(tableId =>
        fetch(`/api/admin/tables/${tableId}`, { method: 'DELETE' })
      );

      await Promise.all(deletePromises);
      setMessage({ type: 'success', text: `Deleted ${selectedTables.size} table(s) successfully` });
      setSelectedTables(new Set());
      await fetchTables();
    } catch (error) {
      console.error('Failed to delete tables:', error);
      setMessage({ type: 'error', text: 'Failed to delete some tables' });
    }
  };

  const handleRegenerateQR = async (tableId: string, tableNumber: string) => {
    try {
      const response = await fetch('/api/admin/qr-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'single',
          tableNumber: tableNumber,
          capacity: tables.find(t => t.id === tableId)?.capacity || 4,
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'QR code regenerated successfully' });
        await fetchTables();
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.error || 'Failed to regenerate QR code' });
      }
    } catch (error) {
      console.error('Failed to regenerate QR code:', error);
      setMessage({ type: 'error', text: 'Failed to regenerate QR code' });
    }
  };

  const handleEditTable = (table: TableData) => {
    setEditingTable(table);
    setEditForm({
      number: table.number,
      capacity: table.capacity,
      status: table.status,
    });
  };

  const handleUpdateTable = async () => {
    if (!editingTable) return;

    try {
      const response = await fetch(`/api/admin/tables/${editingTable.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Table updated successfully' });
        setEditingTable(null);
        await fetchTables();
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.error || 'Failed to update table' });
      }
    } catch (error) {
      console.error('Failed to update table:', error);
      setMessage({ type: 'error', text: 'Failed to update table' });
    }
  };

  const toggleTableSelection = (tableId: string) => {
    const newSelection = new Set(selectedTables);
    if (newSelection.has(tableId)) {
      newSelection.delete(tableId);
    } else {
      newSelection.add(tableId);
    }
    setSelectedTables(newSelection);
  };

  const toggleAllTables = () => {
    if (selectedTables.size === tables.length) {
      setSelectedTables(new Set());
    } else {
      setSelectedTables(new Set(tables.map(t => t.id)));
    }
  };

  const getStatusColor = (status: TableData['status']) => {
    switch (status) {
      case 'AVAILABLE':
        return '#00C2CB';
      case 'OCCUPIED':
        return '#FF6B6B';
      case 'RESERVED':
        return '#FFA500';
      case 'OUT_OF_SERVICE':
        return '#6e7c8b';
      default:
        return '#2E3A45';
    }
  };

  const getStatusIcon = (status: TableData['status']) => {
    switch (status) {
      case 'AVAILABLE':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'OCCUPIED':
        return <Users className="h-4 w-4" />;
      case 'RESERVED':
        return <AlertCircle className="h-4 w-4" />;
      case 'OUT_OF_SERVICE':
        return <XCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8F9FA' }}>
      <Navigation currentPage="admin" />

      {/* Header */}
      <header className="bg-white shadow-sm mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <Table className="h-8 w-8" style={{ color: '#00C2CB' }} />
              <h1 className="text-2xl font-bold" style={{ color: '#2E3A45' }}>Tables Management</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/qr-generator" className="btn-secondary text-sm py-2 px-4">
                Generate QR Codes
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Message Display */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center space-x-2 ${
            message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5" style={{ color: '#00C2CB' }} />
            ) : (
              <AlertCircle className="h-5 w-5" style={{ color: '#FF6B6B' }} />
            )}
            <p className="text-sm" style={{ color: message.type === 'success' ? '#00C2CB' : '#FF6B6B' }}>
              {message.text}
            </p>
            <button onClick={() => setMessage(null)} className="ml-auto">
              <XCircle className="h-4 w-4" style={{ color: '#6e7c8b' }} />
            </button>
          </div>
        )}

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: '#6e7c8b' }}>Total Tables</p>
                  <p className="text-3xl font-bold mt-1" style={{ color: '#2E3A45' }}>{summary.total}</p>
                </div>
                <Table className="h-10 w-10" style={{ color: '#00C2CB', opacity: 0.2 }} />
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: '#6e7c8b' }}>With QR Codes</p>
                  <p className="text-3xl font-bold mt-1" style={{ color: '#00C2CB' }}>{summary.withQrCodes}</p>
                </div>
                <QrCode className="h-10 w-10" style={{ color: '#00C2CB', opacity: 0.2 }} />
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: '#6e7c8b' }}>Available</p>
                  <p className="text-3xl font-bold mt-1" style={{ color: '#00C2CB' }}>{summary.byStatus.available}</p>
                </div>
                <CheckCircle2 className="h-10 w-10" style={{ color: '#00C2CB', opacity: 0.2 }} />
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: '#6e7c8b' }}>Occupied</p>
                  <p className="text-3xl font-bold mt-1" style={{ color: '#FF6B6B' }}>{summary.byStatus.occupied}</p>
                </div>
                <Users className="h-10 w-10" style={{ color: '#FF6B6B', opacity: 0.2 }} />
              </div>
            </div>
          </div>
        )}

        {/* Bulk Actions */}
        {selectedTables.size > 0 && (
          <div className="card mb-6 flex items-center justify-between">
            <p className="text-sm font-medium" style={{ color: '#2E3A45' }}>
              {selectedTables.size} table(s) selected
            </p>
            <button
              onClick={handleBulkDelete}
              className="btn-primary text-sm py-2 px-4 flex items-center space-x-2"
              style={{ backgroundColor: '#FF6B6B' }}
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete Selected</span>
            </button>
          </div>
        )}

        {/* Tables List */}
        <div className="card">
          {isLoading ? (
            <div className="text-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" style={{ color: '#00C2CB' }} />
              <p style={{ color: '#6e7c8b' }}>Loading tables...</p>
            </div>
          ) : tables.length === 0 ? (
            <div className="text-center py-12">
              <Table className="h-12 w-12 mx-auto mb-4" style={{ color: '#6e7c8b', opacity: 0.3 }} />
              <p className="text-lg font-medium mb-2" style={{ color: '#2E3A45' }}>No tables found</p>
              <p className="text-sm mb-4" style={{ color: '#6e7c8b' }}>Get started by generating QR codes for your tables</p>
              <Link href="/qr-generator" className="btn-secondary inline-block text-sm py-2 px-4">
                Generate QR Codes
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                    <th className="text-left py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedTables.size === tables.length}
                        onChange={toggleAllTables}
                        className="w-4 h-4"
                      />
                    </th>
                    <th className="text-left py-3 px-4 font-semibold" style={{ color: '#2E3A45' }}>Table #</th>
                    <th className="text-left py-3 px-4 font-semibold" style={{ color: '#2E3A45' }}>Capacity</th>
                    <th className="text-left py-3 px-4 font-semibold" style={{ color: '#2E3A45' }}>Status</th>
                    <th className="text-left py-3 px-4 font-semibold" style={{ color: '#2E3A45' }}>QR Code</th>
                    <th className="text-left py-3 px-4 font-semibold" style={{ color: '#2E3A45' }}>Orders</th>
                    <th className="text-left py-3 px-4 font-semibold" style={{ color: '#2E3A45' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tables.map((table) => (
                    <tr key={table.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={selectedTables.has(table.id)}
                          onChange={() => toggleTableSelection(table.id)}
                          className="w-4 h-4"
                        />
                      </td>
                      <td className="py-3 px-4 font-medium" style={{ color: '#2E3A45' }}>
                        {table.number}
                      </td>
                      <td className="py-3 px-4" style={{ color: '#6e7c8b' }}>
                        {table.capacity} seats
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium"
                          style={{ backgroundColor: `${getStatusColor(table.status)}20`, color: getStatusColor(table.status) }}
                        >
                          {getStatusIcon(table.status)}
                          <span>{table.status.replace('_', ' ')}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {table.hasQrCode ? (
                          <CheckCircle2 className="h-5 w-5" style={{ color: '#00C2CB' }} />
                        ) : (
                          <XCircle className="h-5 w-5" style={{ color: '#6e7c8b' }} />
                        )}
                      </td>
                      <td className="py-3 px-4" style={{ color: '#6e7c8b' }}>
                        {table.orderCount}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditTable(table)}
                            className="p-2 rounded hover:bg-gray-100 transition"
                            title="Edit table"
                          >
                            <Edit2 className="h-4 w-4" style={{ color: '#00C2CB' }} />
                          </button>
                          <button
                            onClick={() => handleRegenerateQR(table.id, table.number)}
                            className="p-2 rounded hover:bg-gray-100 transition"
                            title="Regenerate QR code"
                          >
                            <RefreshCw className="h-4 w-4" style={{ color: '#00C2CB' }} />
                          </button>
                          {table.qrCode && (
                            <Link
                              href={table.qrCode}
                              target="_blank"
                              className="p-2 rounded hover:bg-gray-100 transition"
                              title="View table page"
                            >
                              <Eye className="h-4 w-4" style={{ color: '#6e7c8b' }} />
                            </Link>
                          )}
                          <button
                            onClick={() => handleDeleteTable(table.id)}
                            className="p-2 rounded hover:bg-gray-100 transition"
                            title="Delete table"
                          >
                            <Trash2 className="h-4 w-4" style={{ color: '#FF6B6B' }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingTable && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4" style={{ color: '#2E3A45' }}>
              Edit Table {editingTable.number}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#2E3A45' }}>
                  Table Number
                </label>
                <input
                  type="text"
                  value={editForm.number}
                  onChange={(e) => setEditForm({ ...editForm, number: e.target.value })}
                  className="input-field"
                  placeholder="Enter table number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#2E3A45' }}>
                  Capacity (seats)
                </label>
                <input
                  type="number"
                  value={editForm.capacity}
                  onChange={(e) => setEditForm({ ...editForm, capacity: parseInt(e.target.value) || 4 })}
                  className="input-field"
                  min="1"
                  max="20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#2E3A45' }}>
                  Status
                </label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value as TableData['status'] })}
                  className="input-field"
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="OCCUPIED">Occupied</option>
                  <option value="RESERVED">Reserved</option>
                  <option value="OUT_OF_SERVICE">Out of Service</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setEditingTable(null)}
                className="flex-1 px-4 py-2 border rounded-lg font-medium transition"
                style={{ borderColor: '#d1d5db', color: '#2E3A45' }}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateTable}
                className="flex-1 btn-secondary"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
