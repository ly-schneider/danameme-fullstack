import supabase from "../supabase";

export async function handlePostReport(id) {
  const { error } = await supabase
    .from("report")
    .insert({ post_id: id, reason: "Reported" });

  if (error) {
    console.log(error);
    return false;
  }

  return true;
}
