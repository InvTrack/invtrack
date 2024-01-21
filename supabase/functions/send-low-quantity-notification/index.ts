// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.
import { corsHeaders } from "../_shared/cors.ts";
import * as OneSignal from "@onesignal/node-onesignal";
import { createClient } from "@supabase/supabase-js@2";
import { Database } from "../_shared/database.types.ts";

const _OnesignalAppId_ = Deno.env.get("ONESIGNAL_APP_ID")!;
const _OnesignalUserAuthKey_ = Deno.env.get("USER_AUTH_KEY")!;
const _OnesignalRestApiKey_ = Deno.env.get("ONESIGNAL_REST_API_KEY")!;
const oneSignalConfiguration = OneSignal.createConfiguration({
  userKey: _OnesignalUserAuthKey_,
  appKey: _OnesignalRestApiKey_,
});

const oneSignalClient = new OneSignal.DefaultApi(oneSignalConfiguration);

Deno.serve(async (req) => {
  // preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  // allow or disallow certain methods
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response("Unauthorized", { status: 401 });
  }

  // assume that the provided auth token allows service_role access
  const supabase = createClient<Database>(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    }
  );

  const { data, error } = await supabase
    .from("low_quantity_notifications_user_id_view")
    .select(`*`);

  if (!data) {
    return new Response(error ? String(error.message) : "No data to return.", {
      status: 500,
    });
  }

  const user_ids_to_notify = data.map((row) => row.user_id);

  if (!user_ids_to_notify.length) {
    console.log("No user_ids to notify. Aborting.");
    return new Response("No user_ids to notify.", {
      status: 200,
    });
  }

  try {
    // Build OneSignal notification object
    const notification = new OneSignal.Notification();
    notification.app_id = _OnesignalAppId_;
    // should be notification.include_aliases = {external_id: ["user_ids"]}
    // but the sdk is kinda broken I guess. The property is not deprecated yet.
    notification.include_external_user_ids = user_ids_to_notify;
    // en messages are necessary for the notification to be sent
    notification.contents = {
      en: `W inwentaryzacji są produkty o stanie poniżej progu.`,
      pl: `W inwentaryzacji są produkty o stanie poniżej progu.`,
    };
    const oneSignalNotificationResponse =
      await oneSignalClient.createNotification(notification);

    await supabase
      .from("inventory")
      .update({ low_quantity_notification_sent: true })
      .in(
        "id",
        data.map((row) => row.inventory_id)
      );

    return new Response(JSON.stringify(oneSignalNotificationResponse), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
      status: 200,
    });
  } catch (e) {
    console.error(e);
    return new Response("Server error. Could not create notification.", {
      headers: { "Content-Type": "application/json" },
      status: 400,
    });
  }
});

// To invoke:
// curl -v 'http://127.0.0.1:54321/functions/v1/send-low-quantity-notification' \
//   --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
//
//
