import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/app/types/database'

export const createClient = () =>
  createBrowserClient<Database>(
    'https://nsvepnlskhvpydltppcd.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zdmVwbmxza2h2cHlkbHRwcGNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwODcxODIsImV4cCI6MjA2MzY2MzE4Mn0.3HDY5BgEU1Vzq92OQF-oZtKNBmnw_MKLVojT6Y4-qbA'
  )

export const supabase = createClient()
