import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://pzwpgbnxlndlblmmcuoo.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6d3BnYm54bG5kbGJsbW1jdW9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE2Nzc2ODk0NjIsImV4cCI6MTk5MzI2NTQ2Mn0.Kiid-moKg5BPa5IktFtbtn7ax69mxhU4VgW9RI-qcjs"

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
