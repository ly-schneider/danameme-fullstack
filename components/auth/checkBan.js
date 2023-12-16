import supabase from "../supabase";

export async function checkBan(accountId) {
  function toIsoString(date) {
    var tzo = -date.getTimezoneOffset(),
      dif = tzo >= 0 ? "+" : "-",
      pad = function (num) {
        return (num < 10 ? "0" : "") + num;
      };

    return (
      date.getFullYear() +
      "-" +
      pad(date.getMonth() + 1) +
      "-" +
      pad(date.getDate()) +
      "T" +
      pad(date.getHours()) +
      ":" +
      pad(date.getMinutes()) +
      ":" +
      pad(date.getSeconds()) +
      dif +
      pad(Math.floor(Math.abs(tzo) / 60)) +
      ":" +
      pad(Math.abs(tzo) % 60)
    );
  }

  const currentDate = toIsoString(new Date());

  const { data: banData, error: banError } = await supabase
    .from("banned")
    .select("id_ban, createdat, account_id, bannedby_id, type, reason, until")
    .eq("account_id", accountId)
    .gt("until", currentDate);

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

  return bans;
}
