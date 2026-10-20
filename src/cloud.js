import { createClient } from "@supabase/supabase-js";
const url = import.meta.env.VITE_SUPABASE_URL,
  key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
export const cloud = url && key ? createClient(url, key) : null;
export async function loadRecords() {
  const { data, error } = await cloud.from("daymark_records").select("*");
  if (error) throw error;
  return data;
}
export async function saveRecord(record, userId) {
  const { id, kind, payload, version } = record;
  let query = version
    ? cloud
        .from("daymark_records")
        .update({
          payload,
          version: version + 1,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("version", version)
    : cloud
        .from("daymark_records")
        .insert({ id, kind, payload, user_id: userId });
  const { data, error } = await query.select().single();
  if (error)
    throw new Error(
      version
        ? "Could not save. Refresh to check for changes on another device, then try again."
        : error.message,
    );
  return data;
}
