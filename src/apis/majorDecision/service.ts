import db from '@db/index';

interface CollegesName {
  collegeName: string;
}

export const getColleges = async () => {
  return new Promise((resolve, reject) => {
    const getCollegesQuery = `SELECT DISTINCT collegeName from departments ORDER BY collegeName;`;
    db.query(getCollegesQuery, (err: Error, res: CollegesName[]) => {
      if (err) reject(err);
      const colleges: string[] = [];
      for (const college of res) {
        colleges.push(college.collegeName);
      }
      resolve(colleges);
    });
  });
};
