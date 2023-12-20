import supabase from "../supabase";

export async function getProfile(accountId) {
  const { data, error } = await supabase
    .from("profile")
    .select("*")
    .eq("account_id", accountId)
    .single();

  if (error) {
    console.log(error);
    return;
  }

  return data;
}
