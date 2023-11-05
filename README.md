# invtrack

## Backend

You need `supabase-cli` to run this project.

To start, make sure docker is running, and run `supabase start` to run backend locally.

You can `supabase db reset` to reset the db to the current seed.

These are the credentials for a basic worker account:
email: adam@example.com
password: aaaaaa

## Developing supabase edge functions

Be sure to install `Deno`, then the Deno language server extension, then open the `workspace-config.code-workspace` file from the command line.

The project structure will look different, but VSCode will know what runtime to use, and where.
