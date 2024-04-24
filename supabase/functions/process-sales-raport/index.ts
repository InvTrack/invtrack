// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.
import { corsHeaders } from "../_shared/cors.ts";
import DocumentIntelligence, {
  AnalyzeResultOperationOutput,
  DocumentFieldOutput,
  getLongRunningPoller,
} from "@azure-rest/ai-document-intelligence@1.0.0-beta.2";
import isEmpty from "lodash/isEmpty";
import { isNil } from "../_shared/isNil.ts";
import { createClient } from "@supabase/supabase-js@2";
import { Database } from "../_shared/database.types.ts";

const DocumentIntelligenceEndpoint = Deno.env.get(
  "DOCUMENT_INTELLIGENCE_ENDPOINT"
);
const DocumentIntelligenceApiKey = Deno.env.get(
  "DOCUMENT_INTELLIGENCE_API_KEY"
);

/**
 * sometimes invoice systems round floats differently
 *
 * allow a 0.03 tolerance
 */
const isCloseEnough = (value1: number, value2: number): boolean =>
  Math.abs(parseFloat6Precision(value1 - value2)) <= 0.03;

const getValueAsNumber = (
  item: DocumentFieldOutput | undefined
): number | null => {
  if (item == null) {
    return null;
  }
  if (item.type === "number") {
    return parseFloat6Precision(item.valueNumber!);
  }
  if (item.type === "currency") {
    return parseFloat6Precision(item.valueCurrency!.amount);
  }
  if (item.type === "string") {
    return parseFloat6Precision(parseFloat(item.valueString!));
  }
  return null;
};
/**
 * standardize possible floats to 2 decimal places
 *
 * should wrap every number returned in a response
 */
const parseFloatForResponse = (value: number | null): number | null =>
  value == null ? null : parseFloat(value.toFixed(2));

/**
 * normalize strings to remove newlines
 *
 * should wrap every string returned in a response
 */
const parseStringForResponse = (value: string | null): string | null =>
  value == null
    ? null
    : value
        .replace(/\r?\n|\r/g, " ")
        .trim()
        .normalize("NFC");

/**
 * standardize possible floats to 6 decimal places
 *
 * should wrap every expected number
 */
const parseFloat6Precision = (value: number): number =>
  parseFloat(value.toFixed(6));

const getName = (item: DocumentFieldOutput | undefined) => {
  if (item == null) {
    return null;
  }
  // the value MAY be an empty string
  if (item?.type !== "string" || isNil(item.valueString)) {
    return "";
  }
  return item.valueString ?? null;
};

const getPricePerUnit = (
  item: Record<string, DocumentFieldOutput> | undefined
): number | null => {
  if (
    item == null ||
    item?.Amount == null ||
    item?.Quantity == null ||
    item?.UnitPrice == null ||
    item?.Tax == null
  ) {
    return null;
  }

  const unitPrice = getValueAsNumber(item.UnitPrice);
  const quantity = getValueAsNumber(item.Quantity);
  const amount = getValueAsNumber(item.Amount);
  const tax = getValueAsNumber(item.Tax);

  if (unitPrice == null || quantity == null || amount == null || tax == null) {
    return null;
  }

  if (!isCloseEnough(quantity * unitPrice + tax, amount)) {
    return parseFloat6Precision((amount - tax) / quantity);
  }

  return parseFloat6Precision(unitPrice);
};

const getQuantity = (item: DocumentFieldOutput | undefined): number | null => {
  if (item == null || item?.type !== "number" || item.valueNumber == null) {
    return null;
  }
  return parseFloat6Precision(item.valueNumber);
};

