import { getTranslations } from "next-intl/server";

export const NoResults = async () => {
  const t = await getTranslations();

  return (
    <h2 className="dark:text-primary text-xl text-slate-700">
      {t("search.no-results")}
    </h2>
  );
};
