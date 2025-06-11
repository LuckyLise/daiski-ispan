-- 建立資料庫proj_db，使用者proj_db，密碼12345，授權proj_db所有權限
CREATE DATABASE next_test
    DEFAULT CHARACTER SET = 'utf8mb4';
CREATE USER 'next_test'@'localhost' IDENTIFIED BY '12345';
GRANT ALL PRIVILEGES ON next_test.* To 'next_test'@'localhost';
FLUSH PRIVILEGES;
SHOW GRANTS FOR 'next_test'@'localhost';
SHOW DATABASES;
SELECT user,host FROM mysql.user;