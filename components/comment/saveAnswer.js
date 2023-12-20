import supabase from "../supabase";

export async function saveAnswerComment(commentId, postId, text, profileId) {
  const { error: answerError } = await supabase
    .from("comment")
    .insert({
      text: text,
      profile_id: profileId,
      post_id: postId,
      answer_id: commentId,
    });

  if (answerError) {
    console.log(answerError);
    return;
  }
}
