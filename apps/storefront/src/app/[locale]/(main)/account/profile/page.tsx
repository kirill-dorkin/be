import { getTranslations } from "next-intl/server";

import { getAccessToken } from "@/auth";
import { getUserService } from "@/services/user";

import { UpdateEmailModal } from "./_modals/update-email-modal";
import { UpdateNameModal } from "./_modals/update-name-modal";
import { UpdatePasswordModal } from "./_modals/update-password-modal";

export default async function Page() {
  const [accessToken, t, userService] = await Promise.all([
    getAccessToken(),
    getTranslations(),
    getUserService(),
  ]);

  const resultUserGet = await userService.userGet(accessToken);

  const user = resultUserGet.ok ? resultUserGet.data : null;
  const defaultUsername = user?.firstName ?? t("staff.orderCard.customer");
  const fullName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() ||
    defaultUsername;
  const initialsSource = fullName || user?.email || "BE";
  const initials =
    initialsSource
      .split(" ")
      .filter(Boolean)
      .map((part) => part.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase() || "BE";

  const profileFields = [
    {
      key: "name",
      label: t("account.first-and-last-name"),
      value: fullName,
      action: <UpdateNameModal user={user} />,
    },
    {
      key: "email",
      label: t("common.email"),
      value: user?.email ?? "-",
      action: user ? <UpdateEmailModal user={user} /> : null,
    },
    {
      key: "password",
      label: t("common.password"),
      value: "•••••••••••••",
      action: <UpdatePasswordModal />,
    },
  ];

  return (
    <div className="flex flex-col gap-6 text-sm md:gap-8">
      <section className="rounded-3xl border border-slate-100/80 bg-white/80 p-6 shadow-sm ring-1 ring-black/5 dark:border-slate-800 dark:bg-slate-900/40 dark:ring-white/5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white text-xl font-semibold uppercase text-slate-700 dark:border-slate-700 dark:from-slate-800 dark:to-slate-900 dark:text-primary">
              {initials}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-muted-foreground">
                {t("account.personal-data")}
              </p>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-primary">
                {fullName}
              </h2>
              {user?.email && (
                <p className="text-sm text-slate-500 dark:text-muted-foreground">
                  {user.email}
                </p>
              )}
            </div>
          </div>
          <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-3 text-xs font-semibold uppercase tracking-widest text-slate-400 dark:border-slate-700 dark:text-muted-foreground">
            {t("account.hello", { username: defaultUsername })}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-100/80 bg-white/90 p-4 shadow-sm ring-1 ring-black/5 dark:border-slate-800 dark:bg-slate-900/40 dark:ring-white/5 sm:p-6">
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {profileFields.map((field) => (
            <div
              key={field.key}
              className="flex flex-col gap-4 py-4 first:pt-0 last:pb-0 md:flex-row md:items-center md:gap-8"
            >
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-muted-foreground">
                  {field.label}
                </p>
                <p className="text-base font-medium text-slate-700 dark:text-primary">
                  {field.value}
                </p>
              </div>
              {field.action && (
                <div className="flex w-full justify-stretch md:w-auto md:justify-end">
                  {field.action}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
