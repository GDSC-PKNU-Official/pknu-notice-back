USE burimidb;

CREATE TABLE notices (
    id INT PRIMARY KEY AUTO_INCREMENT,
    major VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    graduate VARCHAR(255),
    link VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    uploadDate VARCHAR(255) NOT NULL
);

CREATE TABLE departments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    collegeName VARCHAR(255) NOT NULL,
    departmentName VARCHAR(255) NOT NULL,
    departmentSubName VARCHAR(255) NOT NULL,
    departmentLink VARCHAR(255) NOT NULL
);
