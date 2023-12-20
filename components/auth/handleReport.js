import supabase from "../supabase";

export async function handleProfileReport(profile_id, reporter_id) {
  const { error } = await supabase.from("report").insert({
    profile_id: profile_id,
    reporter_id: reporter_id,
    reason: "Reported",
  });

  if (error) {
    console.log(error);
    return;
  }

  return true;
}
