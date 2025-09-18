import { getServerSession } from 'next-auth';
import { authOptions } from '../auth';

export { authOptions };

export function auth() {
  return getServerSession(authOptions);
}
