import create from 'zustand';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export type OrderStatus = 'pending' | 'completed' | 'cancelled';

interface OrderProduct {
  productId: string;
  quantity: number;
}

interface Order {
  id: string;
  number: string;
  date: string;
  deliveryDate: string;
  products: OrderProduct[];
  branch: string;
  address: string;
  carrier: string;
  carrierPhone: string;
  deliveryPolicy: string;
  authorizedBy: string;
  additionalInfo: string;
  status: OrderStatus;
}

interface OrderStore {
  orders: Order[];
  loading: boolean;
  fetchOrders: () => Promise<void>;
  createOrder: (order: Omit<Order, 'id' | 'number'>) => Promise<void>;
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<void>;
  getPendingOrders: () => Order[];
  getTodayOrders: () => Order[];
}

export const useOrders = create<OrderStore>((set, get) => ({
  orders: [],
  loading: false,

  fetchOrders: async () => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) throw error;
      set({ orders: data });
    } catch (error) {
      toast.error('Error al cargar órdenes');
    } finally {
      set({ loading: false });
    }
  },

  createOrder: async (order) => {
    try {
      const orderNumber = `OD${Date.now()}`;
      const { data, error } = await supabase
        .from('orders')
        .insert([{ ...order, number: orderNumber }])
        .select()
        .single();

      if (error) throw error;
      set(state => ({ orders: [data, ...state.orders] }));
      toast.success('Orden creada exitosamente');
    } catch (error) {
      toast.error('Error al crear orden');
    }
  },

  updateOrderStatus: async (id, status) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      set(state => ({
        orders: state.orders.map(o => 
          o.id === id ? { ...o, status } : o
        )
      }));
      toast.success('Estado de orden actualizado');
    } catch (error) {
      toast.error('Error al actualizar estado');
    }
  },

  getPendingOrders: () => {
    return get().orders.filter(o => o.status === 'pending');
  },

  getTodayOrders: () => {
    const today = new Date().toISOString().split('T')[0];
    return get().orders.filter(o => o.date.startsWith(today));
  },
}));