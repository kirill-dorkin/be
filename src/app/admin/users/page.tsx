import { Metadata } from 'next';
import getUsersAction from "@/actions/dashboard/getUsersAction"
import { IUser } from "@/models/User";
import UsersPageClient from '@/components/admin/UsersPageClient';

interface UsersResponse {
  items: IUser[];
  totalItemsLength: number;
}

export const metadata: Metadata = {
  title: 'Управление пользователями - Админ панель',
  description: 'Управление пользователями и их правами в системе'
};

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