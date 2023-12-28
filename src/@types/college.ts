export interface College {
  id?: number;
  college_name: string;
  department_name: string;
  department_subname: string;
  department_link: string;
  graduation_link?: string;
}

export interface Notices {
  id?: number;
  title: string;
  link: string;
  author?: string;
  rep_yn?: boolean | NoticeBoolean;
  description?: string;
  upload_date: string;
  category?: NoticeCategory;
}

export type NoticeCategory = 'SCHOOL' | 'LANGUAGE';
export type NoticeBoolean = 1 | 0;

export interface WhalebeData {
  title: string;
  operating_period: string;
  recruitment_period: string;
  imgurl: string;
  link: string;
}

export interface RecruitData {
  title: string;
  link: string;
  recruitment_period: string;
}
