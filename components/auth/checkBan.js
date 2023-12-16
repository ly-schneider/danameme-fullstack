import supabase from "../supabase";

export async function checkBan(accountId) {
  const { data: banData, error: banError } = await supabase
    .from("banned")
    .select("id_ban, createdat, account_id, bannedby_id, type, reason, until")
    .eq("account_id", accountId);

  if (banError) {
    console.log(banError);
    return;
  }

  const bans = [];

  const banPromises = banData.map(async (ban) => {
    const { data: bannedByData, error: bannedByError } = await supabase
      .from("account")
      .select("firstname, lastname")
      .eq("id_account", ban.bannedby_id);

    if (bannedByError) {
      console.log(bannedByError);
      return;
    }

    console.log(bannedByData);

    bans.push({
      id_ban: ban.id_ban,
      createdat: ban.createdat,
      account_id: ban.account_id,
      bannedby_id: ban.bannedby_id,
      type: ban.type,
      reason: ban.reason,
      until: ban.until,
      bannedby: `${bannedByData[0].firstname} ${bannedByData[0].lastname}`,
    });
  });

  await Promise.all(banPromises);

  console.log(bans);
  return bans;
}
