import supabase from "../supabase";

export async function handlePostReport(id, profile_id) {
  const { error } = await supabase
    .from("report")
    .insert({ post_id: id, reporter_id: profile_id, reason: "Reported" });

  if (error) {
    console.log(error);
    return false;
  }

  return true;
}
