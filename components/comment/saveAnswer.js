import supabase from "../supabase";

export async function saveAnswerComment(commentId, postId, text, profileId) {
  const { error: answerError } = await supabase.from("comment").insert({
    text: text,
    profile_id: profileId,
    post_id: postId,
    answer_id: commentId,
  });

  if (answerError) {
    console.log(answerError);
    return;
  }

  const { data: profileIdComment, error: profileIdCommentError } =
    await supabase
      .from("comment")
      .select("profile_id")
      .eq("id_comment", commentId);

  if (profileIdCommentError) {
    console.log(profileIdCommentError);
    return;
  }

  const { data: answerId, error: answerIdError } = await supabase
    .from("comment")
    .select("id_comment")
    .eq("text", text)
    .eq("profile_id", profileId)
    .eq("post_id", postId);

  if (answerIdError) {
    console.log(answerIdError);
    return;
  }

  const { error: notificationError } = await supabase
    .from("notification")
    .insert({
      toprofile_id: profileIdComment[0].profile_id,
      fromprofile_id: profileId,
      text: `hat auf deinen Kommentar geantwortet`,
      comment_id: answerId[0].id_comment,
    });

  if (notificationError) {
    console.log(notificationError);
    return;
  }
}
