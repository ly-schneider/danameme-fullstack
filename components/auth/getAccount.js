import supabase from "../supabase";

export async function getAccount(email) {
  const { data, error } = await supabase
    .from("account")
    .select("*")
    .eq("email", email)
    .single();

  if (error) {
    console.log(error);
    return false;
  }

  return data;
}
