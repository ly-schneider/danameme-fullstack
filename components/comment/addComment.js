import supabase from "../supabase";

export async function addComment(profileIdPost, postId, text, profileId) {
  const { error: commentError } = await supabase.from("comment").insert({
    text: text,
    profile_id: profileId,
    post_id: postId,
  });

  if (commentError) {
    console.log(commentError);
    return;
  }

  const { data: commentId, error: commentIdError } = await supabase
    .from("comment")
    .select("id_comment")
    .eq("text", text)
    .eq("profile_id", profileId)
    .eq("post_id", postId);

  if (commentIdError) {
    console.log(commentIdError);
    return;
  }

  const { error: notificationError } = await supabase
    .from("notification")
    .insert({
      toprofile_id: profileIdPost,
      fromprofile_id: profileId,
      text: `hat deinem Beitrag ein Kommentar hinzugefügt`,
      comment_id: commentId[0].id_comment,
    });

  if (notificationError) {
    console.log(notificationError);
    return;
  }

  return true;
}
