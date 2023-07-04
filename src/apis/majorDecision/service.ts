import db from '@db/index';

interface CollegesName {
  collegeName: string;
}

interface DepartmentsName {
  departmentName: string;
  departmentSubName: string;
}

export const getCollegesName = async (): Promise<string[]> => {
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

export const getDepartmentsName = async (
  collegeName: string,
): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const getDepartmentsQuery = `SELECT departmentName, departmentSubName FROM departments WHERE collegeName = '${collegeName}' ORDER BY departmentName;`;
    db.query(getDepartmentsQuery, (err: Error, res: DepartmentsName[]) => {
      if (err) reject(err);
      const departments: string[] = [];
      for (const department of res) {
        const major =
          department.departmentSubName === '-'
            ? department.departmentName
            : department.departmentName + ' ' + department.departmentSubName;
        departments.push(major);
      }
      resolve(departments);
    });
  });
};
