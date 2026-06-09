export default class PanelInventario {
  #nodo;
  #repositorio;

  constructor(nodo, repositorio) {
    this.#nodo = nodo;
    this.#repositorio = repositorio;
    this.#configurarDrop();
    this.render();
  }

  render() {
    const inventario = this.#repositorio.obtenerInventario();
    const plantillaInventario = document.getElementById("inventario").content;
    const ul = this.#nodo.querySelector("ul");

    ul.innerHTML = "";

    for (const item of inventario) {
      const clon = plantillaInventario.cloneNode(true);
      const nodoInventario = clon.querySelector(".inventario");

      clon.querySelector(".tipo").textContent = item.tipo_cafe;
      clon.querySelector(".contador").textContent = `${item.cantidad_kg} kg`;
      this.#hacerInventarioArrastrable(nodoInventario, item);
      ul.appendChild(clon);
    }
  }

  #hacerInventarioArrastrable(nodoInventario, item) {
    nodoInventario.draggable = true;
    nodoInventario.addEventListener("dragstart", (evento) => {
      evento.dataTransfer.effectAllowed = "copy";
      const data = JSON.stringify({
        id_inv: item.id_inv,
        id_tipo: item.id_tipo,
        tipo_cafe: item.tipo_cafe,
        cantidad_kg: item.cantidad_kg,
        precio_kg_bs: item.precio_kg_bs,
      });

      evento.dataTransfer.setData("application/json", data);
      evento.dataTransfer.setData("text/plain", data);
    });
  }

  #configurarDrop() {
    const ul = this.#nodo.querySelector("ul");

    ul.addEventListener("dragover", (evento) => {
      evento.preventDefault();
      ul.classList.add("inventario-drop-activo");
    });

    ul.addEventListener("dragleave", () => {
      ul.classList.remove("inventario-drop-activo");
    });

    ul.addEventListener("drop", (evento) => {
      evento.preventDefault();
      ul.classList.remove("inventario-drop-activo");

      const data =
        evento.dataTransfer.getData("application/json") ||
        evento.dataTransfer.getData("text/plain");
      if (!data) {
        return;
      }

      this.#agregarCompraPendiente(JSON.parse(data));
    });
  }

  #agregarCompraPendiente(producto) {
    const plantillaInventario = document.getElementById("inventario").content;
    const clon = plantillaInventario.cloneNode(true);
    const item = clon.querySelector(".inventario");
    const contador = clon.querySelector(".contador");
    const input = document.createElement("input");
    const total = document.createElement("span");

    item.classList.add("inventario-pendiente");
    item.querySelector(".tipo").textContent = producto.tipo_cafe;
    input.type = "number";
    input.min = "0";
    input.step = "0.01";
    input.placeholder = "0";
    total.textContent = "0.00 Bs";
    contador.replaceChildren(
      input,
      document.createTextNode("kg=("),
      total,
      document.createTextNode(")"),
    );

    input.addEventListener("input", () => {
      const cantidadKg = Number(input.value) || 0;
      total.textContent =
        `${(cantidadKg * producto.precio_kg_bs).toFixed(2)} Bs`;
    });

    input.addEventListener("keydown", (evento) => {
      if (evento.key !== "Enter") {
        return;
      }

      evento.preventDefault();
      const cantidadKg = Number(input.value);
      if (this.#repositorio.comprarCafe(producto, cantidadKg)) {
        item.remove();
      }
    });

    input.addEventListener("blur", () => {
      item.remove();
    });

    this.#nodo.querySelector("ul").appendChild(clon);
    input.focus();
  }
}
