# Konwenja nazewnictwa hooków backendowych

- `useGet...` - hooki do fetchowania jednej rzeczy np jednego użytkownika
- `useList...` - hooki do fetchowania zwykłych list rzeczy np list produktów w przedsiębiorstwie
- `useFind...` - hooki do fetchowania list z parametrami, np paginacja albo warunki jakie muszą spelniać encje
- `useUpdate...` - hooki mutujące dane serwerowe

# Warto wiedzieć

- nigdy nie współdziel queryBuildera od supabase pomiędzy kilka zapytań. Poniższa abstrakcja prowadzi do bugów, które są trudne do zlokalizowania:

```ts
const fromRecordTable = supabase.from<"record_view", RecordViewTable>(
  "record_view"
);

const res1 = fromRecordTable.select().eq("id", recordId).single();
const res2 = fromRecordTable.select().eq("inventory_id", inventoryId);
```
