import MenuContacto from "../MenuContacto.js";

export default class Negocio {
  #repositorio;

  constructor(data, repositorio) {
    this.data = data;
    this.#repositorio = repositorio;
  }

  render() {
    const negocio = this.data;
    const plantillaNegocio = document.getElementById("negocio").content;
    const clon = plantillaNegocio.cloneNode(true);

    clon.querySelector(".encabezado h3").textContent = negocio.nombre_negocio;
    clon.querySelector(".rif").textContent = negocio.rif_negocio;
    clon.querySelector(".direccion").textContent =
      negocio.direccion || "Sin direccion";
    clon.querySelector(".nombre-contacto").textContent =
      negocio.nombre_contacto || "Sin contacto";
    clon.querySelector(".telefono-contacto").textContent =
      negocio.numero_telf || "Sin telefono";
    clon.querySelector(".cedula-contacto").textContent =
      negocio.cedula_contacto || "Sin cedula";

    const contacto = clon.querySelector(".contacto");
    const contenedor = clon.querySelector(".negocio");
    contacto.addEventListener("click", (evento) => {
      evento.stopPropagation();
      new MenuContacto(this.#repositorio, {
        onSeleccionar: (contactoSeleccionado) => {
          this.#repositorio.actualizarContactoNegocio(
            negocio.rif_negocio,
            contactoSeleccionado.cedula_contacto,
          );
        },
      }).abrir(contacto, contenedor);
    });

    const listaVentas = clon.querySelector(".productos");
    this.#configurarDrop(listaVentas, negocio);
    this.#renderVentas(listaVentas, negocio);

    return clon;
  }

  #configurarDrop(listaVentas, negocio) {
    listaVentas.addEventListener("dragover", (evento) => {
      evento.preventDefault();
      listaVentas.classList.add("inventario-drop-activo");
    });

    listaVentas.addEventListener("dragleave", () => {
      listaVentas.classList.remove("inventario-drop-activo");
    });

    listaVentas.addEventListener("drop", (evento) => {
      evento.preventDefault();
      listaVentas.classList.remove("inventario-drop-activo");

      const data =
        evento.dataTransfer.getData("application/json") ||
        evento.dataTransfer.getData("text/plain");
      if (!data) {
        return;
      }

      const inventario = this.#leerInventarioTransferido(data);
      if (!inventario) {
        return;
      }

      this.#agregarVentaPendiente(listaVentas, negocio, inventario);
    });
  }

  #leerInventarioTransferido(data) {
    try {
      const inventario = JSON.parse(data);

      if (!this.#esInventarioCafe(inventario)) {
        return null;
      }

      return inventario;
    } catch {
      return null;
    }
  }

  #esInventarioCafe(inventario) {
    return Boolean(
      inventario &&
        typeof inventario === "object" &&
        Number.isFinite(inventario.id_inv) &&
        Number.isFinite(inventario.id_tipo) &&
        typeof inventario.tipo_cafe === "string" &&
        inventario.tipo_cafe.trim() !== "" &&
        Number.isFinite(inventario.cantidad_kg) &&
        Number.isFinite(inventario.precio_kg_bs),
    );
  }

  #renderVentas(listaVentas, negocio) {
    const ventas = this.#repositorio.obtenerVentasPorNegocio(negocio.rif_negocio);
    const plantillaInventario = document.getElementById("inventario").content;

    for (const venta of ventas) {
      const clon = plantillaInventario.cloneNode(true);
      const item = clon.querySelector(".inventario");
      const contador = clon.querySelector(".contador");

      item.classList.add("venta-negocio");
      item.querySelector(".tipo").textContent = venta.tipo_cafe;
      contador.textContent = `${venta.cantidad_kg.toFixed(2)} kg`;
      item.appendChild(this.#crearProgresoVenta(venta));
      listaVentas.appendChild(clon);
    }
  }

  #agregarVentaPendiente(listaVentas, negocio, inventario) {
    const plantillaInventario = document.getElementById("inventario").content;
    const clon = plantillaInventario.cloneNode(true);
    const item = clon.querySelector(".inventario");
    const contador = clon.querySelector(".contador");
    const inputKg = this.#crearInputNumero("0", "0.01");
    const inputAbonos = this.#crearInputNumero("1", "1");
    const total = document.createElement("span");

    inputAbonos.value = "1";
    item.classList.add("inventario-pendiente", "venta-pendiente");
    item.querySelector(".tipo").textContent = inventario.tipo_cafe;
    total.textContent = "0.00 Bs";
    contador.replaceChildren(
      inputKg,
      document.createTextNode("kg=("),
      total,
      document.createTextNode(") en "),
      inputAbonos,
      document.createTextNode(" abonos"),
    );

    inputKg.addEventListener("input", () => {
      const cantidadKg = Number(inputKg.value) || 0;
      total.textContent =
        `${(cantidadKg * inventario.precio_kg_bs).toFixed(2)} Bs`;
    });

    const confirmar = (evento) => {
      if (evento.key !== "Enter") {
        return;
      }

      evento.preventDefault();
      const cantidadKg = Number(inputKg.value);
      const cantidadAbonos = Number(inputAbonos.value);
      if (this.#repositorio.venderCafe(
        negocio,
        inventario,
        cantidadKg,
        cantidadAbonos,
      )) {
        item.remove();
      }
    };

    inputKg.addEventListener("keydown", confirmar);
    inputAbonos.addEventListener("keydown", confirmar);
    item.addEventListener("focusout", () => {
      setTimeout(() => {
        if (!item.contains(document.activeElement)) {
          item.remove();
        }
      }, 0);
    });

    listaVentas.appendChild(clon);
    inputKg.focus();
  }

  #crearInputNumero(min, step) {
    const input = document.createElement("input");

    input.type = "number";
    input.min = min;
    input.step = step;
    input.placeholder = min;

    return input;
  }

  #crearProgresoVenta(venta) {
    const contenedor = document.createElement("div");
    const barra = document.createElement("div");
    const progreso = document.createElement("div");
    const abonar = document.createElement("button");
    const porcentaje = Math.min(
      (venta.abonos_pagados / venta.cantidad_abonos) * 100,
      100,
    );

    contenedor.className = "progreso-venta";
    barra.className = "progreso-venta__barra";
    progreso.className = "progreso-venta__valor";
    progreso.style.width = `${porcentaje}%`;
    barra.appendChild(progreso);
    contenedor.appendChild(barra);

    if (venta.abonos_pagados < venta.cantidad_abonos) {
      abonar.type = "button";
      abonar.textContent = "+";
      abonar.ariaLabel = "Agregar abono";
      abonar.addEventListener("click", () => {
        this.#repositorio.abonarVenta(venta.id_venta);
      });
      contenedor.appendChild(abonar);
    }

    return contenedor;
  }
}
