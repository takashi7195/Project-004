import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabaseUrl = 'https://afozqmhxwcaiefwimjjn.supabase.co';
const supabaseKey = 'sb_publishable_GkbtpYQRoQi33zmJhB-Bsg_tqA7sEDN';

export const supabase = createClient(supabaseUrl, supabaseKey);
