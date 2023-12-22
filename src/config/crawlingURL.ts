export const PKNU_URL = {
  main_homepage_notice: 'https://www.pknu.ac.kr/main/163',
  major_information_page: 'https://www.pknu.ac.kr/main/23',
  whalebe_homepage: 'https://whalebe.pknu.ac.kr',
  language_notice_exchange_student:
    'https://www.pknu.ac.kr/main/163?pageIndex=1&bbsId=2&searchCondition=title&searchKeyword=교환학생&cd=',
  language_notice_language_traning:
    'https://www.pknu.ac.kr/main/163?pageIndex=1&bbsId=2&searchCondition=title&searchKeyword=어학연수&cd=',
  recruit_notice_hostlink: 'https://pknujob.pknu.ac.kr/main/37',

  recruit_notice(pageIndex: number) {
    return `https://pknujob.pknu.ac.kr/main/37?pageIndex=${pageIndex}&bbsId=11&searchCondition=0&strDt=&endDt=&searchKeyword=`;
  },
};

export const MAJOR_URL = {
  spatial_information_system_engineering_notice:
    'http://geoinfo.pknu.ac.kr/05piazza/08.php',
  biomedical_engineering_notice:
    'http://bme.pknu.ac.kr/bbs/board.php?bo_table=notice',
  visual_design_notice: 'https://visual.pknu.ac.kr/visual/3674',
};
