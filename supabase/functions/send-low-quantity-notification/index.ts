// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.
import { corsHeaders } from "../_shared/cors.ts";
import * as OneSignal from "@onesignal/node-onesignal";

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
  // const { record } = await req.json();
  // console.log(record);

  try {
    // Build OneSignal notification object
    const notification = new OneSignal.Notification();
    notification.app_id = _OnesignalAppId_;
    // should be notification.include_aliases = {external_id: ["user_ids"]}
    // but the sdk is kinda broken I guess. The method is not deprecated yet.
    notification.include_external_user_ids = ["user_ids from request"];
    // en messages are necessary for the notification to be sent
    notification.contents = {
      en: `Message in en`,
      pl: `Message in pl`,
    };
    const oneSignalNotificationResponse =
      await oneSignalClient.createNotification(notification);

    return new Response(JSON.stringify(oneSignalNotificationResponse), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
      status: 200,
    });
  } catch (e) {
    console.error("Failed to create OneSignal notification", e);
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
