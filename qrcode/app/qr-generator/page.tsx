'use client';

import { useState, useRef } from 'react';
import { Download, QrCode, Plus, Minus } from 'lucide-react';
import Link from 'next/link';
import Navigation from '../../components/Navigation';

export default function QRGeneratorPage() {
  const [tableNumber, setTableNumber] = useState('');
  const [qrCodes, setQrCodes] = useState<Array<{ table: string; qrData: string }>>([]);
  const [bulkStart, setBulkStart] = useState(1);
  const [bulkEnd, setBulkEnd] = useState(10);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateQRCode = async (table: string) => {
    if (!table) return null;

    const QRCode = (await import('qrcode')).default;
    const url = `${window.location.origin}/table/${table}`;
    
    try {
      const qrDataURL = await QRCode.toDataURL(url, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      return qrDataURL;
    } catch (error) {
      console.error('Error generating QR code:', error);
      return null;
    }
  };

  const handleSingleGenerate = async () => {
    if (!tableNumber) return;
    
    const qrData = await generateQRCode(tableNumber);
    if (qrData) {
      setQrCodes([{ table: tableNumber, qrData }]);
    }
  };

  const handleBulkGenerate = async () => {
    if (bulkStart > bulkEnd) return;
    
    const newQrCodes: Array<{ table: string; qrData: string }> = [];
    
    for (let i = bulkStart; i <= bulkEnd; i++) {
      const qrData = await generateQRCode(i.toString());
      if (qrData) {
        newQrCodes.push({ table: i.toString(), qrData });
      }
    }
    
    setQrCodes(newQrCodes);
  };

  const downloadQRCode = (qrData: string, tableName: string) => {
    const link = document.createElement('a');
    link.download = `table-${tableName}-qr.png`;
    link.href = qrData;
    link.click();
  };

  const downloadAllQRCodes = async () => {
    if (qrCodes.length === 0) return;

    // Create a zip file with all QR codes (simplified version)
    for (const qr of qrCodes) {
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay between downloads
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
            body { font-family: Arial, sans-serif; margin: 20px; }
            .qr-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; }
            .qr-item { text-align: center; page-break-inside: avoid; border: 2px solid #ddd; padding: 20px; border-radius: 8px; }
            .qr-item h3 { margin-bottom: 10px; font-size: 24px; }
            .qr-item img { max-width: 200px; height: auto; }
            .qr-item p { margin-top: 10px; font-size: 14px; color: #666; }
            @media print { .qr-item { page-break-inside: avoid; } }
          </style>
        </head>
        <body>
          <h1 style="text-align: center; margin-bottom: 40px;">Restaurant Table QR Codes</h1>
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
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                  placeholder="Enter table number"
                />
              </div>
              <button
                onClick={handleSingleGenerate}
                disabled={!tableNumber}
                className="w-full btn-primary disabled:opacity-50"
              >
                Generate QR Code
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
                  />
                </div>
              </div>
              <button
                onClick={handleBulkGenerate}
                disabled={bulkStart > bulkEnd}
                className="w-full btn-primary disabled:opacity-50"
              >
                Generate QR Codes ({Math.max(0, bulkEnd - bulkStart + 1)} tables)
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
              <p>Generate QR codes for your restaurant tables using the forms above.</p>
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
              <p>Customers scan the QR code to access the menu and place orders.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}