Deno.serve(async (req) => {
  // preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  //
  //
  const requestBody: { image?: { data?: unknown }; inventory_id?: unknown } =
    await req.json();
  // const requestBody = { image: { data: "" }, inventory_id: 11 };
  //
  //
  if (
    requestBody?.image?.data == null ||
    requestBody?.inventory_id == null ||
    typeof requestBody.image.data !== "string" ||
    typeof requestBody.inventory_id !== "number"
  ) {
    console.error("Missing or malformed request body properties");
    return new Response("Missing or malformed request body properties", {
      status: 400,
      headers: { ...corsHeaders },
    });
  }

  const authHeader = req.headers.get("Authorization");
  if (authHeader == null) {
    console.error("Unauthorized");
    return new Response("Unauthorized", { status: 401 });
  }
  const supabase = createClient<Database>(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { global: { headers: { Authorization: authHeader } } }
  );
  const { data: productAliasData, error: productAliasError } = await supabase
    .from("product_name_alias")
    .select("alias, product_id");

  if (productAliasError) {
    console.error("Error fetching table data");
    return new Response("Error fetching table data", { status: 500 });
  }
  /** ids of products that have aliases */
  const productIds = productAliasData?.map((item) => item.product_id);

  const { data: productRecordDataRaw, error: productRecordError } =
    await supabase
      .from("product_record")
      .select("id, product_id, quantity, price_per_unit")
      .eq("inventory_id", requestBody.inventory_id);

  if (productRecordError) {
    console.error("Error fetching table data");
    return new Response("Error fetching table data", { status: 500 });
  }

  // filter out records that don't have aliases
  const productRecordData = productRecordDataRaw.filter((pr) =>
    productIds.includes(pr.product_id)
  );

  // fetches possibly incomplete recipes, we don't need products that do not occurr in the current inventory
  const { data: recipeDataRaw, error: recipeError } = await supabase
    .from("recipe")
    .select(
      "id, name, recipe_part(quantity, product_id), recipe_name_alias(alias)"
    )
    .in(
      "recipe_part.product_id",
      productRecordDataRaw.map((pr) => pr.product_id)
    )
    .order("name", { ascending: true });

  if (recipeError) {
    console.error("Error fetching table data");
    return new Response("Error fetching table data", { status: 500 });
  }
  const recipeData = recipeDataRaw.filter((r) => r.recipe_part.length !== 0);

  let documentAnalysisResult:
    | ({
        sanitizedName: string | null;
        quantity: number | null;
      } | null)[]
    | null = null;

  if (!DocumentIntelligenceEndpoint || !DocumentIntelligenceApiKey) {
    console.error("Environment variables are not set up correctly");
    return new Response("Environment variables are not set up correctly.", {
      status: 500,
    });
  }

  const client = DocumentIntelligence(DocumentIntelligenceEndpoint, {
    key: DocumentIntelligenceApiKey,
  });
  const initialResponse = await client
    .path("/documentModels/{modelId}:analyze", "prebuilt-invoice")
    .post({
      contentType: "application/json",
      body: {
        base64Source: requestBody.image.data,
      },
    });

  const poller = await getLongRunningPoller(client, initialResponse);
  const result = (await poller.pollUntilDone())
    .body as AnalyzeResultOperationOutput;

  // to mock, copy a json from examples
  // const result = mockResponse;

  // analyzeResult?.documents?.[0].fields contents are defined here
  // https://learn.microsoft.com/en-gb/azure/ai-services/document-intelligence/concept-invoice?view=doc-intel-4.0.0#line-items
  if (
    !result.analyzeResult ||
    isEmpty(result.analyzeResult?.documents) ||
    !result.analyzeResult?.documents
  ) {
    console.error(
      `No useful data found during processing, status ${
        result.status
      }, ${JSON.stringify(result.error, null, 2)}`
    );
    return new Response(`No useful data found during processing`, {
      status: 400,
      headers: { ...corsHeaders },
    });
  }

  if (result.analyzeResult.documents.length > 1) {
    console.error("More than one page in document");
    return new Response("More than one page in document", {
      status: 400,
      headers: { ...corsHeaders },
    });
  }

  if (
    isEmpty(result.analyzeResult?.documents[0].fields) ||
    !result.analyzeResult.documents[0].fields
  ) {
    console.error("No data extracted from document");
    return new Response("No data extracted from document", {
      status: 400,
      headers: { ...corsHeaders },
    });
  }

  if (result.analyzeResult.documents[0].fields.Items.type === "object") {
    const itemValue =
      result.analyzeResult.documents[0].fields.Items.valueObject;
    const sanitizedName = parseStringForResponse(
      getName(itemValue?.Description)
    );
    const quantity = parseFloatForResponse(getQuantity(itemValue?.Quantity));
    documentAnalysisResult = [
      {
        sanitizedName,
        quantity,
      },
    ];
  }
  if (result.analyzeResult.documents[0].fields.Items.type === "array") {
    documentAnalysisResult =
      result.analyzeResult.documents[0].fields.Items.valueArray?.map((item) => {
        if (item.type !== "object") {
          return null;
        }
        const itemValue = item.valueObject;
        const sanitizedName = parseStringForResponse(
          getName(itemValue?.Description)
        );
        const quantity = parseFloatForResponse(
          getQuantity(itemValue?.Quantity)
        );
        return {
          sanitizedName,
          quantity,
        };
      }) ?? null;
  }
  const recipeResponsePart = recipeData.reduce(
    (acc, recipe) => {
      const recognizedDataMatchedToRecipeAliases =
        documentAnalysisResult?.filter(
          (dar) =>
            dar != null &&
            dar.sanitizedName != null &&
            dar.quantity != null &&
            recipe.recipe_name_alias.includes({
              alias: dar.sanitizedName,
            })
        ) as { sanitizedName: string; quantity: number }[];

      const quantity =
        recognizedDataMatchedToRecipeAliases?.reduce(
          (sum, it) => sum + (it.quantity ?? 0),
          0
        ) ?? 0;

      return {
        ...acc,
        recognized: {
          ...acc.recognized,
          [String(recipe.id)]: {
            quantity: parseFloatForResponse(quantity),
          },
        },
        recognizedAliases: [
          ...acc.recognizedAliases,
          ...recognizedDataMatchedToRecipeAliases?.map(
            (it) => it?.sanitizedName
          ),
        ],
      };
    },
    {
      recognized: {},
      recognizedAliases: [],
    } as {
      recognized: Record<
        string,
        {
          quantity: number | null;
        }
      >;
      recognizedAliases: string[];
    }
  );

  // we want them unique
  const unmatchedAliasesProduct = [
    ...new Set(
      documentAnalysisResult
        ?.filter(
          (analysis) =>
            !recipeResponsePart.recognizedAliases.some(
              (recognizedAlias) => recognizedAlias === analysis?.sanitizedName
            )
        )
        .map((item) => item?.sanitizedName) ?? []
    ),
  ];

  return new Response(
    JSON.stringify({
      form: recipeResponsePart.recognized,
      unmatchedAliases: { products: unmatchedAliasesProduct },
    }),
    {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
});

// remember that with an anon key you get nothing due to RLS
// with service_role yout get multiple companies' data
// curl -v 'http://127.0.0.1:54321/functions/v1/process-sales-raport' \
//   --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
// --data '{"inventory_id":10,"image":{"data":""}}'

// const mockResponse =
