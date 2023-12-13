import supabase from "../supabase";

export async function handleVote(postId, type, profileId) {
  const { data, error } = await supabase
    .from("rating_post")
    .select("*")
    .eq("post_id", postId)
    .eq("profile_id", profileId);

  if (error) {
    console.log(error);
    return;
  }

  console.log(data);

  if (data.length == 0) {
    const { error } = await supabase.from("rating_post").insert({
      post_id: postId,
      profile_id: profileId,
      type: type,
    });

    if (error) {
      console.log(error);
      return;
    }
  } else {
    if (data[0].type == type) {
      const { error } = await supabase
        .from("rating_post")
        .delete()
        .eq("id_ratingpost", data[0].id_ratingpost);

      if (error) {
        console.log(error);
        return;
      }
    } else {
      const { error } = await supabase
        .from("rating_post")
        .update({ type: type })
        .eq("id_ratingpost", data[0].id_ratingpost);

      if (error) {
        console.log(error);
        return;
      }
    }
  }

  return true;
}
