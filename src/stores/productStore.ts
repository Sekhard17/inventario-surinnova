import create from 'zustand';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  code: string;
  name: string;
  category: string;
  stock: number;
  branch: string;
}

interface ProductStore {
  products: Product[];
  loading: boolean;
  fetchProducts: () => Promise<void>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  updateStock: (id: string, quantity: number) => Promise<void>;
  checkLowStock: () => Product[];
}

export const useProducts = create<ProductStore>((set, get) => ({
  products: [],
  loading: false,

  fetchProducts: async () => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');
      
      if (error) throw error;
      set({ products: data });
    } catch (error) {
      toast.error('Error al cargar productos');
    } finally {
      set({ loading: false });
    }
  },

  addProduct: async (product) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([product])
        .select()
        .single();

      if (error) throw error;
      set(state => ({ products: [...state.products, data] }));
      toast.success('Producto agregado exitosamente');
    } catch (error) {
      toast.error('Error al agregar producto');
    }
  },

  updateProduct: async (id, updates) => {
    try {
      const { error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      set(state => ({
        products: state.products.map(p => 
          p.id === id ? { ...p, ...updates } : p
        )
      }));
      toast.success('Producto actualizado exitosamente');
    } catch (error) {
      toast.error('Error al actualizar producto');
    }
  },

  deleteProduct: async (id) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      set(state => ({
        products: state.products.filter(p => p.id !== id)
      }));
      toast.success('Producto eliminado exitosamente');
    } catch (error) {
      toast.error('Error al eliminar producto');
    }
  },

  updateStock: async (id, quantity) => {
    const product = get().products.find(p => p.id === id);
    if (!product) return;

    const newStock = product.stock + quantity;
    if (newStock < 0) {
      toast.error('Stock insuficiente');
      return;
    }

    await get().updateProduct(id, { stock: newStock });
  },

  checkLowStock: () => {
    const LOW_STOCK_THRESHOLD = 10;
    return get().products.filter(p => p.stock <= LOW_STOCK_THRESHOLD);
  },
}));