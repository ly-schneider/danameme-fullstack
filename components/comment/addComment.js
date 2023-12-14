import supabase from "../supabase";

export async function addComment(postId, text, profileId) {
  const { error: commentError } = await supabase.from("comment").insert({
    text: text,
    profile_id: profileId,
    post_id: postId,
  });

  if (commentError) {
    console.log(commentError);
    return;
  }

  return true;
}
