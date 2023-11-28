import db from '@db/index';
import { selectQuery } from '@db/query/dbQueryHandler';
import notificationToSlack from 'src/hooks/notificateToSlack';

interface CollegesName {
  college_name: string;
}

interface DepartmentsName {
  department_name: string;
  department_subname: string;
}

export const getCollegesName = async (): Promise<string[]> => {
  const getCollegesQuery = `SELECT DISTINCT college_name from departments ORDER BY college_name;`;
  try {
    const colleges = await selectQuery<CollegesName[]>(getCollegesQuery);
    return colleges.map((college) => college.college_name);
  } catch (error) {
    notificationToSlack(error);
  }
};

export const getDepartmentsName = async (
  collegeName: string,
): Promise<string[]> => {
  const getDepartmentsQuery = `SELECT department_name, department_subname FROM departments WHERE college_name = '${collegeName}' ORDER BY department_name;`;

  try {
    const departments = await selectQuery<DepartmentsName[]>(
      getDepartmentsQuery,
    );

    return departments.map((department) => {
      const major =
        department.department_subname === '-'
          ? department.department_name
          : department.department_name + ' ' + department.department_subname;
      return major;
    });
  } catch (error) {
    notificationToSlack(error);
  }
};
