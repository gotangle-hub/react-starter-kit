import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

const LOVABLE_CLOUD_URL = "https://fbtvxznbwjyktlkxzkpl.supabase.co";
const LOVABLE_CLOUD_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZidHZ4em5id2p5a3Rsa3h6a3BsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2Mzg0ODIsImV4cCI6MjA5NzIxNDQ4Mn0.4VBabmshSEWTJUz018EHlT3DKwMpnhvoKpek-0JmMyY";

// Lovable-standard config: `@` aliases to ./src
export default defineConfig({
  define: {
    "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(process.env.VITE_SUPABASE_URL || LOVABLE_CLOUD_URL),
    "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(process.env.VITE_SUPABASE_PUBLISHABLE_KEY || LOVABLE_CLOUD_PUBLISHABLE_KEY),
    "import.meta.env.VITE_SUPABASE_ANON_KEY": JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || LOVABLE_CLOUD_PUBLISHABLE_KEY),
  },
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
