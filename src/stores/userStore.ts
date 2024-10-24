import create from 'zustand';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export type UserRole = 'admin' | 'supervisor' | 'bodeguero' | 'personal';

interface User {
  id: string;
  email: string;
  name: string;
  lastName: string;
  role: UserRole;
  active: boolean;
  lastActivity: string;
}

interface UserStore {
  users: User[];
  loading: boolean;
  fetchUsers: () => Promise<void>;
  addUser: (user: Omit<User, 'id' | 'lastActivity'>) => Promise<void>;
  updateUser: (id: string, updates: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  registerUser: (email: string, password: string, userData: Omit<User, 'id' | 'lastActivity'>) => Promise<void>;
}

export const useUsers = create<UserStore>((set) => ({
  users: [],
  loading: false,

  fetchUsers: async () => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('name');
      
      if (error) throw error;
      set({ users: data });
    } catch (error) {
      toast.error('Error al cargar usuarios');
    } finally {
      set({ loading: false });
    }
  },

  addUser: async (user) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([{ ...user, lastActivity: new Date().toISOString() }])
        .select()
        .single();

      if (error) throw error;
      set(state => ({ users: [...state.users, data] }));
      toast.success('Usuario agregado exitosamente');
    } catch (error) {
      toast.error('Error al agregar usuario');
    }
  },

  updateUser: async (id, updates) => {
    try {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      set(state => ({
        users: state.users.map(u => 
          u.id === id ? { ...u, ...updates } : u
        )
      }));
      toast.success('Usuario actualizado exitosamente');
    } catch (error) {
      toast.error('Error al actualizar usuario');
    }
  },

  deleteUser: async (id) => {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (error) throw error;
      set(state => ({
        users: state.users.filter(u => u.id !== id)
      }));
      toast.success('Usuario eliminado exitosamente');
    } catch (error) {
      toast.error('Error al eliminar usuario');
    }
  },

  registerUser: async (email, password, userData) => {
    try {
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: userData.role,
            name: userData.name,
            lastName: userData.lastName,
          }
        }
      });

      if (authError) throw authError;

      // 2. Create user profile
      if (authData.user) {
        await supabase.from('users').insert([{
          id: authData.user.id,
          ...userData,
          lastActivity: new Date().toISOString(),
        }]);
      }

      toast.success('Usuario registrado exitosamente');
    } catch (error) {
      toast.error('Error al registrar usuario');
      throw error;
    }
  },
}));