import { create } from 'zustand';

interface AddressState {
  selectedAddress: string;
  setSelectedAddress: (address: string) => void;
}

export const useAddressStore = create<AddressState>((set) => ({
  selectedAddress: 'Asia Square Tower 2',
  setSelectedAddress: (address) => set({ selectedAddress: address }),
}));
