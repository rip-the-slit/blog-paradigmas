import MenuContactoProveedor from "./MenuContactoProveedor.js";
import FormularioProducto from "./FormularioProducto.js";

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

    clon.querySelector(".encabezado h3").textContent =
      proveedor.nombre_proveedor;
    clon.querySelector(".rif").textContent = proveedor.rif_proveedor;
    clon.querySelector(".nombre-contacto").textContent =
      proveedor.nombre_contacto || "Sin contacto";
    clon.querySelector(".telefono-contacto").textContent =
      proveedor.numero_telf || "Sin telefono";
    clon.querySelector(".cedula-contacto").textContent =
      proveedor.cedula_contacto || "Sin cedula";

    const contacto = clon.querySelector(".contacto");
    contacto.addEventListener("click", (evento) => {
      evento.stopPropagation();
      new MenuContactoProveedor(proveedor, this.#repositorio).abrir(contacto);
    });

    const productos = this.#repositorio.obtenerProductosPorProveedor(
      proveedor.rif_proveedor,
    );
    const ulProductos = clon.querySelector(".productos");
    const botonAgregarProducto = this.#crearBotonAgregarProducto(proveedor);

    if (productos.length === 0) {
      const li = document.createElement("li");
      li.textContent = "No hay productos disponibles";
      li.className = "productos-vacio";
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

    ulProductos.appendChild(botonAgregarProducto);

    return clon;
  }

  #crearBotonAgregarProducto(proveedor) {
    const item = document.createElement("li");
    const boton = document.createElement("button");

    item.className = "agregar-producto";
    boton.type = "button";
    boton.textContent = "+";
    boton.ariaLabel = "Agregar producto";
    boton.addEventListener("click", (evento) => {
      evento.stopPropagation();
      new FormularioProducto(proveedor, this.#repositorio).abrir(boton);
    });

    item.appendChild(boton);
    return item;
  }
}
