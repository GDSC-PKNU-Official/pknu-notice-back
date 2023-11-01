export interface College {
  collegeName: string;
  departmentName: string;
  departmentSubName: string;
  departmentLink: string;
  graduationLink?: string;
}

export interface Notice {
  title: string;
  path: string;
  description: string;
  date: string;
}
