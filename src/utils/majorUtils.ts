import { selectQuery } from '@db/query/dbQueryHandler';
import notificationToSlack from 'src/hooks/notificateToSlack';

export const getDepartmentIdByMajor = async (major: string) => {
  const [departmentName, departmentSubName] = major.split(' ');
  const getDepartmentQuery = `SELECT id FROM departments WHERE department_name = '${departmentName}' ${
    departmentSubName ? `AND department_subname = '${departmentSubName}'` : ''
  };`;

  try {
    const departmentId = await selectQuery<{ id: number }[]>(
      getDepartmentQuery,
    );

    if (!departmentId.length) {
      notificationToSlack('잘못된 학과 입력');
      return;
    }
    return departmentId[0].id;
  } catch (error) {
    notificationToSlack(error.message + '학과 ID 조회 실패');
  }
};
