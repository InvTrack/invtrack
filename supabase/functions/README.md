# edge functions readme

## Development

Be sure to install `Deno`, then the Deno language server extension, then open the `workspace-config.code-workspace` file from the command line.

The project structure will look different, but VSCode will know what runtime to use, and where.

## Descriptions

### process-invoice

This function processes invoice document photos on azure, then matches the parsed data to aliases and product_record we have in the db. It returns product names that couldn't be matched to an alias, as well as a ready-to-go form for the app. We should take care to return a form json that can be inserted to the form context without any transformations on the client. It returns only relevant form entries, e.g. if a product doesn't have an alias, its product_record will not be included in the form. product_records entries missing in the returned form, will of course be supplemented with backend data in the app.

### process-sales-raport

This function processes sales raport document photos on azure, then matches the parsed data to a recipe alias. It returns recipe names that couldn't be matched to an alias, as well as a ready-to-go recipe form for the app. We should take care to return a form json that can be inserted to the form context without any transformations on the client.
