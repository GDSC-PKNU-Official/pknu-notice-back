import db from '@db/index';

export const selectQuery = async <T>(queryString: string): Promise<T> => {
  const [results] = await db.execute(queryString);
  return results as T;
};
