import { getAccessToken } from "@/auth";
import { getCheckoutOrRedirect } from "@/lib/checkout";
import { safeUserGet } from "@/lib/user/safe-user";
import { type SupportedLocale } from "@/regions/types";
import { getUserService } from "@/services/user";

import { validateCheckoutStepAction } from "./actions";

type PageProps = {
  params: Promise<{ locale: SupportedLocale }>;
};

export default async function Page(props: PageProps) {
  const [{ locale }, checkout, accessToken, userService] = await Promise.all([
    props.params,
    getCheckoutOrRedirect(),
    getAccessToken(),
    getUserService(),
  ]);

  const user = await safeUserGet(accessToken, userService);

  await validateCheckoutStepAction({
    user,
    locale,
    checkout,
    step: null,
  });
}
