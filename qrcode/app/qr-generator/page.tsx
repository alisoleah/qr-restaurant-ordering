'use client';

import { useState, useRef, useEffect } from 'react';
import { Download, QrCode, Plus, Minus, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import Navigation from '../../components/Navigation';

interface TableData {
  id: string;
  number: string;
  capacity: number;
  qrCode: string;
  status: string;
}

export default function QRGeneratorPage() {
  const [tableNumber, setTableNumber] = useState('');
  const [capacity, setCapacity] = useState(4);
  const [qrCodes, setQrCodes] = useState<Array<{ table: string; qrData: string; id?: string }>>([]);
  const [bulkStart, setBulkStart] = useState(1);
  const [bulkEnd, setBulkEnd] = useState(10);
  const [bulkCapacity, setBulkCapacity] = useState(4);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [existingTables, setExistingTables] = useState<TableData[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Fetch existing tables on component mount
  useEffect(() => {
    fetchExistingTables();
  }, []);

  const fetchExistingTables = async () => {
    try {
      const response = await fetch('/api/admin/tables');
      if (response.ok) {
        const data = await response.json();
        setExistingTables(data.tables || []);
      }
    } catch (error) {
      console.error('Failed to fetch existing tables:', error);
    }
  };

  const generateQRCode = async (table: string) => {
    if (!table) return null;

    const QRCode = (await import('qrcode')).default;
    const url = `${window.location.origin}/table/${table}`;

    try {
      const qrDataURL = await QRCode.toDataURL(url, {
        width: 256,
        margin: 2,
        color: {
          dark: '#00C2CB',
          light: '#FFFFFF'
        }
      });
      return qrDataURL;
    } catch (error) {
      console.error('Error generating QR code:', error);
      return null;
    }
  };

  const saveToDatabase = async (mode: 'single' | 'bulk') => {
    setIsSaving(true);
    setMessage(null);

    try {
      const requestBody: any = {
        mode,
        capacity: mode === 'single' ? capacity : bulkCapacity,
      };

      if (mode === 'single') {
        requestBody.tableNumber = tableNumber;
      } else {
        requestBody.startTable = bulkStart;
        requestBody.endTable = bulkEnd;
      }

      const response = await fetch('/api/admin/qr-generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save to database');
      }

      // Generate QR codes for display
      const qrCodesWithData = await Promise.all(
        data.tables.map(async (table: TableData) => {
          const qrData = await generateQRCode(table.number);
          return {
            table: table.number,
            qrData: qrData || '',
            id: table.id,
          };
        })
      );

      setQrCodes(qrCodesWithData);
      setMessage({
        type: 'success',
        text: `✅ Successfully saved ${data.tables.length} table(s) to database!`,
      });

      // Refresh existing tables list
      await fetchExistingTables();

      // Clear form fields
      if (mode === 'single') {
        setTableNumber('');
      }
    } catch (error: any) {
      console.error('Error saving to database:', error);
      setMessage({
        type: 'error',
        text: `❌ ${error.message}`,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSingleGenerate = async () => {
    if (!tableNumber) {
      setMessage({ type: 'error', text: 'Please enter a table number' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    await saveToDatabase('single');
    setIsLoading(false);
  };

  const handleBulkGenerate = async () => {
    if (bulkStart > bulkEnd) {
      setMessage({ type: 'error', text: 'Start table must be ≤ end table' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    await saveToDatabase('bulk');
    setIsLoading(false);
  };

  const downloadQRCode = (qrData: string, tableName: string) => {
    const link = document.createElement('a');
    link.download = `table-${tableName}-qr.png`;
    link.href = qrData;
    link.click();
  };

  const downloadAllQRCodes = async () => {
    if (qrCodes.length === 0) return;

    for (const qr of qrCodes) {
      await new Promise(resolve => setTimeout(resolve, 100));
      downloadQRCode(qr.qrData, qr.table);
    }
  };

  const printQRCodes = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Codes for Tables</title>
          <style>
            body { font-family: 'Poppins', Arial, sans-serif; margin: 20px; }
            .qr-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; }
            .qr-item { text-align: center; page-break-inside: avoid; border: 2px solid #00C2CB; padding: 20px; border-radius: 8px; }
            .qr-item h3 { margin-bottom: 10px; font-size: 24px; color: #2E3A45; }
            .qr-item img { max-width: 200px; height: auto; }
            .qr-item p { margin-top: 10px; font-size: 14px; color: #6e7c8b; }
            @media print { .qr-item { page-break-inside: avoid; } }
          </style>
        </head>
        <body>
          <h1 style="text-align: center; margin-bottom: 40px; color: #2E3A45;">Restaurant Table QR Codes</h1>
          <div class="qr-grid">
            ${qrCodes.map(qr => `
              <div class="qr-item">
                <h3>Table ${qr.table}</h3>
                <img src="${qr.qrData}" alt="QR Code for Table ${qr.table}" />
                <p>Scan to view menu and place order</p>
              </div>
            `).join('')}
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8F9FA' }}>
      <Navigation currentPage="other" />

      {/* Header */}
      <header className="bg-white shadow-sm mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <QrCode className="h-8 w-8" style={{ color: '#00C2CB' }} />
              <h1 className="text-2xl font-bold" style={{ color: '#2E3A45' }}>QR Code Generator</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm" style={{ color: '#6e7c8b' }}>
                {existingTables.length} tables • {existingTables.filter(t => t.qrCode).length} with QR codes
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          </div>
        )}

        {/* Generation Controls */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Single QR Code */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4" style={{ color: '#2E3A45' }}>Generate Single QR Code</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#2E3A45' }}>
                  Table Number
                </label>
                <input
                  type="text"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className="input-field"
                  placeholder="Enter table number (e.g., 1, A1, VIP-1)"
                  disabled={isLoading || isSaving}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#2E3A45' }}>
                  Capacity (seats)
                </label>
                <input
                  type="number"
                  value={capacity}
                  onChange={(e) => setCapacity(parseInt(e.target.value) || 4)}
                  className="input-field"
                  min="1"
                  max="20"
                  disabled={isLoading || isSaving}
                />
              </div>
              <button
                onClick={handleSingleGenerate}
                disabled={!tableNumber || isLoading || isSaving}
                className="w-full btn-primary disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>{isSaving ? 'Saving...' : 'Generate & Save to Database'}</span>
              </button>
            </div>
          </div>

          {/* Bulk QR Codes */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4" style={{ color: '#2E3A45' }}>Generate Multiple QR Codes</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#2E3A45' }}>
                    Start Table
                  </label>
                  <input
                    type="number"
                    value={bulkStart}
                    onChange={(e) => setBulkStart(parseInt(e.target.value) || 1)}
                    className="input-field"
                    min="1"
                    disabled={isLoading || isSaving}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#2E3A45' }}>
                    End Table
                  </label>
                  <input
                    type="number"
                    value={bulkEnd}
                    onChange={(e) => setBulkEnd(parseInt(e.target.value) || 10)}
                    className="input-field"
                    min="1"
                    disabled={isLoading || isSaving}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#2E3A45' }}>
                  Capacity per table (seats)
                </label>
                <input
                  type="number"
                  value={bulkCapacity}
                  onChange={(e) => setBulkCapacity(parseInt(e.target.value) || 4)}
                  className="input-field"
                  min="1"
                  max="20"
                  disabled={isLoading || isSaving}
                />
              </div>
              <button
                onClick={handleBulkGenerate}
                disabled={bulkStart > bulkEnd || isLoading || isSaving}
                className="w-full btn-primary disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>
                  {isSaving
                    ? 'Saving...'
                    : `Generate & Save ${Math.max(0, bulkEnd - bulkStart + 1)} tables`
                  }
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Generated QR Codes */}
        {qrCodes.length > 0 && (
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold" style={{ color: '#2E3A45' }}>Generated QR Codes</h2>
              <div className="space-x-2">
                <button
                  onClick={downloadAllQRCodes}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Download All</span>
                </button>
                <button
                  onClick={printQRCodes}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Print All</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {qrCodes.map((qr) => (
                <div key={qr.table} className="border rounded-lg p-4 text-center" style={{ backgroundColor: '#F8F9FA' }}>
                  <h3 className="text-lg font-semibold mb-3" style={{ color: '#2E3A45' }}>Table {qr.table}</h3>
                  <img
                    src={qr.qrData}
                    alt={`QR Code for Table ${qr.table}`}
                    className="mx-auto mb-3 border rounded"
                  />
                  <p className="text-sm mb-3" style={{ color: '#6e7c8b' }}>
                    Scan to view menu and place order
                  </p>
                  <div className="space-y-2">
                    <button
                      onClick={() => downloadQRCode(qr.qrData, qr.table)}
                      className="w-full btn-secondary text-sm py-2"
                    >
                      Download PNG
                    </button>
                    <Link
                      href={`/table/${qr.table}`}
                      target="_blank"
                      className="block w-full btn-primary text-sm py-2"
                    >
                      Test Table
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="card mt-8">
          <h2 className="text-xl font-bold mb-4" style={{ color: '#2E3A45' }}>How to Use</h2>
          <div className="space-y-3" style={{ color: '#2E3A45' }}>
            <div className="flex items-start space-x-3">
              <span className="px-2 py-1 rounded text-sm font-medium" style={{ backgroundColor: 'rgba(0, 194, 203, 0.15)', color: '#00C2CB' }}>1</span>
              <p>Generate QR codes for your restaurant tables using the forms above. Tables are automatically saved to the database.</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="px-2 py-1 rounded text-sm font-medium" style={{ backgroundColor: 'rgba(0, 194, 203, 0.15)', color: '#00C2CB' }}>2</span>
              <p>Download the QR codes as PNG images or print them directly.</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="px-2 py-1 rounded text-sm font-medium" style={{ backgroundColor: 'rgba(0, 194, 203, 0.15)', color: '#00C2CB' }}>3</span>
              <p>Place the printed QR codes on your restaurant tables.</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="px-2 py-1 rounded text-sm font-medium" style={{ backgroundColor: 'rgba(0, 194, 203, 0.15)', color: '#00C2CB' }}>4</span>
              <p>Customers scan the QR code to access the menu for that specific table and place orders.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
