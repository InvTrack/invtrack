# edge functions readme

## Development

Be sure to install `Deno`, then the Deno language server extension, then open the `workspace-config.code-workspace` file from the command line.

The project structure will look different, but VSCode will know what runtime to use, and where.

## Descriptions

### process-invoice

This function processes document photos on azure, then matches the parsed data to aliases and product_record we have in the db. It returns product names that couldn't be matched to an alias, as well as a ready-to-go form for the app. We should take care to return a form json that can be inserted to the form context without any transformations on the client. It returns only relevant form entries, e.g. if a product doesn't have an alias, its product_record will not be included in the form - but it will be fetched in the app.
