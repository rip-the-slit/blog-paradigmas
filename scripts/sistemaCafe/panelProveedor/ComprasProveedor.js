export default class ComprasProveedor {
  #repositorio;
  #modo = "diarias";
  #nodo;

  constructor(repositorio) {
    this.#repositorio = repositorio;
  }

  render() {
    this.#nodo = document.createElement("div");
    this.#nodo.className = "compras-proveedor";
    this.#nodo.append(this.#crearModos(), this.#crearLista());
    return this.#nodo;
  }

  actualizar() {
    this.#nodo?.replaceChildren(this.#crearModos(), this.#crearLista());
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
        this.#nodo.replaceChildren(this.#crearModos(), this.#crearLista());
      });

      modos.appendChild(boton);
    }

    return modos;
  }

  #crearLista() {
    const contenedor = document.createElement("div");
    const lista = document.createElement("ul");
    const total = document.createElement("div");
    const compras = this.#agruparCompras();
    const totalGastado = compras.reduce((suma, compra) => suma + compra.monto, 0);

    contenedor.className = "compras-proveedor__lista";

    if (compras.length === 0) {
      const vacio = document.createElement("li");

      vacio.className = "compras-proveedor__vacio";
      vacio.textContent = "Sin compras registradas";
      lista.appendChild(vacio);
    }

    for (const compra of compras) {
      const item = document.createElement("li");
      const periodo = document.createElement("span");
      const detalle = document.createElement("small");
      const monto = document.createElement("strong");

      periodo.textContent = compra.periodo;
      detalle.textContent =
        `${compra.cantidad_kg.toFixed(2)} kg - ${compra.detalle}`;
      monto.textContent = `${compra.monto.toFixed(2)} Bs`;

      item.append(periodo, detalle, monto);
      lista.appendChild(item);
    }

    total.className = "compras-proveedor__total";
    total.textContent = `Total gastado: ${totalGastado.toFixed(2)} Bs`;
    contenedor.append(lista, total);

    return contenedor;
  }

  #agruparCompras() {
    const compras = this.#repositorio.obtenerCompras();
    const grupos = new Map();

    for (const compra of compras) {
      const periodo = this.#obtenerPeriodo(compra.fecha_compra);
      const grupo = grupos.get(periodo) || {
        periodo,
        cantidad_kg: 0,
        monto: 0,
        detalles: new Set(),
        proveedores: new Set(),
      };

      grupo.cantidad_kg += compra.cantidad_kg;
      grupo.monto += compra.monto;
      grupo.detalles.add(compra.tipo_cafe);
      grupo.proveedores.add(compra.nombre_proveedor);
      grupos.set(periodo, grupo);
    }

    return [...grupos.values()].map((grupo) => ({
      ...grupo,
      detalle: `${[...grupo.detalles].join(", ")} | ${[...grupo.proveedores].join(", ")}`,
    }));
  }

  #obtenerPeriodo(fechaCompra) {
    const fecha = new Date(`${this.#normalizarFecha(fechaCompra)}T00:00:00`);

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

  #normalizarFecha(fecha) {
    if (fecha instanceof Date) {
      return fecha.toISOString().slice(0, 10);
    }

    return String(fecha).slice(0, 10);
  }
}
