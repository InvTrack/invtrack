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
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
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
  Math.abs(parseFloat4Precision(value1 - value2)) <= 0.03;

const getValueAsNumber = (
  item: DocumentFieldOutput | undefined
): number | null => {
  if (item == null) {
    return null;
  }
  if (item.type === "number") {
    return parseFloat4Precision(item.valueNumber!);
  }
  if (item.type === "currency") {
    return parseFloat4Precision(item.valueCurrency!.amount);
  }
  if (item.type === "string") {
    return parseFloat4Precision(parseFloat(item.valueString!));
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
 * standardize possible floats to 4 decimal places
 *
 * should wrap every expected number
 */
const parseFloat4Precision = (value: number): number =>
  parseFloat(value.toFixed(4));

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
    return parseFloat4Precision((amount - tax) / quantity);
  }

  return parseFloat4Precision(unitPrice);
};

const getQuantity = (item: DocumentFieldOutput | undefined): number | null => {
  if (item == null || item?.type !== "number" || item.valueNumber == null) {
    return null;
  }
  return parseFloat4Precision(item.valueNumber);
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
    return new Response("Missing or malformed request body properties", {
      status: 400,
      headers: corsHeaders,
    });
  }

  const authHeader = req.headers.get("Authorization");
  if (authHeader == null) {
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
    return new Response("Error fetching table data", { status: 500 });
  }

  const productIds = productAliasData?.map((item) => item.product_id);
  const { data: productRecordData, error: productRecordError } = await supabase
    .from("product_record")
    .select("id, product_id")
    .eq("inventory_id", requestBody.inventory_id)
    .in("product_id", productIds);

  if (productRecordError) {
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

  // const result = mockResponse;

  // analyzeResult?.documents?.[0].fields contents are defined here
  // https://learn.microsoft.com/en-gb/azure/ai-services/document-intelligence/concept-invoice?view=doc-intel-4.0.0#line-items
  if (
    !result.analyzeResult ||
    isEmpty(result.analyzeResult?.documents) ||
    !result.analyzeResult?.documents
  ) {
    return new Response("No useful data found during processing", {
      status: 400,
      headers: corsHeaders,
    });
  }

  if (result.analyzeResult.documents.length > 1) {
    return new Response("More than one page in document", {
      status: 400,
      headers: corsHeaders,
    });
  }

  if (
    isEmpty(result.analyzeResult?.documents[0].fields) ||
    !result.analyzeResult.documents[0].fields
  ) {
    return new Response("No data extracted from document", {
      status: 400,
      headers: corsHeaders,
    });
  }

  if (result.analyzeResult.documents[0].fields.Items.type === "object") {
    const itemValue =
      result.analyzeResult.documents[0].fields.Items.valueObject;
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
      }) ?? null;
  }

  // this is extremely inefficient and we should find a better solution
  const matchAliasesToRecognizedData = productRecordData.reduce(
    (acc, item) => {
      const product_id = item.product_id;
      const record_id = item.id;

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
        ...matchedDocumentData.map((item) => item?.price_per_unit ?? 0)
      );

      const quantity = matchedDocumentData.reduce(
        (sum, item) => sum + (item?.quantity ?? 0),
        0
      );

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

  return new Response(
    JSON.stringify({
      form: matchAliasesToRecognizedData.recognized,
      unmatchedAliases,
    }),
    {
      headers: corsHeaders,
    }
  );
});

