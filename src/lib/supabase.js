import { supabase } from './customSupabaseClient';


export { supabase };

export const isSupabaseConfigured = () => {
  return !!supabase;
};