
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://kksxzbcvosofafpkstow.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtrc3h6YmN2b3NvZmFmcGtzdG93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0NzU3MzcsImV4cCI6MjA2MjA1MTczN30.vFyv-n7xymV41xu7qyBskGKeMP8I8psg7vV0q1bta-w";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
