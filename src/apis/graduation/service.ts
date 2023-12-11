import { selectQuery } from '@db/query/dbQueryHandler';
import notificationToSlack from 'src/hooks/notificateToSlack';

interface GraduationData {
  graduation_link: string | '';
}

export const getGraduationLink = async (
  major: string,
): Promise<string | ''> => {
  console.log(major);
  const getGraduationLinkQuery = `SELECT graduation_link FROM departments WHERE department_name = '${major}' OR department_subname = '${major}'`;

  try {
    const data = await selectQuery<GraduationData[]>(getGraduationLinkQuery);
    const { graduation_link } = data[0];
    return graduation_link;
  } catch (error) {
    notificationToSlack(error);
  }
};
