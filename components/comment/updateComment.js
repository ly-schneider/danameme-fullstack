import supabase from "../supabase";

export async function updateComment(commentId, text) {
  if (text == "" || text == null || text.length == 0) {
    return false;
  }

  const { error: commentError } = await supabase
    .from("comment")
    .update({
      text: text,
      edited: true,
    })
    .eq("id_comment", commentId);

  if (commentError) {
    console.log(commentError);
    return;
  }

  return true;
}
