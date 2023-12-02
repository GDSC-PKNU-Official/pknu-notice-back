import db from '@db/index';
import { PoolConnection } from 'mysql2/promise';

export const selectQuery = async <T>(
  queryString: string,
  connection?: PoolConnection,
): Promise<T> => {
  const [results] = connection
    ? await connection.execute(queryString)
    : await db.execute(queryString);
  return results as T;
};
