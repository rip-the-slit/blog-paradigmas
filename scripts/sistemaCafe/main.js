import Repositorio from "./Repositorio.js";
import BarraInfo from "./BarraInfo.js";
import PanelProveedor from "./panelProveedor/PanelProveedor.js";
import PanelInventario from "./panelInventario/PanelInventario.js";
import PanelNegocio from "./panelNegocio/PanelNegocio.js";

const distribuidor = Repositorio.obtenerDistribuidores()[0];

const nodoBarraInfo = document.querySelector("#barra-info");
const barraInfo = new BarraInfo(
  nodoBarraInfo,
  Repositorio
);

const nodoProveedor = document.querySelector("#panel-proveedor");
const panelProveedor = new PanelProveedor(
  nodoProveedor,
  Repositorio
);

const nodoInventario = document.querySelector("#panel-inventario");
const panelInventario = new PanelInventario(
  nodoInventario,
  Repositorio
);

const nodoNegocio = document.querySelector("#panel-negocio");
const panelNegocio = new PanelNegocio(
  nodoNegocio,
  Repositorio
);

const controller = new AbortController();
const { signal } = controller;

Repositorio.addEventListener(
  "cambioInfo",
  (e) => {
    barraInfo.render();
    panelProveedor.render();
    panelInventario.render();
    panelNegocio.render();
  },
  { signal },
);

Repositorio.addEventListener(
  "cambioProveedor",
  (e) => {
    panelProveedor.render();
  },
  { signal },
);

Repositorio.addEventListener(
  "cambioNegocio",
  (e) => {
    panelNegocio.render();
    panelInventario.render();
  },
  { signal },
);


// controller.abort();
