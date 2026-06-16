export default class BarraInfo {
  #nodo;
  #repositorio;
  #nodoSesion;
  #menuSesion;
  #loginSesion;
  #rifLoginSeleccionado;

  constructor(nodo, repositorio) {
    this.#nodo = nodo;
    this.#repositorio = repositorio;
    this.#configurarFecha();
    this.#configurarSesion();
    this.render();
  }

  render() {
    const fecha = this.#repositorio.fecha;
    const distribuidor = this.#repositorio.distribuidorSesion;
    const nodoFecha = this.#nodo.querySelector("#fecha p");
    const nodoSaldo = this.#nodo.querySelector("#saldo p");
    const nodoSesionNombre = this.#nodoSesion.querySelector("p");

    if (fecha) {
      const opcionesFecha = { day: "numeric", month: "long", year: "numeric" };
      nodoFecha.textContent =
        fecha?.toLocaleDateString("es-VE", opcionesFecha) || "";
    }

    nodoSaldo.textContent = `$${distribuidor?.saldo_bs?.toFixed(2) || "0.00"}`;
    nodoSesionNombre.textContent = distribuidor?.nombre || "Sin sesion";

    if (distribuidor) {
      this.#cerrarLoginSesion();
      return;
    }

    this.#abrirLoginSesion();
  }

  #configurarFecha() {
    const nodoFecha = this.#nodo.querySelector("#fecha");

    nodoFecha.addEventListener("click", () => {
      if (nodoFecha.querySelector("input")) {
        return;
      }

      const input = document.createElement("input");
      const fechaMinima = new Date(this.#repositorio.fecha);

      fechaMinima.setDate(fechaMinima.getDate() + 1);
      input.type = "date";
      input.min = this.#formatearFechaInput(fechaMinima);
      input.value = input.min;

      nodoFecha.querySelector("p").replaceChildren(input);
      input.focus();
      input.showPicker?.();

      input.addEventListener("change", () => {
        this.#repositorio.fecha = new Date(`${input.value}T00:00:00`);
      });
    });
  }

  #configurarSesion() {
    this.#nodoSesion = document.createElement("div");
    this.#nodoSesion.id = "sesion-distribuidor";
    this.#nodoSesion.innerHTML = "<div>Distribuidor</div><p>Sin sesion</p>";
    this.#nodoSesion.addEventListener("click", (evento) => {
      evento.stopPropagation();
      this.#alternarMenuSesion();
    });
    this.#nodo.appendChild(this.#nodoSesion);

    document.addEventListener("click", (evento) => {
      if (
        this.#menuSesion &&
        !this.#menuSesion.contains(evento.target) &&
        !this.#nodoSesion.contains(evento.target)
      ) {
        this.#cerrarMenuSesion();
      }
    });
  }

  #alternarMenuSesion() {
    if (this.#menuSesion) {
      this.#cerrarMenuSesion();
      return;
    }

    this.#abrirMenuSesion();
  }

  #abrirMenuSesion() {
    const menu = document.createElement("div");
    const titulo = document.createElement("h4");
    const lista = document.createElement("ul");

    menu.className = "menu-sesion";
    titulo.textContent = "Distribuidores";
    menu.append(titulo, lista);

    for (const distribuidor of this.#repositorio.obtenerDistribuidores()) {
      const item = document.createElement("li");
      const boton = document.createElement("button");
      const nombre = document.createElement("span");
      const rif = document.createElement("small");

      boton.type = "button";
      nombre.textContent = distribuidor.nombre;
      rif.textContent = distribuidor.rif_dist;
      boton.append(nombre, rif);
      boton.addEventListener("click", (evento) => {
        evento.stopPropagation();
        this.#cerrarMenuSesion();
        this.#abrirLoginSesion(distribuidor.rif_dist);
      });

      item.appendChild(boton);
      lista.appendChild(item);
    }

    this.#menuSesion = menu;
    this.#nodoSesion.appendChild(menu);
  }

  #cerrarMenuSesion() {
    this.#menuSesion?.remove();
    this.#menuSesion = null;
  }

  #abrirLoginSesion(rifDistribuidor = null) {
    const distribuidores = this.#repositorio.obtenerDistribuidores();
    const distribuidorSeleccionado =
      distribuidores.find((distribuidor) => distribuidor.rif_dist === rifDistribuidor) ||
      distribuidores[0];

    if (!distribuidorSeleccionado) {
      return;
    }

    this.#rifLoginSeleccionado = distribuidorSeleccionado.rif_dist;

    if (!this.#loginSesion) {
      this.#loginSesion = document.createElement("div");
      this.#loginSesion.className = "login-sesion";
      this.#nodo.closest("#sistema-cafe").appendChild(this.#loginSesion);
    }

    this.#renderLoginSesion();
  }

  #renderLoginSesion(mensajeError = "") {
    const distribuidores = this.#repositorio.obtenerDistribuidores();
    const distribuidor = distribuidores.find(
      (item) => item.rif_dist === this.#rifLoginSeleccionado,
    ) || distribuidores[0];
    const panel = document.createElement("div");
    const lista = document.createElement("div");
    const formulario = document.createElement("form");
    const titulo = document.createElement("h3");
    const rif = document.createElement("p");
    const input = document.createElement("input");
    const error = document.createElement("p");
    const boton = document.createElement("button");

    this.#rifLoginSeleccionado = distribuidor.rif_dist;
    panel.className = "login-sesion__panel";
    lista.className = "login-sesion__usuarios";
    formulario.className = "login-sesion__formulario";

    for (const item of distribuidores) {
      const botonUsuario = document.createElement("button");
      const nombreUsuario = document.createElement("span");
      const rifUsuario = document.createElement("small");

      botonUsuario.type = "button";
      botonUsuario.classList.toggle(
        "activo",
        item.rif_dist === this.#rifLoginSeleccionado,
      );
      nombreUsuario.textContent = item.nombre;
      rifUsuario.textContent = item.rif_dist;
      botonUsuario.append(nombreUsuario, rifUsuario);
      botonUsuario.addEventListener("click", () => {
        this.#rifLoginSeleccionado = item.rif_dist;
        this.#renderLoginSesion();
      });
      lista.appendChild(botonUsuario);
    }

    titulo.textContent = distribuidor.nombre;
    rif.textContent = distribuidor.rif_dist;
    input.type = "password";
    input.name = "contrasena";
    input.placeholder = "Contrasena";
    input.required = true;
    input.autocomplete = "current-password";
    error.className = "login-sesion__error";
    error.textContent = mensajeError;
    boton.type = "submit";
    boton.textContent = "Iniciar sesion";

    formulario.append(titulo, rif, input, error, boton);
    formulario.addEventListener("submit", (evento) => {
      evento.preventDefault();
      const exito = this.#repositorio.iniciarSesionDistribuidor(
        this.#rifLoginSeleccionado,
        input.value,
      );

      if (!exito) {
        this.#renderLoginSesion("Contrasena incorrecta");
      }
    });

    panel.append(lista, formulario);
    this.#loginSesion.replaceChildren(panel);
    input.focus();
  }

  #cerrarLoginSesion() {
    this.#loginSesion?.remove();
    this.#loginSesion = null;
  }

  #formatearFechaInput(fecha) {
    return fecha.toISOString().slice(0, 10);
  }
}
