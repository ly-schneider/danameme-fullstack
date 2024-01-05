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

  const { data: postUser, error: postUserError } = await supabase
    .from("post")
    .select("profile_id")
    .eq("id_post", postId);

  if (postUserError) {
    console.log(postUserError);
    return;
  }

  const { data: userKarma, error: userKarmaError } = await supabase
    .from("profile")
    .select("karma")
    .eq("id_profile", postUser[0].profile_id);

  if (userKarmaError) {
    console.log(userKarmaError);
    return;
  }

  let karma = userKarma[0].karma;
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

    if (profileId != postUser[0].profile_id) {
      const { error: notificationError } = await supabase
        .from("notification")
        .insert({
          toprofile_id: postUser[0].profile_id,
          fromprofile_id: profileId,
          text: `hat deinem Beitrag ein ${
            type ? "Upvote" : "Downvote"
          } gegeben`,
          post_id: postId,
        });

      if (notificationError) {
        console.log(notificationError);
        return;
      }
    }

    if (type) {
      karma += 1;
    } else {
      karma -= 1;
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

      if (profileId != postUser[0].profile_id) {
        const { error: notificationError } = await supabase
          .from("notification")
          .delete()
          .eq("post_id", postId)
          .eq("fromprofile_id", profileId);

        if (notificationError) {
          console.log(notificationError);
          return;
        }
      }

      if (type) {
        karma -= 1;
      } else {
        karma += 1;
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

      if (profileId != postUser[0].profile_id) {
        const { data: notificationData, error: notificationErrorData } =
          await supabase
            .from("notification")
            .select("id_notification")
            .eq("post_id", postId)
            .eq("fromprofile_id", profileId);

        if (notificationErrorData) {
          console.log(notificationErrorData);
          return;
        }

        if (notificationData.length == 0) {
          const { error: notificationError } = await supabase
            .from("notification")
            .insert({
              toprofile_id: postUser[0].profile_id,
              fromprofile_id: profileId,
              text: `hat deinem Beitrag ein ${
                type ? "Upvote" : "Downvote"
              } gegeben`,
              post_id: postId,
            });

          if (notificationError) {
            console.log(notificationError);
            return;
          }
          return;
        }

        const { error: notificationError } = await supabase
          .from("notification")
          .update({
            text: `hat deinem Beitrag ein ${
              type ? "Upvote" : "Downvote"
            } gegeben`,
          })
          .eq("post_id", postId)
          .eq("fromprofile_id", profileId);

        if (notificationError) {
          console.log(notificationError);
          return;
        }
      }

      if (type) {
        karma += 2;
      } else {
        karma -= 2;
      }
    }
  }

  if (karma < 0) {
    karma = 0;
  }

  if (profileId != postUser[0].profile_id) {
    const { error: updateKarmaError } = await supabase
      .from("profile")
      .update({ karma: karma })
      .eq("id_profile", postUser[0].profile_id);

    if (updateKarmaError) {
      console.log(updateKarmaError);
      return;
    }
  }

  return true;
}
