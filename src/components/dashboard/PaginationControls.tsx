"use client";
import { useRouter } from "next/navigation";
import { Suspense, type ReactElement } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { usePathname, useSearchParams } from "next/navigation";

export interface PaginationControlsProps {
  hasNextPage: boolean;
  hasPrevPage: boolean;
  totalItemsLength: number;
}

export default function PaginationControls({
  hasNextPage,
  hasPrevPage,
  totalItemsLength,
}: PaginationControlsProps): ReactElement {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const page = searchParams.get("page") ?? "1";
  const per_page = searchParams.get("per_page") ?? "5";

  return (
    <Suspense>
      <Pagination className="justify-end mx-0 overflow-hidden w-full">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => {
                if (hasPrevPage) {
                  router.push(
                    `${pathname}?page=${Number(page) - 1}&per_page=${per_page}`,
                  );
                }
              }}
              className={`hover:bg-transparent cursor-pointer ${!hasPrevPage ? "text-muted-foreground cursor-not-allowed" : ""}`}
            />
          </PaginationItem>
          <PaginationItem>
            {page} / {Math.ceil(totalItemsLength / Number(per_page))}
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              className={`hover:bg-transparent cursor-pointer ${!hasNextPage ? "text-muted-foreground cursor-not-allowed" : ""}`}
              onClick={() => {
                if (hasNextPage) {
                  router.push(
                    `${pathname}?page=${Number(page) + 1}&per_page=${per_page}`,
                  );
                }
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </Suspense>
  );
}
