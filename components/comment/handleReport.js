import supabase from "../supabase";

export async function handleCommentReport(id) {
  const { error } = await supabase
    .from("report")
    .insert({ comment_id: id, reason: "Reported" });

  if (error) {
    console.log(error);
    return;
  }

  setSuccess("Kommentar wurde erfolgreich gemeldet!");
  setTimeout(() => {
    setSuccess("");
  }, 3000);
}

async function handlePostReport(id) {
  const { error } = await supabase
    .from("report")
    .insert({ post_id: id, reason: "Reported" });

  if (error) {
    console.log(error);
    return;
  }
}
