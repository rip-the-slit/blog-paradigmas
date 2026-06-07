class Repositorio extends EventTarget {
  #fecha;

  constructor() {
    super();
    this.init();
    this.#fecha = new Date();
  }

  set fecha(val) {
    this.#fecha = val;
    this.dispatchEvent(new CustomEvent("cambioInfo", { detail: { fecha: this.#fecha } }));
  }

  get fecha() {
    return this.#fecha;
  }

  init() {
    alasql(sql`
      CREATE TABLE IF NOT EXISTS distribuidor (
        rif_dist VARCHAR(20) PRIMARY KEY,
        contrasena VARCHAR(255) NOT NULL,
        saldo_bs DECIMAL(12, 2) DEFAULT 0.00
      );

      CREATE TABLE IF NOT EXISTS contacto (
        cedula_contacto VARCHAR(20) PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        numero_telf VARCHAR(20)
      );

      CREATE TABLE IF NOT EXISTS proveedor (
        rif_proveedor VARCHAR(20) PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        cedula_contacto VARCHAR(20),
        FOREIGN KEY (cedula_contacto) REFERENCES CONTACTO(cedula_cont)
      );

      CREATE TABLE IF NOT EXISTS negocio (
        rif_negocio VARCHAR(20) PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        cedula_conta VARCHAR(20),
        direccion VARCHAR(255),
        FOREIGN KEY (cedula_conta) REFERENCES CONTACTO(cedula_cont)
      );

      CREATE TABLE IF NOT EXISTS tipo_cafe(
        id_tipo INT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS cafe (
        id_cafe INT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        precio_kg_bs DECIMAL(10, 2) NOT NULL,
        id_tipo INT,
        FOREIGN KEY (id_tipo) REFERENCES tipo_cafe(id_tipo)
      );

      CREATE TABLE IF NOT EXISTS inventario (
        id_inv INT PRIMARY KEY,
        cantidad_kg DECIMAL(10, 2) DEFAULT 0.00,
        rif_dist VARCHAR(20),
        id_tipo INT,
        FOREIGN KEY (rif_dist) REFERENCES distribuidor(rif_dist),
        FOREIGN KEY (id_tipo) REFERENCES tipo_cafe(id_tipo)
      ); 

      CREATE TABLE IF NOT EXISTS compra (
        id_compra INT PRIMARY KEY,
        fecha_compra DATE NOT NULL,
        cantidad_kg DECIMAL(10, 2) NOT NULL,
        cantidad_abonos INT DEFAULT 0,
        rif_proveedor VARCHAR(20),
        rif_dist VARCHAR(20),
        id_cafe INT,
        FOREIGN KEY (rif_proveedor) REFERENCES proveedor(rif_proveedor),
        FOREIGN KEY (rif_dist) REFERENCES distribuidor(rif_dist),
        FOREIGN KEY (id_cafe) REFERENCES cafe(id_cafe)
      );

      CREATE TABLE IF NOT EXISTS pago_compra (
        id_pago INT PRIMARY KEY,
        fecha_pago DATE NOT NULL,
        monto DECIMAL(10, 2) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS venta (
        id_venta INT PRIMARY KEY,
        fecha_venta DATE NOT NULL,
        cantidad_kg DECIMAL(10, 2) NOT NULL,
        cantidad_abonos INT DEFAULT 0,
        rif_negocio VARCHAR(20),
        rif_dist VARCHAR(20),
        id_inv INT,
        FOREIGN KEY (rif_negocio) REFERENCES negocio(rif_negocio),
        FOREIGN KEY (rif_dist) REFERENCES distribuidor(rif_dist),
        FOREIGN KEY (id_inv) REFERENCES inventario(id_inv)
      );

      CREATE TABLE IF NOT EXISTS pago_venta (
        id_pago INT PRIMARY KEY,
        fecha_pago DATE NOT NULL,
        monto DECIMAL(10, 2) NOT NULL
      );

      INSERT INTO  tipo_cafe (id_tipo, nombre) VALUES
        (1, 'Arabica'),
        (2, 'Robusta'),
        (3, 'Liberica'),
        (4, 'Excelsa');

      INSERT INTO distribuidor (rif_dist, contrasena, saldo_bs) VALUES
        ('D-12345678', 'contrasena123', 10000.00);
  `);
  }

  obtenerDistribuidores() {
    const result = alasql(sql`
      SELECT rif_dist, saldo_bs FROM distribuidor
    `);
    return result;
  }
}

function sql(strings, ...values) {return strings.reduce((result, string, i) => result + string + (values[i] || ''), '');}

export default new Repositorio();
