# InvTrack Admin Dashboard

## Developing

```bash
npm run dev
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.

## Notifications

We're setting up a service worker with OneSignal - it's crucial that the file path and names are not modified - refer to the docs for an exaplanation.
To test notifications, build the web app and send a new notification in the local testing project.
