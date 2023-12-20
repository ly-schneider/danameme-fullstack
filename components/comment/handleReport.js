import supabase from "../supabase";

export async function handleCommentReport(id, profile_id) {
  const { error } = await supabase
    .from("report")
    .insert({ comment_id: id, reporter_id: profile_id, reason: "Reported" });

  if (error) {
    console.log(error);
    return;
  }

  return true;
}
