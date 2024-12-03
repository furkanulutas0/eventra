import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

export const supabase = createClient(
  `${process.env.SUPABASE_PROJECT_URL}`,
  `${process.env.SUPABASE_PUBLIC_ANON_KEY}`
);
