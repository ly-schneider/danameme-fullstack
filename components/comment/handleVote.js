import supabase from "../supabase";

export async function handleCommentVote(id, type, profileId) {
  const { data, error } = await supabase
    .from("rating_comment")
    .select("*")
    .eq("comment_id", id)
    .eq("profile_id", profileId);

  if (error) {
    console.log(error);
    return;
  }

  if (data.length == 0) {
    const { data, error } = await supabase
      .from("rating_comment")
      .insert({ comment_id: id, profile_id: profileId, type: type });
    if (error) {
      console.log(error);
      return;
    }
  } else {
    const { data, error } = await supabase
      .from("rating_comment")
      .update({ type: type })
      .eq("comment_id", id)
      .eq("profile_id", profileId);
    if (error) {
      console.log(error);
      return;
    }
  }
}
