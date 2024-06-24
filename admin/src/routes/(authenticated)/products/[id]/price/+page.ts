import { error } from "@sveltejs/kit";
export const load = async ({ parent, params }) => {
  const id = params.id;
  const { supabase } = await parent();

  // TODO handle error
  const { data: product, error: supabaseError1 } = await supabase
    .from("product")
    .select(`name, unit`)
    .eq("id", id)
    .single();

  const { data: datesWithProductRecords, error: supabaseError } = await supabase
    .from("inventory")
    .select(`date, product_record (price_per_unit)`, { count: "exact", head: false })
    .order("date")
    .eq("product_record.product_id", id);

  if (supabaseError) {
    console.error(supabaseError);
    throw error(404, "Product not found.");
  }
  return {
    chartData: datesWithProductRecords?.map((r) => ({
      date: new Date(r.date),
      ...r.product_record[0],
    })),
    product,
  };
};
