// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.
import Papa from "papaparse";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "@supabase/supabase-js@2";
import { Database } from "../_shared/database.types.ts";

Deno.serve(async (req) => {
  // preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  try {
    const authHeader = req.headers.get("Authorization")!;
    const supabase = createClient<Database>(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data, error } = await supabase
      .from("inventory")
      .select(`date, record_view (*)`)
      .order("date");

    if (!data) {
      return new Response(
        error ? String(error.message) : "No data to return.",
        { status: 500 }
      );
    }

    const contents = Papa.unparse(
      data.map((row) => ({ date: row.date, ...row.record_view[0] }))
    );

    return new Response(new Blob([contents]), {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=inventory.csv",
      },
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return new Response(String(error?.message ?? error), { status: 500 });
  }
});

// To invoke:
// curl -v 'http://127.0.0.1:54321/functions/v1/csv-export' \
//   --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
//   --output 'csv-export-test.csv'
//
//
// Or click the button in the admin panel -> Overview
