export const PKNU_URL = {
  language_notice_exchange_student:
    'https://www.pknu.ac.kr/main/163?pageIndex=1&bbsId=2&searchCondition=title&searchKeyword=교환학생&cd=',
  language_notice_language_traning:
    'https://www.pknu.ac.kr/main/163?pageIndex=1&bbsId=2&searchCondition=title&searchKeyword=어학연수&cd=',
  recruit_notice_hostlink: 'https://pknujob.pknu.ac.kr/main/37',

  recruit_notice(pageIndex: number) {
    return `https://pknujob.pknu.ac.kr/main/37?pageIndex=${pageIndex}&bbsId=11&searchCondition=0&strDt=&endDt=&searchKeyword=`;
  },
};
