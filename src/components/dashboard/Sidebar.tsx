import useAppContext from "@/hooks/useAppContext";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { BiSolidLogOut } from "react-icons/bi";
import { RxHamburgerMenu } from "react-icons/rx";
import { AiOutlineClose } from "react-icons/ai";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { RiDashboardFill } from 'react-icons/ri';
import { FaTasks, FaUsers } from 'react-icons/fa';
import { MdShoppingCart, MdInventory } from 'react-icons/md';
import { useTranslations } from "next-intl";

interface LinkItem {
  href: string;
  label: string;
  icon: React.ReactElement;
}

const getAdminLinks = (t: ReturnType<typeof useTranslations>): LinkItem[] => [
  {
    href: "/admin/dashboard",
    label: t("navigation.dashboard"),
    icon: <RiDashboardFill />,
  },
  {
    href: "/admin/tasks",
    label: t("navigation.tasks"),
    icon: <FaTasks />,
  },
  {
    href: "/admin/users",
    label: t("navigation.users"),
    icon: <FaUsers />,
  },
  {
    href: "/admin/products",
    label: t("navigation.products"),
    icon: <MdInventory />,
  },
  {
    href: "/admin/orders",
    label: t("navigation.orders"),
    icon: <MdShoppingCart />,
  },
  {
    href: "/admin/categories",
    label: t("navigation.categories"),
    icon: <FaTasks />,
  },
  {
    href: "/admin/devices",
    label: t("navigation.devices"),
    icon: <FaTasks />,
  },
  {
    href: "/admin/services",
    label: t("navigation.services"),
    icon: <FaTasks />,
  },
];

const getWorkerLinks = (t: ReturnType<typeof useTranslations>): LinkItem[] => [
  {
    href: "/worker/my-tasks",
    label: t("navigation.myTasks"),
    icon: <FaTasks />,
  },
];

const getLinksByRole = (role: string, t: ReturnType<typeof useTranslations>): LinkItem[] => {
  switch (role) {
    case 'worker':
      return getWorkerLinks(t);
    case 'admin':
      return getAdminLinks(t);
    default:
      return [];
  }
};

const Sidebar = () => {
  const { isExpanded, toggleSidebar, setIsExpanded } = useAppContext();
  const [isVisible, setIsVisible] = useState(false);
  const { data: session } = useSession();
  const [links, setLinks] = useState<LinkItem[]>([]);
  const t = useTranslations('common');

  useEffect(() => {
    if (session?.user) {
      setLinks(getLinksByRole(session?.user?.role, t));
    }
  }, [session?.user, t]);

  const handleLogout = () => {
    signOut();
    setIsExpanded(false);
  };

  useEffect(() => {
    if (isExpanded) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isExpanded]);

  const pathname = usePathname();

  const handleLinkClick = () => {
    setIsExpanded(false);
  };

  return (
    <aside
      className={`h-screen py-12 bg-background text-white px-6 fixed left-0 z-10 top-0 transition-transform duration-300 w-[300px] max-w-[300px] ${isExpanded ? "translate-x-0" : "-translate-x-full"}`}
    >
      <div
        className={`mb-12 text-foreground flex items-center justify-center gap-6 ${!isExpanded && "pt-0"}`}
      >
        <h2
          className={`mb-0 p-0 transition-all duration-500 delay-200 ${isExpanded && isVisible
            ? "block opacity-100 w-auto"
            : "w-0 opacity-0"
            }`}
          style={{ display: isExpanded ? "block" : "none" }}
        >
          {t("navigation.menu")}
        </h2>
        <span
          className="h-5 text-4xl w-6 cursor-pointer flex items-center justify-center"
          onClick={toggleSidebar}
        >
          {isExpanded ? <AiOutlineClose /> : <RxHamburgerMenu />} {/* Toggle between Hamburger and X icon */}
        </span>
      </div>
      <ul className="space-y-4">
        {links.map(({ href, label, icon }, index) => (
          <li key={index} className="group active:scale-95">
            <Link
              href={href}
              onClick={handleLinkClick}
              className={`flex hover:after:hidden items-center px-8 py-4 rounded-lg space-x-4 w-full transition-all duration-500 ease-in-out bg-white ${pathname?.includes(href)
                ? "text-primary"
                : "text-muted-foreground hover:bg-gray-100"
                } ${!isExpanded && "justify-center p-8"}`}
            >
              <span className="text-2xl">{icon}</span>
              <span
                className={`transition-all duration-500 ${isExpanded && isVisible ? "block opacity-100" : "opacity-0"
                  }`}
                style={{ display: isExpanded ? "block" : "none" }}
              >
                {label}
              </span>
            </Link>
          </li>
        ))}
        <li className="group active:scale-95">
          <button
            onClick={handleLogout}
            className={` text-lg font-medium flex hover:after:hidden items-center px-8 py-4 rounded-lg space-x-4 w-full transition-all duration-500 ${pathname?.includes("/auth/logout")
              ? "bg-primary text-primary-foreground"
              : `bg-transparent text-muted-foreground hover:bg-primary/85 group-hover:text-primary-foreground/85 ${!isExpanded && "justify-center p-8"
              }`
              }`}
          >
            <span className="text-2xl">
              <BiSolidLogOut />
            </span>
            <span
              className={`transition-all duration-500 ${isExpanded && isVisible ? "block opacity-100" : "opacity-0"
                }`}
              style={{ display: isExpanded ? "block" : "none" }}
            >
              {t("navigation.logout")}
            </span>
          </button>
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;

