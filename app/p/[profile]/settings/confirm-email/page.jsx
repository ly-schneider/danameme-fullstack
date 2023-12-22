"use client";

import { getAccount } from "@/components/auth/getAccount";
import { getSession } from "@/components/auth/getSession";
import { useEffect } from "react";

export default function ConfirmEmailPage() {
  useEffect(() => {
    async function confirmEmail() {
      const session = await getSession();
      console.log(session);
      if (session) {
        const account = await getAccount(session.session.user.email);
        if (account) {
          console.log(account);
          console.log(session.session.user.new_email);
        }
      }
    }

    confirmEmail();
  }, []);
}
