import supabase from "../supabase";

export async function fetchPosts(profileId = null) {
  const { data: postsData, error: postsError } = await supabase
    .from("post")
    .select(
      "id_post, title, content, asset, createdat, edited, profile_id, pinned, profile (username, profileimage, id_profile)"
    )
    .order("pinned", { ascending: false })
    .order("createdat", { ascending: false });

  if (postsError) {
    console.log(postsError);
    return;
  }

  const calcLikes = await Promise.all(
    postsData.map(async (post) => {
      const { data: ratingData, error } = await supabase
        .from("rating_post")
        .select("*")
        .eq("post_id", post.id_post);

      let upvotes = 0;
      let downvotes = 0;
      ratingData.map((rating) => {
        if (rating.type == true) {
          upvotes++;
        } else {
          downvotes++;
        }
      });

      if (error) {
        console.log(error);
        return { ...post, upvotes: 0, downvotes: 0 };
      }

      return { ...post, upvotes: upvotes, downvotes: downvotes };
    })
  );

  const countComments = await Promise.all(
    calcLikes.map(async (post) => {
      const { data: commentData, error } = await supabase
        .from("comment")
        .select("*")
        .eq("post_id", post.id_post);

      if (error) {
        console.log(error);
        return { ...post, comments: 0 };
      }

      if (profileId == null) {
        return { ...post, comments: commentData.length, rating: null };
      }

      let { data: ratingData, error: ratingError } = await supabase
        .from("rating_post")
        .select("*")
        .eq("post_id", post.id_post)
        .eq("profile_id", profileId);

      if (ratingError) {
        console.log(ratingError);
        return { ...post, comments: commentData.length, rating: null };
      }

      if (ratingData.length == 0) {
        ratingData = null;
      } else {
        ratingData = ratingData[0].type;
      }

      return { ...post, comments: commentData.length, rating: ratingData };
    })
  );

  return countComments;
}
