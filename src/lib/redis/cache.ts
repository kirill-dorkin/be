// import redis from './index';
//
// const CACHE_TTL = parseInt(process.env.CACHE_TTL || '300');
//
// export async function getCache(key: string) {
//   const data = await redis.get(key);
//   return data ? JSON.parse(data) : null;
// }
//
// export async function setCache(key: string, value: any) {
//   await redis.setex(key, CACHE_TTL, JSON.stringify(value));
// }
//
// export async function deleteCache(key: string) {
//   await redis.del(key);
// }
//
