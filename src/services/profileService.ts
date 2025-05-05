
import { supabase } from '@/lib/supabase';

export const fetchProfileById = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      // Only log the error but don't throw it, so the app can continue
      console.error('Error fetching profile:', error.message);
    }

    return data || null;
  } catch (error: any) {
    console.error('Error fetching profile:', error.message);
    return null;
  }
};
