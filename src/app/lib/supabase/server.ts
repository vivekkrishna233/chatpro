import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const createClient = (cookieStore: ReturnType<typeof cookies>) => {
  return createServerClient(
    "https://nsvepnlskhvpydltppcd.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zdmVwbmxza2h2cHlkbHRwcGNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwODcxODIsImV4cCI6MjA2MzY2MzE4Mn0.3HDY5BgEU1Vzq92OQF-oZtKNBmnw_MKLVojT6Y4-qbA",
    {
      cookies: {
        async getAll() {
          return (await cookieStore).getAll();
        },
        setAll(cookiesToSet) {
          try {
            (async () => {
              for (const { name, value, options } of cookiesToSet) {
                await (await cookieStore).set(name, value, options);
              }
            })();
          } catch {
            // Ignore errors in Server Component context
          }
        },
      },
    }
  );
};
