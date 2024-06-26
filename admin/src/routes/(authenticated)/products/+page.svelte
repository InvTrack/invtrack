<script lang="ts">
  import {
    Accordion,
    AccordionItem,
    Button,
    Table,
    TableBody,
    TableBodyCell,
    TableBodyRow,
    TableHead,
    TableHeadCell,
  } from "flowbite-svelte";
  import ScreenCard from "$lib/ScreenCard.svelte";
  import { parseISODatestring } from "$lib/dates/parseISODatestring";

  export let data;
  let { categories, uncategorisedProducts } = data;
</script>

<ScreenCard header="Produkty">
  {#if categories}
    <Accordion flush multiple>
      {#if uncategorisedProducts && uncategorisedProducts.length > 0}
        <AccordionItem class=" min-w-max">
          <span slot="header">Brak kategorii</span>
          <Table shadow>
            <TableHead class="bg-primary-100 normal-case dark:bg-gray-600">
              <TableHeadCell>Nazwa</TableHeadCell>
              <TableHeadCell>Jednostka</TableHeadCell>
              <TableHeadCell>Data utworzenia</TableHeadCell>
              <TableHeadCell>Step</TableHeadCell>
              <TableHeadCell />
            </TableHead>
            <TableBody>
              {#each uncategorisedProducts as product}
                <TableBodyRow>
                  <TableBodyCell>
                    {product.name}
                  </TableBodyCell>
                  <TableBodyCell>
                    {product.unit}
                  </TableBodyCell>
                  <TableBodyCell>
                    {parseISODatestring(product.created_at)}
                  </TableBodyCell>
                  <TableBodyCell>
                    {product.steps.map((step) => " " + step)}
                  </TableBodyCell>
                  <TableBodyCell>
                    <Button class="hover:underline" href={`/products/${product.id}`}>Edytuj</Button>
                    <Button class="hover:underline" href={`/products/${product.id}/price`}
                      >Wykres ceny</Button
                    >
                  </TableBodyCell>
                </TableBodyRow>
              {/each}
            </TableBody>
          </Table>
        </AccordionItem>
      {/if}

      {#each categories.filter((category) => category.items.length > 0) as category}
        <AccordionItem class="min-w-max">
          <span slot="header">{category.name}</span>
          <Table shadow>
            <TableHead class="bg-primary-100 normal-case dark:bg-gray-600">
              <TableHeadCell>Nazwa</TableHeadCell>
              <TableHeadCell>Jednostka</TableHeadCell>
              <TableHeadCell>Data utworzenia</TableHeadCell>
              <TableHeadCell>Step</TableHeadCell>
              <TableHeadCell />
            </TableHead>
            {#each category.items as product}
              <TableBodyRow>
                <TableBodyCell>
                  {product.name}
                </TableBodyCell>
                <TableBodyCell>
                  {product.unit}
                </TableBodyCell>
                <TableBodyCell>
                  {parseISODatestring(product.created_at)}
                </TableBodyCell>
                <TableBodyCell>
                  {product.steps.map((step) => " " + step)}
                </TableBodyCell>
                <TableBodyCell>
                  <Button class="hover:underline" href={`/products/${product.id}`}>Edytuj</Button>
                  <Button class="hover:underline" href={`/products/${product.id}/price`}
                    >Wykres ceny</Button
                  >
                </TableBodyCell>
              </TableBodyRow>
            {/each}
          </Table>
        </AccordionItem>
      {/each}
    </Accordion>
  {/if}
  <div class="mt-2 flex flex-wrap justify-center gap-4 md:justify-start">
    <Button class="hover:underline" href={`/products/add`}>Dodaj produkt</Button>
    <Button class="hover:underline" href={`/products/add-category`}>Dodaj kategorię</Button>
    <Button class="hover:underline" href={`/products/reorder`}>Zmień kolejność</Button>
  </div>
</ScreenCard>
