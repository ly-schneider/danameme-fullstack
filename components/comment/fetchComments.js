import supabase from "../supabase";

export async function fetchComments(postId, profileId) {
  const { data: commentData, error: commentError } = await supabase
    .from("comment")
    .select(
      "id_comment, post_id, text, createdat, profile_id, answer_id, edited, profile (username, profileimage, id_profile)"
    )
    .eq("post_id", postId);

  if (commentError) {
    console.log(commentError);
    return;
  }

  const calcLikes = await Promise.all(
    commentData.map(async (comment) => {
      const { data: ratingData, error } = await supabase
        .from("rating_comment")
        .select("*")
        .eq("comment_id", comment.id_comment);

      let count = 0;
      ratingData.map((rating) => {
        if (rating.type == true) {
          count++;
        } else {
          count--;
        }
      });

      if (error) {
        console.log(error);
        return { ...comment, likes: 0 };
      }

      return { ...comment, likes: count };
    })
  );

  const checkRated = await Promise.all(
    calcLikes.map(async (comment) => {
      let { data: ratingData, error } = await supabase
        .from("rating_comment")
        .select("*")
        .eq("comment_id", comment.id_comment)
        .eq("profile_id", profileId);

      if (error) {
        console.log(error);
        return { ...comment, rating: null };
      }

      if (ratingData.length == 0) {
        ratingData = null;
      } else {
        ratingData = ratingData[0].type;
      }

      return { ...comment, rating: ratingData };
    })
  );

  const commentsWithAnswers = checkRated.map((comment) => {
    if (comment.answer_id) {
      const parentComment = checkRated.find(
        (c) => c.id_comment === comment.answer_id
      );
      if (parentComment) {
        if (!parentComment.replies) {
          parentComment.replies = [];
        }
        parentComment.replies.push(comment);
      }
    }
    return comment;
  });

  const removeInsertedComments = (comments) => {
    return comments.filter((comment) => !comment.answer_id);
  };

  const commentsWithoutInserted = removeInsertedComments(commentsWithAnswers);

  console.log(commentsWithoutInserted);
  return commentsWithoutInserted;
}
