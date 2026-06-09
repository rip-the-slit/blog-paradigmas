export default class PanelInventario {
  #nodo;
  #repositorio;

  constructor(nodo, repositorio) {
    this.#nodo = nodo;
    this.#repositorio = repositorio;
    this.render();
  }

  render() {
    const inventario = this.#repositorio.obtenerInventario();
    const plantillaInventario = document.getElementById("inventario").content;
    const ul = this.#nodo.querySelector("ul");

    ul.innerHTML = "";

    for (const item of inventario) {
      const clon = plantillaInventario.cloneNode(true);

      clon.querySelector(".tipo").textContent = item.tipo_cafe;
      clon.querySelector(".contador").textContent = `${item.cantidad_kg} kg`;
      ul.appendChild(clon);
    }
  }
}
