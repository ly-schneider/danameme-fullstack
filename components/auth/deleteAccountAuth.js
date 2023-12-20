import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export default async function deleteAccountAuth(userId) {
  const { data, error } = await supabase.auth.admin.deleteUser(userId);

  if (error) {
    console.log(error);
    return false;
  }

  const { error: signOutError } = await supabase.auth.signOut();

  if (signOutError) {
    console.log(signOutError);
    return false;
  }

  return data;
}
