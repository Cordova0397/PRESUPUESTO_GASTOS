CREATE DATABASE presupuesto_gastos_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

CREATE USER 'presupuesto_user'@'localhost'
IDENTIFIED BY 'presupuesto2026';

GRANT ALL PRIVILEGES ON presupuesto_gastos_db.* 
TO 'presupuesto_user'@'localhost';

FLUSH PRIVILEGES;