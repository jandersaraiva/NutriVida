import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lftaombspbwqwsydizka.supabase.co';
const supabaseKey = 'sb_publishable_89lLnGeQsLd4-fA4KkwHKA_SPR4vFMU';

export const supabase = createClient(supabaseUrl, supabaseKey);