# invtrack

## Setup

Make sure to use the correct node version - nvm is recommended. To install the dependencies for every project, run `npm run setup`. Refering to individual projects' READMEs is a good start.

## Backend

To start, make sure docker is running, and run `npm start` from the root to run the backend locally.

These are the credentials for a basic worker account:
email: adam@example.com
password: aaaaaa

# Local development

## Notifications

To make notifications work correctly, you have to add the service role key and local project url to the valut, run this from the sql console:
`select vault.create_secret('__insert_service_role_key', 'service_role_key');`
`select vault.create_secret('http://172.17.0.1:54321', 'project_url');`

## Developing supabase edge functions

Be sure to install `Deno`, then the Deno language server extension, then open the `workspace-config.code-workspace` file from the command line - `code ./workspace-config.code-workspace`

The project structure will look different, but VSCode will know what runtime to use, and where.
