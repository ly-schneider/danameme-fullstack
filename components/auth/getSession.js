import supabase from "../supabase";

export async function getSession() {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.log(error);
      return false;
    }

    if (data.session == null) {
      return false;
    }

    return data;
}