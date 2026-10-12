import Repositorio from "./Repositorio.js";
import BarraInfo from "./BarraInfo.js";
import PanelProveedor from "./panelProveedor/PanelProveedor.js";
import PanelInventario from "./panelInventario/PanelInventario.js";
import PanelNegocio from "./panelNegocio/PanelNegocio.js";
import Negocio from "./panelNegocio/Negocio.js";
import Proveedor from "./panelProveedor/Proveedor.js";
import MenuContacto from "./MenuContacto.js";
import FormularioProveedor from "./panelProveedor/FormularioProveedor.js";
import FormularioProducto from "./panelProveedor/FormularioProducto.js";
import FormularioNegocio from "./panelNegocio/FormularioNegocio.js";
import { iniciar } from "./asyncUI.js";

const estado = document.querySelector("#estado-cafe");
Repositorio.addEventListener("carga", ({ detail: pendientes }) => {
  if (estado.dataset.error !== "true") estado.textContent = pendientes ? "Cargando…" : "";
});

const barraInfo = new BarraInfo(document.querySelector("#barra-info"), Repositorio);
const panelProveedor = new PanelProveedor(document.querySelector("#panel-proveedor"), Repositorio);
const panelInventario = new PanelInventario(document.querySelector("#panel-inventario"), Repositorio);
const panelNegocio = new PanelNegocio(document.querySelector("#panel-negocio"), Repositorio);
Repositorio.addEventListener("escritura", ({ detail: pendiente }) => {
  document.querySelector("#seleccionar-distribuidor").disabled = pendiente;
  const fecha = document.querySelector("#fecha");
  fecha.setAttribute("aria-disabled", String(pendiente));
  const input = fecha.querySelector("input");
  if (input) input.disabled = pendiente;
});

function refrescarTodo() {
  for (const componente of [barraInfo, panelProveedor, panelInventario, panelNegocio]) {
    iniciar(() => componente.render());
  }
}
Repositorio.addEventListener("cambioInfo", refrescarTodo);
Repositorio.addEventListener("cambioProveedor", () => iniciar(() => panelProveedor.render()));
Repositorio.addEventListener("cambioNegocio", () => {
  iniciar(() => panelNegocio.render());
  iniciar(() => panelInventario.render());
});
Repositorio.addEventListener("cambioSesion", () => {
  Negocio.rifExpandido = null;
  Proveedor.rifExpandido = null;
  panelProveedor.cerrarReporte();
  panelNegocio.cerrarReporte();
  MenuContacto.cerrarActivo();
  FormularioProveedor.cerrarActivo();
  FormularioProducto.cerrarActivo();
  FormularioNegocio.cerrarActivo();
  for (const id of ["panel-proveedor", "panel-inventario", "panel-negocio"]) {
    const panel = document.getElementById(id);
    panel.querySelector("ul").replaceChildren();
    const contador = panel.querySelector(".cantidad");
    if (contador) contador.textContent = "0";
    panel.querySelector(".compras-proveedor")?.replaceChildren();
  }
  refrescarTodo();
});
