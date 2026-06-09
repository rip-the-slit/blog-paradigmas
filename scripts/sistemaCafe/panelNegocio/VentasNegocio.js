const BS_POR_DOLAR = 563;

export default class VentasNegocio {
  #repositorio;
  #modo = "diarias";
  #nodo;

  constructor(repositorio) {
    this.#repositorio = repositorio;
  }

  render() {
    this.#nodo = document.createElement("div");
    this.#nodo.className = "compras-proveedor ventas-negocio-reporte";
    this.#nodo.append(
      this.#crearModos(),
      this.#crearLista(),
      this.#crearAbonos(),
    );
    return this.#nodo;
  }

  #crearModos() {
    const modos = document.createElement("div");

    modos.className = "compras-proveedor__modos";

    for (const modo of ["diarias", "semanales", "mensuales"]) {
      const boton = document.createElement("button");

      boton.type = "button";
      boton.textContent = modo;
      boton.classList.toggle("activo", modo === this.#modo);
      boton.addEventListener("click", () => {
        this.#modo = modo;
        this.#nodo.replaceChildren(
          this.#crearModos(),
          this.#crearLista(),
          this.#crearAbonos(),
        );
      });

      modos.appendChild(boton);
    }

    return modos;
  }

  #crearLista() {
    const contenedor = document.createElement("div");
    const lista = document.createElement("ul");
    const total = document.createElement("div");
    const ventas = this.#agruparVentas();
    const totalGanado = ventas.reduce((suma, venta) => suma + venta.monto, 0);

    contenedor.className = "compras-proveedor__lista";

    if (ventas.length === 0) {
      const vacio = document.createElement("li");

      vacio.className = "compras-proveedor__vacio";
      vacio.textContent = "Sin ventas registradas";
      lista.appendChild(vacio);
    }

    for (const venta of ventas) {
      const item = document.createElement("li");
      const periodo = document.createElement("span");
      const detalle = document.createElement("small");
      const monto = document.createElement("strong");

      periodo.textContent = venta.periodo;
      detalle.textContent =
        `${venta.cantidad_kg.toFixed(2)} kg - ${venta.detalle}`;
      monto.textContent = this.#formatearDolares(venta.monto);

      item.append(periodo, detalle, monto);
      lista.appendChild(item);
    }

    total.className = "compras-proveedor__total";
    total.textContent =
      `Ganancias totales: ${this.#formatearDolares(totalGanado)}`;
    contenedor.append(lista, total);

    return contenedor;
  }

  #crearAbonos() {
    const contenedor = document.createElement("div");
    const titulo = document.createElement("h4");
    const lista = document.createElement("ul");
    const resumen = document.createElement("div");
    const abonos = this.#repositorio.obtenerAbonosVentaDelDia();
    const ventas = this.#repositorio.obtenerVentas();
    const totalPagado = abonos.reduce((suma, abono) => suma + abono.monto, 0);
    const totalDebe = ventas.reduce((suma, venta) => suma + venta.monto_debe, 0);

    contenedor.className = "ventas-negocio-reporte__abonos";
    titulo.textContent = "Abonos de hoy";

    if (abonos.length === 0) {
      const vacio = document.createElement("li");

      vacio.className = "compras-proveedor__vacio";
      vacio.textContent = "Sin abonos pagados hoy";
      lista.appendChild(vacio);
    }

    for (const abono of abonos) {
      const item = document.createElement("li");
      const negocio = document.createElement("span");
      const detalle = document.createElement("small");
      const monto = document.createElement("strong");

      negocio.textContent = abono.nombre_negocio;
      detalle.textContent = abono.tipo_cafe;
      monto.textContent = this.#formatearDolares(abono.monto);
      item.append(negocio, detalle, monto);
      lista.appendChild(item);
    }

    resumen.className = "compras-proveedor__total";
    resumen.textContent =
      `Pagado hoy: ${this.#formatearDolares(totalPagado)} | Deben: ${this.#formatearDolares(totalDebe)}`;
    contenedor.append(titulo, lista, resumen);

    return contenedor;
  }

  #agruparVentas() {
    const ventas = this.#repositorio.obtenerVentas();
    const grupos = new Map();

    for (const venta of ventas) {
      const periodo = this.#obtenerPeriodo(venta.fecha_venta);
      const grupo = grupos.get(periodo) || {
        periodo,
        cantidad_kg: 0,
        monto: 0,
        detalles: new Set(),
        negocios: new Set(),
      };

      grupo.cantidad_kg += venta.cantidad_kg;
      grupo.monto += venta.monto;
      grupo.detalles.add(venta.tipo_cafe);
      grupo.negocios.add(venta.nombre_negocio);
      grupos.set(periodo, grupo);
    }

    return [...grupos.values()].map((grupo) => ({
      ...grupo,
      detalle: `${[...grupo.detalles].join(", ")} | ${[...grupo.negocios].join(", ")}`,
    }));
  }

  #obtenerPeriodo(fechaVenta) {
    const fecha = new Date(`${this.#normalizarFecha(fechaVenta)}T00:00:00`);

    if (this.#modo === "diarias") {
      return fecha.toLocaleDateString("es-VE");
    }

    if (this.#modo === "mensuales") {
      return fecha.toLocaleDateString("es-VE", {
        month: "long",
        year: "numeric",
      });
    }

    return `Semana ${this.#obtenerSemana(fecha)} de ${fecha.getFullYear()}`;
  }

  #obtenerSemana(fecha) {
    const inicio = new Date(fecha.getFullYear(), 0, 1);
    const dias = Math.floor((fecha - inicio) / 86400000);

    return Math.ceil((dias + inicio.getDay() + 1) / 7);
  }

  #formatearDolares(montoBs) {
    return `$${(montoBs / BS_POR_DOLAR).toFixed(2)}`;
  }

  #normalizarFecha(fecha) {
    if (fecha instanceof Date) {
      return fecha.toISOString().slice(0, 10);
    }

    return String(fecha).slice(0, 10);
  }
}
