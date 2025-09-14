import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import Providers from '@/app/providers';
import './globals.css';

type Props = {
  children: React.ReactNode;
};

export default async function RootLayout({
  children
}: Props) {
  const session = await getServerSession(authOptions);
  
  return (
    <html lang="ru">
      <body>
        <Providers session={session}>
          {children}
        </Providers>
      </body>
    </html>
  );
}