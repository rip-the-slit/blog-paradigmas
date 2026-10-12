-- Import once into a new database; this does not reset an existing database.
CREATE DATABASE IF NOT EXISTS sistema_cafe CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sistema_cafe;

CREATE TABLE IF NOT EXISTS distribuidor (
  rif_dist VARCHAR(20) PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  saldo_bs DECIMAL(12, 2) NOT NULL DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS contacto (
  cedula_contacto VARCHAR(20) PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  numero_telf VARCHAR(20)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS proveedor (
  rif_proveedor VARCHAR(20) PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  cedula_contacto VARCHAR(20),
  rif_dist VARCHAR(20) NOT NULL,
  FOREIGN KEY (rif_dist) REFERENCES distribuidor(rif_dist),
  FOREIGN KEY (cedula_contacto) REFERENCES contacto(cedula_contacto)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS negocio (
  rif_negocio VARCHAR(20) PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  cedula_contacto VARCHAR(20),
  direccion VARCHAR(255),
  rif_dist VARCHAR(20) NOT NULL,
  FOREIGN KEY (rif_dist) REFERENCES distribuidor(rif_dist),
  FOREIGN KEY (cedula_contacto) REFERENCES contacto(cedula_contacto)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tipo_cafe(
  id_tipo INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS cafe (
  id_cafe INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  precio_kg_bs DECIMAL(10, 2) NOT NULL,
  id_tipo INT NOT NULL,
  rif_proveedor VARCHAR(20) NOT NULL,
  FOREIGN KEY (id_tipo) REFERENCES tipo_cafe(id_tipo),
  FOREIGN KEY (rif_proveedor) REFERENCES proveedor(rif_proveedor)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS inventario (
  id_inv INT AUTO_INCREMENT PRIMARY KEY,
  cantidad_kg DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  rif_dist VARCHAR(20) NOT NULL,
  id_tipo INT NOT NULL,
  FOREIGN KEY (rif_dist) REFERENCES distribuidor(rif_dist),
  FOREIGN KEY (id_tipo) REFERENCES tipo_cafe(id_tipo),
  UNIQUE KEY inventario_distribuidor_tipo (rif_dist, id_tipo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci; 

CREATE TABLE IF NOT EXISTS compra (
  id_compra INT AUTO_INCREMENT PRIMARY KEY,
  fecha_compra DATE NOT NULL,
  precio_kg_bs DECIMAL(10, 2) NOT NULL,
  cantidad_kg DECIMAL(10, 2) NOT NULL,
  cantidad_abonos INT NOT NULL DEFAULT 0,
  rif_proveedor VARCHAR(20) NOT NULL,
  rif_dist VARCHAR(20) NOT NULL,
  id_cafe INT NOT NULL,
  FOREIGN KEY (rif_proveedor) REFERENCES proveedor(rif_proveedor),
  FOREIGN KEY (rif_dist) REFERENCES distribuidor(rif_dist),
  FOREIGN KEY (id_cafe) REFERENCES cafe(id_cafe)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS pago_compra (
  id_pago INT AUTO_INCREMENT PRIMARY KEY,
  fecha_pago DATE NOT NULL,
  monto DECIMAL(12, 2) NOT NULL,
  id_compra INT NOT NULL,
  FOREIGN KEY (id_compra) REFERENCES compra(id_compra)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS venta (
  id_venta INT AUTO_INCREMENT PRIMARY KEY,
  fecha_venta DATE NOT NULL,
  cantidad_kg DECIMAL(10, 2) NOT NULL,
  cantidad_abonos INT NOT NULL DEFAULT 0,
  precio_kg_bs DECIMAL(18, 8) NOT NULL,
  monto_total DECIMAL(12, 2) NOT NULL,
  rif_negocio VARCHAR(20) NOT NULL,
  rif_dist VARCHAR(20) NOT NULL,
  id_inv INT NOT NULL,
  FOREIGN KEY (rif_negocio) REFERENCES negocio(rif_negocio),
  FOREIGN KEY (rif_dist) REFERENCES distribuidor(rif_dist),
  FOREIGN KEY (id_inv) REFERENCES inventario(id_inv),
  UNIQUE KEY venta_diaria (rif_dist, rif_negocio, id_inv, fecha_venta)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS pago_venta (
  id_pago INT AUTO_INCREMENT PRIMARY KEY,
  fecha_pago DATE NOT NULL,
  monto DECIMAL(12, 2) NOT NULL,
  id_venta INT NOT NULL,
  FOREIGN KEY (id_venta) REFERENCES venta(id_venta)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
