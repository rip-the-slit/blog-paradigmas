const API = new URL("../../api/sistemaCafe/", import.meta.url);

class Repositorio extends EventTarget {
  #fecha = new Date();
  #distribuidor = null;
  #version = 0;
  #pendientes = 0;
  #escribiendo = false;
  #controlador = new AbortController();

  get fecha() { return new Date(this.#fecha); }
  set fecha(val) {
    if (this.#escribiendo) return;
    if (!(val instanceof Date) || !Number.isFinite(val.getTime())) return;
    this.#fecha = new Date(val);
    this.#invalidar();
    this.#emitir("cambioInfo", { fecha: this.fecha });
  }
  get distribuidorSesion() { return this.#distribuidor; }
  get escribiendo() { return this.#escribiendo; }
  get version() { return this.#version; }
  get fechaSQL() {
    return `${this.#fecha.getFullYear()}-${String(this.#fecha.getMonth() + 1).padStart(2, "0")}-${String(this.#fecha.getDate()).padStart(2, "0")}`;
  }

  #emitir(nombre, detail) {
    this.dispatchEvent(new CustomEvent(nombre, { detail }));
  }
  #invalidar() {
    this.#version++;
    this.#controlador.abort();
    this.#controlador = new AbortController();
  }

  async #solicitar(recurso, datos = {}, escritura = false, scoped = true) {
    if (escritura && this.#escribiendo) throw new Error("Espere a que termine la operación pendiente");
    const version = this.#version;
    const url = new URL(`${recurso}.php`, API);
    const params = { ...datos };
    if (scoped) {
      if (!this.#distribuidor) throw new Error("Seleccione un distribuidor");
      params.rif_dist = this.#distribuidor.rif_dist;
    }
    const opciones = { method: escritura ? "POST" : "GET", cache: "no-store" };
    if (!escritura) opciones.signal = this.#controlador.signal;
    if (escritura) {
      opciones.headers = { "Content-Type": "application/json" };
      opciones.body = JSON.stringify(params);
    } else {
      Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
    }
    if (escritura) {
      this.#escribiendo = true;
      this.#emitir("escritura", true);
    }
    this.#emitir("carga", ++this.#pendientes);
    try {
      const response = await fetch(url, opciones);
      if (version !== this.#version) throw new DOMException("Solicitud anterior", "AbortError");
      let payload;
      try { payload = await response.json(); }
      catch { throw new Error("El servidor no devolvió JSON.."); }
      if (!response.ok || payload.error) throw new Error(payload.error?.message || `Error HTTP ${response.status}`);
      if (escritura) {
        this.#invalidar();
        if (payload.distribuidor) this.#distribuidor = payload.distribuidor;
      }
      return payload.data;
    } catch (error) {
      if (version !== this.#version) throw new DOMException("Solicitud anterior", "AbortError");
      if (error instanceof TypeError) throw new Error("No se pudo conectar con el servidor.");
      throw error;
    } finally {
      if (escritura) { this.#escribiendo = false; this.#emitir("escritura", false); }
      this.#emitir("carga", --this.#pendientes);
    }
  }

  async seleccionarDistribuidor(rif) {
    if (this.#escribiendo) throw new Error("Espere a que termine la operación pendiente");
    const distribuidores = await this.obtenerDistribuidores();
    const elegido = distribuidores.find((item) => item.rif_dist === rif);
    if (!elegido) throw new Error("Distribuidor no encontrado");
    this.#invalidar();
    this.#distribuidor = elegido;
    this.#emitir("cambioSesion", { distribuidor: elegido });
    return true;
  }
  cerrarSesionDistribuidor() {
    if (this.#escribiendo) return;
    this.#invalidar();
    this.#distribuidor = null;
    this.#emitir("cambioSesion", null);
  }

  async #leer(recurso, datos = {}) {
    if (!this.#distribuidor) return [];
    return this.#solicitar(recurso, datos);
  }
  async #guardar(recurso, datos, evento) {
    const result = await this.#solicitar(recurso, { accion: "crear", ...datos }, true);
    if (evento) this.#emitir(evento, result);
    return true;
  }

  obtenerDistribuidores() { return this.#solicitar("distribuidores", {}, false, false); }
  obtenerContactos() { return this.#solicitar("contactos", {}, false, false); }
  obtenerTiposCafe() { return this.#solicitar("tipos", {}, false, false); }
  obtenerProveedores() { return this.#leer("proveedores"); }
  obtenerNegocios() { return this.#leer("negocios"); }
  obtenerInventario() { return this.#leer("inventario"); }
  obtenerProductosPorProveedor(rif_proveedor) { return this.#leer("productos", { rif_proveedor }); }
  obtenerCompras() { return this.#leer("compras"); }
  obtenerVentas() { return this.#leer("ventas"); }
  obtenerVentasPorNegocio(rif_negocio) { return this.#leer("ventas", { rif_negocio, fecha: this.fechaSQL }); }
  obtenerAbonosVentaDelDia() { return this.#leer("abonos", { fecha: this.fechaSQL }); }

  async agregarContacto(contacto) {
    await this.#solicitar("contactos", { accion: "crear", ...contacto }, true, false);
    return true;
  }
  agregarProveedor(proveedor) { return this.#guardar("proveedores", proveedor, "cambioProveedor"); }
  agregarNegocio(negocio) { return this.#guardar("negocios", negocio, "cambioNegocio"); }
  actualizarContactoProveedor(rif_proveedor, cedula_contacto) {
    return this.#guardar("proveedores", { accion: "contacto", rif_proveedor, cedula_contacto }, "cambioProveedor");
  }
  actualizarContactoNegocio(rif_negocio, cedula_contacto) {
    return this.#guardar("negocios", { accion: "contacto", rif_negocio, cedula_contacto }, "cambioNegocio");
  }
  agregarProductoCafe(producto) { return this.#guardar("productos", producto, "cambioProveedor"); }
  comprarCafe(producto, cantidad_kg) {
    return this.#guardar("compras", { id_cafe: producto.id_cafe, cantidad_kg, fecha: this.fechaSQL }, "cambioInfo");
  }
  venderCafe(negocio, inventario, cantidad_kg, cantidad_abonos) {
    return this.#guardar("ventas", {
      rif_negocio: negocio.rif_negocio, id_inv: inventario.id_inv,
      precio_kg_bs: Math.round(inventario.precio_kg_bs * 100) / 100,
      cantidad_kg, cantidad_abonos, fecha: this.fechaSQL,
    }, "cambioInfo");
  }
  abonarVenta(id_venta) { return this.#guardar("abonos", { id_venta, fecha: this.fechaSQL }, "cambioInfo"); }
}

export default new Repositorio();
