"use client";

import * as Sentry from "@sentry/nextjs";
import { memo, useEffect } from "react";

type Props = {
  user: Sentry.User | null;
};

const ErrorServiceClientComponent = ({ user }: Props) => {
  useEffect(() => {
    // Add or remove the user from Sentry context
    Sentry.setUser(user);
  }, [user]);

  return null;
};

// Мемоизация - Sentry клиент
export const ErrorServiceClient = memo(ErrorServiceClientComponent, (prevProps, nextProps) => {
  return prevProps.user?.id === nextProps.user?.id;
});
