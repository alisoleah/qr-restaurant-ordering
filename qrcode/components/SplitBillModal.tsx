'use client'

import { useState } from 'react'
import { X, Users, List, ArrowRight } from 'lucide-react'

interface SplitBillModalProps {
  isOpen: boolean
  onClose: () => void
  tableCapacity: number
  totalAmount: number
  onEqualSplit: (numPeople: number) => void
  onItemizedSplit: () => void
}

export default function SplitBillModal({
  isOpen,
  onClose,
  tableCapacity,
  totalAmount,
  onEqualSplit,
  onItemizedSplit
}: SplitBillModalProps) {
  const [splitType, setSplitType] = useState<'equal' | 'itemized' | null>(null)
  const [numPeople, setNumPeople] = useState(tableCapacity)

  if (!isOpen) return null

  const amountPerPerson = totalAmount / numPeople

  const handleConfirm = () => {
    if (splitType === 'equal') {
      onEqualSplit(numPeople)
    } else if (splitType === 'itemized') {
      onItemizedSplit()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-900">Split Bill</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Total Amount Display */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 text-center border border-blue-100">
            <p className="text-sm text-gray-600 mb-1">Total Bill Amount</p>
            <p className="text-4xl font-bold text-gray-900">EGP {totalAmount.toFixed(2)}</p>
          </div>

          {/* Split Type Selection */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 mb-3">Choose Split Method</h3>

            {/* Equal Split Option */}
            <div
              onClick={() => setSplitType('equal')}
              className={`border-2 rounded-xl p-5 cursor-pointer transition-all ${
                splitType === 'equal'
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start">
                <div className={`p-3 rounded-lg ${
                  splitType === 'equal' ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  <Users className={`w-6 h-6 ${
                    splitType === 'equal' ? 'text-blue-600' : 'text-gray-600'
                  }`} />
                </div>
                <div className="ml-4 flex-1">
                  <h4 className="font-semibold text-lg text-gray-900">Equal Split</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Split the bill equally among everyone at the table
                  </p>

                  {splitType === 'equal' && (
                    <div className="mt-4 space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Number of People
                        </label>
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setNumPeople(Math.max(2, numPeople - 1))
                            }}
                            className="w-10 h-10 rounded-lg bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-bold text-gray-700 transition"
                          >
                            −
                          </button>
                          <input
                            type="number"
                            value={numPeople}
                            onChange={(e) => {
                              e.stopPropagation()
                              const val = parseInt(e.target.value) || 2
                              setNumPeople(Math.max(2, Math.min(20, val)))
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-20 text-center text-2xl font-bold py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                            min="2"
                            max="20"
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setNumPeople(Math.min(20, numPeople + 1))
                            }}
                            className="w-10 h-10 rounded-lg bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-bold text-gray-700 transition"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="bg-blue-100 border border-blue-200 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-blue-900">Amount per person:</span>
                          <span className="text-2xl font-bold text-blue-900">
                            EGP {amountPerPerson.toFixed(2)}
                          </span>
                        </div>
                        <p className="text-xs text-blue-700 mt-2">
                          Including tax, service charge, and tips
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Itemized Split Option */}
            <div
              onClick={() => setSplitType('itemized')}
              className={`border-2 rounded-xl p-5 cursor-pointer transition-all ${
                splitType === 'itemized'
                  ? 'border-purple-500 bg-purple-50 shadow-md'
                  : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start">
                <div className={`p-3 rounded-lg ${
                  splitType === 'itemized' ? 'bg-purple-100' : 'bg-gray-100'
                }`}>
                  <List className={`w-6 h-6 ${
                    splitType === 'itemized' ? 'text-purple-600' : 'text-gray-600'
                  }`} />
                </div>
                <div className="ml-4 flex-1">
                  <h4 className="font-semibold text-lg text-gray-900">Itemized Split</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Each person selects and pays for their own items
                  </p>

                  {splitType === 'itemized' && (
                    <div className="mt-4 bg-purple-100 border border-purple-200 rounded-lg p-4">
                      <p className="text-sm text-purple-900 font-medium">
                        Each person will scan a QR code and select which items they ordered
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!splitType}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <span>Continue</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
