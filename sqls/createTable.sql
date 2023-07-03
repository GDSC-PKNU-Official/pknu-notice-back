USE burimidb;

CREATE TABLE departments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    collegeName VARCHAR(255) NOT NULL,
    departmentName VARCHAR(255) NOT NULL,
    departmentSubName VARCHAR(255) NOT NULL,
    departmentLink VARCHAR(255) NOT NULL
);

CREATE TABLE schoolnotices (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    link VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    uploadDate VARCHAR(255) NOT NULL
);