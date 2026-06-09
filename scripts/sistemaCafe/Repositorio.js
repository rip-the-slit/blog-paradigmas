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
        FOREIGN KEY (cedula_contacto) REFERENCES contacto(cedula_contacto)
      );
      
      CREATE TABLE IF NOT EXISTS negocio (
        rif_negocio VARCHAR(20) PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        cedula_contacto VARCHAR(20),
        direccion VARCHAR(255),
        FOREIGN KEY (cedula_contacto) REFERENCES contacto(cedula_contacto)
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
        rif_proveedor VARCHAR(20),
        FOREIGN KEY (id_tipo) REFERENCES tipo_cafe(id_tipo),
        FOREIGN KEY (rif_proveedor) REFERENCES proveedor(rif_proveedor)
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
        monto DECIMAL(10, 2) NOT NULL,
        id_venta INT,
        FOREIGN KEY (id_venta) REFERENCES venta(id_venta)
      );

      INSERT INTO  tipo_cafe (id_tipo, nombre) VALUES
        (1, 'Arabica'),
        (2, 'Robusta'),
        (3, 'Liberica'),
        (4, 'Excelsa');

      INSERT INTO distribuidor (rif_dist, contrasena, saldo_bs) VALUES
        ('D-12345678', 'contrasena123', 10000.00);

      INSERT INTO contacto (cedula_contacto, nombre, numero_telf) VALUES
        ('C-12345678', 'Contacto Uno', '04141234567');

      INSERT INTO proveedor (rif_proveedor, nombre, cedula_contacto) VALUES
        ('P-12345678', 'Proveedor Uno', 'C-12345678');

      INSERT INTO proveedor (rif_proveedor, nombre, cedula_contacto) VALUES
        ('P-87654321', 'Proveedor Dos', 'C-12345678');

      INSERT INTO negocio (rif_negocio, nombre, cedula_contacto, direccion) VALUES
        ('N-12345678', 'Negocio Uno', 'C-12345678', 'Av. Principal, local 1');

      INSERT INTO negocio (rif_negocio, nombre, cedula_contacto, direccion) VALUES
        ('N-87654321', 'Negocio Dos', 'C-12345678', 'Calle Comercio, local 2');

      INSERT INTO cafe (id_cafe, nombre, precio_kg_bs, id_tipo, rif_proveedor) VALUES
        (1, 'Café Arabica Premium', 50.00, 1, 'P-12345678'),
        (2, 'Café Robusta Clásico', 30.00, 2, 'P-12345678'),
        (3, 'Café Liberica Exótico', 40.00, 3, 'P-87654321'),
        (4, 'Café Excelsa Único', 45.00, 4, 'P-87654321');

      INSERT INTO inventario (id_inv, cantidad_kg, rif_dist, id_tipo) VALUES
        (1, 100.00, 'D-12345678', 1),
        (2, 50.00, 'D-12345678', 2),
        (3, 75.00, 'D-12345678', 3);
  `);
  }

  obtenerDistribuidores() {
    const result = alasql(sql`
      SELECT rif_dist, saldo_bs FROM distribuidor
    `);
    return result;
  }

  obtenerProveedores() {
    const result = alasql(sql`
      SELECT proveedor.nombre AS nombre_proveedor, contacto.nombre AS nombre_contacto, * 
      FROM proveedor LEFT JOIN contacto ON proveedor.cedula_contacto = contacto.cedula_contacto
    `);
    return result;
  }

  obtenerContactos() {
    const result = alasql(sql`
      SELECT cedula_contacto, nombre, numero_telf
      FROM contacto
      ORDER BY nombre
    `);
    return result;
  }

  obtenerTiposCafe() {
    const result = alasql(sql`
      SELECT id_tipo, nombre
      FROM tipo_cafe
      ORDER BY nombre
    `);
    return result;
  }

  obtenerInventario() {
    const result = alasql(sql`
      SELECT inventario.id_inv,
             inventario.cantidad_kg,
             inventario.id_tipo,
             tipo_cafe.nombre AS tipo_cafe,
             AVG(cafe.precio_kg_bs) AS precio_kg_bs
      FROM inventario INNER JOIN tipo_cafe ON inventario.id_tipo = tipo_cafe.id_tipo
      LEFT JOIN cafe ON inventario.id_tipo = cafe.id_tipo
      GROUP BY inventario.id_inv, inventario.cantidad_kg, inventario.id_tipo, tipo_cafe.nombre
      ORDER BY tipo_cafe.nombre
    `);
    return result;
  }

  agregarContacto(contacto) {
    alasql(
      "INSERT INTO contacto (cedula_contacto, nombre, numero_telf) VALUES (?, ?, ?)",
      [contacto.cedula_contacto, contacto.nombre, contacto.numero_telf],
    );
  }

  agregarProveedor(proveedor) {
    alasql(
      "INSERT INTO proveedor (rif_proveedor, nombre, cedula_contacto) VALUES (?, ?, ?)",
      [
        proveedor.rif_proveedor,
        proveedor.nombre,
        proveedor.cedula_contacto || null,
      ],
    );
    this.dispatchEvent(
      new CustomEvent("cambioProveedor", {
        detail: { rif_proveedor: proveedor.rif_proveedor },
      }),
    );
  }

  actualizarContactoProveedor(rif_proveedor, cedula_contacto) {
    alasql(
      "UPDATE proveedor SET cedula_contacto = ? WHERE rif_proveedor = ?",
      [cedula_contacto, rif_proveedor],
    );
    this.dispatchEvent(
      new CustomEvent("cambioProveedor", {
        detail: { rif_proveedor, cedula_contacto },
      }),
    );
  }

  agregarNegocio(negocio) {
    alasql(
      "INSERT INTO negocio (rif_negocio, nombre, cedula_contacto, direccion) VALUES (?, ?, ?, ?)",
      [
        negocio.rif_negocio,
        negocio.nombre,
        negocio.cedula_contacto || null,
        negocio.direccion,
      ],
    );
    this.dispatchEvent(
      new CustomEvent("cambioNegocio", {
        detail: { rif_negocio: negocio.rif_negocio },
      }),
    );
  }

  actualizarContactoNegocio(rif_negocio, cedula_contacto) {
    alasql(
      "UPDATE negocio SET cedula_contacto = ? WHERE rif_negocio = ?",
      [cedula_contacto, rif_negocio],
    );
    this.dispatchEvent(
      new CustomEvent("cambioNegocio", {
        detail: { rif_negocio, cedula_contacto },
      }),
    );
  }

  agregarProductoCafe(producto) {
    const [{ ultimo_id }] = alasql(
      "SELECT MAX(id_cafe) AS ultimo_id FROM cafe",
    );
    const siguiente_id = (ultimo_id || 0) + 1;

    alasql(
      "INSERT INTO cafe (id_cafe, nombre, precio_kg_bs, id_tipo, rif_proveedor) VALUES (?, ?, ?, ?, ?)",
      [
        siguiente_id,
        producto.nombre,
        producto.precio_kg_bs,
        producto.id_tipo,
        producto.rif_proveedor,
      ],
    );

    this.dispatchEvent(
      new CustomEvent("cambioProveedor", {
        detail: { rif_proveedor: producto.rif_proveedor },
      }),
    );
  }

  comprarCafe(producto, cantidad_kg) {
    const distribuidor = this.obtenerDistribuidores()[0];
    const monto = cantidad_kg * producto.precio_kg_bs;

    if (!distribuidor || cantidad_kg <= 0 || monto > distribuidor.saldo_bs) {
      return false;
    }

    const inventario = alasql(
      "SELECT id_inv, cantidad_kg FROM inventario WHERE rif_dist = ? AND id_tipo = ?",
      [distribuidor.rif_dist, producto.id_tipo],
    )[0];

    if (inventario) {
      alasql(
        "UPDATE inventario SET cantidad_kg = ? WHERE id_inv = ?",
        [inventario.cantidad_kg + cantidad_kg, inventario.id_inv],
      );
    } else {
      const [{ ultimo_id }] = alasql(
        "SELECT MAX(id_inv) AS ultimo_id FROM inventario",
      );
      alasql(
        "INSERT INTO inventario (id_inv, cantidad_kg, rif_dist, id_tipo) VALUES (?, ?, ?, ?)",
        [(ultimo_id || 0) + 1, cantidad_kg, distribuidor.rif_dist, producto.id_tipo],
      );
    }

    const [{ ultima_compra }] = alasql(
      "SELECT MAX(id_compra) AS ultima_compra FROM compra",
    );
    alasql(
      "INSERT INTO compra (id_compra, fecha_compra, cantidad_kg, cantidad_abonos, rif_proveedor, rif_dist, id_cafe) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        (ultima_compra || 0) + 1,
        this.#fecha.toISOString().slice(0, 10),
        cantidad_kg,
        1,
        producto.rif_proveedor,
        distribuidor.rif_dist,
        producto.id_cafe,
      ],
    );

    const [{ ultimo_pago }] = alasql(
      "SELECT MAX(id_pago) AS ultimo_pago FROM pago_compra",
    );
    alasql(
      "INSERT INTO pago_compra (id_pago, fecha_pago, monto) VALUES (?, ?, ?)",
      [(ultimo_pago || 0) + 1, this.#fecha.toISOString().slice(0, 10), monto],
    );

    alasql(
      "UPDATE distribuidor SET saldo_bs = ? WHERE rif_dist = ?",
      [distribuidor.saldo_bs - monto, distribuidor.rif_dist],
    );

    this.dispatchEvent(
      new CustomEvent("cambioInfo", {
        detail: { id_cafe: producto.id_cafe, cantidad_kg, monto },
      }),
    );
    return true;
  }

  obtenerCompras() {
    const result = alasql(sql`
      SELECT compra.id_compra,
             compra.fecha_compra,
             compra.cantidad_kg,
             proveedor.nombre AS nombre_proveedor,
             cafe.nombre AS nombre_cafe,
             cafe.precio_kg_bs,
             tipo_cafe.nombre AS tipo_cafe
      FROM compra
      INNER JOIN proveedor ON compra.rif_proveedor = proveedor.rif_proveedor
      INNER JOIN cafe ON compra.id_cafe = cafe.id_cafe
      INNER JOIN tipo_cafe ON cafe.id_tipo = tipo_cafe.id_tipo
      ORDER BY compra.fecha_compra DESC, compra.id_compra DESC
    `);
    return result.map((compra) => ({
      ...compra,
      monto: compra.cantidad_kg * compra.precio_kg_bs,
    }));
  }

  venderCafe(negocio, inventario, cantidad_kg, cantidad_abonos) {
    const distribuidor = this.obtenerDistribuidores()[0];
    const fecha = this.#fecha.toISOString().slice(0, 10);
    const monto = cantidad_kg * inventario.precio_kg_bs;

    if (
      !distribuidor ||
      cantidad_kg <= 0 ||
      cantidad_abonos <= 0 ||
      cantidad_kg > inventario.cantidad_kg
    ) {
      return false;
    }

    const ventaExistente = alasql(
      "SELECT id_venta, cantidad_kg, cantidad_abonos FROM venta WHERE fecha_venta = ? AND rif_negocio = ? AND id_inv = ?",
      [fecha, negocio.rif_negocio, inventario.id_inv],
    )[0];
    let idVenta;

    if (ventaExistente) {
      idVenta = ventaExistente.id_venta;
      alasql(
        "UPDATE venta SET cantidad_kg = ?, cantidad_abonos = ? WHERE id_venta = ?",
        [
          ventaExistente.cantidad_kg + cantidad_kg,
          ventaExistente.cantidad_abonos + cantidad_abonos,
          ventaExistente.id_venta,
        ],
      );
    } else {
      const [{ ultima_venta }] = alasql(
        "SELECT MAX(id_venta) AS ultima_venta FROM venta",
      );
      idVenta = (ultima_venta || 0) + 1;
      alasql(
        "INSERT INTO venta (id_venta, fecha_venta, cantidad_kg, cantidad_abonos, rif_negocio, rif_dist, id_inv) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
          idVenta,
          fecha,
          cantidad_kg,
          cantidad_abonos,
          negocio.rif_negocio,
          distribuidor.rif_dist,
          inventario.id_inv,
        ],
      );
    }

    alasql(
      "UPDATE inventario SET cantidad_kg = ? WHERE id_inv = ?",
      [inventario.cantidad_kg - cantidad_kg, inventario.id_inv],
    );

    this.abonarVenta(idVenta);
    this.dispatchEvent(
      new CustomEvent("cambioInfo", {
        detail: { rif_negocio: negocio.rif_negocio, cantidad_kg, monto },
      }),
    );
    return true;
  }

  obtenerVentasPorNegocio(rif_negocio) {
    const fecha = this.#fecha.toISOString().slice(0, 10);
    const result = alasql(sql`
      SELECT venta.id_venta,
             venta.fecha_venta,
             venta.cantidad_kg,
             venta.cantidad_abonos,
             venta.rif_negocio,
             inventario.id_tipo,
             tipo_cafe.nombre AS tipo_cafe,
             AVG(cafe.precio_kg_bs) AS precio_kg_bs,
             COUNT(pago_venta.id_pago) AS abonos_pagados
      FROM venta
      INNER JOIN inventario ON venta.id_inv = inventario.id_inv
      INNER JOIN tipo_cafe ON inventario.id_tipo = tipo_cafe.id_tipo
      LEFT JOIN cafe ON inventario.id_tipo = cafe.id_tipo
      LEFT JOIN pago_venta ON venta.id_venta = pago_venta.id_venta
      WHERE venta.rif_negocio = ?
      GROUP BY venta.id_venta,
               venta.fecha_venta,
               venta.cantidad_kg,
               venta.cantidad_abonos,
               venta.rif_negocio,
               inventario.id_tipo,
               tipo_cafe.nombre
      ORDER BY venta.fecha_venta DESC, venta.id_venta DESC
    `, [rif_negocio]);

    return result
      .map((venta) => ({
        ...venta,
        monto: venta.cantidad_kg * venta.precio_kg_bs,
      }))
      .filter((venta) => (
        normalizarFecha(venta.fecha_venta) === fecha ||
        venta.abonos_pagados < venta.cantidad_abonos
      ));
  }

  obtenerVentas() {
    const result = alasql(sql`
      SELECT venta.id_venta,
             venta.fecha_venta,
             venta.cantidad_kg,
             venta.cantidad_abonos,
             negocio.nombre AS nombre_negocio,
             tipo_cafe.nombre AS tipo_cafe,
             AVG(cafe.precio_kg_bs) AS precio_kg_bs,
             COUNT(pago_venta.id_pago) AS abonos_pagados,
             SUM(pago_venta.monto) AS monto_pagado
      FROM venta
      INNER JOIN negocio ON venta.rif_negocio = negocio.rif_negocio
      INNER JOIN inventario ON venta.id_inv = inventario.id_inv
      INNER JOIN tipo_cafe ON inventario.id_tipo = tipo_cafe.id_tipo
      LEFT JOIN cafe ON inventario.id_tipo = cafe.id_tipo
      LEFT JOIN pago_venta ON venta.id_venta = pago_venta.id_venta
      GROUP BY venta.id_venta,
               venta.fecha_venta,
               venta.cantidad_kg,
               venta.cantidad_abonos,
               negocio.nombre,
               tipo_cafe.nombre
      ORDER BY venta.fecha_venta DESC, venta.id_venta DESC
    `);

    return result.map((venta) => {
      const monto = venta.cantidad_kg * venta.precio_kg_bs;

      return {
        ...venta,
        monto,
        monto_pagado: venta.monto_pagado || 0,
        monto_debe: monto - (venta.monto_pagado || 0),
      };
    });
  }

  obtenerAbonosVentaDelDia() {
    const fecha = this.#fecha.toISOString().slice(0, 10);
    const result = alasql(sql`
      SELECT pago_venta.id_pago,
             pago_venta.fecha_pago,
             pago_venta.monto,
             negocio.nombre AS nombre_negocio,
             tipo_cafe.nombre AS tipo_cafe
      FROM pago_venta
      INNER JOIN venta ON pago_venta.id_venta = venta.id_venta
      INNER JOIN negocio ON venta.rif_negocio = negocio.rif_negocio
      INNER JOIN inventario ON venta.id_inv = inventario.id_inv
      INNER JOIN tipo_cafe ON inventario.id_tipo = tipo_cafe.id_tipo
      WHERE pago_venta.fecha_pago = ?
      ORDER BY pago_venta.id_pago DESC
    `, [fecha]);
    return result;
  }

  abonarVenta(id_venta) {
    const venta = alasql(
      "SELECT venta.*, inventario.id_tipo FROM venta INNER JOIN inventario ON venta.id_inv = inventario.id_inv WHERE venta.id_venta = ?",
      [id_venta],
    )[0];

    if (!venta) {
      return false;
    }

    const [{ abonos_pagados }] = alasql(
      "SELECT COUNT(*) AS abonos_pagados FROM pago_venta WHERE id_venta = ?",
      [id_venta],
    );

    if (abonos_pagados >= venta.cantidad_abonos) {
      return false;
    }

    const precio = alasql(
      "SELECT AVG(precio_kg_bs) AS precio_kg_bs FROM cafe WHERE id_tipo = ?",
      [venta.id_tipo],
    )[0]?.precio_kg_bs || 0;
    const monto = (venta.cantidad_kg * precio) / venta.cantidad_abonos;
    const distribuidor = this.obtenerDistribuidores()[0];
    const [{ ultimo_pago }] = alasql(
      "SELECT MAX(id_pago) AS ultimo_pago FROM pago_venta",
    );

    alasql(
      "INSERT INTO pago_venta (id_pago, fecha_pago, monto, id_venta) VALUES (?, ?, ?, ?)",
      [
        (ultimo_pago || 0) + 1,
        this.#fecha.toISOString().slice(0, 10),
        monto,
        id_venta,
      ],
    );
    alasql(
      "UPDATE distribuidor SET saldo_bs = ? WHERE rif_dist = ?",
      [distribuidor.saldo_bs + monto, distribuidor.rif_dist],
    );

    this.dispatchEvent(
      new CustomEvent("cambioInfo", {
        detail: { id_venta, monto },
      }),
    );
    return true;
  }
  
  obtenerNegocios() {
    const result = alasql(sql`
      SELECT negocio.nombre AS nombre_negocio, contacto.nombre AS nombre_contacto, * 
      FROM negocio LEFT JOIN contacto ON negocio.cedula_contacto = contacto.cedula_contacto
    `);
    return result;
  }

  obtenerProductosPorProveedor(rif_proveedor) {
    const result = alasql(sql`
      SELECT cafe.nombre AS nombre_cafe, cafe.precio_kg_bs, tipo_cafe.nombre AS tipo_cafe, * 
      FROM cafe INNER JOIN tipo_cafe ON cafe.id_tipo = tipo_cafe.id_tipo
      WHERE cafe.rif_proveedor = ?
    `, [rif_proveedor]);
    return result;
  }
}

function normalizarFecha(fecha) {
  if (fecha instanceof Date) {
    return fecha.toISOString().slice(0, 10);
  }

  return String(fecha).slice(0, 10);
}

function sql(strings, ...values) {return strings.reduce((result, string, i) => result + string + (values[i] || ''), '');}

export default new Repositorio();
