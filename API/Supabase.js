import { createClient } from '@supabase/supabase-js'


const supabaseUrl = 'https://zjvxlqvbljuoyncglbbm.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqdnhscXZibGp1b3luY2dsYmJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc2MzAwNzYsImV4cCI6MjA1MzIwNjA3Nn0.olB2yAIi4BBzOmgZoGjc2AsKeZTaglAiQ1YSiq-aGSk'
const supabase = createClient(supabaseUrl, supabaseKey)


export default supabase