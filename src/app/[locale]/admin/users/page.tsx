import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import getUsersAction from "@/actions/dashboard/getUsersAction"
import { SearchParams } from "@/types"
import { IUser } from "@/models/User";
import UsersPageClient from "@/components/admin/UsersPageClient";

interface UsersResponse {
  items: IUser[];
  totalItemsLength: number;
}

type Props = {
  params: { locale: string };
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'admin.users' });
  
  return {
    title: t('metadata.title'),
    description: t('metadata.description')
  };
}

const UsersPage = async ({
  searchParams,
}: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) => {
  const { page = "1", perPage = "5" } = await searchParams;

  const usersResponse = (await getUsersAction(
    Number(page),
    Number(perPage),
  )) as unknown as UsersResponse;
  const items = usersResponse.items ?? [];
  const totalItemsLength: number = usersResponse.totalItemsLength ?? 0;

  return (
    <UsersPageClient
      page={page}
      perPage={perPage}
      items={items}
      totalItemsLength={totalItemsLength}
    />
  );
};

export default UsersPage;
