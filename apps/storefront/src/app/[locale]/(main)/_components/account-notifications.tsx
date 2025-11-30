"use client";

import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { memo, useEffect, useMemo } from "react";

import type { User } from "@nimara/domain/objects/User";
import { useToast } from "@nimara/ui/hooks";

const DynamicAccountDeletedModal = dynamic(
  () =>
    import("./account-deleted-modal").then((mod) => ({
      default: mod.AccountDeletedModal,
    })),
  { ssr: false },
);

function AccountNotificationsComponent({ user }: { user: User | null }) {
  const t = useTranslations();
  const { toast } = useToast();
  const searchParams = useSearchParams();

  // Мемоизация флагов
  const flags = useMemo(
    () => ({
      isLoginSuccessful: searchParams.get("loggedIn") === "true",
      isLogoutSuccessful: searchParams.get("loggedOut") === "true",
      isAccountDeleted: searchParams.get("accountDeleted") === "true",
    }),
    [searchParams],
  );

  const { isLoginSuccessful, isLogoutSuccessful, isAccountDeleted } = flags;

  useEffect(() => {
    if (isLoginSuccessful && user?.id) {
      toast({
        description: t("account.greetings", { username: user?.firstName }),
        position: "center",
      });
    }
    if (isLogoutSuccessful) {
      toast({
        description: t("account.until-next-time"),
        position: "center",
      });
    }
  }, [isLoginSuccessful, isLogoutSuccessful, user]);

  return <DynamicAccountDeletedModal open={isAccountDeleted} />;
}

// Мемоизация - notifications компонент
export const AccountNotifications = memo(
  AccountNotificationsComponent,
  (prevProps, nextProps) => {
    return prevProps.user?.id === nextProps.user?.id;
  },
);
