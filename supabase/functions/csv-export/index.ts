// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import * as postgres from "postgres";
import Papa from "papaparse";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey",
};

const databaseUrl = Deno.env.get("SUPABASE_DB_URL")!;

Deno.serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const pool = new postgres.Pool(databaseUrl, 3, true);
  try {
    const connection = await pool.connect();
    // TODO Match by company_id
    const result = await connection.queryObject`
    SELECT inventory.date, record_view.*
    FROM inventory
    JOIN record_view ON inventory.id = record_view.inventory_id
    WHERE inventory.company_id = ${2}
    ORDER BY inventory.date
    LIMIT 10 OFFSET 0;`;

    const contents = Papa.unparse(result.rows);

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

    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  } finally {
    await pool.end();
  }
});

// To invoke:
// curl -v 'http://127.0.0.1:54321/functions/v1/csv-export' \
//   --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
//   --output 'csv-export-test.csv' \