// remember that with an anon key you get nothing due to RLS
// with service_role yout get multiple companies' data
// curl -v 'http://127.0.0.1:54321/functions/v1/scan-doc' \
//   --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
// --data '{}'
const mockResponse = {
  status: "succeeded",
  createdDateTime: "2024-03-23T12:41:57Z",
  lastUpdatedDateTime: "2024-03-23T12:42:00Z",
  analyzeResult: {
    apiVersion: "2024-02-29-preview",
    modelId: "prebuilt-invoice",
    stringIndexType: "textElements",
    content:
      "Miejsce wystawienia\nWarszawa\nData wystawienia\n12.03.2024\n* 1 F V / GD / 24/03/00558*\nData sprzedaży\n12.03.2024\nFaktura Nr FV/GD/24/03/00558\nSprzedawca\nNabywca\nMille Sapori Plus Sp. z o.o.\nul. K. Gierdziejewskiego 7\nCUST-13918\n02-495 Warszawa\nN.A.P New Authentic Pizza Michał Lemke, Kacper\nNIP: 5272633791 Numer BDO: 000022763\nKop czyński spółka cywilna\nul. Żytnia 42\n84-122 Żelistrzewo\nNIP: 5871730810\nBank: INGBSK O. W WARSZAWIE\nNr konta: PL 33 1050 1041 1000 0090 7521 8496\nNr\nLp\nkatalogo\nNazwa towaru lub usługi\nCena\nRabat\nProducent\nKod PKWIU /\nIlość\nJ.M.\nnetto bez\nNarzut\nCena netto po\nWartość\nSt\nKwota\nWartość\nwy\nCN\nrabatu\n(%)\nrabacie\nnetto\nVAT\nVAT\nbrutto\nWydanie nr WZ24/03/05484:\n1 MAD05\nMĄKA SEMOLA RIMACINATA\nGOLD WOREK 25KG\nMOLINI\nAMBROSIO\n1103 11 10\n1\nPCS\n106,06\n5\n100,76\n100,76\n0\n0\n100,76\nLot No: 250131\nPCS\n1\nWydanie nr WZ24/03/05495:\n2 SA573\nSALAMI PIKANTNE VENTRICINA\nVACUUM OK. 3,2KG\nSORRENTINO\n1601 00 91\n3,962\nKG\n42,80\n0\n42,80\n169,57\n0\n0\n169,57\nLot No: 240430\nKG\n3,962\nWydanie nr WZ24/03/05545:\n3 NFG73\nKREM TRUFLOWY 3%- SOS E\nBRUSCHETTA 540 GR\nNOVA\n2103 90 90\n6\nPCS\n34,54\n8\n31,78\n190,66\n8\n15,25\n205,91\nLot No: 280126\nPCS\n6\n4 SA479\nSPIANATA PIKANTNA VACUUM\nOK. 2.6KG\nSORRENTINO\n1601 00 91\n3,046\nKG\n52,59\n8\n48,38\n147,37\n0\n0\n147,37\nLot No: 241031\nKG\n3,046\n5 SA573\nSALAMI PIKANTNE VENTRICINA\nVACUUM OK. 3,2KG\nSORRENTINO\n1601 00 91\n4,104\nKG\n52,38\n0\n52,38\n214,97\n0\n0\n214,97\nLot No: 240430\nKG\n4,104\nSpecyfikacja VAT\nWartość netto\nSt VAT\nWartość VAT\nWartość brutto\nRazem\n632,67\n0,00\n0,00\n632,67\nRazem\n190,66\n8,00\n15,25\n205,91\nOGÓŁEM\n823,33\n15,25\n838,58\nNowy kontakt: helpdesk@millesapori.pl\nFV/GD/24/03/00558\nSkorzystaj z niego, jeśli masz jakiekolwiek uwagi, sugestie lub chcesz wyrazić opinię.\nStrona 1/2 :unselected: :unselected: :unselected: :selected: :unselected: :unselected: :unselected:",
    pages: [
      {
        pageNumber: 1,
        angle: -90,
        width: 2016,
        height: 1512,
        unit: "pixel",
        words: [
          {
            content: "Miejsce",
            polygon: [212, 424, 213, 356, 237, 356, 236, 424],
            confidence: 0.994,
            span: { offset: 0, length: 7 },
          },
          {
            content: "wystawienia",
            polygon: [213, 351, 212, 239, 235, 238, 237, 351],
            confidence: 0.993,
            span: { offset: 8, length: 11 },
          },
          {
            content: "Warszawa",
            polygon: [214, 148, 217, 56, 234, 57, 233, 148],
            confidence: 0.993,
            span: { offset: 20, length: 8 },
          },
          {
            content: "Data",
            polygon: [247, 424, 247, 380, 270, 380, 269, 423],
            confidence: 0.993,
            span: { offset: 29, length: 4 },
          },
          {
            content: "wystawienia",
            polygon: [247, 376, 246, 263, 269, 262, 270, 375],
            confidence: 0.992,
            span: { offset: 34, length: 11 },
          },
          {
            content: "12.03.2024",
            polygon: [247, 158, 248, 57, 268, 58, 267, 157],
            confidence: 0.995,
            span: { offset: 46, length: 10 },
          },
          {
            content: "*",
            polygon: [276, 973, 276, 962, 293, 962, 293, 973],
            confidence: 0.961,
            span: { offset: 57, length: 1 },
          },
          {
            content: "1",
            polygon: [276, 949, 276, 940, 293, 940, 293, 949],
            confidence: 0.992,
            span: { offset: 59, length: 1 },
          },
          {
            content: "F",
            polygon: [275, 931, 275, 921, 294, 921, 293, 931],
            confidence: 0.97,
            span: { offset: 61, length: 1 },
          },
          {
            content: "V",
            polygon: [275, 910, 275, 900, 294, 900, 294, 910],
            confidence: 0.994,
            span: { offset: 63, length: 1 },
          },
          {
            content: "/",
            polygon: [275, 888, 275, 878, 294, 878, 294, 888],
            confidence: 0.936,
            span: { offset: 65, length: 1 },
          },
          {
            content: "GD",
            polygon: [275, 868, 275, 839, 295, 839, 294, 868],
            confidence: 0.927,
            span: { offset: 67, length: 2 },
          },
          {
            content: "/",
            polygon: [275, 826, 275, 816, 295, 816, 295, 826],
            confidence: 0.883,
            span: { offset: 70, length: 1 },
          },
          {
            content: "24/03/00558*",
            polygon: [275, 806, 277, 571, 295, 571, 295, 805],
            confidence: 0.705,
            span: { offset: 72, length: 12 },
          },
          {
            content: "Data",
            polygon: [281, 424, 281, 380, 302, 381, 302, 424],
            confidence: 0.993,
            span: { offset: 85, length: 4 },
          },
          {
            content: "sprzedaży",
            polygon: [281, 374, 281, 283, 304, 284, 303, 375],
            confidence: 0.995,
            span: { offset: 90, length: 9 },
          },
          {
            content: "12.03.2024",
            polygon: [281, 158, 282, 58, 302, 58, 301, 158],
            confidence: 0.994,
            span: { offset: 100, length: 10 },
          },
          {
            content: "Faktura",
            polygon: [331, 1028, 331, 870, 379, 869, 372, 1028],
            confidence: 0.995,
            span: { offset: 111, length: 7 },
          },
          {
            content: "Nr",
            polygon: [331, 856, 331, 800, 381, 799, 380, 856],
            confidence: 0.996,
            span: { offset: 119, length: 2 },
          },
          {
            content: "FV/GD/24/03/00558",
            polygon: [331, 789, 333, 360, 380, 359, 381, 788],
            confidence: 0.991,
            span: { offset: 122, length: 17 },
          },
          {
            content: "Sprzedawca",
            polygon: [430, 1293, 432, 1169, 454, 1169, 454, 1293],
            confidence: 0.991,
            span: { offset: 140, length: 10 },
          },
          {
            content: "Nabywca",
            polygon: [433, 643, 435, 548, 458, 549, 457, 643],
            confidence: 0.993,
            span: { offset: 151, length: 7 },
          },
          {
            content: "Mille",
            polygon: [473, 1308, 474, 1253, 501, 1253, 500, 1308],
            confidence: 0.995,
            span: { offset: 159, length: 5 },
          },
          {
            content: "Sapori",
            polygon: [474, 1246, 475, 1171, 502, 1171, 501, 1246],
            confidence: 0.995,
            span: { offset: 165, length: 6 },
          },
          {
            content: "Plus",
            polygon: [475, 1165, 475, 1115, 502, 1115, 502, 1165],
            confidence: 0.973,
            span: { offset: 172, length: 4 },
          },
          {
            content: "Sp.",
            polygon: [476, 1109, 476, 1073, 502, 1073, 502, 1109],
            confidence: 0.989,
            span: { offset: 177, length: 3 },
          },
          {
            content: "z",
            polygon: [476, 1067, 477, 1054, 503, 1054, 502, 1067],
            confidence: 0.995,
            span: { offset: 181, length: 1 },
          },
          {
            content: "o.o.",
            polygon: [477, 1048, 478, 1006, 503, 1006, 503, 1048],
            confidence: 0.977,
            span: { offset: 183, length: 4 },
          },
          {
            content: "ul.",
            polygon: [502, 1308, 502, 1283, 528, 1282, 528, 1307],
            confidence: 0.995,
            span: { offset: 188, length: 3 },
          },
          {
            content: "K.",
            polygon: [502, 1277, 502, 1253, 529, 1253, 528, 1277],
            confidence: 0.995,
            span: { offset: 192, length: 2 },
          },
          {
            content: "Gierdziejewskiego",
            polygon: [502, 1248, 504, 1067, 530, 1066, 529, 1247],
            confidence: 0.992,
            span: { offset: 195, length: 17 },
          },
          {
            content: "7",
            polygon: [504, 1058, 504, 1047, 530, 1047, 530, 1057],
            confidence: 0.996,
            span: { offset: 213, length: 1 },
          },
          {
            content: "CUST-13918",
            polygon: [479, 656, 478, 514, 504, 514, 504, 656],
            confidence: 0.961,
            span: { offset: 215, length: 10 },
          },
          {
            content: "02-495",
            polygon: [530, 1308, 531, 1237, 556, 1237, 556, 1308],
            confidence: 0.995,
            span: { offset: 226, length: 6 },
          },
          {
            content: "Warszawa",
            polygon: [532, 1229, 535, 1128, 557, 1127, 556, 1229],
            confidence: 0.994,
            span: { offset: 233, length: 8 },
          },
          {
            content: "N.A.P",
            polygon: [506, 657, 506, 596, 532, 595, 531, 656],
            confidence: 0.994,
            span: { offset: 242, length: 5 },
          },
          {
            content: "New",
            polygon: [506, 588, 506, 543, 532, 543, 532, 588],
            confidence: 0.996,
            span: { offset: 248, length: 3 },
          },
          {
            content: "Authentic",
            polygon: [506, 529, 506, 417, 533, 416, 532, 528],
            confidence: 0.993,
            span: { offset: 252, length: 9 },
          },
          {
            content: "Pizza",
            polygon: [506, 411, 507, 351, 534, 351, 533, 410],
            confidence: 0.995,
            span: { offset: 262, length: 5 },
          },
          {
            content: "Michał",
            polygon: [507, 346, 508, 269, 535, 268, 534, 345],
            confidence: 0.995,
            span: { offset: 268, length: 6 },
          },
          {
            content: "Lemke,",
            polygon: [508, 263, 509, 183, 536, 182, 535, 263],
            confidence: 0.995,
            span: { offset: 275, length: 6 },
          },
          {
            content: "Kacper",
            polygon: [509, 177, 510, 96, 537, 96, 536, 177],
            confidence: 0.995,
            span: { offset: 282, length: 6 },
          },
          {
            content: "NIP:",
            polygon: [558, 1309, 558, 1261, 584, 1260, 583, 1307],
            confidence: 0.992,
            span: { offset: 289, length: 4 },
          },
          {
            content: "5272633791",
            polygon: [558, 1256, 559, 1129, 585, 1128, 584, 1255],
            confidence: 0.994,
            span: { offset: 294, length: 10 },
          },
          {
            content: "Numer",
            polygon: [560, 1118, 560, 1047, 585, 1047, 585, 1118],
            confidence: 0.995,
            span: { offset: 305, length: 5 },
          },
          {
            content: "BDO:",
            polygon: [560, 1042, 560, 986, 586, 985, 585, 1041],
            confidence: 0.991,
            span: { offset: 311, length: 4 },
          },
          {
            content: "000022763",
            polygon: [561, 980, 561, 866, 587, 866, 586, 980],
            confidence: 0.994,
            span: { offset: 316, length: 9 },
          },
          {
            content: "Kop",
            polygon: [534, 657, 534, 613, 562, 612, 561, 656],
            confidence: 0.997,
            span: { offset: 326, length: 3 },
          },
          {
            content: "czyński",
            polygon: [534, 605, 535, 520, 563, 519, 562, 605],
            confidence: 0.995,
            span: { offset: 330, length: 7 },
          },
          {
            content: "spółka",
            polygon: [535, 514, 535, 439, 563, 439, 563, 514],
            confidence: 0.995,
            span: { offset: 338, length: 6 },
          },
          {
            content: "cywilna",
            polygon: [535, 431, 536, 345, 562, 345, 563, 431],
            confidence: 0.993,
            span: { offset: 345, length: 7 },
          },
          {
            content: "ul.",
            polygon: [563, 657, 563, 630, 589, 630, 588, 657],
            confidence: 0.995,
            span: { offset: 353, length: 3 },
          },
          {
            content: "Żytnia",
            polygon: [562, 625, 563, 561, 589, 562, 589, 625],
            confidence: 0.995,
            span: { offset: 357, length: 6 },
          },
          {
            content: "42",
            polygon: [563, 555, 564, 530, 590, 530, 590, 556],
            confidence: 0.997,
            span: { offset: 364, length: 2 },
          },
          {
            content: "84-122",
            polygon: [590, 656, 591, 584, 617, 584, 616, 656],
            confidence: 0.994,
            span: { offset: 367, length: 6 },
          },
          {
            content: "Żelistrzewo",
            polygon: [591, 578, 593, 464, 618, 465, 617, 579],
            confidence: 0.991,
            span: { offset: 374, length: 11 },
          },
          {
            content: "NIP:",
            polygon: [619, 658, 620, 612, 643, 611, 643, 657],
            confidence: 0.983,
            span: { offset: 386, length: 4 },
          },
          {
            content: "5871730810",
            polygon: [620, 607, 619, 482, 644, 481, 643, 606],
            confidence: 0.988,
            span: { offset: 391, length: 10 },
          },
          {
            content: "Bank:",
            polygon: [653, 1339, 653, 1272, 679, 1271, 678, 1339],
            confidence: 0.995,
            span: { offset: 402, length: 5 },
          },
          {
            content: "INGBSK",
            polygon: [653, 1267, 653, 1178, 680, 1177, 679, 1266],
            confidence: 0.994,
            span: { offset: 408, length: 6 },
          },
          {
            content: "O.",
            polygon: [653, 1167, 653, 1141, 680, 1141, 680, 1167],
            confidence: 0.963,
            span: { offset: 415, length: 2 },
          },
          {
            content: "W",
            polygon: [653, 1136, 653, 1122, 680, 1122, 680, 1135],
            confidence: 0.996,
            span: { offset: 418, length: 1 },
          },
          {
            content: "WARSZAWIE",
            polygon: [653, 1106, 655, 955, 681, 955, 680, 1106],
            confidence: 0.993,
            span: { offset: 420, length: 9 },
          },
          {
            content: "Nr",
            polygon: [692, 1339, 692, 1312, 718, 1312, 718, 1338],
            confidence: 0.995,
            span: { offset: 430, length: 2 },
          },
          {
            content: "konta:",
            polygon: [692, 1307, 692, 1230, 718, 1229, 718, 1306],
            confidence: 0.993,
            span: { offset: 433, length: 6 },
          },
          {
            content: "PL",
            polygon: [692, 1224, 692, 1196, 719, 1195, 718, 1224],
            confidence: 0.997,
            span: { offset: 440, length: 2 },
          },
          {
            content: "33",
            polygon: [692, 1188, 693, 1160, 719, 1159, 719, 1188],
            confidence: 0.995,
            span: { offset: 443, length: 2 },
          },
          {
            content: "1050",
            polygon: [693, 1151, 693, 1096, 719, 1096, 719, 1150],
            confidence: 0.993,
            span: { offset: 446, length: 4 },
          },
          {
            content: "1041",
            polygon: [693, 1086, 693, 1028, 720, 1027, 719, 1085],
            confidence: 0.993,
            span: { offset: 451, length: 4 },
          },
          {
            content: "1000",
            polygon: [693, 1020, 694, 964, 720, 964, 720, 1020],
            confidence: 0.963,
            span: { offset: 456, length: 4 },
          },
          {
            content: "0090",
            polygon: [694, 955, 695, 898, 721, 897, 721, 955],
            confidence: 0.992,
            span: { offset: 461, length: 4 },
          },
          {
            content: "7521",
            polygon: [695, 889, 696, 831, 722, 830, 721, 888],
            confidence: 0.993,
            span: { offset: 466, length: 4 },
          },
          {
            content: "8496",
            polygon: [696, 825, 696, 769, 722, 769, 722, 825],
            confidence: 0.993,
            span: { offset: 471, length: 4 },
          },
          {
            content: "Nr",
            polygon: [742, 1299, 742, 1283, 758, 1283, 758, 1298],
            confidence: 0.976,
            span: { offset: 476, length: 2 },
          },
          {
            content: "Lp",
            polygon: [763, 1334, 763, 1317, 780, 1317, 780, 1334],
            confidence: 0.995,
            span: { offset: 479, length: 2 },
          },
          {
            content: "katalogo",
            polygon: [763, 1301, 764, 1239, 782, 1240, 780, 1301],
            confidence: 0.994,
            span: { offset: 482, length: 8 },
          },
          {
            content: "Nazwa",
            polygon: [763, 1197, 764, 1149, 782, 1149, 781, 1196],
            confidence: 0.995,
            span: { offset: 491, length: 5 },
          },
          {
            content: "towaru",
            polygon: [764, 1145, 764, 1094, 783, 1095, 782, 1145],
            confidence: 0.994,
            span: { offset: 497, length: 6 },
          },
          {
            content: "lub",
            polygon: [764, 1090, 764, 1068, 784, 1068, 783, 1091],
            confidence: 0.995,
            span: { offset: 504, length: 3 },
          },
          {
            content: "usługi",
            polygon: [764, 1062, 764, 1018, 785, 1019, 784, 1063],
            confidence: 0.994,
            span: { offset: 508, length: 6 },
          },
          {
            content: "Cena",
            polygon: [749, 620, 749, 585, 764, 585, 764, 620],
            confidence: 0.992,
            span: { offset: 515, length: 4 },
          },
          {
            content: "Rabat",
            polygon: [748, 549, 749, 508, 765, 508, 764, 550],
            confidence: 0.995,
            span: { offset: 520, length: 5 },
          },
          {
            content: "Producent",
            polygon: [765, 955, 766, 882, 783, 883, 783, 955],
            confidence: 0.993,
            span: { offset: 526, length: 9 },
          },
          {
            content: "Kod",
            polygon: [757, 854, 757, 827, 775, 827, 774, 854],
            confidence: 0.995,
            span: { offset: 536, length: 3 },
          },
          {
            content: "PKWIU",
            polygon: [757, 823, 758, 777, 775, 776, 775, 823],
            confidence: 0.987,
            span: { offset: 540, length: 5 },
          },
          {
            content: "/",
            polygon: [758, 771, 758, 764, 775, 763, 775, 770],
            confidence: 0.995,
            span: { offset: 546, length: 1 },
          },
          {
            content: "Ilość",
            polygon: [766, 739, 767, 704, 783, 705, 782, 739],
            confidence: 0.994,
            span: { offset: 548, length: 5 },
          },
          {
            content: "J.M.",
            polygon: [767, 680, 767, 651, 783, 651, 783, 680],
            confidence: 0.961,
            span: { offset: 554, length: 4 },
          },
          {
            content: "netto",
            polygon: [769, 636, 769, 599, 785, 600, 784, 635],
            confidence: 0.994,
            span: { offset: 559, length: 5 },
          },
          {
            content: "bez",
            polygon: [769, 594, 769, 568, 784, 569, 785, 594],
            confidence: 0.995,
            span: { offset: 565, length: 3 },
          },
          {
            content: "Narzut",
            polygon: [768, 554, 768, 505, 784, 504, 784, 554],
            confidence: 0.995,
            span: { offset: 569, length: 6 },
          },
          {
            content: "Cena",
            polygon: [758, 492, 759, 457, 775, 457, 774, 492],
            confidence: 0.989,
            span: { offset: 576, length: 4 },
          },
          {
            content: "netto",
            polygon: [759, 454, 759, 417, 776, 417, 775, 454],
            confidence: 0.995,
            span: { offset: 581, length: 5 },
          },
          {
            content: "po",
            polygon: [759, 411, 759, 394, 776, 394, 776, 411],
            confidence: 0.995,
            span: { offset: 587, length: 2 },
          },
          {
            content: "Wartość",
            polygon: [758, 365, 757, 307, 773, 307, 774, 365],
            confidence: 0.994,
            span: { offset: 590, length: 7 },
          },
          {
            content: "St",
            polygon: [759, 266, 759, 250, 774, 250, 774, 266],
            confidence: 0.996,
            span: { offset: 598, length: 2 },
          },
          {
            content: "Kwota",
            polygon: [759, 215, 759, 172, 774, 172, 773, 215],
            confidence: 0.994,
            span: { offset: 601, length: 5 },
          },
          {
            content: "Wartość",
            polygon: [758, 130, 757, 72, 774, 72, 774, 130],
            confidence: 0.989,
            span: { offset: 607, length: 7 },
          },
          {
            content: "wy",
            polygon: [784, 1300, 785, 1280, 800, 1280, 799, 1301],
            confidence: 0.935,
            span: { offset: 615, length: 2 },
          },
          {
            content: "CN",
            polygon: [777, 815, 777, 799, 793, 799, 793, 815],
            confidence: 0.994,
            span: { offset: 618, length: 2 },
          },
          {
            content: "rabatu",
            polygon: [789, 623, 788, 579, 803, 579, 803, 623],
            confidence: 0.994,
            span: { offset: 621, length: 6 },
          },
          {
            content: "(%)",
            polygon: [787, 540, 788, 511, 806, 511, 805, 541],
            confidence: 0.908,
            span: { offset: 628, length: 3 },
          },
          {
            content: "rabacie",
            polygon: [780, 466, 779, 415, 793, 415, 794, 466],
            confidence: 0.994,
            span: { offset: 632, length: 7 },
          },
          {
            content: "netto",
            polygon: [779, 353, 779, 317, 793, 317, 793, 352],
            confidence: 0.994,
            span: { offset: 640, length: 5 },
          },
          {
            content: "VAT",
            polygon: [776, 272, 776, 242, 792, 242, 792, 272],
            confidence: 0.993,
            span: { offset: 646, length: 3 },
          },
          {
            content: "VAT",
            polygon: [776, 204, 777, 176, 793, 176, 792, 205],
            confidence: 0.995,
            span: { offset: 650, length: 3 },
          },
          {
            content: "brutto",
            polygon: [778, 120, 779, 78, 794, 78, 793, 121],
            confidence: 0.993,
            span: { offset: 654, length: 6 },
          },
          {
            content: "Wydanie",
            polygon: [818, 1229, 818, 1167, 837, 1167, 838, 1229],
            confidence: 0.994,
            span: { offset: 661, length: 7 },
          },
          {
            content: "nr",
            polygon: [818, 1163, 818, 1147, 837, 1147, 837, 1163],
            confidence: 0.995,
            span: { offset: 669, length: 2 },
          },
          {
            content: "WZ24/03/05484:",
            polygon: [818, 1143, 820, 1022, 838, 1023, 837, 1143],
            confidence: 0.989,
            span: { offset: 672, length: 14 },
          },
          {
            content: "1",
            polygon: [851, 1318, 851, 1309, 868, 1309, 868, 1317],
            confidence: 0.995,
            span: { offset: 687, length: 1 },
          },
          {
            content: "MAD05",
            polygon: [851, 1301, 851, 1249, 869, 1249, 868, 1301],
            confidence: 0.924,
            span: { offset: 689, length: 5 },
          },
          {
            content: "MĄKA",
            polygon: [841, 1230, 841, 1187, 860, 1187, 860, 1230],
            confidence: 0.977,
            span: { offset: 695, length: 4 },
          },
          {
            content: "SEMOLA",
            polygon: [841, 1182, 841, 1123, 860, 1122, 860, 1181],
            confidence: 0.995,
            span: { offset: 700, length: 6 },
          },
          {
            content: "RIMACINATA",
            polygon: [841, 1117, 842, 1023, 861, 1023, 860, 1117],
            confidence: 0.994,
            span: { offset: 707, length: 10 },
          },
          {
            content: "GOLD",
            polygon: [861, 1228, 861, 1190, 878, 1189, 879, 1227],
            confidence: 0.993,
            span: { offset: 718, length: 4 },
          },
          {
            content: "WOREK",
            polygon: [861, 1182, 861, 1129, 878, 1129, 878, 1182],
            confidence: 0.995,
            span: { offset: 723, length: 5 },
          },
          {
            content: "25KG",
            polygon: [861, 1121, 862, 1086, 878, 1086, 878, 1121],
            confidence: 0.993,
            span: { offset: 729, length: 4 },
          },
          {
            content: "MOLINI",
            polygon: [844, 977, 844, 921, 861, 921, 860, 977],
            confidence: 0.995,
            span: { offset: 734, length: 6 },
          },
          {
            content: "AMBROSIO",
            polygon: [862, 976, 864, 899, 879, 899, 880, 976],
            confidence: 0.995,
            span: { offset: 741, length: 8 },
          },
          {
            content: "1103",
            polygon: [854, 852, 855, 817, 872, 817, 872, 851],
            confidence: 0.993,
            span: { offset: 750, length: 4 },
          },
          {
            content: "11",
            polygon: [855, 812, 855, 795, 872, 795, 872, 811],
            confidence: 0.995,
            span: { offset: 755, length: 2 },
          },
          {
            content: "10",
            polygon: [855, 790, 855, 774, 871, 774, 872, 790],
            confidence: 0.998,
            span: { offset: 758, length: 2 },
          },
          {
            content: "1",
            polygon: [855, 703, 856, 695, 871, 696, 870, 704],
            confidence: 0.996,
            span: { offset: 761, length: 1 },
          },
          {
            content: "PCS",
            polygon: [854, 680, 854, 652, 871, 652, 871, 680],
            confidence: 0.995,
            span: { offset: 763, length: 3 },
          },
          {
            content: "106,06",
            polygon: [855, 618, 855, 565, 872, 565, 872, 618],
            confidence: 0.995,
            span: { offset: 767, length: 6 },
          },
          {
            content: "5",
            polygon: [855, 532, 855, 525, 869, 525, 869, 532],
            confidence: 0.996,
            span: { offset: 774, length: 1 },
          },
          {
            content: "100,76",
            polygon: [855, 439, 855, 390, 872, 390, 872, 439],
            confidence: 0.995,
            span: { offset: 776, length: 6 },
          },
          {
            content: "100,76",
            polygon: [854, 335, 854, 288, 872, 288, 872, 335],
            confidence: 0.994,
            span: { offset: 783, length: 6 },
          },
          {
            content: "0",
            polygon: [854, 261, 855, 254, 868, 255, 868, 262],
            confidence: 0.86,
            span: { offset: 790, length: 1 },
          },
          {
            content: "0",
            polygon: [854, 161, 855, 154, 868, 155, 868, 162],
            confidence: 0.658,
            span: { offset: 792, length: 1 },
          },
          {
            content: "100,76",
            polygon: [855, 100, 855, 54, 871, 54, 871, 100],
            confidence: 0.994,
            span: { offset: 794, length: 6 },
          },
          {
            content: "Lot",
            polygon: [888, 805, 887, 782, 905, 781, 904, 804],
            confidence: 0.996,
            span: { offset: 801, length: 3 },
          },
          {
            content: "No:",
            polygon: [887, 778, 888, 749, 905, 750, 905, 778],
            confidence: 0.995,
            span: { offset: 805, length: 3 },
          },
          {
            content: "250131",
            polygon: [888, 746, 888, 695, 904, 696, 905, 746],
            confidence: 0.993,
            span: { offset: 809, length: 6 },
          },
          {
            content: "PCS",
            polygon: [887, 679, 887, 652, 903, 652, 903, 679],
            confidence: 0.995,
            span: { offset: 816, length: 3 },
          },
          {
            content: "1",
            polygon: [887, 635, 888, 628, 904, 628, 903, 636],
            confidence: 0.996,
            span: { offset: 820, length: 1 },
          },
          {
            content: "Wydanie",
            polygon: [911, 1229, 912, 1168, 931, 1168, 932, 1229],
            confidence: 0.994,
            span: { offset: 822, length: 7 },
          },
          {
            content: "nr",
            polygon: [912, 1164, 912, 1147, 931, 1147, 931, 1164],
            confidence: 0.995,
            span: { offset: 830, length: 2 },
          },
          {
            content: "WZ24/03/05495:",
            polygon: [912, 1143, 912, 1021, 932, 1021, 931, 1143],
            confidence: 0.99,
            span: { offset: 833, length: 14 },
          },
          {
            content: "2",
            polygon: [946, 1317, 946, 1309, 963, 1309, 963, 1317],
            confidence: 0.924,
            span: { offset: 848, length: 1 },
          },
          {
            content: "SA573",
            polygon: [946, 1300, 946, 1254, 963, 1254, 963, 1300],
            confidence: 0.979,
            span: { offset: 850, length: 5 },
          },
          {
            content: "SALAMI",
            polygon: [935, 1228, 935, 1173, 954, 1173, 954, 1228],
            confidence: 0.993,
            span: { offset: 856, length: 6 },
          },
          {
            content: "PIKANTNE",
            polygon: [935, 1169, 935, 1093, 954, 1093, 954, 1169],
            confidence: 0.973,
            span: { offset: 863, length: 8 },
          },
          {
            content: "VENTRICINA",
            polygon: [935, 1089, 936, 997, 955, 997, 954, 1089],
            confidence: 0.992,
            span: { offset: 872, length: 10 },
          },
          {
            content: "VACUUM",
            polygon: [955, 1229, 954, 1169, 972, 1169, 973, 1228],
            confidence: 0.994,
            span: { offset: 883, length: 6 },
          },
          {
            content: "OK.",
            polygon: [954, 1161, 955, 1133, 972, 1133, 972, 1160],
            confidence: 0.995,
            span: { offset: 890, length: 3 },
          },
          {
            content: "3,2KG",
            polygon: [955, 1129, 955, 1088, 973, 1087, 972, 1129],
            confidence: 0.991,
            span: { offset: 894, length: 5 },
          },
          {
            content: "SORRENTINO",
            polygon: [946, 976, 946, 880, 964, 880, 963, 976],
            confidence: 0.993,
            span: { offset: 900, length: 10 },
          },
          {
            content: "1601",
            polygon: [947, 852, 947, 817, 964, 817, 964, 851],
            confidence: 0.981,
            span: { offset: 911, length: 4 },
          },
          {
            content: "00",
            polygon: [947, 814, 947, 796, 964, 795, 964, 813],
            confidence: 0.995,
            span: { offset: 916, length: 2 },
          },
          {
            content: "91",
            polygon: [947, 791, 946, 776, 964, 775, 964, 790],
            confidence: 0.996,
            span: { offset: 919, length: 2 },
          },
          {
            content: "3,962",
            polygon: [948, 735, 947, 697, 963, 696, 964, 734],
            confidence: 0.995,
            span: { offset: 922, length: 5 },
          },
          {
            content: "KG",
            polygon: [947, 675, 947, 658, 963, 658, 963, 675],
            confidence: 0.991,
            span: { offset: 928, length: 2 },
          },
          {
            content: "42,80",
            polygon: [948, 610, 947, 566, 964, 565, 965, 610],
            confidence: 0.994,
            span: { offset: 931, length: 5 },
          },
          {
            content: "0",
            polygon: [947, 533, 947, 525, 962, 525, 962, 533],
            confidence: 0.86,
            span: { offset: 937, length: 1 },
          },
          {
            content: "42,80",
            polygon: [948, 432, 948, 392, 964, 392, 964, 432],
            confidence: 0.991,
            span: { offset: 939, length: 5 },
          },
          {
            content: "169,57",
            polygon: [948, 335, 948, 287, 965, 287, 965, 335],
            confidence: 0.995,
            span: { offset: 945, length: 6 },
          },
          {
            content: "0",
            polygon: [947, 261, 948, 253, 963, 254, 962, 262],
            confidence: 0.917,
            span: { offset: 952, length: 1 },
          },
          {
            content: "0",
            polygon: [948, 161, 949, 154, 962, 155, 962, 162],
            confidence: 0.909,
            span: { offset: 954, length: 1 },
          },
          {
            content: "169,57",
            polygon: [949, 101, 949, 53, 965, 54, 965, 101],
            confidence: 0.994,
            span: { offset: 956, length: 6 },
          },
          {
            content: "Lot",
            polygon: [979, 805, 979, 782, 997, 782, 997, 804],
            confidence: 0.996,
            span: { offset: 963, length: 3 },
          },
          {
            content: "No:",
            polygon: [979, 778, 979, 750, 997, 750, 997, 778],
            confidence: 0.995,
            span: { offset: 967, length: 3 },
          },
          {
            content: "240430",
            polygon: [979, 746, 980, 696, 996, 696, 997, 746],
            confidence: 0.993,
            span: { offset: 971, length: 6 },
          },
          {
            content: "KG",
            polygon: [980, 677, 980, 658, 997, 658, 997, 676],
            confidence: 0.981,
            span: { offset: 978, length: 2 },
          },
          {
            content: "3,962",
            polygon: [980, 636, 981, 595, 999, 595, 998, 636],
            confidence: 0.993,
            span: { offset: 981, length: 5 },
          },
          {
            content: "Wydanie",
            polygon: [1006, 1229, 1005, 1168, 1025, 1168, 1025, 1228],
            confidence: 0.995,
            span: { offset: 987, length: 7 },
          },
          {
            content: "nr",
            polygon: [1005, 1163, 1005, 1147, 1025, 1147, 1025, 1163],
            confidence: 0.995,
            span: { offset: 995, length: 2 },
          },
          {
            content: "WZ24/03/05545:",
            polygon: [1005, 1143, 1005, 1020, 1026, 1021, 1025, 1143],
            confidence: 0.982,
            span: { offset: 998, length: 14 },
          },
          {
            content: "3",
            polygon: [1040, 1318, 1040, 1308, 1058, 1308, 1058, 1318],
            confidence: 0.995,
            span: { offset: 1013, length: 1 },
          },
          {
            content: "NFG73",
            polygon: [1040, 1301, 1040, 1252, 1059, 1252, 1058, 1301],
            confidence: 0.993,
            span: { offset: 1015, length: 5 },
          },
          {
            content: "KREM",
            polygon: [1030, 1229, 1030, 1192, 1047, 1191, 1048, 1229],
            confidence: 0.992,
            span: { offset: 1021, length: 4 },
          },
          {
            content: "TRUFLOWY",
            polygon: [1030, 1181, 1029, 1100, 1048, 1099, 1047, 1180],
            confidence: 0.994,
            span: { offset: 1026, length: 8 },
          },
          {
            content: "3%-",
            polygon: [1029, 1095, 1029, 1063, 1048, 1062, 1048, 1094],
            confidence: 0.991,
            span: { offset: 1035, length: 3 },
          },
          {
            content: "SOS",
            polygon: [1029, 1059, 1029, 1029, 1048, 1028, 1048, 1059],
            confidence: 0.993,
            span: { offset: 1039, length: 3 },
          },
          {
            content: "E",
            polygon: [1029, 1025, 1029, 1016, 1048, 1015, 1048, 1024],
            confidence: 0.995,
            span: { offset: 1043, length: 1 },
          },
          {
            content: "BRUSCHETTA",
            polygon: [1049, 1228, 1048, 1131, 1067, 1131, 1067, 1228],
            confidence: 0.981,
            span: { offset: 1045, length: 10 },
          },
          {
            content: "540",
            polygon: [1048, 1125, 1048, 1099, 1067, 1099, 1067, 1125],
            confidence: 0.995,
            span: { offset: 1056, length: 3 },
          },
          {
            content: "GR",
            polygon: [1048, 1094, 1048, 1073, 1067, 1074, 1067, 1094],
            confidence: 0.995,
            span: { offset: 1060, length: 2 },
          },
          {
            content: "NOVA",
            polygon: [1040, 977, 1040, 936, 1056, 936, 1056, 977],
            confidence: 0.992,
            span: { offset: 1063, length: 4 },
          },
          {
            content: "2103",
            polygon: [1040, 852, 1040, 817, 1058, 816, 1057, 852],
            confidence: 0.992,
            span: { offset: 1068, length: 4 },
          },
          {
            content: "90",
            polygon: [1040, 813, 1040, 796, 1058, 796, 1058, 813],
            confidence: 0.996,
            span: { offset: 1073, length: 2 },
          },
          {
            content: "90",
            polygon: [1040, 791, 1040, 774, 1058, 774, 1058, 791],
            confidence: 0.996,
            span: { offset: 1076, length: 2 },
          },
          {
            content: "6",
            polygon: [1040, 704, 1040, 696, 1055, 697, 1055, 705],
            confidence: 0.995,
            span: { offset: 1079, length: 1 },
          },
          {
            content: "PCS",
            polygon: [1039, 680, 1040, 653, 1057, 654, 1056, 680],
            confidence: 0.995,
            span: { offset: 1081, length: 3 },
          },
          {
            content: "34,54",
            polygon: [1041, 610, 1041, 566, 1056, 566, 1057, 610],
            confidence: 0.994,
            span: { offset: 1085, length: 5 },
          },
          {
            content: "8",
            polygon: [1041, 533, 1041, 526, 1055, 525, 1055, 532],
            confidence: 0.995,
            span: { offset: 1091, length: 1 },
          },
          {
            content: "31,78",
            polygon: [1042, 432, 1041, 392, 1058, 392, 1058, 431],
            confidence: 0.994,
            span: { offset: 1093, length: 5 },
          },
          {
            content: "190,66",
            polygon: [1042, 336, 1042, 289, 1057, 288, 1059, 335],
            confidence: 0.994,
            span: { offset: 1099, length: 6 },
          },
          {
            content: "8",
            polygon: [1042, 261, 1042, 254, 1055, 254, 1055, 261],
            confidence: 0.995,
            span: { offset: 1106, length: 1 },
          },
          {
            content: "15,25",
            polygon: [1041, 191, 1041, 153, 1058, 152, 1058, 190],
            confidence: 0.995,
            span: { offset: 1108, length: 5 },
          },
          {
            content: "205,91",
            polygon: [1042, 102, 1043, 55, 1059, 55, 1058, 102],
            confidence: 0.995,
            span: { offset: 1114, length: 6 },
          },
          {
            content: "Lot",
            polygon: [1073, 804, 1072, 781, 1089, 781, 1089, 804],
            confidence: 0.993,
            span: { offset: 1121, length: 3 },
          },
          {
            content: "No:",
            polygon: [1072, 778, 1072, 750, 1089, 750, 1089, 778],
            confidence: 0.995,
            span: { offset: 1125, length: 3 },
          },
          {
            content: "280126",
            polygon: [1072, 747, 1073, 696, 1089, 697, 1089, 747],
            confidence: 0.995,
            span: { offset: 1129, length: 6 },
          },
          {
            content: "PCS",
            polygon: [1071, 679, 1071, 651, 1089, 651, 1089, 679],
            confidence: 0.994,
            span: { offset: 1136, length: 3 },
          },
          {
            content: "6",
            polygon: [1072, 636, 1072, 628, 1087, 628, 1087, 636],
            confidence: 0.995,
            span: { offset: 1140, length: 1 },
          },
          {
            content: "4",
            polygon: [1106, 1317, 1106, 1308, 1124, 1308, 1123, 1317],
            confidence: 0.937,
            span: { offset: 1142, length: 1 },
          },
          {
            content: "SA479",
            polygon: [1106, 1299, 1107, 1254, 1124, 1254, 1124, 1299],
            confidence: 0.995,
            span: { offset: 1144, length: 5 },
          },
          {
            content: "SPIANATA",
            polygon: [1096, 1228, 1096, 1156, 1114, 1156, 1114, 1228],
            confidence: 0.983,
            span: { offset: 1150, length: 8 },
          },
          {
            content: "PIKANTNA",
            polygon: [1096, 1151, 1096, 1076, 1114, 1076, 1114, 1151],
            confidence: 0.988,
            span: { offset: 1159, length: 8 },
          },
          {
            content: "VACUUM",
            polygon: [1096, 1071, 1095, 1011, 1114, 1011, 1114, 1071],
            confidence: 0.993,
            span: { offset: 1168, length: 6 },
          },
          {
            content: "OK.",
            polygon: [1115, 1228, 1115, 1200, 1132, 1200, 1133, 1228],
            confidence: 0.994,
            span: { offset: 1175, length: 3 },
          },
          {
            content: "2.6KG",
            polygon: [1115, 1197, 1115, 1156, 1132, 1156, 1132, 1197],
            confidence: 0.993,
            span: { offset: 1179, length: 5 },
          },
          {
            content: "SORRENTINO",
            polygon: [1104, 976, 1104, 879, 1122, 879, 1123, 976],
            confidence: 0.995,
            span: { offset: 1185, length: 10 },
          },
          {
            content: "1601",
            polygon: [1105, 852, 1105, 818, 1122, 817, 1122, 852],
            confidence: 0.993,
            span: { offset: 1196, length: 4 },
          },
          {
            content: "00",
            polygon: [1105, 814, 1104, 796, 1122, 796, 1122, 814],
            confidence: 0.995,
            span: { offset: 1201, length: 2 },
          },
          {
            content: "91",
            polygon: [1104, 791, 1104, 774, 1121, 774, 1121, 791],
            confidence: 0.983,
            span: { offset: 1204, length: 2 },
          },
          {
            content: "3,046",
            polygon: [1105, 735, 1105, 697, 1121, 697, 1121, 735],
            confidence: 0.995,
            span: { offset: 1207, length: 5 },
          },
          {
            content: "KG",
            polygon: [1105, 675, 1105, 658, 1120, 658, 1120, 675],
            confidence: 0.951,
            span: { offset: 1213, length: 2 },
          },
          {
            content: "52,59",
            polygon: [1104, 608, 1104, 566, 1122, 566, 1122, 609],
            confidence: 0.994,
            span: { offset: 1216, length: 5 },
          },
          {
            content: "8",
            polygon: [1107, 533, 1106, 526, 1120, 525, 1121, 532],
            confidence: 0.995,
            span: { offset: 1222, length: 1 },
          },
          {
            content: "48,38",
            polygon: [1106, 432, 1106, 392, 1122, 392, 1122, 432],
            confidence: 0.993,
            span: { offset: 1224, length: 5 },
          },
          {
            content: "147,37",
            polygon: [1106, 335, 1107, 288, 1125, 288, 1124, 336],
            confidence: 0.995,
            span: { offset: 1230, length: 6 },
          },
          {
            content: "0",
            polygon: [1106, 261, 1106, 254, 1121, 254, 1121, 261],
            confidence: 0.599,
            span: { offset: 1237, length: 1 },
          },
          {
            content: "0",
            polygon: [1107, 162, 1107, 155, 1122, 154, 1122, 161],
            confidence: 0.531,
            span: { offset: 1239, length: 1 },
          },
          {
            content: "147,37",
            polygon: [1107, 102, 1107, 54, 1124, 54, 1124, 102],
            confidence: 0.995,
            span: { offset: 1241, length: 6 },
          },
          {
            content: "Lot",
            polygon: [1138, 805, 1137, 782, 1154, 782, 1154, 803],
            confidence: 0.996,
            span: { offset: 1248, length: 3 },
          },
          {
            content: "No:",
            polygon: [1137, 779, 1137, 750, 1154, 750, 1154, 778],
            confidence: 0.995,
            span: { offset: 1252, length: 3 },
          },
          {
            content: "241031",
            polygon: [1137, 747, 1137, 695, 1154, 696, 1154, 746],
            confidence: 0.994,
            span: { offset: 1256, length: 6 },
          },
          {
            content: "KG",
            polygon: [1137, 674, 1137, 659, 1153, 659, 1153, 675],
            confidence: 0.976,
            span: { offset: 1263, length: 2 },
          },
          {
            content: "3,046",
            polygon: [1137, 634, 1138, 596, 1155, 597, 1154, 635],
            confidence: 0.995,
            span: { offset: 1266, length: 5 },
          },
          {
            content: "5",
            polygon: [1173, 1318, 1173, 1307, 1190, 1308, 1190, 1318],
            confidence: 0.945,
            span: { offset: 1272, length: 1 },
          },
          {
            content: "SA573",
            polygon: [1173, 1299, 1173, 1254, 1191, 1255, 1190, 1299],
            confidence: 0.986,
            span: { offset: 1274, length: 5 },
          },
          {
            content: "SALAMI",
            polygon: [1163, 1228, 1162, 1173, 1180, 1173, 1180, 1228],
            confidence: 0.994,
            span: { offset: 1280, length: 6 },
          },
          {
            content: "PIKANTNE",
            polygon: [1162, 1169, 1162, 1094, 1180, 1094, 1180, 1169],
            confidence: 0.993,
            span: { offset: 1287, length: 8 },
          },
          {
            content: "VENTRICINA",
            polygon: [1162, 1090, 1161, 998, 1179, 997, 1180, 1089],
            confidence: 0.991,
            span: { offset: 1296, length: 10 },
          },
          {
            content: "VACUUM",
            polygon: [1182, 1228, 1181, 1170, 1199, 1170, 1200, 1228],
            confidence: 0.994,
            span: { offset: 1307, length: 6 },
          },
          {
            content: "OK.",
            polygon: [1181, 1160, 1181, 1133, 1199, 1133, 1199, 1160],
            confidence: 0.993,
            span: { offset: 1314, length: 3 },
          },
          {
            content: "3,2KG",
            polygon: [1181, 1129, 1181, 1088, 1198, 1088, 1199, 1129],
            confidence: 0.993,
            span: { offset: 1318, length: 5 },
          },
          {
            content: "SORRENTINO",
            polygon: [1169, 977, 1169, 880, 1188, 880, 1188, 977],
            confidence: 0.993,
            span: { offset: 1324, length: 10 },
          },
          {
            content: "1601",
            polygon: [1170, 852, 1170, 818, 1187, 818, 1188, 852],
            confidence: 0.993,
            span: { offset: 1335, length: 4 },
          },
          {
            content: "00",
            polygon: [1170, 814, 1169, 796, 1187, 796, 1187, 814],
            confidence: 0.996,
            span: { offset: 1340, length: 2 },
          },
          {
            content: "91",
            polygon: [1169, 791, 1169, 774, 1187, 774, 1187, 791],
            confidence: 0.996,
            span: { offset: 1343, length: 2 },
          },
          {
            content: "4,104",
            polygon: [1169, 735, 1169, 695, 1186, 695, 1186, 734],
            confidence: 0.995,
            span: { offset: 1346, length: 5 },
          },
          {
            content: "KG",
            polygon: [1169, 675, 1169, 658, 1186, 658, 1186, 675],
            confidence: 0.993,
            span: { offset: 1352, length: 2 },
          },
          {
            content: "52,38",
            polygon: [1170, 610, 1170, 566, 1187, 566, 1187, 611],
            confidence: 0.994,
            span: { offset: 1355, length: 5 },
          },
          {
            content: "0",
            polygon: [1170, 533, 1170, 525, 1185, 525, 1185, 533],
            confidence: 0.947,
            span: { offset: 1361, length: 1 },
          },
          {
            content: "52,38",
            polygon: [1172, 431, 1171, 392, 1187, 391, 1188, 430],
            confidence: 0.995,
            span: { offset: 1363, length: 5 },
          },
          {
            content: "214,97",
            polygon: [1171, 336, 1171, 288, 1189, 288, 1189, 336],
            confidence: 0.995,
            span: { offset: 1369, length: 6 },
          },
          {
            content: "0",
            polygon: [1172, 262, 1172, 254, 1187, 254, 1187, 262],
            confidence: 0.981,
            span: { offset: 1376, length: 1 },
          },
          {
            content: "0",
            polygon: [1172, 162, 1172, 155, 1185, 156, 1185, 163],
            confidence: 0.934,
            span: { offset: 1378, length: 1 },
          },
          {
            content: "214,97",
            polygon: [1172, 102, 1173, 55, 1190, 56, 1189, 103],
            confidence: 0.995,
            span: { offset: 1380, length: 6 },
          },
          {
            content: "Lot",
            polygon: [1202, 805, 1202, 782, 1220, 781, 1220, 804],
            confidence: 0.996,
            span: { offset: 1387, length: 3 },
          },
          {
            content: "No:",
            polygon: [1202, 778, 1202, 750, 1219, 750, 1220, 778],
            confidence: 0.995,
            span: { offset: 1391, length: 3 },
          },
          {
            content: "240430",
            polygon: [1202, 747, 1202, 696, 1219, 696, 1219, 746],
            confidence: 0.995,
            span: { offset: 1395, length: 6 },
          },
          {
            content: "KG",
            polygon: [1202, 675, 1202, 658, 1218, 658, 1218, 675],
            confidence: 0.995,
            span: { offset: 1402, length: 2 },
          },
          {
            content: "4,104",
            polygon: [1202, 636, 1202, 597, 1219, 597, 1219, 635],
            confidence: 0.995,
            span: { offset: 1405, length: 5 },
          },
          {
            content: "Specyfikacja",
            polygon: [1235, 767, 1235, 653, 1255, 653, 1257, 766],
            confidence: 0.993,
            span: { offset: 1411, length: 12 },
          },
          {
            content: "VAT",
            polygon: [1235, 649, 1235, 612, 1254, 612, 1255, 648],
            confidence: 0.995,
            span: { offset: 1424, length: 3 },
          },
          {
            content: "Wartość",
            polygon: [1262, 640, 1263, 574, 1282, 574, 1281, 640],
            confidence: 0.991,
            span: { offset: 1428, length: 7 },
          },
          {
            content: "netto",
            polygon: [1263, 570, 1263, 529, 1282, 529, 1282, 570],
            confidence: 0.995,
            span: { offset: 1436, length: 5 },
          },
          {
            content: "St",
            polygon: [1263, 486, 1263, 468, 1283, 469, 1283, 487],
            confidence: 0.996,
            span: { offset: 1442, length: 2 },
          },
          {
            content: "VAT",
            polygon: [1263, 464, 1263, 429, 1283, 429, 1283, 464],
            confidence: 0.993,
            span: { offset: 1445, length: 3 },
          },
          {
            content: "Wartość",
            polygon: [1264, 422, 1264, 353, 1284, 353, 1282, 422],
            confidence: 0.99,
            span: { offset: 1449, length: 7 },
          },
          {
            content: "VAT",
            polygon: [1264, 349, 1263, 316, 1283, 316, 1284, 349],
            confidence: 0.995,
            span: { offset: 1457, length: 3 },
          },
          {
            content: "Wartość",
            polygon: [1264, 266, 1265, 200, 1284, 200, 1283, 265],
            confidence: 0.992,
            span: { offset: 1461, length: 7 },
          },
          {
            content: "brutto",
            polygon: [1265, 196, 1265, 147, 1283, 147, 1284, 196],
            confidence: 0.995,
            span: { offset: 1469, length: 6 },
          },
          {
            content: "Razem",
            polygon: [1300, 767, 1300, 721, 1317, 721, 1317, 767],
            confidence: 0.994,
            span: { offset: 1476, length: 5 },
          },
          {
            content: "632,67",
            polygon: [1298, 550, 1297, 496, 1315, 496, 1315, 549],
            confidence: 0.995,
            span: { offset: 1482, length: 6 },
          },
          {
            content: "0,00",
            polygon: [1298, 466, 1298, 430, 1317, 430, 1317, 466],
            confidence: 0.993,
            span: { offset: 1489, length: 4 },
          },
          {
            content: "0,00",
            polygon: [1299, 307, 1299, 274, 1317, 274, 1317, 307],
            confidence: 0.991,
            span: { offset: 1494, length: 4 },
          },
          {
            content: "632,67",
            polygon: [1300, 177, 1299, 124, 1317, 124, 1317, 176],
            confidence: 0.995,
            span: { offset: 1499, length: 6 },
          },
          {
            content: "Razem",
            polygon: [1327, 768, 1327, 720, 1345, 720, 1344, 768],
            confidence: 0.994,
            span: { offset: 1506, length: 5 },
          },
          {
            content: "190,66",
            polygon: [1325, 549, 1325, 495, 1343, 495, 1343, 548],
            confidence: 0.995,
            span: { offset: 1512, length: 6 },
          },
          {
            content: "8,00",
            polygon: [1325, 465, 1325, 431, 1343, 431, 1343, 465],
            confidence: 0.993,
            span: { offset: 1519, length: 4 },
          },
          {
            content: "15,25",
            polygon: [1327, 319, 1327, 275, 1345, 275, 1345, 319],
            confidence: 0.995,
            span: { offset: 1524, length: 5 },
          },
          {
            content: "205,91",
            polygon: [1327, 175, 1326, 123, 1344, 123, 1345, 175],
            confidence: 0.994,
            span: { offset: 1530, length: 6 },
          },
          {
            content: "OGÓŁEM",
            polygon: [1357, 767, 1355, 694, 1376, 694, 1376, 766],
            confidence: 0.995,
            span: { offset: 1537, length: 6 },
          },
          {
            content: "823,33",
            polygon: [1358, 550, 1357, 495, 1376, 495, 1376, 550],
            confidence: 0.995,
            span: { offset: 1544, length: 6 },
          },
          {
            content: "15,25",
            polygon: [1358, 319, 1358, 276, 1378, 276, 1378, 318],
            confidence: 0.995,
            span: { offset: 1551, length: 5 },
          },
          {
            content: "838,58",
            polygon: [1359, 177, 1359, 123, 1376, 123, 1377, 176],
            confidence: 0.995,
            span: { offset: 1557, length: 6 },
          },
          {
            content: "Nowy",
            polygon: [1920, 871, 1919, 821, 1943, 820, 1944, 871],
            confidence: 0.993,
            span: { offset: 1564, length: 4 },
          },
          {
            content: "kontakt:",
            polygon: [1919, 815, 1918, 742, 1943, 742, 1943, 815],
            confidence: 0.993,
            span: { offset: 1569, length: 8 },
          },
          {
            content: "helpdesk@millesapori.pl",
            polygon: [1918, 737, 1917, 513, 1942, 513, 1943, 737],
            confidence: 0.948,
            span: { offset: 1578, length: 23 },
          },
          {
            content: "FV/GD/24/03/00558",
            polygon: [1950, 1318, 1948, 1114, 1972, 1114, 1975, 1318],
            confidence: 0.983,
            span: { offset: 1602, length: 17 },
          },
          {
            content: "Skorzystaj",
            polygon: [1946, 1035, 1945, 952, 1968, 951, 1969, 1034],
            confidence: 0.993,
            span: { offset: 1620, length: 10 },
          },
          {
            content: "z",
            polygon: [1945, 947, 1944, 938, 1968, 938, 1968, 946],
            confidence: 0.995,
            span: { offset: 1631, length: 1 },
          },
          {
            content: "niego,",
            polygon: [1944, 933, 1944, 884, 1967, 883, 1968, 933],
            confidence: 0.993,
            span: { offset: 1633, length: 6 },
          },
          {
            content: "jeśli",
            polygon: [1943, 879, 1943, 847, 1967, 847, 1967, 878],
            confidence: 0.961,
            span: { offset: 1640, length: 5 },
          },
          {
            content: "masz",
            polygon: [1943, 842, 1942, 799, 1966, 798, 1967, 842],
            confidence: 0.993,
            span: { offset: 1646, length: 4 },
          },
          {
            content: "jakiekolwiek",
            polygon: [1942, 794, 1941, 696, 1965, 695, 1966, 793],
            confidence: 0.99,
            span: { offset: 1651, length: 12 },
          },
          {
            content: "uwagi,",
            polygon: [1941, 691, 1941, 638, 1964, 638, 1965, 690],
            confidence: 0.993,
            span: { offset: 1664, length: 6 },
          },
          {
            content: "sugestie",
            polygon: [1941, 633, 1940, 567, 1964, 567, 1964, 633],
            confidence: 0.994,
            span: { offset: 1671, length: 8 },
          },
          {
            content: "lub",
            polygon: [1940, 562, 1940, 538, 1963, 538, 1964, 562],
            confidence: 0.995,
            span: { offset: 1680, length: 3 },
          },
          {
            content: "chcesz",
            polygon: [1940, 533, 1940, 477, 1963, 477, 1963, 533],
            confidence: 0.933,
            span: { offset: 1684, length: 6 },
          },
          {
            content: "wyrazić",
            polygon: [1940, 472, 1940, 410, 1962, 410, 1963, 472],
            confidence: 0.993,
            span: { offset: 1691, length: 7 },
          },
          {
            content: "opinię.",
            polygon: [1940, 406, 1940, 352, 1961, 352, 1962, 405],
            confidence: 0.993,
            span: { offset: 1699, length: 7 },
          },
          {
            content: "Strona",
            polygon: [1932, 193, 1932, 130, 1953, 129, 1954, 193],
            confidence: 0.995,
            span: { offset: 1707, length: 6 },
          },
          {
            content: "1/2",
            polygon: [1932, 120, 1932, 92, 1952, 92, 1953, 120],
            confidence: 0.996,
            span: { offset: 1714, length: 3 },
          },
        ],
        selectionMarks: [
          {
            state: "unselected",
            polygon: [857, 252, 868, 252, 868, 262, 857, 262],
            confidence: 0.1,
            span: { offset: 1718, length: 12 },
          },
          {
            state: "unselected",
            polygon: [951, 252, 961, 252, 961, 261, 951, 261],
            confidence: 0.1,
            span: { offset: 1731, length: 12 },
          },
          {
            state: "unselected",
            polygon: [951, 152, 961, 152, 961, 162, 951, 162],
            confidence: 0.1,
            span: { offset: 1744, length: 12 },
          },
          {
            state: "selected",
            polygon: [1045, 252, 1054, 252, 1054, 261, 1045, 261],
            confidence: 0.1,
            span: { offset: 1757, length: 10 },
          },
          {
            state: "unselected",
            polygon: [1110, 252, 1120, 252, 1120, 262, 1110, 262],
            confidence: 0.1,
            span: { offset: 1768, length: 12 },
          },
          {
            state: "unselected",
            polygon: [1110, 153, 1120, 153, 1120, 162, 1110, 162],
            confidence: 0.1,
            span: { offset: 1781, length: 12 },
          },
          {
            state: "unselected",
            polygon: [1176, 252, 1186, 252, 1186, 262, 1176, 262],
            confidence: 0.1,
            span: { offset: 1794, length: 12 },
          },
        ],
        lines: [
          {
            content: "Miejsce wystawienia",
            polygon: [212, 424, 212, 237, 236, 237, 237, 424],
            spans: [{ offset: 0, length: 19 }],
          },
          {
            content: "Warszawa",
            polygon: [214, 148, 216, 54, 234, 55, 233, 149],
            spans: [{ offset: 20, length: 8 }],
          },
          {
            content: "Data wystawienia",
            polygon: [246, 424, 246, 261, 269, 261, 269, 424],
            spans: [{ offset: 29, length: 16 }],
          },
          {
            content: "12.03.2024",
            polygon: [247, 158, 248, 55, 268, 55, 267, 159],
            spans: [{ offset: 46, length: 10 }],
          },
          {
            content: "* 1 F V / GD / 24/03/00558*",
            polygon: [275, 973, 276, 570, 296, 570, 294, 973],
            spans: [{ offset: 57, length: 27 }],
          },
          {
            content: "Data sprzedaży",
            polygon: [281, 424, 281, 282, 304, 282, 302, 425],
            spans: [{ offset: 85, length: 14 }],
          },
          {
            content: "12.03.2024",
            polygon: [281, 159, 281, 57, 302, 57, 301, 159],
            spans: [{ offset: 100, length: 10 }],
          },
          {
            content: "Faktura Nr FV/GD/24/03/00558",
            polygon: [331, 1028, 333, 358, 384, 359, 380, 1029],
            spans: [{ offset: 111, length: 28 }],
          },
          {
            content: "Sprzedawca",
            polygon: [430, 1295, 431, 1167, 454, 1167, 453, 1295],
            spans: [{ offset: 140, length: 10 }],
          },
          {
            content: "Nabywca",
            polygon: [433, 644, 434, 547, 458, 547, 456, 644],
            spans: [{ offset: 151, length: 7 }],
          },
          {
            content: "Mille Sapori Plus Sp. z o.o.",
            polygon: [473, 1308, 476, 1005, 503, 1005, 500, 1309],
            spans: [{ offset: 159, length: 28 }],
          },
          {
            content: "ul. K. Gierdziejewskiego 7",
            polygon: [502, 1307, 504, 1046, 530, 1046, 528, 1308],
            spans: [{ offset: 188, length: 26 }],
          },
          {
            content: "CUST-13918",
            polygon: [478, 656, 478, 512, 503, 512, 503, 656],
            spans: [{ offset: 215, length: 10 }],
          },
          {
            content: "02-495 Warszawa",
            polygon: [530, 1307, 533, 1126, 557, 1126, 555, 1308],
            spans: [{ offset: 226, length: 15 }],
          },
          {
            content: "N.A.P New Authentic Pizza Michał Lemke, Kacper",
            polygon: [506, 658, 509, 95, 537, 95, 532, 658],
            spans: [{ offset: 242, length: 46 }],
          },
          {
            content: "NIP: 5272633791 Numer BDO: 000022763",
            polygon: [558, 1308, 561, 864, 586, 864, 583, 1308],
            spans: [{ offset: 289, length: 36 }],
          },
          {
            content: "Kop czyński spółka cywilna",
            polygon: [534, 656, 535, 345, 563, 345, 562, 657],
            spans: [{ offset: 326, length: 26 }],
          },
          {
            content: "ul. Żytnia 42",
            polygon: [562, 657, 563, 528, 589, 528, 588, 657],
            spans: [{ offset: 353, length: 13 }],
          },
          {
            content: "84-122 Żelistrzewo",
            polygon: [590, 657, 593, 464, 618, 464, 615, 657],
            spans: [{ offset: 367, length: 18 }],
          },
          {
            content: "NIP: 5871730810",
            polygon: [619, 658, 619, 480, 644, 480, 643, 658],
            spans: [{ offset: 386, length: 15 }],
          },
          {
            content: "Bank: INGBSK O. W WARSZAWIE",
            polygon: [653, 1339, 654, 954, 681, 954, 678, 1339],
            spans: [{ offset: 402, length: 27 }],
          },
          {
            content: "Nr konta: PL 33 1050 1041 1000 0090 7521 8496",
            polygon: [692, 1338, 695, 767, 722, 767, 717, 1338],
            spans: [{ offset: 430, length: 45 }],
          },
          {
            content: "Nr",
            polygon: [743, 1299, 742, 1283, 758, 1283, 758, 1299],
            spans: [{ offset: 476, length: 2 }],
          },
          {
            content: "Lp",
            polygon: [763, 1334, 763, 1315, 780, 1314, 780, 1334],
            spans: [{ offset: 479, length: 2 }],
          },
          {
            content: "katalogo",
            polygon: [763, 1307, 764, 1238, 781, 1239, 780, 1308],
            spans: [{ offset: 482, length: 8 }],
          },
          {
            content: "Nazwa towaru lub usługi",
            polygon: [763, 1197, 764, 1017, 784, 1017, 782, 1198],
            spans: [{ offset: 491, length: 23 }],
          },
          {
            content: "Cena",
            polygon: [749, 622, 750, 583, 764, 583, 764, 621],
            spans: [{ offset: 515, length: 4 }],
          },
          {
            content: "Rabat",
            polygon: [748, 550, 749, 509, 764, 508, 764, 550],
            spans: [{ offset: 520, length: 5 }],
          },
          {
            content: "Producent",
            polygon: [765, 957, 765, 882, 783, 882, 782, 957],
            spans: [{ offset: 526, length: 9 }],
          },
          {
            content: "Kod PKWIU /",
            polygon: [756, 853, 758, 762, 775, 762, 774, 854],
            spans: [{ offset: 536, length: 11 }],
          },
          {
            content: "Ilość",
            polygon: [766, 740, 767, 703, 783, 703, 782, 740],
            spans: [{ offset: 548, length: 5 }],
          },
          {
            content: "J.M.",
            polygon: [767, 681, 767, 651, 783, 651, 783, 681],
            spans: [{ offset: 554, length: 4 }],
          },
          {
            content: "netto bez",
            polygon: [769, 636, 769, 567, 784, 567, 784, 636],
            spans: [{ offset: 559, length: 9 }],
          },
          {
            content: "Narzut",
            polygon: [768, 556, 768, 504, 785, 504, 784, 556],
            spans: [{ offset: 569, length: 6 }],
          },
          {
            content: "Cena netto po",
            polygon: [758, 492, 759, 390, 776, 390, 774, 492],
            spans: [{ offset: 576, length: 13 }],
          },
          {
            content: "Wartość",
            polygon: [758, 367, 757, 306, 773, 306, 774, 367],
            spans: [{ offset: 590, length: 7 }],
          },
          {
            content: "St",
            polygon: [759, 268, 759, 249, 774, 249, 774, 267],
            spans: [{ offset: 598, length: 2 }],
          },
          {
            content: "Kwota",
            polygon: [759, 215, 759, 170, 774, 170, 773, 216],
            spans: [{ offset: 601, length: 5 }],
          },
          {
            content: "Wartość",
            polygon: [758, 131, 757, 72, 773, 72, 774, 131],
            spans: [{ offset: 607, length: 7 }],
          },
          {
            content: "wy",
            polygon: [784, 1301, 785, 1276, 800, 1276, 799, 1301],
            spans: [{ offset: 615, length: 2 }],
          },
          {
            content: "CN",
            polygon: [777, 815, 777, 794, 793, 795, 793, 815],
            spans: [{ offset: 618, length: 2 }],
          },
          {
            content: "rabatu",
            polygon: [788, 626, 788, 576, 803, 576, 803, 626],
            spans: [{ offset: 621, length: 6 }],
          },
          {
            content: "(%)",
            polygon: [787, 541, 787, 511, 805, 511, 804, 541],
            spans: [{ offset: 628, length: 3 }],
          },
          {
            content: "rabacie",
            polygon: [779, 466, 779, 413, 794, 413, 794, 466],
            spans: [{ offset: 632, length: 7 }],
          },
          {
            content: "netto",
            polygon: [778, 357, 778, 313, 793, 313, 793, 357],
            spans: [{ offset: 640, length: 5 }],
          },
          {
            content: "VAT",
            polygon: [776, 272, 776, 242, 792, 242, 792, 271],
            spans: [{ offset: 646, length: 3 }],
          },
          {
            content: "VAT",
            polygon: [776, 207, 777, 174, 793, 175, 792, 207],
            spans: [{ offset: 650, length: 3 }],
          },
          {
            content: "brutto",
            polygon: [778, 121, 779, 76, 794, 76, 793, 121],
            spans: [{ offset: 654, length: 6 }],
          },
          {
            content: "Wydanie nr WZ24/03/05484:",
            polygon: [818, 1228, 819, 1021, 839, 1021, 837, 1228],
            spans: [{ offset: 661, length: 25 }],
          },
          {
            content: "1 MAD05",
            polygon: [851, 1318, 851, 1248, 868, 1248, 868, 1318],
            spans: [{ offset: 687, length: 7 }],
          },
          {
            content: "MĄKA SEMOLA RIMACINATA",
            polygon: [841, 1230, 842, 1020, 861, 1020, 859, 1230],
            spans: [{ offset: 695, length: 22 }],
          },
          {
            content: "GOLD WOREK 25KG",
            polygon: [860, 1227, 861, 1082, 879, 1082, 878, 1227],
            spans: [{ offset: 718, length: 15 }],
          },
          {
            content: "MOLINI",
            polygon: [843, 977, 843, 920, 861, 920, 861, 977],
            spans: [{ offset: 734, length: 6 }],
          },
          {
            content: "AMBROSIO",
            polygon: [862, 976, 863, 896, 880, 896, 879, 976],
            spans: [{ offset: 741, length: 8 }],
          },
          {
            content: "1103 11 10",
            polygon: [854, 852, 854, 772, 872, 772, 871, 852],
            spans: [{ offset: 750, length: 10 }],
          },
          {
            content: "1",
            polygon: [855, 704, 856, 695, 870, 695, 870, 704],
            spans: [{ offset: 761, length: 1 }],
          },
          {
            content: "PCS",
            polygon: [854, 680, 854, 651, 871, 652, 871, 680],
            spans: [{ offset: 763, length: 3 }],
          },
          {
            content: "106,06",
            polygon: [855, 620, 855, 562, 872, 562, 872, 620],
            spans: [{ offset: 767, length: 6 }],
          },
          {
            content: "5",
            polygon: [855, 533, 855, 523, 869, 523, 869, 533],
            spans: [{ offset: 774, length: 1 }],
          },
          {
            content: "100,76",
            polygon: [855, 440, 855, 391, 872, 390, 872, 439],
            spans: [{ offset: 776, length: 6 }],
          },
          {
            content: "100,76",
            polygon: [854, 336, 855, 287, 871, 288, 872, 336],
            spans: [{ offset: 783, length: 6 }],
          },
          {
            content: "0",
            polygon: [854, 261, 855, 252, 868, 252, 868, 262],
            spans: [{ offset: 790, length: 1 }],
          },
          {
            content: "0",
            polygon: [854, 162, 855, 153, 868, 152, 868, 162],
            spans: [{ offset: 792, length: 1 }],
          },
          {
            content: "100,76",
            polygon: [855, 100, 855, 54, 871, 54, 871, 100],
            spans: [{ offset: 794, length: 6 }],
          },
          {
            content: "Lot No: 250131",
            polygon: [887, 805, 887, 694, 904, 694, 904, 805],
            spans: [{ offset: 801, length: 14 }],
          },
          {
            content: "PCS",
            polygon: [887, 679, 887, 649, 903, 649, 903, 679],
            spans: [{ offset: 816, length: 3 }],
          },
          {
            content: "1",
            polygon: [887, 637, 888, 628, 903, 628, 903, 637],
            spans: [{ offset: 820, length: 1 }],
          },
          {
            content: "Wydanie nr WZ24/03/05495:",
            polygon: [911, 1228, 911, 1019, 931, 1019, 931, 1228],
            spans: [{ offset: 822, length: 25 }],
          },
          {
            content: "2 SA573",
            polygon: [946, 1319, 946, 1252, 963, 1252, 963, 1319],
            spans: [{ offset: 848, length: 7 }],
          },
          {
            content: "SALAMI PIKANTNE VENTRICINA",
            polygon: [935, 1229, 935, 994, 955, 994, 954, 1229],
            spans: [{ offset: 856, length: 26 }],
          },
          {
            content: "VACUUM OK. 3,2KG",
            polygon: [954, 1229, 954, 1085, 972, 1085, 972, 1229],
            spans: [{ offset: 883, length: 16 }],
          },
          {
            content: "SORRENTINO",
            polygon: [946, 977, 946, 876, 964, 876, 963, 977],
            spans: [{ offset: 900, length: 10 }],
          },
          {
            content: "1601 00 91",
            polygon: [946, 853, 946, 774, 964, 774, 964, 853],
            spans: [{ offset: 911, length: 10 }],
          },
          {
            content: "3,962",
            polygon: [948, 736, 947, 696, 963, 697, 964, 735],
            spans: [{ offset: 922, length: 5 }],
          },
          {
            content: "KG",
            polygon: [947, 675, 947, 654, 963, 655, 963, 675],
            spans: [{ offset: 928, length: 2 }],
          },
          {
            content: "42,80",
            polygon: [948, 611, 947, 564, 963, 564, 965, 611],
            spans: [{ offset: 931, length: 5 }],
          },
          {
            content: "0",
            polygon: [947, 533, 947, 523, 962, 523, 962, 533],
            spans: [{ offset: 937, length: 1 }],
          },
          {
            content: "42,80",
            polygon: [948, 433, 948, 391, 964, 391, 964, 432],
            spans: [{ offset: 939, length: 5 }],
          },
          {
            content: "169,57",
            polygon: [948, 336, 948, 287, 965, 287, 965, 335],
            spans: [{ offset: 945, length: 6 }],
          },
          {
            content: "0",
            polygon: [947, 262, 948, 252, 962, 252, 962, 263],
            spans: [{ offset: 952, length: 1 }],
          },
          {
            content: "0",
            polygon: [948, 163, 949, 153, 962, 153, 962, 163],
            spans: [{ offset: 954, length: 1 }],
          },
          {
            content: "169,57",
            polygon: [948, 102, 948, 53, 965, 53, 964, 102],
            spans: [{ offset: 956, length: 6 }],
          },
          {
            content: "Lot No: 240430",
            polygon: [979, 804, 979, 695, 997, 695, 997, 804],
            spans: [{ offset: 963, length: 14 }],
          },
          {
            content: "KG",
            polygon: [980, 677, 980, 654, 996, 654, 997, 677],
            spans: [{ offset: 978, length: 2 }],
          },
          {
            content: "3,962",
            polygon: [980, 637, 980, 595, 998, 595, 997, 636],
            spans: [{ offset: 981, length: 5 }],
          },
          {
            content: "Wydanie nr WZ24/03/05545:",
            polygon: [1005, 1228, 1005, 1019, 1025, 1019, 1025, 1228],
            spans: [{ offset: 987, length: 25 }],
          },
          {
            content: "3 NFG73",
            polygon: [1040, 1319, 1040, 1251, 1058, 1251, 1058, 1319],
            spans: [{ offset: 1013, length: 7 }],
          },
          {
            content: "KREM TRUFLOWY 3%- SOS E",
            polygon: [1029, 1229, 1029, 1013, 1047, 1013, 1047, 1229],
            spans: [{ offset: 1021, length: 23 }],
          },
          {
            content: "BRUSCHETTA 540 GR",
            polygon: [1048, 1228, 1048, 1073, 1066, 1073, 1067, 1228],
            spans: [{ offset: 1045, length: 17 }],
          },
          {
            content: "NOVA",
            polygon: [1040, 977, 1040, 933, 1056, 933, 1056, 976],
            spans: [{ offset: 1063, length: 4 }],
          },
          {
            content: "2103 90 90",
            polygon: [1040, 853, 1040, 771, 1057, 771, 1057, 853],
            spans: [{ offset: 1068, length: 10 }],
          },
          {
            content: "6",
            polygon: [1040, 705, 1041, 695, 1055, 696, 1055, 705],
            spans: [{ offset: 1079, length: 1 }],
          },
          {
            content: "PCS",
            polygon: [1039, 681, 1040, 653, 1056, 653, 1056, 681],
            spans: [{ offset: 1081, length: 3 }],
          },
          {
            content: "34,54",
            polygon: [1040, 611, 1040, 564, 1056, 564, 1056, 611],
            spans: [{ offset: 1085, length: 5 }],
          },
          {
            content: "8",
            polygon: [1041, 533, 1041, 524, 1054, 524, 1055, 533],
            spans: [{ offset: 1091, length: 1 }],
          },
          {
            content: "31,78",
            polygon: [1041, 433, 1041, 390, 1057, 390, 1058, 432],
            spans: [{ offset: 1093, length: 5 }],
          },
          {
            content: "190,66",
            polygon: [1041, 338, 1041, 286, 1057, 285, 1058, 338],
            spans: [{ offset: 1099, length: 6 }],
          },
          {
            content: "8",
            polygon: [1042, 261, 1042, 252, 1055, 252, 1055, 261],
            spans: [{ offset: 1106, length: 1 }],
          },
          {
            content: "15,25",
            polygon: [1042, 191, 1041, 152, 1058, 152, 1058, 191],
            spans: [{ offset: 1108, length: 5 }],
          },
          {
            content: "205,91",
            polygon: [1042, 103, 1043, 54, 1058, 55, 1058, 102],
            spans: [{ offset: 1114, length: 6 }],
          },
          {
            content: "Lot No: 280126",
            polygon: [1072, 805, 1072, 695, 1089, 695, 1089, 805],
            spans: [{ offset: 1121, length: 14 }],
          },
          {
            content: "PCS",
            polygon: [1071, 680, 1071, 651, 1088, 651, 1089, 680],
            spans: [{ offset: 1136, length: 3 }],
          },
          {
            content: "6",
            polygon: [1072, 636, 1072, 627, 1087, 627, 1087, 635],
            spans: [{ offset: 1140, length: 1 }],
          },
          {
            content: "4 SA479",
            polygon: [1106, 1317, 1106, 1253, 1124, 1253, 1123, 1317],
            spans: [{ offset: 1142, length: 7 }],
          },
          {
            content: "SPIANATA PIKANTNA VACUUM",
            polygon: [1096, 1230, 1095, 1005, 1114, 1005, 1114, 1230],
            spans: [{ offset: 1150, length: 24 }],
          },
          {
            content: "OK. 2.6KG",
            polygon: [1115, 1229, 1115, 1154, 1131, 1154, 1132, 1229],
            spans: [{ offset: 1175, length: 9 }],
          },
          {
            content: "SORRENTINO",
            polygon: [1104, 977, 1104, 876, 1122, 876, 1122, 976],
            spans: [{ offset: 1185, length: 10 }],
          },
          {
            content: "1601 00 91",
            polygon: [1104, 852, 1104, 774, 1121, 774, 1122, 852],
            spans: [{ offset: 1196, length: 10 }],
          },
          {
            content: "3,046",
            polygon: [1105, 735, 1105, 696, 1121, 697, 1121, 734],
            spans: [{ offset: 1207, length: 5 }],
          },
          {
            content: "KG",
            polygon: [1105, 675, 1105, 655, 1120, 656, 1120, 675],
            spans: [{ offset: 1213, length: 2 }],
          },
          {
            content: "52,59",
            polygon: [1104, 609, 1105, 564, 1122, 564, 1122, 609],
            spans: [{ offset: 1216, length: 5 }],
          },
          {
            content: "8",
            polygon: [1106, 533, 1106, 524, 1119, 523, 1120, 532],
            spans: [{ offset: 1222, length: 1 }],
          },
          {
            content: "48,38",
            polygon: [1106, 432, 1106, 390, 1122, 390, 1122, 431],
            spans: [{ offset: 1224, length: 5 }],
          },
          {
            content: "147,37",
            polygon: [1106, 336, 1107, 287, 1124, 287, 1124, 336],
            spans: [{ offset: 1230, length: 6 }],
          },
          {
            content: "0",
            polygon: [1106, 261, 1106, 252, 1121, 251, 1121, 261],
            spans: [{ offset: 1237, length: 1 }],
          },
          {
            content: "0",
            polygon: [1107, 162, 1107, 153, 1121, 152, 1122, 162],
            spans: [{ offset: 1239, length: 1 }],
          },
          {
            content: "147,37",
            polygon: [1107, 103, 1107, 54, 1124, 54, 1124, 102],
            spans: [{ offset: 1241, length: 6 }],
          },
          {
            content: "Lot No: 241031",
            polygon: [1137, 804, 1136, 695, 1154, 695, 1154, 804],
            spans: [{ offset: 1248, length: 14 }],
          },
          {
            content: "KG",
            polygon: [1137, 675, 1138, 655, 1153, 656, 1153, 675],
            spans: [{ offset: 1263, length: 2 }],
          },
          {
            content: "3,046",
            polygon: [1137, 635, 1137, 596, 1154, 596, 1153, 635],
            spans: [{ offset: 1266, length: 5 }],
          },
          {
            content: "5 SA573",
            polygon: [1172, 1318, 1173, 1253, 1190, 1253, 1190, 1318],
            spans: [{ offset: 1272, length: 7 }],
          },
          {
            content: "SALAMI PIKANTNE VENTRICINA",
            polygon: [1162, 1229, 1161, 995, 1179, 995, 1180, 1229],
            spans: [{ offset: 1280, length: 26 }],
          },
          {
            content: "VACUUM OK. 3,2KG",
            polygon: [1182, 1229, 1181, 1086, 1198, 1086, 1199, 1229],
            spans: [{ offset: 1307, length: 16 }],
          },
          {
            content: "SORRENTINO",
            polygon: [1169, 978, 1169, 876, 1188, 876, 1188, 978],
            spans: [{ offset: 1324, length: 10 }],
          },
          {
            content: "1601 00 91",
            polygon: [1170, 853, 1169, 773, 1186, 772, 1187, 853],
            spans: [{ offset: 1335, length: 10 }],
          },
          {
            content: "4,104",
            polygon: [1170, 736, 1169, 695, 1186, 695, 1186, 736],
            spans: [{ offset: 1346, length: 5 }],
          },
          {
            content: "KG",
            polygon: [1169, 675, 1169, 655, 1186, 655, 1186, 675],
            spans: [{ offset: 1352, length: 2 }],
          },
          {
            content: "52,38",
            polygon: [1170, 611, 1170, 564, 1187, 563, 1186, 611],
            spans: [{ offset: 1355, length: 5 }],
          },
          {
            content: "0",
            polygon: [1170, 533, 1170, 523, 1185, 523, 1185, 533],
            spans: [{ offset: 1361, length: 1 }],
          },
          {
            content: "52,38",
            polygon: [1172, 431, 1171, 391, 1187, 391, 1188, 431],
            spans: [{ offset: 1363, length: 5 }],
          },
          {
            content: "214,97",
            polygon: [1171, 338, 1171, 287, 1189, 287, 1189, 338],
            spans: [{ offset: 1369, length: 6 }],
          },
          {
            content: "0",
            polygon: [1172, 262, 1172, 252, 1187, 252, 1187, 262],
            spans: [{ offset: 1376, length: 1 }],
          },
          {
            content: "0",
            polygon: [1172, 163, 1173, 154, 1185, 154, 1185, 163],
            spans: [{ offset: 1378, length: 1 }],
          },
          {
            content: "214,97",
            polygon: [1172, 103, 1173, 55, 1189, 56, 1189, 102],
            spans: [{ offset: 1380, length: 6 }],
          },
          {
            content: "Lot No: 240430",
            polygon: [1202, 805, 1202, 695, 1219, 695, 1219, 805],
            spans: [{ offset: 1387, length: 14 }],
          },
          {
            content: "KG",
            polygon: [1202, 675, 1202, 654, 1218, 654, 1218, 675],
            spans: [{ offset: 1402, length: 2 }],
          },
          {
            content: "4,104",
            polygon: [1202, 637, 1202, 594, 1218, 594, 1219, 637],
            spans: [{ offset: 1405, length: 5 }],
          },
          {
            content: "Specyfikacja VAT",
            polygon: [1235, 769, 1234, 611, 1255, 611, 1256, 769],
            spans: [{ offset: 1411, length: 16 }],
          },
          {
            content: "Wartość netto",
            polygon: [1262, 640, 1263, 526, 1282, 526, 1280, 640],
            spans: [{ offset: 1428, length: 13 }],
          },
          {
            content: "St VAT",
            polygon: [1263, 487, 1263, 428, 1283, 428, 1283, 487],
            spans: [{ offset: 1442, length: 6 }],
          },
          {
            content: "Wartość VAT",
            polygon: [1263, 424, 1263, 315, 1283, 315, 1283, 424],
            spans: [{ offset: 1449, length: 11 }],
          },
          {
            content: "Wartość brutto",
            polygon: [1264, 266, 1265, 147, 1284, 147, 1283, 267],
            spans: [{ offset: 1461, length: 14 }],
          },
          {
            content: "Razem",
            polygon: [1299, 768, 1300, 714, 1317, 714, 1316, 768],
            spans: [{ offset: 1476, length: 5 }],
          },
          {
            content: "632,67",
            polygon: [1298, 550, 1297, 495, 1315, 495, 1315, 550],
            spans: [{ offset: 1482, length: 6 }],
          },
          {
            content: "0,00",
            polygon: [1299, 466, 1298, 428, 1317, 429, 1316, 466],
            spans: [{ offset: 1489, length: 4 }],
          },
          {
            content: "0,00",
            polygon: [1300, 308, 1299, 273, 1317, 274, 1317, 308],
            spans: [{ offset: 1494, length: 4 }],
          },
          {
            content: "632,67",
            polygon: [1299, 176, 1299, 123, 1316, 123, 1317, 176],
            spans: [{ offset: 1499, length: 6 }],
          },
          {
            content: "Razem",
            polygon: [1326, 768, 1327, 713, 1345, 713, 1344, 769],
            spans: [{ offset: 1506, length: 5 }],
          },
          {
            content: "190,66",
            polygon: [1324, 550, 1324, 494, 1343, 494, 1343, 550],
            spans: [{ offset: 1512, length: 6 }],
          },
          {
            content: "8,00",
            polygon: [1325, 468, 1326, 428, 1343, 429, 1343, 468],
            spans: [{ offset: 1519, length: 4 }],
          },
          {
            content: "15,25",
            polygon: [1327, 319, 1327, 274, 1345, 275, 1345, 318],
            spans: [{ offset: 1524, length: 5 }],
          },
          {
            content: "205,91",
            polygon: [1326, 176, 1326, 122, 1344, 121, 1344, 176],
            spans: [{ offset: 1530, length: 6 }],
          },
          {
            content: "OGÓŁEM",
            polygon: [1355, 767, 1355, 687, 1376, 687, 1376, 767],
            spans: [{ offset: 1537, length: 6 }],
          },
          {
            content: "823,33",
            polygon: [1357, 551, 1357, 494, 1376, 494, 1377, 551],
            spans: [{ offset: 1544, length: 6 }],
          },
          {
            content: "15,25",
            polygon: [1358, 320, 1358, 275, 1377, 275, 1378, 320],
            spans: [{ offset: 1551, length: 5 }],
          },
          {
            content: "838,58",
            polygon: [1359, 177, 1359, 121, 1376, 121, 1377, 177],
            spans: [{ offset: 1557, length: 6 }],
          },
          {
            content: "Nowy kontakt: helpdesk@millesapori.pl",
            polygon: [1919, 872, 1917, 511, 1941, 511, 1944, 872],
            spans: [{ offset: 1564, length: 37 }],
          },
          {
            content: "FV/GD/24/03/00558",
            polygon: [1950, 1321, 1948, 1112, 1973, 1112, 1975, 1321],
            spans: [{ offset: 1602, length: 17 }],
          },
          {
            content:
              "Skorzystaj z niego, jeśli masz jakiekolwiek uwagi, sugestie lub chcesz wyrazić opinię.",
            polygon: [1945, 1036, 1940, 352, 1961, 352, 1969, 1035],
            spans: [{ offset: 1620, length: 86 }],
          },
          {
            content: "Strona 1/2",
            polygon: [1932, 195, 1932, 89, 1952, 89, 1953, 195],
            spans: [{ offset: 1707, length: 10 }],
          },
        ],
        spans: [{ offset: 0, length: 1806 }],
      },
    ],
    tables: [
      {
        rowCount: 7,
        columnCount: 2,
        cells: [
          {
            kind: "columnHeader",
            rowIndex: 0,
            columnIndex: 0,
            content: "Sprzedawca",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [412, 1337, 415, 759, 473, 759, 469, 1336],
              },
            ],
            spans: [{ offset: 140, length: 10 }],
          },
          {
            kind: "columnHeader",
            rowIndex: 0,
            columnIndex: 1,
            content: "Nabywca",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [415, 759, 419, 65, 477, 65, 473, 759],
              },
            ],
            spans: [{ offset: 151, length: 7 }],
          },
          {
            rowIndex: 1,
            columnIndex: 0,
            content: "Mille Sapori Plus Sp. z o.o.",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [469, 1336, 473, 759, 504, 759, 500, 1336],
              },
            ],
            spans: [{ offset: 159, length: 28 }],
          },
          {
            rowIndex: 1,
            columnIndex: 1,
            content: "CUST-13918",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [473, 759, 477, 65, 508, 65, 504, 759],
              },
            ],
            spans: [{ offset: 215, length: 10 }],
          },
          {
            rowIndex: 2,
            columnIndex: 0,
            content: "ul. K. Gierdziejewskiego 7",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [500, 1336, 504, 759, 533, 759, 529, 1336],
              },
            ],
            spans: [{ offset: 188, length: 26 }],
          },
          {
            rowIndex: 2,
            columnIndex: 1,
            content: "N.A.P New Authentic Pizza Michał Lemke, Kacper",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [504, 759, 508, 65, 538, 65, 533, 759],
              },
            ],
            spans: [{ offset: 242, length: 46 }],
          },
          {
            rowIndex: 3,
            columnIndex: 0,
            content: "02-495 Warszawa",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [529, 1336, 533, 759, 561, 759, 557, 1336],
              },
            ],
            spans: [{ offset: 226, length: 15 }],
          },
          {
            rowIndex: 3,
            columnIndex: 1,
            content: "Kop czyński spółka cywilna",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [533, 759, 538, 65, 565, 65, 561, 759],
              },
            ],
            spans: [{ offset: 326, length: 26 }],
          },
          {
            rowIndex: 4,
            columnIndex: 0,
            rowSpan: 3,
            content: "NIP: 5272633791 Numer BDO: 000022763",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [557, 1336, 561, 759, 647, 759, 644, 1336],
              },
            ],
            spans: [{ offset: 289, length: 36 }],
          },
          {
            rowIndex: 4,
            columnIndex: 1,
            content: "ul. Żytnia 42",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [561, 759, 565, 65, 594, 65, 591, 759],
              },
            ],
            spans: [{ offset: 353, length: 13 }],
          },
          {
            rowIndex: 5,
            columnIndex: 1,
            content: "84-122 Żelistrzewo",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [591, 759, 594, 65, 622, 65, 618, 759],
              },
            ],
            spans: [{ offset: 367, length: 18 }],
          },
          {
            rowIndex: 6,
            columnIndex: 1,
            content: "NIP: 5871730810",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [618, 759, 622, 65, 651, 65, 647, 759],
              },
            ],
            spans: [{ offset: 386, length: 15 }],
          },
        ],
        boundingRegions: [
          {
            pageNumber: 1,
            polygon: [410, 1346, 418, 51, 653, 52, 645, 1347],
          },
        ],
        spans: [
          { offset: 140, length: 47 },
          { offset: 215, length: 10 },
          { offset: 188, length: 26 },
          { offset: 242, length: 46 },
          { offset: 226, length: 15 },
          { offset: 326, length: 26 },
          { offset: 289, length: 36 },
          { offset: 353, length: 48 },
        ],
      },
      {
        rowCount: 14,
        columnCount: 14,
        cells: [
          {
            kind: "columnHeader",
            rowIndex: 0,
            columnIndex: 0,
            content: "Lp",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [729, 1344, 729, 1308, 812, 1308, 812, 1344],
              },
            ],
            spans: [{ offset: 479, length: 2 }],
          },
          {
            kind: "columnHeader",
            rowIndex: 0,
            columnIndex: 1,
            content: "Nr\nkatalogo\nwy",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [729, 1308, 730, 1233, 814, 1233, 812, 1308],
              },
            ],
            spans: [
              { offset: 476, length: 2 },
              { offset: 482, length: 8 },
              { offset: 615, length: 2 },
            ],
          },
          {
            kind: "columnHeader",
            rowIndex: 0,
            columnIndex: 2,
            content: "Nazwa towaru lub usługi",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [730, 1233, 731, 980, 815, 980, 814, 1233],
              },
            ],
            spans: [{ offset: 491, length: 23 }],
          },
          {
            kind: "columnHeader",
            rowIndex: 0,
            columnIndex: 3,
            content: "Producent",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [731, 980, 733, 856, 816, 856, 815, 980],
              },
            ],
            spans: [{ offset: 526, length: 9 }],
          },
          {
            kind: "columnHeader",
            rowIndex: 0,
            columnIndex: 4,
            content: "Kod PKWIU /\nCN",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [733, 856, 733, 756, 816, 756, 816, 856],
              },
            ],
            spans: [
              { offset: 536, length: 11 },
              { offset: 618, length: 2 },
            ],
          },
          {
            kind: "columnHeader",
            rowIndex: 0,
            columnIndex: 5,
            content: "Ilość",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [733, 756, 733, 691, 816, 691, 816, 756],
              },
            ],
            spans: [{ offset: 548, length: 5 }],
          },
          {
            kind: "columnHeader",
            rowIndex: 0,
            columnIndex: 6,
            content: "J.M.",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [733, 691, 734, 639, 816, 639, 816, 691],
              },
            ],
            spans: [{ offset: 554, length: 4 }],
          },
          {
            kind: "columnHeader",
            rowIndex: 0,
            columnIndex: 7,
            content: "Cena\nnetto bez\nrabatu",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [734, 639, 734, 559, 816, 559, 816, 639],
              },
            ],
            spans: [
              { offset: 515, length: 4 },
              { offset: 559, length: 9 },
              { offset: 621, length: 6 },
            ],
          },
          {
            kind: "columnHeader",
            rowIndex: 0,
            columnIndex: 8,
            content: "Rabat\nNarzut\n(%)",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [734, 559, 734, 495, 816, 495, 816, 559],
              },
            ],
            spans: [
              { offset: 520, length: 5 },
              { offset: 569, length: 6 },
              { offset: 628, length: 3 },
            ],
          },
          {
            kind: "columnHeader",
            rowIndex: 0,
            columnIndex: 9,
            content: "Cena netto po\nrabacie",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [734, 495, 734, 386, 816, 386, 816, 495],
              },
            ],
            spans: [
              { offset: 576, length: 13 },
              { offset: 632, length: 7 },
            ],
          },
          {
            kind: "columnHeader",
            rowIndex: 0,
            columnIndex: 10,
            content: "Wartość\nnetto",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [734, 386, 734, 281, 816, 282, 816, 386],
              },
            ],
            spans: [
              { offset: 590, length: 7 },
              { offset: 640, length: 5 },
            ],
          },
          {
            kind: "columnHeader",
            rowIndex: 0,
            columnIndex: 11,
            content: "St\nVAT",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [734, 281, 734, 231, 816, 231, 816, 282],
              },
            ],
            spans: [
              { offset: 598, length: 2 },
              { offset: 646, length: 3 },
            ],
          },
          {
            kind: "columnHeader",
            rowIndex: 0,
            columnIndex: 12,
            content: "Kwota\nVAT",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [734, 231, 734, 148, 816, 148, 816, 231],
              },
            ],
            spans: [
              { offset: 601, length: 5 },
              { offset: 650, length: 3 },
            ],
          },
          {
            kind: "columnHeader",
            rowIndex: 0,
            columnIndex: 13,
            content: "Wartość\nbrutto",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [734, 148, 734, 50, 816, 50, 816, 148],
              },
            ],
            spans: [
              { offset: 607, length: 7 },
              { offset: 654, length: 6 },
            ],
          },
          {
            rowIndex: 1,
            columnIndex: 0,
            content: "",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [812, 1344, 812, 1308, 839, 1308, 839, 1342],
              },
            ],
            spans: [],
          },
          {
            rowIndex: 1,
            columnIndex: 1,
            content: "",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [812, 1308, 814, 1233, 839, 1233, 839, 1308],
              },
            ],
            spans: [],
          },
          {
            rowIndex: 1,
            columnIndex: 2,
            content: "Wydanie nr WZ24/03/05484:",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [814, 1233, 815, 980, 840, 980, 839, 1233],
              },
            ],
            spans: [{ offset: 661, length: 25 }],
          },
          {
            rowIndex: 1,
            columnIndex: 3,
            content: "",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [815, 980, 816, 856, 840, 856, 840, 980],
              },
            ],
            spans: [],
          },
          {
            rowIndex: 1,
            columnIndex: 4,
            content: "",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [816, 856, 816, 756, 842, 756, 840, 856],
              },
            ],
            spans: [],
          },
          {
            rowIndex: 1,
            columnIndex: 5,
            content: "",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [816, 756, 816, 691, 842, 691, 842, 756],
              },
            ],
            spans: [],
          },
          {
            rowIndex: 1,
            columnIndex: 6,
            content: "",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [816, 691, 816, 639, 842, 639, 842, 691],
              },
            ],
            spans: [],
          },
          {
            rowIndex: 1,
            columnIndex: 7,
            content: "",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [816, 639, 816, 559, 842, 560, 842, 639],
              },
            ],
            spans: [],
          },
          {
            rowIndex: 1,
            columnIndex: 8,
            content: "",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [816, 559, 816, 495, 842, 495, 842, 560],
              },
            ],
            spans: [],
          },
          {
            rowIndex: 1,
            columnIndex: 9,
            content: "",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [816, 495, 816, 386, 842, 386, 842, 495],
              },
            ],
            spans: [],
          },
          {
            rowIndex: 1,
            columnIndex: 10,
            content: "",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [816, 386, 816, 282, 842, 282, 842, 386],
              },
            ],
            spans: [],
          },
          {
            rowIndex: 1,
            columnIndex: 11,
            content: "",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [816, 282, 816, 231, 842, 231, 842, 282],
              },
            ],
            spans: [],
          },
          {
            rowIndex: 1,
            columnIndex: 12,
            content: "",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [816, 231, 816, 148, 842, 148, 842, 231],
              },
            ],
            spans: [],
          },
          {
            rowIndex: 1,
            columnIndex: 13,
            content: "",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [816, 148, 816, 50, 843, 52, 842, 148],
              },
            ],
            spans: [],
          },
          {
            rowIndex: 2,
            columnIndex: 0,
            content: "1",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [839, 1342, 839, 1308, 878, 1308, 878, 1342],
              },
            ],
            spans: [{ offset: 687, length: 1 }],
          },
          {
            rowIndex: 2,
            columnIndex: 1,
            content: "MAD05",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [839, 1308, 839, 1233, 879, 1233, 878, 1308],
              },
            ],
            spans: [{ offset: 689, length: 5 }],
          },
          {
            rowIndex: 2,
            columnIndex: 2,
            content: "MĄKA SEMOLA RIMACINATA\nGOLD WOREK 25KG",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [839, 1233, 840, 980, 879, 980, 879, 1233],
              },
            ],
            spans: [{ offset: 695, length: 38 }],
          },
          {
            rowIndex: 2,
            columnIndex: 3,
            content: "MOLINI\nAMBROSIO",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [840, 980, 840, 856, 880, 856, 879, 980],
              },
            ],
            spans: [{ offset: 734, length: 15 }],
          },
          {
            rowIndex: 2,
            columnIndex: 4,
            content: "1103 11 10",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [840, 856, 842, 756, 880, 756, 880, 856],
              },
            ],
            spans: [{ offset: 750, length: 10 }],
          },
          {
            rowIndex: 2,
            columnIndex: 5,
            content: "1",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [842, 756, 842, 691, 880, 691, 880, 756],
              },
            ],
            spans: [{ offset: 761, length: 1 }],
          },
          {
            rowIndex: 2,
            columnIndex: 6,
            content: "PCS",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [842, 691, 842, 639, 880, 640, 880, 691],
              },
            ],
            spans: [{ offset: 763, length: 3 }],
          },
          {
            rowIndex: 2,
            columnIndex: 7,
            content: "106,06",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [842, 639, 842, 560, 880, 560, 880, 640],
              },
            ],
            spans: [{ offset: 767, length: 6 }],
          },
          {
            rowIndex: 2,
            columnIndex: 8,
            content: "5",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [842, 560, 842, 495, 880, 495, 880, 560],
              },
            ],
            spans: [{ offset: 774, length: 1 }],
          },
          {
            rowIndex: 2,
            columnIndex: 9,
            content: "100,76",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [842, 495, 842, 386, 880, 387, 880, 495],
              },
            ],
            spans: [{ offset: 776, length: 6 }],
          },
          {
            rowIndex: 2,
            columnIndex: 10,
            content: "100,76",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [842, 386, 842, 282, 882, 282, 880, 387],
              },
            ],
            spans: [{ offset: 783, length: 6 }],
          },
          {
            rowIndex: 2,
            columnIndex: 11,
            content: "0\n:unselected:",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [842, 282, 842, 231, 882, 231, 882, 282],
              },
            ],
            spans: [
              { offset: 790, length: 1 },
              { offset: 1718, length: 12 },
            ],
          },
          {
            rowIndex: 2,
            columnIndex: 12,
            content: "0",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [842, 231, 842, 148, 882, 148, 882, 231],
              },
            ],
            spans: [{ offset: 792, length: 1 }],
          },
          {
            rowIndex: 2,
            columnIndex: 13,
            content: "100,76",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [842, 148, 843, 52, 882, 52, 882, 148],
              },
            ],
            spans: [{ offset: 794, length: 6 }],
          },
          {
            rowIndex: 3,
            columnIndex: 0,
            content: "",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [878, 1342, 878, 1308, 907, 1306, 906, 1342],
              },
            ],
            spans: [],
          },
          {
            rowIndex: 3,
            columnIndex: 1,
            content: "",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [878, 1308, 879, 1233, 907, 1233, 907, 1306],
              },
            ],
            spans: [],
          },
          {
            rowIndex: 3,
            columnIndex: 2,
            content: "",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [879, 1233, 879, 980, 908, 980, 907, 1233],
              },
            ],
            spans: [],
          },
          {
            rowIndex: 3,
            columnIndex: 3,
            content: "",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [879, 980, 880, 856, 908, 856, 908, 980],
              },
            ],
            spans: [],
          },
          {
            rowIndex: 3,
            columnIndex: 4,
            columnSpan: 2,
            content: "Lot No: 250131",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [880, 856, 880, 691, 910, 690, 908, 856],
              },
            ],
            spans: [{ offset: 801, length: 14 }],
          },
          {
            rowIndex: 3,
            columnIndex: 6,
            content: "PCS",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [880, 691, 880, 640, 910, 640, 910, 690],
              },
            ],
            spans: [{ offset: 816, length: 3 }],
          },
          {
            rowIndex: 3,
            columnIndex: 7,
            content: "1",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [880, 640, 880, 560, 910, 560, 910, 640],
              },
            ],
            spans: [{ offset: 820, length: 1 }],
          },
          {
            rowIndex: 3,
            columnIndex: 8,
            content: "",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [880, 560, 880, 495, 910, 495, 910, 560],
              },
            ],
            spans: [],
          },
          {
            rowIndex: 3,
            columnIndex: 9,
            content: "",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [880, 495, 880, 387, 910, 387, 910, 495],
              },
            ],
            spans: [],
          },
          {
            rowIndex: 3,
            columnIndex: 10,
            content: "",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [880, 387, 882, 282, 910, 282, 910, 387],
              },
            ],
            spans: [],
          },
          {
            rowIndex: 3,
            columnIndex: 11,
            content: "",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [882, 282, 882, 231, 910, 231, 910, 282],
              },
            ],
            spans: [],
          },
          {
            rowIndex: 3,
            columnIndex: 12,
            content: "",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [882, 231, 882, 148, 910, 148, 910, 231],
              },
            ],
            spans: [],
          },
          {
            rowIndex: 3,
            columnIndex: 13,
            content: "",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [882, 148, 882, 52, 910, 52, 910, 148],
              },
            ],
            spans: [],
          },
          {
            rowIndex: 4,
            columnIndex: 0,
            content: "",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [906, 1342, 907, 1306, 934, 1306, 934, 1342],
              },
            ],
            spans: [],
          },
          {
            rowIndex: 4,
            columnIndex: 1,
            content: "",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [907, 1306, 907, 1233, 934, 1233, 934, 1306],
              },
            ],
            spans: [],
          },
          {
            rowIndex: 4,
            columnIndex: 2,
            content: "Wydanie nr WZ24/03/05495:",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [907, 1233, 908, 980, 934, 980, 934, 1233],
              },
            ],
            spans: [{ offset: 822, length: 25 }],
          },
          {
            rowIndex: 4,
            columnIndex: 3,
            content: "",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [908, 980, 908, 856, 935, 856, 934, 980],
              },
            ],
            spans: [],
          },
          {
            rowIndex: 4,
            columnIndex: 4,
            content: "",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [908, 856, 908, 756, 935, 756, 935, 856],
              },
            ],
            spans: [],
          },
          {
            rowIndex: 4,
            columnIndex: 5,
            content: "",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [908, 756, 910, 690, 935, 690, 935, 756],
              },
            ],
            spans: [],
          },
          {
            rowIndex: 4,
            columnIndex: 6,
            content: "",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [910, 690, 910, 640, 935, 640, 935, 690],
              },
            ],
            spans: [],
          },
          {
            rowIndex: 4,
            columnIndex: 7,
            content: "",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [910, 640, 910, 560, 935, 560, 935, 640],
              },
            ],
            spans: [],
          },
          {
            rowIndex: 4,
            columnIndex: 8,
            content: "",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [910, 560, 910, 495, 935, 495, 935, 560],
              },
            ],
            spans: [],
          },
          {
            rowIndex: 4,
            columnIndex: 9,
            content: "",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [910, 495, 910, 387, 935, 387, 935, 495],
              },
            ],
            spans: [],
          },
          {
            rowIndex: 4,
            columnIndex: 10,
            content: "",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [910, 387, 910, 282, 935, 282, 935, 387],
              },
            ],
            spans: [],
          },
          {
            rowIndex: 4,
            columnIndex: 11,
            content: "",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [910, 282, 910, 231, 935, 231, 935, 282],
              },
            ],
            spans: [],
          },
          {
            rowIndex: 4,
            columnIndex: 12,
            content: "",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [910, 231, 910, 148, 936, 148, 935, 231],
              },
            ],
            spans: [],
          },
          {
            rowIndex: 4,
            columnIndex: 13,
            content: "",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [910, 148, 910, 52, 936, 52, 936, 148],
              },
            ],
            spans: [],
          },
          {
            rowIndex: 5,
            columnIndex: 0,
            content: "2",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [934, 1342, 934, 1306, 972, 1306, 972, 1342],
              },
            ],
            spans: [{ offset: 848, length: 1 }],
          },
          {
            rowIndex: 5,
            columnIndex: 1,
            content: "SA573",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [934, 1306, 934, 1233, 972, 1233, 972, 1306],
              },
            ],
            spans: [{ offset: 850, length: 5 }],
          },
          {
            rowIndex: 5,
            columnIndex: 2,
            content: "SALAMI PIKANTNE VENTRICINA\nVACUUM OK. 3,2KG",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [934, 1233, 934, 980, 972, 980, 972, 1233],
              },
            ],
            spans: [{ offset: 856, length: 43 }],
          },
          {
            rowIndex: 5,
            columnIndex: 3,
            content: "SORRENTINO",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [934, 980, 935, 856, 972, 856, 972, 980],
              },
            ],
            spans: [{ offset: 900, length: 10 }],
          },
          {
            rowIndex: 5,
            columnIndex: 4,
            content: "1601 00 91",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [935, 856, 935, 756, 973, 756, 972, 856],
              },
            ],
            spans: [{ offset: 911, length: 10 }],
          },
          {
            rowIndex: 5,
            columnIndex: 5,
            content: "3,962",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [935, 756, 935, 690, 973, 690, 973, 756],
              },
            ],
            spans: [{ offset: 922, length: 5 }],
          },
          {
            rowIndex: 5,
            columnIndex: 6,
            content: "KG",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [935, 690, 935, 640, 973, 640, 973, 690],
              },
            ],
            spans: [{ offset: 928, length: 2 }],
          },
          {
            rowIndex: 5,
            columnIndex: 7,
            content: "42,80",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [935, 640, 935, 560, 973, 560, 973, 640],
              },
            ],
            spans: [{ offset: 931, length: 5 }],
          },
          {
            rowIndex: 5,
            columnIndex: 8,
            content: "0",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [935, 560, 935, 495, 973, 495, 973, 560],
              },
            ],
            spans: [{ offset: 937, length: 1 }],
          },
          {
            rowIndex: 5,
            columnIndex: 9,
            content: "42,80",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [935, 495, 935, 387, 973, 387, 973, 495],
              },
            ],
            spans: [{ offset: 939, length: 5 }],
          },
          {
            rowIndex: 5,
            columnIndex: 10,
            content: "169,57",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [935, 387, 935, 282, 973, 282, 973, 387],
              },
            ],
            spans: [{ offset: 945, length: 6 }],
          },
          {
            rowIndex: 5,
            columnIndex: 11,
            content: "0\n:unselected:",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [935, 282, 935, 231, 973, 231, 973, 282],
              },
            ],
            spans: [
              { offset: 952, length: 1 },
              { offset: 1731, length: 12 },
            ],
          },
          {
            rowIndex: 5,
            columnIndex: 12,
            content: "0\n:unselected:",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [935, 231, 936, 148, 973, 148, 973, 231],
              },
            ],
            spans: [
              { offset: 954, length: 1 },
              { offset: 1744, length: 12 },
            ],
          },
          {
            rowIndex: 5,
            columnIndex: 13,
            content: "169,57",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [936, 148, 936, 52, 973, 52, 973, 148],
              },
            ],
            spans: [{ offset: 956, length: 6 }],
          },
          {
            rowIndex: 6,
            columnIndex: 0,
            content: "",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [972, 1342, 972, 1306, 1000, 1306, 1000, 1342],
              },
            ],
            spans: [],
          },
          {
            rowIndex: 6,
            columnIndex: 1,
            content: "",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [972, 1306, 972, 1233, 1000, 1233, 1000, 1306],
              },
            ],
            spans: [],
          },
          {
            rowIndex: 6,
            columnIndex: 2,
            content: "",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [972, 1233, 972, 980, 1001, 980, 1000, 1233],
              },
            ],
            spans: [],
          },
          {
            rowIndex: 6,
            columnIndex: 3,
            content: "",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [972, 980, 972, 856, 1001, 856, 1001, 980],
              },
            ],
            spans: [],
          },
          {
            rowIndex: 6,
            columnIndex: 4,
            columnSpan: 2,
            content: "Lot No: 240430",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [972, 856, 973, 690, 1001, 690, 1001, 856],
              },
            ],
            spans: [{ offset: 963, length: 14 }],
          },
          {
            rowIndex: 6,
            columnIndex: 6,
            content: "KG",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [973, 690, 973, 640, 1001, 640, 1001, 690],
              },
            ],
            spans: [{ offset: 978, length: 2 }],
          },
          {
            rowIndex: 6,
            columnIndex: 7,
            content: "3,962",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [973, 640, 973, 560, 1001, 560, 1001, 640],
              },
            ],
            spans: [{ offset: 981, length: 5 }],
          },
          {
            rowIndex: 6,
            columnIndex: 8,
            content: "",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [973, 560, 973, 495, 1001, 495, 1001, 560],
              },
            ],
            spans: [],
          },
          {
            rowIndex: 6,
            columnIndex: 9,
            content: "",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [973, 495, 973, 387, 1001, 387, 1001, 495],
              },
            ],
            spans: [],
          },
          {
            rowIndex: 6,
            columnIndex: 10,
            content: "",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [973, 387, 973, 282, 1001, 282, 1001, 387],
              },
            ],
            spans: [],
          },
          {
            rowIndex: 6,
            columnIndex: 11,
            content: "",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [973, 282, 973, 231, 1001, 231, 1001, 282],
              },
            ],
            spans: [],
          },
          {
            rowIndex: 6,
            columnIndex: 12,
            content: "",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [973, 231, 973, 148, 1001, 148, 1001, 231],
              },
            ],
            spans: [],
          },
          {
            rowIndex: 6,
            columnIndex: 13,
            content: "",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [973, 148, 973, 52, 1003, 52, 1001, 148],
              },
            ],
            spans: [],
          },
          {
            rowIndex: 7,
            columnIndex: 0,
            content: "",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1000, 1342, 1000, 1306, 1028, 1306, 1027, 1342],
              },
            ],
            spans: [],
          },
          {
            rowIndex: 7,
            columnIndex: 1,
            content: "",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1000, 1306, 1000, 1233, 1028, 1233, 1028, 1306],
              },
            ],
            spans: [],
          },
          {
            rowIndex: 7,
            columnIndex: 2,
            content: "Wydanie nr WZ24/03/05545:",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1000, 1233, 1001, 980, 1029, 980, 1028, 1233],
              },
            ],
            spans: [{ offset: 987, length: 25 }],
          },
          {
            rowIndex: 7,
            columnIndex: 3,
            content: "",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1001, 980, 1001, 856, 1029, 856, 1029, 980],
              },
            ],
            spans: [],
          },
          {
            rowIndex: 7,
            columnIndex: 4,
            content: "",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1001, 856, 1001, 756, 1029, 756, 1029, 856],
              },
            ],
            spans: [],
          },
          {
            rowIndex: 7,
            columnIndex: 5,
            content: "",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1001, 756, 1001, 690, 1029, 690, 1029, 756],
              },
            ],
            spans: [],
          },
          {
            rowIndex: 7,
            columnIndex: 6,
            content: "",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1001, 690, 1001, 640, 1029, 640, 1029, 690],
              },
            ],
            spans: [],
          },
          {
            rowIndex: 7,
            columnIndex: 7,
            content: "",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1001, 640, 1001, 560, 1029, 560, 1029, 640],
              },
            ],
            spans: [],
          },
          {
            rowIndex: 7,
            columnIndex: 8,
            content: "",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1001, 560, 1001, 495, 1029, 495, 1029, 560],
              },
            ],
            spans: [],
          },
          {
            rowIndex: 7,
            columnIndex: 9,
            content: "",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1001, 495, 1001, 387, 1029, 387, 1029, 495],
              },
            ],
            spans: [],
          },
          {
            rowIndex: 7,
            columnIndex: 10,
            content: "",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1001, 387, 1001, 282, 1029, 282, 1029, 387],
              },
            ],
            spans: [],
          },
          {
            rowIndex: 7,
            columnIndex: 11,
            content: "",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1001, 282, 1001, 231, 1029, 231, 1029, 282],
              },
            ],
            spans: [],
          },
          {
            rowIndex: 7,
            columnIndex: 12,
            content: "",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1001, 231, 1001, 148, 1029, 148, 1029, 231],
              },
            ],
            spans: [],
          },
          {
            rowIndex: 7,
            columnIndex: 13,
            content: "",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1001, 148, 1003, 52, 1029, 52, 1029, 148],
              },
            ],
            spans: [],
          },
          {
            rowIndex: 8,
            columnIndex: 0,
            content: "3",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1027, 1342, 1028, 1306, 1065, 1306, 1065, 1342],
              },
            ],
            spans: [{ offset: 1013, length: 1 }],
          },
          {
            rowIndex: 8,
            columnIndex: 1,
            content: "NFG73",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1028, 1306, 1028, 1233, 1065, 1233, 1065, 1306],
              },
            ],
            spans: [{ offset: 1015, length: 5 }],
          },
          {
            rowIndex: 8,
            columnIndex: 2,
            content: "KREM TRUFLOWY 3%- SOS E\nBRUSCHETTA 540 GR",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1028, 1233, 1029, 980, 1067, 980, 1065, 1233],
              },
            ],
            spans: [{ offset: 1021, length: 41 }],
          },
          {
            rowIndex: 8,
            columnIndex: 3,
            content: "NOVA",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1029, 980, 1029, 856, 1065, 856, 1067, 980],
              },
            ],
            spans: [{ offset: 1063, length: 4 }],
          },
          {
            rowIndex: 8,
            columnIndex: 4,
            content: "2103 90 90",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1029, 856, 1029, 756, 1065, 756, 1065, 856],
              },
            ],
            spans: [{ offset: 1068, length: 10 }],
          },
          {
            rowIndex: 8,
            columnIndex: 5,
            content: "6",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1029, 756, 1029, 690, 1065, 690, 1065, 756],
              },
            ],
            spans: [{ offset: 1079, length: 1 }],
          },
          {
            rowIndex: 8,
            columnIndex: 6,
            content: "PCS",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1029, 690, 1029, 640, 1065, 640, 1065, 690],
              },
            ],
            spans: [{ offset: 1081, length: 3 }],
          },
          {
            rowIndex: 8,
            columnIndex: 7,
            content: "34,54",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1029, 640, 1029, 560, 1065, 560, 1065, 640],
              },
            ],
            spans: [{ offset: 1085, length: 5 }],
          },
          {
            rowIndex: 8,
            columnIndex: 8,
            content: "8",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1029, 560, 1029, 495, 1065, 495, 1065, 560],
              },
            ],
            spans: [{ offset: 1091, length: 1 }],
          },
          {
            rowIndex: 8,
            columnIndex: 9,
            content: "31,78",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1029, 495, 1029, 387, 1067, 387, 1065, 495],
              },
            ],
            spans: [{ offset: 1093, length: 5 }],
          },
          {
            rowIndex: 8,
            columnIndex: 10,
            content: "190,66",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1029, 387, 1029, 282, 1067, 282, 1067, 387],
              },
            ],
            spans: [{ offset: 1099, length: 6 }],
          },
          {
            rowIndex: 8,
            columnIndex: 11,
            content: "8\n:selected:",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1029, 282, 1029, 231, 1067, 231, 1067, 282],
              },
            ],
            spans: [
              { offset: 1106, length: 1 },
              { offset: 1757, length: 10 },
            ],
          },
          {
            rowIndex: 8,
            columnIndex: 12,
            content: "15,25",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1029, 231, 1029, 148, 1067, 148, 1067, 231],
              },
            ],
            spans: [{ offset: 1108, length: 5 }],
          },
          {
            rowIndex: 8,
            columnIndex: 13,
            content: "205,91",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1029, 148, 1029, 52, 1067, 52, 1067, 148],
              },
            ],
            spans: [{ offset: 1114, length: 6 }],
          },
          {
            rowIndex: 9,
            columnIndex: 0,
            content: "",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1065, 1342, 1065, 1306, 1093, 1305, 1093, 1342],
              },
            ],
            spans: [],
          },
          {
            rowIndex: 9,
            columnIndex: 1,
            content: "",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1065, 1306, 1065, 1233, 1093, 1233, 1093, 1305],
              },
            ],
            spans: [],
          },
          {
            rowIndex: 9,
            columnIndex: 2,
            content: "",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1065, 1233, 1067, 980, 1093, 980, 1093, 1233],
              },
            ],
            spans: [],
          },
          {
            rowIndex: 9,
            columnIndex: 3,
            content: "",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1067, 980, 1065, 856, 1093, 856, 1093, 980],
              },
            ],
            spans: [],
          },
          {
            rowIndex: 9,
            columnIndex: 4,
            columnSpan: 2,
            content: "Lot No: 280126",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1065, 856, 1065, 690, 1093, 690, 1093, 856],
              },
            ],
            spans: [{ offset: 1121, length: 14 }],
          },
          {
            rowIndex: 9,
            columnIndex: 6,
            content: "PCS",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1065, 690, 1065, 640, 1093, 640, 1093, 690],
              },
            ],
            spans: [{ offset: 1136, length: 3 }],
          },
          {
            rowIndex: 9,
            columnIndex: 7,
            content: "6",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1065, 640, 1065, 560, 1093, 560, 1093, 640],
              },
            ],
            spans: [{ offset: 1140, length: 1 }],
          },
          {
            rowIndex: 9,
            columnIndex: 8,
            content: "",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1065, 560, 1065, 495, 1093, 495, 1093, 560],
              },
            ],
            spans: [],
          },
          {
            rowIndex: 9,
            columnIndex: 9,
            content: "",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1065, 495, 1067, 387, 1093, 387, 1093, 495],
              },
            ],
            spans: [],
          },
          {
            rowIndex: 9,
            columnIndex: 10,
            content: "",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1067, 387, 1067, 282, 1093, 282, 1093, 387],
              },
            ],
            spans: [],
          },
          {
            rowIndex: 9,
            columnIndex: 11,
            columnSpan: 3,
            content: "",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1067, 282, 1067, 52, 1095, 52, 1093, 282],
              },
            ],
            spans: [],
          },
          {
            rowIndex: 10,
            columnIndex: 0,
            content: "4",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1093, 1342, 1093, 1305, 1132, 1305, 1132, 1342],
              },
            ],
            spans: [{ offset: 1142, length: 1 }],
          },
          {
            rowIndex: 10,
            columnIndex: 1,
            content: "SA479",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1093, 1305, 1093, 1233, 1132, 1233, 1132, 1305],
              },
            ],
            spans: [{ offset: 1144, length: 5 }],
          },
          {
            rowIndex: 10,
            columnIndex: 2,
            content: "SPIANATA PIKANTNA VACUUM\nOK. 2.6KG",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1093, 1233, 1093, 980, 1132, 980, 1132, 1233],
              },
            ],
            spans: [{ offset: 1150, length: 34 }],
          },
          {
            rowIndex: 10,
            columnIndex: 3,
            content: "SORRENTINO",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1093, 980, 1093, 856, 1131, 856, 1132, 980],
              },
            ],
            spans: [{ offset: 1185, length: 10 }],
          },
          {
            rowIndex: 10,
            columnIndex: 4,
            content: "1601 00 91",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1093, 856, 1093, 756, 1131, 756, 1131, 856],
              },
            ],
            spans: [{ offset: 1196, length: 10 }],
          },
          {
            rowIndex: 10,
            columnIndex: 5,
            content: "3,046",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1093, 756, 1093, 690, 1131, 690, 1131, 756],
              },
            ],
            spans: [{ offset: 1207, length: 5 }],
          },
          {
            rowIndex: 10,
            columnIndex: 6,
            content: "KG",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1093, 690, 1093, 640, 1131, 640, 1131, 690],
              },
            ],
            spans: [{ offset: 1213, length: 2 }],
          },
          {
            rowIndex: 10,
            columnIndex: 7,
            content: "52,59",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1093, 640, 1093, 560, 1131, 560, 1131, 640],
              },
            ],
            spans: [{ offset: 1216, length: 5 }],
          },
          {
            rowIndex: 10,
            columnIndex: 8,
            content: "8",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1093, 560, 1093, 495, 1131, 495, 1131, 560],
              },
            ],
            spans: [{ offset: 1222, length: 1 }],
          },
          {
            rowIndex: 10,
            columnIndex: 9,
            content: "48,38",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1093, 495, 1093, 387, 1131, 387, 1131, 495],
              },
            ],
            spans: [{ offset: 1224, length: 5 }],
          },
          {
            rowIndex: 10,
            columnIndex: 10,
            content: "147,37",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1093, 387, 1093, 282, 1132, 282, 1131, 387],
              },
            ],
            spans: [{ offset: 1230, length: 6 }],
          },
          {
            rowIndex: 10,
            columnIndex: 11,
            content: "0\n:unselected:",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1093, 282, 1093, 231, 1132, 231, 1132, 282],
              },
            ],
            spans: [
              { offset: 1237, length: 1 },
              { offset: 1768, length: 12 },
            ],
          },
          {
            rowIndex: 10,
            columnIndex: 12,
            content: "0\n:unselected:",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1093, 231, 1093, 148, 1132, 148, 1132, 231],
              },
            ],
            spans: [
              { offset: 1239, length: 1 },
              { offset: 1781, length: 12 },
            ],
          },
          {
            rowIndex: 10,
            columnIndex: 13,
            content: "147,37",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1093, 148, 1095, 52, 1132, 53, 1132, 148],
              },
            ],
            spans: [{ offset: 1241, length: 6 }],
          },
          {
            rowIndex: 11,
            columnIndex: 0,
            content: "",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1132, 1342, 1132, 1305, 1160, 1305, 1160, 1342],
              },
            ],
            spans: [],
          },
          {
            rowIndex: 11,
            columnIndex: 1,
            content: "",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1132, 1305, 1132, 1233, 1160, 1233, 1160, 1305],
              },
            ],
            spans: [],
          },
          {
            rowIndex: 11,
            columnIndex: 2,
            content: "",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1132, 1233, 1132, 980, 1158, 980, 1160, 1233],
              },
            ],
            spans: [],
          },
          {
            rowIndex: 11,
            columnIndex: 3,
            content: "",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1132, 980, 1131, 856, 1158, 856, 1158, 980],
              },
            ],
            spans: [],
          },
          {
            rowIndex: 11,
            columnIndex: 4,
            columnSpan: 2,
            content: "Lot No: 241031",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1131, 856, 1131, 690, 1158, 690, 1158, 856],
              },
            ],
            spans: [{ offset: 1248, length: 14 }],
          },
          {
            rowIndex: 11,
            columnIndex: 6,
            content: "KG",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1131, 690, 1131, 640, 1158, 640, 1158, 690],
              },
            ],
            spans: [{ offset: 1263, length: 2 }],
          },
          {
            rowIndex: 11,
            columnIndex: 7,
            content: "3,046",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1131, 640, 1131, 560, 1158, 560, 1158, 640],
              },
            ],
            spans: [{ offset: 1266, length: 5 }],
          },
          {
            rowIndex: 11,
            columnIndex: 8,
            content: "",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1131, 560, 1131, 495, 1158, 497, 1158, 560],
              },
            ],
            spans: [],
          },
          {
            rowIndex: 11,
            columnIndex: 9,
            content: "",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1131, 495, 1131, 387, 1158, 387, 1158, 497],
              },
            ],
            spans: [],
          },
          {
            rowIndex: 11,
            columnIndex: 10,
            content: "",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1131, 387, 1132, 282, 1158, 282, 1158, 387],
              },
            ],
            spans: [],
          },
          {
            rowIndex: 11,
            columnIndex: 11,
            content: "",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1132, 282, 1132, 231, 1158, 231, 1158, 282],
              },
            ],
            spans: [],
          },
          {
            rowIndex: 11,
            columnIndex: 12,
            content: "",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1132, 231, 1132, 148, 1158, 148, 1158, 231],
              },
            ],
            spans: [],
          },
          {
            rowIndex: 11,
            columnIndex: 13,
            content: "",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1132, 148, 1132, 53, 1158, 53, 1158, 148],
              },
            ],
            spans: [],
          },
          {
            rowIndex: 12,
            columnIndex: 0,
            content: "5",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1160, 1342, 1160, 1305, 1198, 1305, 1198, 1342],
              },
            ],
            spans: [{ offset: 1272, length: 1 }],
          },
          {
            rowIndex: 12,
            columnIndex: 1,
            content: "SA573",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1160, 1305, 1160, 1233, 1198, 1233, 1198, 1305],
              },
            ],
            spans: [{ offset: 1274, length: 5 }],
          },
          {
            rowIndex: 12,
            columnIndex: 2,
            content: "SALAMI PIKANTNE VENTRICINA\nVACUUM OK. 3,2KG",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1160, 1233, 1158, 980, 1197, 979, 1198, 1233],
              },
            ],
            spans: [{ offset: 1280, length: 43 }],
          },
          {
            rowIndex: 12,
            columnIndex: 3,
            content: "SORRENTINO",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1158, 980, 1158, 856, 1197, 856, 1197, 979],
              },
            ],
            spans: [{ offset: 1324, length: 10 }],
          },
          {
            rowIndex: 12,
            columnIndex: 4,
            content: "1601 00 91",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1158, 856, 1158, 756, 1197, 756, 1197, 856],
              },
            ],
            spans: [{ offset: 1335, length: 10 }],
          },
          {
            rowIndex: 12,
            columnIndex: 5,
            content: "4,104",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1158, 756, 1158, 690, 1196, 690, 1197, 756],
              },
            ],
            spans: [{ offset: 1346, length: 5 }],
          },
          {
            rowIndex: 12,
            columnIndex: 6,
            content: "KG",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1158, 690, 1158, 640, 1196, 640, 1196, 690],
              },
            ],
            spans: [{ offset: 1352, length: 2 }],
          },
          {
            rowIndex: 12,
            columnIndex: 7,
            content: "52,38",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1158, 640, 1158, 560, 1196, 560, 1196, 640],
              },
            ],
            spans: [{ offset: 1355, length: 5 }],
          },
          {
            rowIndex: 12,
            columnIndex: 8,
            content: "0",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1158, 560, 1158, 497, 1196, 497, 1196, 560],
              },
            ],
            spans: [{ offset: 1361, length: 1 }],
          },
          {
            rowIndex: 12,
            columnIndex: 9,
            content: "52,38",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1158, 497, 1158, 387, 1196, 387, 1196, 497],
              },
            ],
            spans: [{ offset: 1363, length: 5 }],
          },
          {
            rowIndex: 12,
            columnIndex: 10,
            content: "214,97",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1158, 387, 1158, 282, 1197, 282, 1196, 387],
              },
            ],
            spans: [{ offset: 1369, length: 6 }],
          },
          {
            rowIndex: 12,
            columnIndex: 11,
            content: "0\n:unselected:",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1158, 282, 1158, 231, 1197, 233, 1197, 282],
              },
            ],
            spans: [
              { offset: 1376, length: 1 },
              { offset: 1794, length: 12 },
            ],
          },
          {
            rowIndex: 12,
            columnIndex: 12,
            content: "0",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1158, 231, 1158, 148, 1197, 148, 1197, 233],
              },
            ],
            spans: [{ offset: 1378, length: 1 }],
          },
          {
            rowIndex: 12,
            columnIndex: 13,
            content: "214,97",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1158, 148, 1158, 53, 1197, 53, 1197, 148],
              },
            ],
            spans: [{ offset: 1380, length: 6 }],
          },
          {
            rowIndex: 13,
            columnIndex: 0,
            content: "",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1198, 1342, 1198, 1305, 1225, 1305, 1225, 1342],
              },
            ],
            spans: [],
          },
          {
            rowIndex: 13,
            columnIndex: 1,
            content: "",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1198, 1305, 1198, 1233, 1224, 1233, 1225, 1305],
              },
            ],
            spans: [],
          },
          {
            rowIndex: 13,
            columnIndex: 2,
            content: "",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1198, 1233, 1197, 979, 1224, 979, 1224, 1233],
              },
            ],
            spans: [],
          },
          {
            rowIndex: 13,
            columnIndex: 3,
            content: "",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1197, 979, 1197, 856, 1222, 856, 1224, 979],
              },
            ],
            spans: [],
          },
          {
            rowIndex: 13,
            columnIndex: 4,
            columnSpan: 2,
            content: "Lot No: 240430",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1197, 856, 1196, 690, 1222, 690, 1222, 856],
              },
            ],
            spans: [{ offset: 1387, length: 14 }],
          },
          {
            rowIndex: 13,
            columnIndex: 6,
            content: "KG",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1196, 690, 1196, 640, 1222, 640, 1222, 690],
              },
            ],
            spans: [{ offset: 1402, length: 2 }],
          },
          {
            rowIndex: 13,
            columnIndex: 7,
            content: "4,104",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1196, 640, 1196, 560, 1222, 560, 1222, 640],
              },
            ],
            spans: [{ offset: 1405, length: 5 }],
          },
          {
            rowIndex: 13,
            columnIndex: 8,
            content: "",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1196, 560, 1196, 497, 1222, 497, 1222, 560],
              },
            ],
            spans: [],
          },
          {
            rowIndex: 13,
            columnIndex: 9,
            content: "",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1196, 497, 1196, 387, 1222, 387, 1222, 497],
              },
            ],
            spans: [],
          },
          {
            rowIndex: 13,
            columnIndex: 10,
            content: "",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1196, 387, 1197, 282, 1222, 282, 1222, 387],
              },
            ],
            spans: [],
          },
          {
            rowIndex: 13,
            columnIndex: 11,
            content: "",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1197, 282, 1197, 233, 1222, 233, 1222, 282],
              },
            ],
            spans: [],
          },
          {
            rowIndex: 13,
            columnIndex: 12,
            content: "",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1197, 233, 1197, 148, 1222, 148, 1222, 233],
              },
            ],
            spans: [],
          },
          {
            rowIndex: 13,
            columnIndex: 13,
            content: "",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1197, 148, 1197, 53, 1222, 53, 1222, 148],
              },
            ],
            spans: [],
          },
        ],
        boundingRegions: [
          {
            pageNumber: 1,
            polygon: [729, 1346, 729, 48, 1219, 47, 1220, 1346],
          },
        ],
        spans: [
          { offset: 479, length: 2 },
          { offset: 476, length: 2 },
          { offset: 482, length: 8 },
          { offset: 615, length: 2 },
          { offset: 491, length: 23 },
          { offset: 526, length: 21 },
          { offset: 618, length: 2 },
          { offset: 548, length: 10 },
          { offset: 515, length: 4 },
          { offset: 559, length: 9 },
          { offset: 621, length: 6 },
          { offset: 520, length: 5 },
          { offset: 569, length: 6 },
          { offset: 628, length: 3 },
          { offset: 576, length: 13 },
          { offset: 632, length: 7 },
          { offset: 590, length: 7 },
          { offset: 640, length: 5 },
          { offset: 598, length: 2 },
          { offset: 646, length: 3 },
          { offset: 601, length: 5 },
          { offset: 650, length: 3 },
          { offset: 607, length: 7 },
          { offset: 654, length: 137 },
          { offset: 1718, length: 12 },
          { offset: 792, length: 161 },
          { offset: 1731, length: 12 },
          { offset: 954, length: 1 },
          { offset: 1744, length: 12 },
          { offset: 956, length: 151 },
          { offset: 1757, length: 10 },
          { offset: 1108, length: 130 },
          { offset: 1768, length: 12 },
          { offset: 1239, length: 1 },
          { offset: 1781, length: 12 },
          { offset: 1241, length: 136 },
          { offset: 1794, length: 12 },
          { offset: 1378, length: 32 },
        ],
      },
      {
        rowCount: 4,
        columnCount: 5,
        cells: [
          {
            kind: "columnHeader",
            rowIndex: 0,
            columnIndex: 0,
            content: "",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1259, 769, 1260, 644, 1292, 644, 1291, 769],
              },
            ],
            spans: [],
          },
          {
            kind: "columnHeader",
            rowIndex: 0,
            columnIndex: 1,
            content: "Wartość netto",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1260, 644, 1260, 490, 1293, 490, 1292, 644],
              },
            ],
            spans: [{ offset: 1428, length: 13 }],
          },
          {
            kind: "columnHeader",
            rowIndex: 0,
            columnIndex: 2,
            content: "St VAT",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1260, 490, 1260, 424, 1293, 424, 1293, 490],
              },
            ],
            spans: [{ offset: 1442, length: 6 }],
          },
          {
            kind: "columnHeader",
            rowIndex: 0,
            columnIndex: 3,
            content: "Wartość VAT",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1260, 424, 1261, 267, 1293, 267, 1293, 424],
              },
            ],
            spans: [{ offset: 1449, length: 11 }],
          },
          {
            kind: "columnHeader",
            rowIndex: 0,
            columnIndex: 4,
            content: "Wartość brutto",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1261, 267, 1261, 119, 1294, 119, 1293, 267],
              },
            ],
            spans: [{ offset: 1461, length: 14 }],
          },
          {
            rowIndex: 1,
            columnIndex: 0,
            content: "Razem",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1291, 769, 1292, 644, 1319, 645, 1319, 769],
              },
            ],
            spans: [{ offset: 1476, length: 5 }],
          },
          {
            rowIndex: 1,
            columnIndex: 1,
            content: "632,67",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1292, 644, 1293, 490, 1320, 490, 1319, 645],
              },
            ],
            spans: [{ offset: 1482, length: 6 }],
          },
          {
            rowIndex: 1,
            columnIndex: 2,
            content: "0,00",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1293, 490, 1293, 424, 1320, 424, 1320, 490],
              },
            ],
            spans: [{ offset: 1489, length: 4 }],
          },
          {
            rowIndex: 1,
            columnIndex: 3,
            content: "0,00",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1293, 424, 1293, 267, 1321, 267, 1320, 424],
              },
            ],
            spans: [{ offset: 1494, length: 4 }],
          },
          {
            rowIndex: 1,
            columnIndex: 4,
            content: "632,67",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1293, 267, 1294, 119, 1321, 119, 1321, 267],
              },
            ],
            spans: [{ offset: 1499, length: 6 }],
          },
          {
            rowIndex: 2,
            columnIndex: 0,
            content: "Razem",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1319, 769, 1319, 645, 1346, 645, 1345, 770],
              },
            ],
            spans: [{ offset: 1506, length: 5 }],
          },
          {
            rowIndex: 2,
            columnIndex: 1,
            content: "190,66",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1319, 645, 1320, 490, 1346, 490, 1346, 645],
              },
            ],
            spans: [{ offset: 1512, length: 6 }],
          },
          {
            rowIndex: 2,
            columnIndex: 2,
            content: "8,00",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1320, 490, 1320, 424, 1346, 424, 1346, 490],
              },
            ],
            spans: [{ offset: 1519, length: 4 }],
          },
          {
            rowIndex: 2,
            columnIndex: 3,
            content: "15,25",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1320, 424, 1321, 267, 1347, 267, 1346, 424],
              },
            ],
            spans: [{ offset: 1524, length: 5 }],
          },
          {
            rowIndex: 2,
            columnIndex: 4,
            content: "205,91",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1321, 267, 1321, 119, 1347, 119, 1347, 267],
              },
            ],
            spans: [{ offset: 1530, length: 6 }],
          },
          {
            rowIndex: 3,
            columnIndex: 0,
            content: "OGÓŁEM",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1345, 770, 1346, 645, 1384, 645, 1384, 770],
              },
            ],
            spans: [{ offset: 1537, length: 6 }],
          },
          {
            rowIndex: 3,
            columnIndex: 1,
            content: "823,33",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1346, 645, 1346, 490, 1385, 490, 1384, 645],
              },
            ],
            spans: [{ offset: 1544, length: 6 }],
          },
          {
            rowIndex: 3,
            columnIndex: 2,
            content: "",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1346, 490, 1346, 424, 1385, 424, 1385, 490],
              },
            ],
            spans: [],
          },
          {
            rowIndex: 3,
            columnIndex: 3,
            content: "15,25",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1346, 424, 1347, 267, 1385, 268, 1385, 424],
              },
            ],
            spans: [{ offset: 1551, length: 5 }],
          },
          {
            rowIndex: 3,
            columnIndex: 4,
            content: "838,58",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1347, 267, 1347, 119, 1386, 119, 1385, 268],
              },
            ],
            spans: [{ offset: 1557, length: 6 }],
          },
        ],
        boundingRegions: [
          {
            pageNumber: 1,
            polygon: [1257, 770, 1259, 117, 1386, 117, 1385, 771],
          },
        ],
        spans: [{ offset: 1428, length: 135 }],
      },
    ],
    styles: [],
    documents: [
      {
        docType: "invoice",
        boundingRegions: [
          { pageNumber: 1, polygon: [0, 0, 2016, 0, 2016, 1512, 0, 1512] },
        ],
        fields: {
          CustomerAddress: {
            type: "address",
            content: "ul. Żytnia 42\n84-122 Żelistrzewo",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [562, 657, 564, 464, 619, 464, 616, 658],
              },
            ],
            confidence: 0.894,
            spans: [{ offset: 353, length: 32 }],
            valueAddress: {
              houseNumber: "42",
              road: "ul. Żytnia",
              postalCode: "84-122",
              city: "Żelistrzewo",
              streetAddress: "42 ul. Żytnia",
            },
          },
          CustomerAddressRecipient: {
            type: "string",
            valueString:
              "CUST-13918\nN.A.P New Authentic Pizza Michał Lemke, Kacper\nKop czyński spółka cywilna",
            content:
              "CUST-13918\nN.A.P New Authentic Pizza Michał Lemke, Kacper\nKop czyński spółka cywilna",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [476, 657, 483, 95, 568, 96, 561, 658],
              },
            ],
            confidence: 0.838,
            spans: [
              { offset: 215, length: 10 },
              { offset: 242, length: 46 },
              { offset: 326, length: 26 },
            ],
          },
          CustomerName: {
            type: "string",
            valueString:
              "CUST-13918\nN.A.P New Authentic Pizza Michał Lemke, Kacper\nKop czyński spółka cywilna",
            content:
              "CUST-13918\nN.A.P New Authentic Pizza Michał Lemke, Kacper\nKop czyński spółka cywilna",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [476, 657, 483, 95, 568, 96, 561, 658],
              },
            ],
            confidence: 0.838,
            spans: [
              { offset: 215, length: 10 },
              { offset: 242, length: 46 },
              { offset: 326, length: 26 },
            ],
          },
          CustomerTaxId: {
            type: "string",
            valueString: "5871730810",
            content: "5871730810",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [620, 607, 619, 482, 644, 481, 643, 606],
              },
            ],
            confidence: 0.939,
            spans: [{ offset: 391, length: 10 }],
          },
          InvoiceDate: {
            type: "date",
            valueDate: "2024-03-12",
            content: "12.03.2024",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [247, 158, 248, 57, 268, 58, 267, 157],
              },
            ],
            confidence: 0.945,
            spans: [{ offset: 46, length: 10 }],
          },
          InvoiceId: {
            type: "string",
            valueString: "FV/GD/24/03/00558",
            content: "FV/GD/24/03/00558",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [331, 789, 333, 360, 380, 359, 381, 788],
              },
            ],
            confidence: 0.943,
            spans: [{ offset: 122, length: 17 }],
          },
          InvoiceTotal: {
            type: "currency",
            valueCurrency: { amount: 838.58, currencyCode: "PLN" },
            content: "838,58",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1359, 177, 1359, 123, 1376, 123, 1377, 176],
              },
            ],
            confidence: 0.944,
            spans: [{ offset: 1557, length: 6 }],
          },
          Items: {
            type: "array",
            valueArray: [
              {
                type: "object",
                valueObject: {
                  Amount: {
                    type: "currency",
                    valueCurrency: {
                      amount: 100.76,
                      currencyCode: "PLN",
                    },
                    content: "100,76",
                    boundingRegions: [
                      {
                        pageNumber: 1,
                        polygon: [855, 100, 855, 54, 871, 54, 871, 100],
                      },
                    ],
                    confidence: 0.933,
                    spans: [{ offset: 794, length: 6 }],
                  },
                  Description: {
                    type: "string",
                    valueString: "MĄKA SEMOLA RIMACINATA\nGOLD WOREK 25KG",
                    content: "MĄKA SEMOLA RIMACINATA\nGOLD WOREK 25KG",
                    boundingRegions: [
                      {
                        pageNumber: 1,
                        polygon: [841, 1230, 841, 1023, 879, 1023, 879, 1230],
                      },
                    ],
                    confidence: 0.943,
                    spans: [{ offset: 695, length: 38 }],
                  },
                  ProductCode: {
                    type: "string",
                    valueString: "MAD05",
                    content: "MAD05",
                    boundingRegions: [
                      {
                        pageNumber: 1,
                        polygon: [851, 1301, 851, 1249, 869, 1249, 868, 1301],
                      },
                    ],
                    confidence: 0.934,
                    spans: [{ offset: 689, length: 5 }],
                  },
                  Quantity: {
                    type: "number",
                    valueNumber: 1,
                    content: "1",
                    boundingRegions: [
                      {
                        pageNumber: 1,
                        polygon: [855, 703, 856, 695, 871, 696, 870, 704],
                      },
                    ],
                    confidence: 0.935,
                    spans: [{ offset: 761, length: 1 }],
                  },
                  Tax: {
                    type: "currency",
                    valueCurrency: { amount: 0, currencyCode: "PLN" },
                    content: "0",
                    boundingRegions: [
                      {
                        pageNumber: 1,
                        polygon: [854, 161, 855, 154, 868, 155, 868, 162],
                      },
                    ],
                    confidence: 0.958,
                    spans: [{ offset: 792, length: 1 }],
                  },
                  TaxRate: {
                    type: "string",
                    valueString: "0",
                    content: "0",
                    boundingRegions: [
                      {
                        pageNumber: 1,
                        polygon: [854, 261, 855, 254, 868, 255, 868, 262],
                      },
                    ],
                    confidence: 0.802,
                    spans: [{ offset: 790, length: 1 }],
                  },
                  Unit: {
                    type: "string",
                    valueString: "PCS",
                    content: "PCS",
                    boundingRegions: [
                      {
                        pageNumber: 1,
                        polygon: [854, 680, 854, 652, 871, 652, 871, 680],
                      },
                    ],
                    confidence: 0.928,
                    spans: [{ offset: 763, length: 3 }],
                  },
                  UnitPrice: {
                    type: "currency",
                    valueCurrency: {
                      amount: 106.06,
                      currencyCode: "PLN",
                    },
                    content: "106,06",
                    boundingRegions: [
                      {
                        pageNumber: 1,
                        polygon: [855, 618, 855, 565, 872, 565, 872, 618],
                      },
                    ],
                    confidence: 0.917,
                    spans: [{ offset: 767, length: 6 }],
                  },
                },
                content:
                  "1 MAD05\nMĄKA SEMOLA RIMACINATA\nGOLD WOREK 25KG\nMOLINI\nAMBROSIO\n1103 11 10\n1\nPCS\n106,06\n5\n100,76\n100,76\n0\n0\n100,76\nLot No: 250131\nPCS",
                boundingRegions: [
                  {
                    pageNumber: 1,
                    polygon: [841, 1318, 841, 54, 905, 54, 905, 1318],
                  },
                ],
                confidence: 0.754,
                spans: [{ offset: 687, length: 132 }],
              },
              {
                type: "object",
                valueObject: {
                  Amount: {
                    type: "currency",
                    valueCurrency: {
                      amount: 169.57,
                      currencyCode: "PLN",
                    },
                    content: "169,57",
                    boundingRegions: [
                      {
                        pageNumber: 1,
                        polygon: [949, 101, 949, 53, 965, 54, 965, 101],
                      },
                    ],
                    confidence: 0.934,
                    spans: [{ offset: 956, length: 6 }],
                  },
                  Description: {
                    type: "string",
                    valueString: "SALAMI PIKANTNE VENTRICINA\nVACUUM OK. 3,2KG",
                    content: "SALAMI PIKANTNE VENTRICINA\nVACUUM OK. 3,2KG",
                    boundingRegions: [
                      {
                        pageNumber: 1,
                        polygon: [933, 1229, 936, 997, 976, 997, 973, 1229],
                      },
                    ],
                    confidence: 0.944,
                    spans: [{ offset: 856, length: 43 }],
                  },
                  ProductCode: {
                    type: "string",
                    valueString: "SA573",
                    content: "SA573",
                    boundingRegions: [
                      {
                        pageNumber: 1,
                        polygon: [946, 1300, 946, 1254, 963, 1254, 963, 1300],
                      },
                    ],
                    confidence: 0.916,
                    spans: [{ offset: 850, length: 5 }],
                  },
                  Quantity: {
                    type: "number",
                    valueNumber: 3.962,
                    content: "3,962",
                    boundingRegions: [
                      {
                        pageNumber: 1,
                        polygon: [948, 735, 947, 697, 963, 696, 964, 734],
                      },
                    ],
                    confidence: 0.935,
                    spans: [{ offset: 922, length: 5 }],
                  },
                  Tax: {
                    type: "currency",
                    valueCurrency: { amount: 0, currencyCode: "PLN" },
                    content: "0",
                    boundingRegions: [
                      {
                        pageNumber: 1,
                        polygon: [948, 161, 949, 154, 962, 155, 962, 162],
                      },
                    ],
                    confidence: 0.937,
                    spans: [{ offset: 954, length: 1 }],
                  },
                  TaxRate: {
                    type: "string",
                    valueString: "0",
                    content: "0",
                    boundingRegions: [
                      {
                        pageNumber: 1,
                        polygon: [947, 261, 948, 253, 963, 254, 962, 262],
                      },
                    ],
                    confidence: 0.781,
                    spans: [{ offset: 952, length: 1 }],
                  },
                  Unit: {
                    type: "string",
                    valueString: "KG",
                    content: "KG",
                    boundingRegions: [
                      {
                        pageNumber: 1,
                        polygon: [947, 675, 947, 658, 963, 658, 963, 675],
                      },
                    ],
                    confidence: 0.928,
                    spans: [{ offset: 928, length: 2 }],
                  },
                  UnitPrice: {
                    type: "currency",
                    valueCurrency: { amount: 42.8, currencyCode: "PLN" },
                    content: "42,80",
                    boundingRegions: [
                      {
                        pageNumber: 1,
                        polygon: [948, 610, 947, 566, 964, 565, 965, 610],
                      },
                    ],
                    confidence: 0.896,
                    spans: [{ offset: 931, length: 5 }],
                  },
                },
                content:
                  "2 SA573\nSALAMI PIKANTNE VENTRICINA\nVACUUM OK. 3,2KG\nSORRENTINO\n1601 00 91\n3,962\nKG\n42,80\n0\n42,80\n169,57\n0\n0\n169,57",
                boundingRegions: [
                  {
                    pageNumber: 1,
                    polygon: [935, 1317, 935, 53, 973, 53, 973, 1317],
                  },
                ],
                confidence: 0.89,
                spans: [{ offset: 848, length: 114 }],
              },
              {
                type: "object",
                valueObject: {
                  Amount: {
                    type: "currency",
                    valueCurrency: {
                      amount: 205.91,
                      currencyCode: "PLN",
                    },
                    content: "205,91",
                    boundingRegions: [
                      {
                        pageNumber: 1,
                        polygon: [1042, 102, 1043, 55, 1059, 55, 1058, 102],
                      },
                    ],
                    confidence: 0.929,
                    spans: [{ offset: 1114, length: 6 }],
                  },
                  Description: {
                    type: "string",
                    valueString: "KREM TRUFLOWY 3%- SOS E\nBRUSCHETTA 540 GR",
                    content: "KREM TRUFLOWY 3%- SOS E\nBRUSCHETTA 540 GR",
                    boundingRegions: [
                      {
                        pageNumber: 1,
                        polygon: [
                          1029, 1229, 1029, 1015, 1067, 1015, 1067, 1229,
                        ],
                      },
                    ],
                    confidence: 0.939,
                    spans: [{ offset: 1021, length: 41 }],
                  },
                  ProductCode: {
                    type: "string",
                    valueString: "NFG73",
                    content: "NFG73",
                    boundingRegions: [
                      {
                        pageNumber: 1,
                        polygon: [
                          1040, 1301, 1040, 1252, 1059, 1252, 1058, 1301,
                        ],
                      },
                    ],
                    confidence: 0.914,
                    spans: [{ offset: 1015, length: 5 }],
                  },
                  Quantity: {
                    type: "number",
                    valueNumber: 6,
                    content: "6",
                    boundingRegions: [
                      {
                        pageNumber: 1,
                        polygon: [1040, 704, 1040, 696, 1055, 697, 1055, 705],
                      },
                    ],
                    confidence: 0.936,
                    spans: [{ offset: 1079, length: 1 }],
                  },
                  Tax: {
                    type: "currency",
                    valueCurrency: { amount: 15.25, currencyCode: "PLN" },
                    content: "15,25",
                    boundingRegions: [
                      {
                        pageNumber: 1,
                        polygon: [1041, 191, 1041, 153, 1058, 152, 1058, 190],
                      },
                    ],
                    confidence: 0.908,
                    spans: [{ offset: 1108, length: 5 }],
                  },
                  TaxRate: {
                    type: "string",
                    valueString: "8",
                    content: "8",
                    boundingRegions: [
                      {
                        pageNumber: 1,
                        polygon: [1042, 261, 1042, 254, 1055, 254, 1055, 261],
                      },
                    ],
                    confidence: 0.888,
                    spans: [{ offset: 1106, length: 1 }],
                  },
                  Unit: {
                    type: "string",
                    valueString: "PCS",
                    content: "PCS",
                    boundingRegions: [
                      {
                        pageNumber: 1,
                        polygon: [1039, 680, 1040, 653, 1057, 654, 1056, 680],
                      },
                    ],
                    confidence: 0.927,
                    spans: [{ offset: 1081, length: 3 }],
                  },
                  UnitPrice: {
                    type: "currency",
                    valueCurrency: { amount: 34.54, currencyCode: "PLN" },
                    content: "34,54",
                    boundingRegions: [
                      {
                        pageNumber: 1,
                        polygon: [1041, 610, 1041, 566, 1056, 566, 1057, 610],
                      },
                    ],
                    confidence: 0.916,
                    spans: [{ offset: 1085, length: 5 }],
                  },
                },
                content:
                  "3 NFG73\nKREM TRUFLOWY 3%- SOS E\nBRUSCHETTA 540 GR\nNOVA\n2103 90 90\n6\nPCS\n34,54\n8\n31,78\n190,66\n8\n15,25\n205,91\nLot No: 280126\nPCS",
                boundingRegions: [
                  {
                    pageNumber: 1,
                    polygon: [1029, 1318, 1029, 55, 1089, 55, 1089, 1318],
                  },
                ],
                confidence: 0.764,
                spans: [{ offset: 1013, length: 126 }],
              },
              {
                type: "object",
                valueObject: {
                  Amount: {
                    type: "currency",
                    valueCurrency: {
                      amount: 147.37,
                      currencyCode: "PLN",
                    },
                    content: "147,37",
                    boundingRegions: [
                      {
                        pageNumber: 1,
                        polygon: [1107, 102, 1107, 54, 1124, 54, 1124, 102],
                      },
                    ],
                    confidence: 0.933,
                    spans: [{ offset: 1241, length: 6 }],
                  },
                  Description: {
                    type: "string",
                    valueString: "SPIANATA PIKANTNA VACUUM\nOK. 2.6KG",
                    content: "SPIANATA PIKANTNA VACUUM\nOK. 2.6KG",
                    boundingRegions: [
                      {
                        pageNumber: 1,
                        polygon: [
                          1095, 1228, 1095, 1011, 1133, 1011, 1133, 1228,
                        ],
                      },
                    ],
                    confidence: 0.802,
                    spans: [{ offset: 1150, length: 34 }],
                  },
                  ProductCode: {
                    type: "string",
                    valueString: "SA479",
                    content: "SA479",
                    boundingRegions: [
                      {
                        pageNumber: 1,
                        polygon: [
                          1106, 1299, 1107, 1254, 1124, 1254, 1124, 1299,
                        ],
                      },
                    ],
                    confidence: 0.908,
                    spans: [{ offset: 1144, length: 5 }],
                  },
                  Quantity: {
                    type: "number",
                    valueNumber: 3.046,
                    content: "3,046",
                    boundingRegions: [
                      {
                        pageNumber: 1,
                        polygon: [1105, 735, 1105, 697, 1121, 697, 1121, 735],
                      },
                    ],
                    confidence: 0.935,
                    spans: [{ offset: 1207, length: 5 }],
                  },
                  Tax: {
                    type: "currency",
                    valueCurrency: { amount: 0, currencyCode: "PLN" },
                    content: "0",
                    boundingRegions: [
                      {
                        pageNumber: 1,
                        polygon: [1107, 162, 1107, 155, 1122, 154, 1122, 161],
                      },
                    ],
                    confidence: 0.963,
                    spans: [{ offset: 1239, length: 1 }],
                  },
                  TaxRate: {
                    type: "string",
                    valueString: "0",
                    content: "0",
                    boundingRegions: [
                      {
                        pageNumber: 1,
                        polygon: [1106, 261, 1106, 254, 1121, 254, 1121, 261],
                      },
                    ],
                    confidence: 0.813,
                    spans: [{ offset: 1237, length: 1 }],
                  },
                  Unit: {
                    type: "string",
                    valueString: "KG",
                    content: "KG",
                    boundingRegions: [
                      {
                        pageNumber: 1,
                        polygon: [1105, 675, 1105, 658, 1120, 658, 1120, 675],
                      },
                    ],
                    confidence: 0.94,
                    spans: [{ offset: 1213, length: 2 }],
                  },
                  UnitPrice: {
                    type: "currency",
                    valueCurrency: { amount: 52.59, currencyCode: "PLN" },
                    content: "52,59",
                    boundingRegions: [
                      {
                        pageNumber: 1,
                        polygon: [1104, 608, 1104, 566, 1122, 566, 1122, 609],
                      },
                    ],
                    confidence: 0.893,
                    spans: [{ offset: 1216, length: 5 }],
                  },
                },
                content:
                  "4 SA479\nSPIANATA PIKANTNA VACUUM\nOK. 2.6KG\nSORRENTINO\n1601 00 91\n3,046\nKG\n52,59\n8\n48,38\n147,37\n0\n0\n147,37",
                boundingRegions: [
                  {
                    pageNumber: 1,
                    polygon: [1095, 1317, 1095, 54, 1133, 54, 1133, 1317],
                  },
                ],
                confidence: 0.814,
                spans: [{ offset: 1142, length: 105 }],
              },
              {
                type: "object",
                valueObject: {
                  Amount: {
                    type: "currency",
                    valueCurrency: {
                      amount: 214.97,
                      currencyCode: "PLN",
                    },
                    content: "214,97",
                    boundingRegions: [
                      {
                        pageNumber: 1,
                        polygon: [1172, 102, 1173, 55, 1190, 56, 1189, 103],
                      },
                    ],
                    confidence: 0.933,
                    spans: [{ offset: 1380, length: 6 }],
                  },
                  Description: {
                    type: "string",
                    valueString: "SALAMI PIKANTNE VENTRICINA\nVACUUM OK. 3,2KG",
                    content: "SALAMI PIKANTNE VENTRICINA\nVACUUM OK. 3,2KG",
                    boundingRegions: [
                      {
                        pageNumber: 1,
                        polygon: [1163, 1228, 1160, 997, 1198, 997, 1200, 1228],
                      },
                    ],
                    confidence: 0.943,
                    spans: [{ offset: 1280, length: 43 }],
                  },
                  ProductCode: {
                    type: "string",
                    valueString: "SA573",
                    content: "SA573",
                    boundingRegions: [
                      {
                        pageNumber: 1,
                        polygon: [
                          1173, 1299, 1173, 1254, 1191, 1255, 1190, 1299,
                        ],
                      },
                    ],
                    confidence: 0.915,
                    spans: [{ offset: 1274, length: 5 }],
                  },
                  Quantity: {
                    type: "number",
                    valueNumber: 4.104,
                    content: "4,104",
                    boundingRegions: [
                      {
                        pageNumber: 1,
                        polygon: [1169, 735, 1169, 695, 1186, 695, 1186, 734],
                      },
                    ],
                    confidence: 0.935,
                    spans: [{ offset: 1346, length: 5 }],
                  },
                  Tax: {
                    type: "currency",
                    valueCurrency: { amount: 0, currencyCode: "PLN" },
                    content: "0",
                    boundingRegions: [
                      {
                        pageNumber: 1,
                        polygon: [1172, 162, 1172, 155, 1185, 156, 1185, 163],
                      },
                    ],
                    confidence: 0.917,
                    spans: [{ offset: 1378, length: 1 }],
                  },
                  TaxRate: {
                    type: "string",
                    valueString: "0",
                    content: "0",
                    boundingRegions: [
                      {
                        pageNumber: 1,
                        polygon: [1172, 262, 1172, 254, 1187, 254, 1187, 262],
                      },
                    ],
                    confidence: 0.641,
                    spans: [{ offset: 1376, length: 1 }],
                  },
                  Unit: {
                    type: "string",
                    valueString: "KG",
                    content: "KG",
                    boundingRegions: [
                      {
                        pageNumber: 1,
                        polygon: [1169, 675, 1169, 658, 1186, 658, 1186, 675],
                      },
                    ],
                    confidence: 0.928,
                    spans: [{ offset: 1352, length: 2 }],
                  },
                  UnitPrice: {
                    type: "currency",
                    valueCurrency: { amount: 52.38, currencyCode: "PLN" },
                    content: "52,38",
                    boundingRegions: [
                      {
                        pageNumber: 1,
                        polygon: [1170, 610, 1170, 566, 1187, 566, 1187, 611],
                      },
                    ],
                    confidence: 0.889,
                    spans: [{ offset: 1355, length: 5 }],
                  },
                },
                content:
                  "5 SA573\nSALAMI PIKANTNE VENTRICINA\nVACUUM OK. 3,2KG\nSORRENTINO\n1601 00 91\n4,104\nKG\n52,38\n0\n52,38\n214,97\n0\n0\n214,97",
                boundingRegions: [
                  {
                    pageNumber: 1,
                    polygon: [1161, 1318, 1161, 55, 1200, 55, 1200, 1318],
                  },
                ],
                confidence: 0.895,
                spans: [{ offset: 1272, length: 114 }],
              },
            ],
          },
          PaymentDetails: {
            type: "array",
            valueArray: [
              {
                type: "object",
                valueObject: {
                  IBAN: {
                    type: "string",
                    valueString: "PL 33 1050 1041 1000 0090 7521 8496",
                    content: "PL 33 1050 1041 1000 0090 7521 8496",
                    boundingRegions: [
                      {
                        pageNumber: 1,
                        polygon: [691, 1224, 695, 769, 723, 769, 719, 1224],
                      },
                    ],
                    confidence: 0.985,
                    spans: [{ offset: 440, length: 35 }],
                  },
                },
                confidence: 0.995,
              },
            ],
          },
          SubTotal: {
            type: "currency",
            valueCurrency: { amount: 823.33, currencyCode: "PLN" },
            content: "823,33",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1358, 550, 1357, 495, 1376, 495, 1376, 550],
              },
            ],
            confidence: 0.938,
            spans: [{ offset: 1544, length: 6 }],
          },
          TotalTax: {
            type: "currency",
            valueCurrency: { amount: 15.25, currencyCode: "PLN" },
            content: "15,25",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [1358, 319, 1358, 276, 1378, 276, 1378, 318],
              },
            ],
            confidence: 0.94,
            spans: [{ offset: 1551, length: 5 }],
          },
          VendorAddress: {
            type: "address",
            content: "ul. K. Gierdziejewskiego 7\n02-495 Warszawa",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [502, 1308, 504, 1047, 558, 1047, 556, 1308],
              },
            ],
            confidence: 0.887,
            spans: [
              { offset: 188, length: 26 },
              { offset: 226, length: 15 },
            ],
            valueAddress: {
              houseNumber: "7",
              road: "ul. K. Gierdziejewskiego",
              postalCode: "02-495",
              city: "Warszawa",
              streetAddress: "7 ul. K. Gierdziejewskiego",
            },
          },
          VendorAddressRecipient: {
            type: "string",
            valueString: "Mille Sapori Plus Sp. z o.o.",
            content: "Mille Sapori Plus Sp. z o.o.",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [472, 1308, 476, 1006, 504, 1006, 500, 1308],
              },
            ],
            confidence: 0.889,
            spans: [{ offset: 159, length: 28 }],
          },
          VendorName: {
            type: "string",
            valueString: "Mille Sapori Plus Sp. z o.o.",
            content: "Mille Sapori Plus Sp. z o.o.",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [472, 1308, 476, 1006, 504, 1006, 500, 1308],
              },
            ],
            confidence: 0.889,
            spans: [{ offset: 159, length: 28 }],
          },
          VendorTaxId: {
            type: "string",
            valueString: "5272633791",
            content: "5272633791",
            boundingRegions: [
              {
                pageNumber: 1,
                polygon: [558, 1256, 559, 1129, 585, 1128, 584, 1255],
              },
            ],
            confidence: 0.942,
            spans: [{ offset: 294, length: 10 }],
          },
        },
        confidence: 1,
        spans: [{ offset: 0, length: 1806 }],
      },
    ],
    contentFormat: "text",
  },
};
