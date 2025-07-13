'use client';

import { OrderProvider } from '../context/OrderContext';

export function OrderProviderWrapper({ children }: { children: React.ReactNode }) {
  return <OrderProvider>{children}</OrderProvider>;
}