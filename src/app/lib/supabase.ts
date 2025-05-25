
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nsvepnlskhvpydltppcd.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zdmVwbmxza2h2cHlkbHRwcGNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwODcxODIsImV4cCI6MjA2MzY2MzE4Mn0.3HDY5BgEU1Vzq92OQF-oZtKNBmnw_MKLVojT6Y4-qbA'

export const supabase = createClient(supabaseUrl, supabaseKey)