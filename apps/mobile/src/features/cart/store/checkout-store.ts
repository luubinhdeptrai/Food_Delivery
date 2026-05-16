import { create } from 'zustand';
import { PaymentMethod } from '../types';

interface CheckoutState {
  selectedPaymentMethod: PaymentMethod | null;
  setSelectedPaymentMethod: (method: PaymentMethod) => void;
}

export const DEFAULT_PAYMENT_METHOD: PaymentMethod = {
  id: 'card-8829',
  brand: 'Mastercard',
  last4: '8829',
  expiry: '12/26',
  type: 'card',
};

export const useCheckoutStore = create<CheckoutState>((set) => ({
  selectedPaymentMethod: DEFAULT_PAYMENT_METHOD,
  setSelectedPaymentMethod: (method) => set({ selectedPaymentMethod: method }),
}));
