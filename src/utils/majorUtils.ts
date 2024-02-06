import { selectQuery } from '@db/query/dbQueryHandler';
import notificationToSlack from 'src/hooks/notificateToSlack';

export const getDepartmentIdByMajor = async (major: string) => {
  const getDepartmentQuery = `SELECT id FROM departments WHERE department_name = '${major}' OR department_subname = '${major}'`;

  try {
    const departmentId = await selectQuery<{ id: number }[]>(
      getDepartmentQuery,
    );

    if (!departmentId.length) {
      notificationToSlack(major + '잘못된 학과 입력');
      return;
    }
    return departmentId[0].id;
  } catch (error) {
    notificationToSlack(error.message + '학과 ID 조회 실패');
  }
};
