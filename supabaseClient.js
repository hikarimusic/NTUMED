import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eyswixtxgreuqupdkgzi.supabase.co';  // replace with your Supabase URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5c3dpeHR4Z3JldXF1cGRrZ3ppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjUwOTMwOTgsImV4cCI6MjA0MDY2OTA5OH0.NOKdCCWKNWAhFddg5WsisRbP7jFOVBYsirFgVJmyrFk';  // replace with your anon API key
export const supabase = createClient(supabaseUrl, supabaseKey);
