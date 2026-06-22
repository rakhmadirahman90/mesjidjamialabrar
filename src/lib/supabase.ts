
import { createClient } from '@supabase/supabase-js';

let _supabase: any = null;

export const isSupabaseConfigured = () => {
  return !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
};

export const supabase = new Proxy({} as any, {
  get(target, prop) {
    if (prop === 'isConfigured') return isSupabaseConfigured();

    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!_supabase) {
      if (!url || !key) {
        // Return a mock that allows chaining but fails on execution
        return () => ({
          from: () => ({
            select: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
            insert: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
            update: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
            delete: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
          })
        });
      }
      _supabase = createClient(url, key);
    }
    
    const value = _supabase[prop];
    if (typeof value === 'function') {
      return value.bind(_supabase);
    }
    return value;
  }
});
