import { ejecutar, iniciar } from "./asyncUI.js";

export default class BarraInfo {
  #nodo;
  #repositorio;
  #selector;
  #renderId = 0;

  constructor(nodo, repositorio) {
    this.#nodo = nodo;
    this.#repositorio = repositorio;
    const contenedor = document.createElement("div");
    contenedor.id = "sesion-distribuidor";
    const etiqueta = document.createElement("label");
    etiqueta.textContent = "Distribuidor";
    etiqueta.htmlFor = "seleccionar-distribuidor";
    this.#selector = document.createElement("select");
    this.#selector.id = etiqueta.htmlFor;
    this.#selector.addEventListener("change", () => {
      const rif = this.#selector.value;
      iniciar(async () => {
        const exito = await ejecutar(contenedor, async () => {
          if (rif) return this.#repositorio.seleccionarDistribuidor(rif);
          this.#repositorio.cerrarSesionDistribuidor();
        });
        if (!exito) this.#selector.value = this.#repositorio.distribuidorSesion?.rif_dist || "";
      });
    });
    contenedor.append(etiqueta, this.#selector);
    nodo.appendChild(contenedor);
    this.#configurarFecha();
    iniciar(() => this.render());
  }

  async render() {
    const renderId = ++this.#renderId;
    const version = this.#repositorio.version;
    const fecha = this.#repositorio.fecha;
    const distribuidor = this.#repositorio.distribuidorSesion;
    this.#nodo.querySelector("#fecha p").textContent = fecha.toLocaleDateString("es-VE", {
      day: "numeric", month: "long", year: "numeric",
    });
    this.#nodo.querySelector("#saldo p").textContent = `$${distribuidor?.saldo_bs?.toFixed(2) || "0.00"}`;
    const distribuidores = await this.#repositorio.obtenerDistribuidores();
    if (renderId !== this.#renderId || version !== this.#repositorio.version) return;
    const opciones = [new Option(distribuidores.length ? "Seleccione un distribuidor" : "Sin distribuidores: importe los datos", "")];
    for (const item of distribuidores) opciones.push(new Option(`${item.nombre} (${item.rif_dist})`, item.rif_dist));
    this.#selector.replaceChildren(...opciones);
    this.#selector.value = this.#repositorio.distribuidorSesion?.rif_dist || "";
  }

  #configurarFecha() {
    const nodoFecha = this.#nodo.querySelector("#fecha");
    nodoFecha.addEventListener("click", () => {
      if (this.#repositorio.escribiendo || nodoFecha.querySelector("input")) return;
      const input = document.createElement("input");
      const minima = this.#repositorio.fecha;
      minima.setDate(minima.getDate() + 1);
      input.type = "date";
      input.min = `${minima.getFullYear()}-${String(minima.getMonth() + 1).padStart(2, "0")}-${String(minima.getDate()).padStart(2, "0")}`;
      input.value = input.min;
      nodoFecha.querySelector("p").replaceChildren(input);
      input.focus();
      input.showPicker?.();
      input.addEventListener("change", () => {
        if (input.validity.valid && input.value) this.#repositorio.fecha = new Date(`${input.value}T00:00:00`);
      });
    });
  }
}
