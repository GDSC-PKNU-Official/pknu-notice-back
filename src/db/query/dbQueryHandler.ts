import db from '@db/index';
import { PoolConnection } from 'mysql2/promise';

export const selectQuery = async <T>(
  queryString: string,
  connection?: PoolConnection,
): Promise<T> => {
  let results;
  if (connection) [results] = await connection.execute(queryString);
  else [results] = await db.execute(queryString);
  return results as T;
};
