// app/lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://kxsyptdzzkuhpwgurzap.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4c3lwdGR6emt1aHB3Z3VyemFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgyMDI3ODIsImV4cCI6MjA1Mzc3ODc4Mn0.bcnR4Sfbckinwsz-_ttZhGZDBXLAuE4DYfCynffXhik"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)