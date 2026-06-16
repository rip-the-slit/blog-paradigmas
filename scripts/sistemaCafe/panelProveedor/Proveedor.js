import FormularioProducto from "./FormularioProducto.js";
import MenuContacto from "../MenuContacto.js";

export default class Proveedor {
  #repositorio;
  #nodo;

  constructor(data, repositorio) {
    this.data = data;
    this.#repositorio = repositorio;
  }

  render() {
    const proveedor = this.data;
    const plantillaProveedor = document.getElementById("proveedor").content;
    const plantillaProducto = document.getElementById("producto").content;
    const clon = plantillaProveedor.cloneNode(true);

    this.#nodo =  clon.querySelector(".proveedor")
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
    const contenedor = this.#nodo;
    contacto.addEventListener("click", (evento) => {
      evento.stopPropagation();
      new MenuContacto(this.#repositorio, {
        onSeleccionar: (contactoSeleccionado) => {
          this.#repositorio.actualizarContactoProveedor(
            proveedor.rif_proveedor,
            contactoSeleccionado.cedula_contacto,
          );
        },
      }).abrir(contacto, contenedor);
    });

    const productos = this.#repositorio.obtenerProductosPorProveedor(
      proveedor.rif_proveedor,
    );
    const ulProductos = clon.querySelector(".productos");
    const botonAgregarProducto = this.#crearBotonAgregarProducto(proveedor);

    for (const producto of productos) {
      const clonProducto = plantillaProducto.cloneNode(true);
      clonProducto.querySelector(".nombre").textContent = producto.nombre_cafe;
      clonProducto.querySelector(".precio").textContent =
        `Precio: ${producto.precio_kg_bs} Bs/kg`;
      clonProducto.querySelector(".tipo").textContent =
        `Tipo: ${producto.tipo_cafe}`;
      this.#hacerProductoArrastrable(clonProducto, producto);

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
      new FormularioProducto(proveedor, this.#repositorio).abrir(boton, this.#nodo);
    });

    item.appendChild(boton);
    return item;
  }

  #hacerProductoArrastrable(clonProducto, producto) {
    const nodoProducto = clonProducto.querySelector(".producto");

    nodoProducto.draggable = true;
    nodoProducto.addEventListener("dragstart", (evento) => {
      evento.dataTransfer.effectAllowed = "copy";
      const data = JSON.stringify({
        id_cafe: producto.id_cafe,
        nombre_cafe: producto.nombre_cafe,
        precio_kg_bs: producto.precio_kg_bs,
        id_tipo: producto.id_tipo,
        tipo_cafe: producto.tipo_cafe,
        rif_proveedor: producto.rif_proveedor,
      });

      evento.dataTransfer.setData("application/json", data);
      evento.dataTransfer.setData("text/plain", data);
    });
  }

}
