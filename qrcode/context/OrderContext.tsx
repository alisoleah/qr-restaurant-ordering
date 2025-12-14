'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { OrderItem, MenuItem } from '../types';

interface OrderState {
  items: OrderItem[];
  tableNumber: string;
  customerEmail: string;
}

type OrderAction =
  | { type: 'ADD_ITEM'; payload: { menuItem: MenuItem; quantity: number; notes?: string } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_ORDER' }
  | { type: 'SET_TABLE'; payload: string }
  | { type: 'SET_EMAIL'; payload: string }
  | { type: 'LOAD_ITEMS'; payload: OrderItem[] };

const initialState: OrderState = {
  items: [],
  tableNumber: '',
  customerEmail: ''
};

function orderReducer(state: OrderState, action: OrderAction): OrderState {
  switch (action.type) {
    case 'ADD_ITEM':
      const existingItem = state.items.find(item => item.menuItem.id === action.payload.menuItem.id);
      
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.menuItem.id === action.payload.menuItem.id
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          )
        };
      }
      
      return {
        ...state,
        items: [...state.items, {
          id: Date.now().toString(),
          menuItem: action.payload.menuItem,
          quantity: action.payload.quantity,
          notes: action.payload.notes
        }]
      };
      
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload)
      };
      
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ).filter(item => item.quantity > 0)
      };
      
    case 'CLEAR_ORDER':
      return {
        ...state,
        items: []
      };
      
    case 'SET_TABLE':
      return {
        ...state,
        tableNumber: action.payload
      };
      
    case 'SET_EMAIL':
      return {
        ...state,
        customerEmail: action.payload
      };

    case 'LOAD_ITEMS':
      return {
        ...state,
        items: action.payload
      };

    default:
      return state;
  }
}

const OrderContext = createContext<{
  state: OrderState;
  dispatch: React.Dispatch<OrderAction>;
} | null>(null);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(orderReducer, initialState);
  
  return (
    <OrderContext.Provider value={{ state, dispatch }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder() {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
}