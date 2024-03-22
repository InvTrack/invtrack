// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.
import { corsHeaders } from "../_shared/cors.ts";
import DocumentIntelligence, {
  AnalyzeResultOperationOutput,
  getLongRunningPoller,
} from "@azure-rest/ai-document-intelligence@1.0.0-beta.2";

const DocumentIntelligenceEndpoint = Deno.env.get(
  "DOCUMENT_INTELLIGENCE_ENDPOINT"
);
const DocumentIntelligenceApiKey = Deno.env.get(
  "DOCUMENT_INTELLIGENCE_API_KEY"
);

const testUrl =
  "https://www.rybnik.com.pl/files/ranking%20wspolnota2022/308399527_628541955652257_1516870276728069286_n.jpg";

Deno.serve(async (req) => {
  // preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (!DocumentIntelligenceEndpoint || !DocumentIntelligenceApiKey) {
    return new Response("Environment variables are not set up correctly.", {
      status: 500,
    });
  }

  const base64DataFromReq = await req.json();
  console.log(base64DataFromReq.image.data);

  const client = DocumentIntelligence(DocumentIntelligenceEndpoint, {
    key: DocumentIntelligenceApiKey,
  });

  const initialResponse = await client
    .path("/documentModels/{modelId}:analyze", "prebuilt-invoice")
    .post({
      contentType: "application/json",
      body: {
        base64Source: base64DataFromReq.image.data,
      },
    });

  console.time("pollUntilDone");

  const poller = await getLongRunningPoller(client, initialResponse);
  const result = (await poller.pollUntilDone())
    .body as AnalyzeResultOperationOutput;

  console.timeEnd("pollUntilDone");
  // around 5s!!!! -- try out if closer datacenters are available

  return new Response(JSON.stringify(result), { headers: corsHeaders });
});

// To invoke:
// curl -v 'http://127.0.0.1:54321/functions/v1/scan-doc' \
//   --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
