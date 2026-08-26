import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabaseUrl = 'https://ainwtluvzixkbstuwnvk.supabase.co';
const supabaseKey = 'sb_publishable_vdUH17i43jfjpB7Fs2bIKA_UYGEIMBF';

export const supabase = createClient(supabaseUrl, supabaseKey);
