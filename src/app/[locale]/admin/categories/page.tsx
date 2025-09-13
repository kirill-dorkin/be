import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { SearchParams } from "@/types";
import type { ICategory } from "@/models/Category";
import getCategoriesAction from "@/actions/dashboard/getCategoriesAction";
import CategoriesPageClient from "@/components/admin/CategoriesPageClient";

interface CategoriesResponse {
  items: ICategory[];
  totalItemsLength: number;
}

type Props = {
  params: { locale: string };
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'admin.categories' });
  
  return {
    title: t('metadata.title'),
    description: t('metadata.description')
  };
}

const CategoriesPage = async ({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) => {
  const { page = "1", perPage = "5" } = await searchParams;
  const categoriesResponse = (await getCategoriesAction(
    Number(page),
    Number(perPage),
  )) as unknown as CategoriesResponse;
  const items: ICategory[] = categoriesResponse.items ?? [];
  const totalItemsLength: number = categoriesResponse.totalItemsLength ?? 0;
  return (
    <CategoriesPageClient
      page={page}
      perPage={perPage}
      items={items}
      totalItemsLength={totalItemsLength}
    />
  );
};

export default CategoriesPage;
