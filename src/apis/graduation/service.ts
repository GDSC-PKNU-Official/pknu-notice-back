import db from '@db/index';
import { QueryError, RowDataPacket } from 'mysql2';

interface GraduationLink extends RowDataPacket {
  department: string;
  link: string;
}

export const getGraduationLink = async (
  major: string,
): Promise<GraduationLink | null> => {
  return new Promise((resolve, reject) => {
    const getGraduationLinkQuery =
      'SELECT department, link FROM graduation WHERE department = ?';
    db.query<GraduationLink[]>(
      getGraduationLinkQuery,
      [major],
      (err: QueryError, result) => {
        if (err) {
          reject(err);
        } else {
          if (result) {
            resolve(result[0] as GraduationLink);
          } else {
            resolve(null);
          }
        }
      },
    );
  });
};
