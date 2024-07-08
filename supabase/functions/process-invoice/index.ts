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
    .from("name_alias")
    .select("alias, product_id")
    .is("recipe_id", null);

  if (productAliasError) {
    console.error("Error fetching table data");
    return new Response("Error fetching table data", { status: 500 });
  }

  const productIds = productAliasData?.map((item) => item.product_id);
  const { data: productRecordData, error: productRecordError } = await supabase
    .from("product_record")
    .select("id, product_id, quantity, price_per_unit")
    .eq("inventory_id", requestBody.inventory_id)
    .in("product_id", productIds);

  if (productRecordError) {
    console.error("Error fetching table data");
    return new Response("Error fetching table data", { status: 500 });
  }

  let documentAnalysisResult:
    | ({
        sanitizedName: string | null;
        price_per_unit: number | null;
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

  if (result.analyzeResult.documents[0].fields.Items?.type === "object") {
    const itemValue =
      result.analyzeResult.documents[0].fields.Items?.valueObject;
    const sanitizedName = parseStringForResponse(
      getName(itemValue?.Description)
    );
    const price_per_unit = parseFloatForResponse(getPricePerUnit(itemValue));
    const quantity = parseFloatForResponse(getQuantity(itemValue?.Quantity));
    documentAnalysisResult = [
      {
        sanitizedName,
        price_per_unit,
        quantity,
      },
    ];
  }
  if (result.analyzeResult.documents[0].fields.Items?.type === "array") {
    documentAnalysisResult =
      result.analyzeResult.documents[0].fields.Items?.valueArray?.map(
        (item) => {
          if (item.type !== "object") {
            return null;
          }
          const itemValue = item.valueObject;
          const sanitizedName = parseStringForResponse(
            getName(itemValue?.Description)
          );
          const price_per_unit = parseFloatForResponse(
            getPricePerUnit(itemValue)
          );
          const quantity = parseFloatForResponse(
            getQuantity(itemValue?.Quantity)
          );
          return {
            sanitizedName,
            price_per_unit,
            quantity,
          };
        }
      ) ?? null;
  }

  // this is extremely inefficient and we should find a better solution
  const matchAliasesToRecognizedData = productRecordData.reduce(
    (acc, productRecord) => {
      const product_id = productRecord.product_id;
      const record_id = productRecord.id;

      const matchedAliases = productAliasData.filter(
        (alias) => alias.product_id === product_id
      );

      if (isEmpty(matchedAliases)) {
        return { ...acc };
      }

      const matchedDocumentData = documentAnalysisResult?.filter(
        (documentItem) =>
          matchedAliases.some(
            (matchedAlias) => documentItem?.sanitizedName === matchedAlias.alias
          )
      );

      if (matchedDocumentData == null) {
        return { ...acc };
      }

      const price_per_unit = Math.max(
        ...matchedDocumentData.map(
          (item) => item?.price_per_unit ?? productRecord?.price_per_unit ?? 0
        )
      );

      const quantity =
        matchedDocumentData.reduce(
          (sum, item) => sum + (item?.quantity ?? 0),
          0
        ) + productRecord.quantity;

      return {
        recognized: {
          ...acc.recognized,
          [String(record_id)]: {
            product_id,
            price_per_unit: price_per_unit
              ? parseFloatForResponse(price_per_unit)
              : // temporary until null handling/merging is figured out in the app
                0,
            quantity: quantity
              ? parseFloatForResponse(quantity)
              : // temporary until null handling/merging is figured out in the app
                0,
          },
        },
        recognizedAliases: [
          ...acc.recognizedAliases,
          ...matchedAliases.map((a) => a.alias),
        ],
      };
    },
    { recognized: {}, recognizedAliases: [] } as {
      recognized: Record<
        string,
        {
          product_id: number;
          price_per_unit: number | null;
          quantity: number | null;
        }
      >;
      recognizedAliases: string[];
    }
  );

  // we want them unique
  const unmatchedAliases = [
    ...new Set(
      documentAnalysisResult
        ?.filter(
          (analysis) =>
            !matchAliasesToRecognizedData.recognizedAliases.some(
              (recognizedAlias) => recognizedAlias === analysis?.sanitizedName
            )
        )
        .map((item) => item?.sanitizedName) ?? []
    ),
  ];

  const unmatched = documentAnalysisResult
    ?.filter(
      (analysis) =>
        !matchAliasesToRecognizedData.recognizedAliases.some(
          (recognizedAlias) => recognizedAlias === analysis?.sanitizedName
        )
    )
    .reduce(
      (acc, item) => {
        if (item?.sanitizedName == null) return acc;

        return {
          ...acc,
          [item.sanitizedName]: {
            price_per_unit: item?.price_per_unit ?? null,
            quantity: item?.quantity ?? null,
          },
        };
      },
      {} as Record<
        string,
        {
          price_per_unit: number | null;
          quantity: number | null;
        }
      >
    );

  return new Response(
    JSON.stringify({
      form: matchAliasesToRecognizedData.recognized,
      unmatchedAliases,
      unmatched,
    }),
    {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
});

// remember that with an anon key you get nothing due to RLS
// with service_role yout get multiple companies' data
// curl -v 'http://127.0.0.1:54321/functions/v1/scan-doc' \
//   --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
// --data '{"inventory_id":10,"image":{"data":""}}'

// const mockResponse =
