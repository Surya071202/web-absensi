CREATE TABLE employees (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255),
    role VARCHAR(50) -- 'admin' or 'employee'
);

CREATE TABLE attendance (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT,
    date DATE,
    time TIME,
    photo_url VARCHAR(255),
    FOREIGN KEY (employee_id) REFERENCES employees(id)
);

CREATE TABLE complaints (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT,
    message TEXT,
    date DATE,
    FOREIGN KEY (employee_id) REFERENCES employees(id)
);
