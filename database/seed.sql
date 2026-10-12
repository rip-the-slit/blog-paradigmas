-- Optional demo data. Import once after schema.sql into empty tables.
USE sistema_cafe;
START TRANSACTION;
INSERT INTO tipo_cafe (id_tipo, nombre) VALUES
  (1, 'Arabica'),
  (2, 'Robusta'),
  (3, 'Liberica'),
  (4, 'Excelsa');

INSERT INTO distribuidor (rif_dist, nombre, saldo_bs) VALUES
  ('J-12345678-9', 'Distribuidor Uno', 10000.00);

INSERT INTO distribuidor (rif_dist, nombre, saldo_bs) VALUES
  ('J-87654321-5', 'Distribuidor Dos', 7500.00);

INSERT INTO contacto (cedula_contacto, nombre, numero_telf) VALUES
  ('V-12345678', 'Contacto Uno', '04141234567');

INSERT INTO proveedor (rif_proveedor, nombre, cedula_contacto, rif_dist) VALUES
  ('J-32345678-1', 'Proveedor Uno', 'V-12345678', 'J-12345678-9');

INSERT INTO proveedor (rif_proveedor, nombre, cedula_contacto, rif_dist) VALUES
  ('J-87654321-2', 'Proveedor Dos', 'V-12345678', 'J-12345678-9');

INSERT INTO negocio (rif_negocio, nombre, cedula_contacto, direccion, rif_dist) VALUES
  ('J-42345678-3', 'Negocio Uno', 'V-12345678', 'Av. Principal, local 1', 'J-12345678-9');

INSERT INTO negocio (rif_negocio, nombre, cedula_contacto, direccion, rif_dist) VALUES
  ('J-87654321-4', 'Negocio Dos', 'V-12345678', 'Calle Comercio, local 2', 'J-12345678-9');

INSERT INTO cafe (id_cafe, nombre, precio_kg_bs, id_tipo, rif_proveedor) VALUES
  (1, 'Café Arabica Premium', 50.00, 1, 'J-32345678-1'),
  (2, 'Café Robusta Clásico', 30.00, 2, 'J-32345678-1'),
  (3, 'Café Liberica Exótico', 40.00, 3, 'J-87654321-2'),
  (4, 'Café Excelsa Único', 45.00, 4, 'J-87654321-2');

INSERT INTO inventario (id_inv, cantidad_kg, rif_dist, id_tipo) VALUES
  (1, 100.00, 'J-12345678-9', 1),
  (2, 50.00, 'J-12345678-9', 2),
  (3, 75.00, 'J-12345678-9', 3);
COMMIT;
