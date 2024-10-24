import create from 'zustand';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export type MovementType = 'in' | 'out';

interface Movement {
  id: string;
  date: string;
  type: MovementType;
  productId: string;
  product: string;
  quantity: number;
  userId: string;
  user: string;
  reason: string;
}

interface InventoryStore {
  movements: Movement[];
  loading: boolean;
  fetchMovements: () => Promise<void>;
  registerMovement: (movement: Omit<Movement, 'id' | 'date'>) => Promise<void>;
  getMovementsByType: (type: MovementType) => Movement[];
  getRecentMovements: (limit?: number) => Movement[];
}

export const useInventory = create<InventoryStore>((set, get) => ({
  movements: [],
  loading: false,

  fetchMovements: async () => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('inventory_movements')
        .select(`
          *,
          products (name),
          users (name)
        `)
        .order('date', { ascending: false });
      
      if (error) throw error;
      set({ movements: data });
    } catch (error) {
      toast.error('Error al cargar movimientos');
    } finally {
      set({ loading: false });
    }
  },

  registerMovement: async (movement) => {
    try {
      const { data, error } = await supabase
        .from('inventory_movements')
        .insert([{ ...movement, date: new Date().toISOString() }])
        .select()
        .single();

      if (error) throw error;
      set(state => ({ movements: [data, ...state.movements] }));
      toast.success('Movimiento registrado exitosamente');
    } catch (error) {
      toast.error('Error al registrar movimiento');
    }
  },

  getMovementsByType: (type: MovementType) => {
    return get().movements.filter(m => m.type === type);
  },

  getRecentMovements: (limit = 10) => {
    return get().movements.slice(0, limit);
  },
}));