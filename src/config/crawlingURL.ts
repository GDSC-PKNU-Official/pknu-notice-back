export const PKNU_URL = {
  LANGUAGE_NOTICE_EXCHANGE_STUDENT:
    'https://www.pknu.ac.kr/main/163?pageIndex=1&bbsId=2&searchCondition=title&searchKeyword=교환학생&cd=',
  LANGUAGE_NOTICE_LANGUAGE_TRANING:
    'https://www.pknu.ac.kr/main/163?pageIndex=1&bbsId=2&searchCondition=title&searchKeyword=어학연수&cd=',
  RECRUIT_NOTICE(pageIndex: number) {
    return `https://pknujob.pknu.ac.kr/main/37?pageIndex=${pageIndex}&bbsId=11&searchCondition=0&strDt=&endDt=&searchKeyword=`;
  },
  RECRUIT_NOTICE_HOSTLINK: 'https://pknujob.pknu.ac.kr/main/37',
};
