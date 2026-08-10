// src/lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

// نقرأ القيم من ملف البيئة .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// إنشاء كلاينت واحد نستعمله في كامل التطبيق
export const supabase = createClient(supabaseUrl, supabaseKey)