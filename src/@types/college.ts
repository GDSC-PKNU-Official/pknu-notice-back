export interface College {
  id?: number;
  collegeName: string;
  departmentName: string;
  departmentSubName: string;
  departmentLink: string;
  graduationLink?: string;
}

export interface MajorNotices {
  title: string;
  path: string;
  description: string;
  upload_date: string;
  rep_yn: string;
  department_id?: number;
}

export interface Notice {
  id?: number;
  title: string;
  path: string;
  author?: string;
  rep_yn?: boolean;
  description: string;
  date: string;
  category?: NoticeCategory;
}

export type NoticeCategory = 'SCHOOL' | 'LANGUAGE';
