import Estudiante from "./Estudiante.js";
import Hoja from "./Hoja.js";
import Resumen from "./Resumen.js";

const muestra = [
  new Estudiante("28123456", "Valeria Morales", [85, 90, 78, 88]),
  new Estudiante("27987654", "Diego Rivas", [95, 88, 92, 90]),
  new Estudiante("28333444", "Camila Silva", [60, 65, 58, 62]),
  new Estudiante("29111222", "Andrés Vargas", [55, 52, 50, 58]),
  new Estudiante("26444555", "Sofía Mendoza", [58, 55, 54, 56]),
  new Estudiante("30555666", "Javier Castro", [45, 40, 38, 42]),
  new Estudiante("25777888", "Lucía Fernández", [35, 42, 40, 38]),
  new Estudiante("29888999", "Mateo Herrera", [48, 50, 45, 49])
];

const formulario = document.querySelector("#hoja-excel > form");
const divResumen = document.querySelector("#hoja-excel > div");

const hoja = new Hoja(formulario, muestra);
const resumen = new Resumen(hoja, divResumen);

const renderOriginal = hoja.render.bind(hoja);
hoja.render = function () {
  renderOriginal();
  resumen.render();
};
hoja.render();