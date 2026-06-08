export default class Proveedor {
  #repositorio;
  #cantidadKgPorProducto = new Map();

  constructor(data, repositorio) {
    this.data = data;
    this.#repositorio = repositorio;
  }

  render() {
    const proveedor = this.data;
    const plantillaProveedor = document.getElementById("proveedor").content;
    const plantillaProducto = document.getElementById("producto").content;
    const clon = plantillaProveedor.cloneNode(true);

    clon.querySelector(".encabezado > h3").textContent =
      proveedor.nombre_proveedor;
    clon.querySelector(".encabezado > p").textContent = proveedor.rif_proveedor;

    const productos = this.#repositorio.obtenerProductosPorProveedor(
      proveedor.rif_proveedor,
    );
    const ulProductos = clon.querySelector(".productos");

    if (productos.length === 0) {
      const li = document.createElement("li");
      li.textContent = "No hay productos disponibles";
      ulProductos.appendChild(li);
    }

    for (const producto of productos) {
      const clonProducto = plantillaProducto.cloneNode(true);
      clonProducto.querySelector(".nombre").textContent = producto.nombre_cafe;
      clonProducto.querySelector(".precio").textContent =
        `Precio: ${producto.precio_kg_bs} Bs/kg`;
      clonProducto.querySelector(".tipo").textContent =
        `Tipo: ${producto.tipo_cafe}`;

        this.#cantidadKgPorProducto.set(producto.nombre_cafe, 0);

      ulProductos.appendChild(clonProducto);
    }

    return clon;
  }
}
