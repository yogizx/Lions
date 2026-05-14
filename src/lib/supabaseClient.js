import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vmlkupjeuwtsehhthoig.supabase.co';
const supabaseKey = 'sb_publishable_2w5sffRDq_R3kFnrBBAL2A_6J26s7Kr';

export const supabase = createClient(supabaseUrl, supabaseKey);
