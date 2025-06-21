import Link from 'next/link';
import BaseContainer from "@/components/BaseContainer";

export default function Footer() {
  return (
    <BaseContainer><footer className="bg-transparent mt-10">
      <div className="w-full mx-auto max-w-screen-xl pb-10 md:flex md:items-center md:justify-between">
        <span className="text-sm text-muted-foreground sm:text-center">
          © 2024{' '}
          <Link href="#" className="hover:underline">
            Best Electronics
          </Link>
          . All Rights Reserved.
        </span>
        <ul className="flex flex-wrap items-center mt-3 text-sm font-medium text-gray-500 dark:text-gray-400 sm:mt-0">
          <li>
            <Link href="#" className="hover:underline me-4 md:me-6">
              About
            </Link>
          </li>
          <li>
            <Link href="#" className="hover:underline me-4 md:me-6">
              Privacy Policy
            </Link>
          </li>
          <li>
            <Link href="#" className="hover:underline me-4 md:me-6">
              Licensing
            </Link>
          </li>
          <li>
            <Link href="#" className="hover:underline">
              Contact
            </Link>
          </li>
        </ul>
      </div>
    </footer></BaseContainer>
  );
}
