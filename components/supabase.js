import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://bqthjsmyghfmujubnjru.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxdGhqc215Z2hmbXVqdWJuanJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDA2NjQ3MjgsImV4cCI6MjAxNjI0MDcyOH0.BLrvtOzhUvxGXgLR02bNDW1yvoHHfMAHjnUvAmKjlLs"
);

export default supabase;