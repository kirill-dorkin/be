import { LocalizedLink } from "@/i18n/routing";
import { paths } from "@/lib/paths";

type LogoBaseProps = {
  ariaLabel: string;
  title: string;
};

export const LogoBase = ({ ariaLabel, title }: LogoBaseProps) => (
  <LocalizedLink
    href={paths.home.asPath()}
    title={title}
    aria-label={ariaLabel}
    className="inline-flex items-center text-lg font-semibold text-slate-700 transition-colors hover:text-slate-500 dark:text-white dark:hover:text-white/80 sm:text-xl md:text-2xl"
  >
    <span aria-hidden="true" className="leading-none tracking-tight">
      BestElectronics
    </span>
  </LocalizedLink>
);

LogoBase.displayName = "LogoBase";
