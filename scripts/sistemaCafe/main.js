import Repositorio from "./Repositorio.js";
import BarraInfo from "./BarraInfo.js";

const distribuidor = Repositorio.obtenerDistribuidores()[0];

const nodoBarraInfo = document.querySelector("#barra-info");
const barraInfo = new BarraInfo(
  nodoBarraInfo,
  (nuevaFecha) => (Repositorio.fecha = nuevaFecha),
  { fecha: Repositorio.fecha, saldo: distribuidor.saldo_bs },
);

const controller = new AbortController();
const { signal } = controller;

Repositorio.addEventListener(
  "cambioInfo",
  (e) => {
    barraInfo.render(e.detail);
  },
  { signal },
);

// controller.abort();
