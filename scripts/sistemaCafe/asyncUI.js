export function mostrarError(error) {
  if (error?.name === "AbortError") return;
  const nodo = document.querySelector("#estado-cafe");
  if (nodo) {
    nodo.dataset.error = "true";
    nodo.textContent = error?.message || "No se pudo completar la operación";
  }
}

export async function ejecutar(nodo, accion) {
  if (!nodo || nodo.getAttribute("aria-busy") === "true") return false;
  const estado = document.querySelector("#estado-cafe");
  if (estado) { estado.dataset.error = "false"; estado.textContent = ""; }
  nodo.setAttribute("aria-busy", "true");
  const campos = [...nodo.querySelectorAll("input, select, button")];
  const estados = campos.map((campo) => campo.disabled);
  campos.forEach((campo) => { campo.disabled = true; });
  try {
    return (await accion()) !== false;
  } catch (error) {
    mostrarError(error);
    return false;
  } finally {
    nodo.removeAttribute("aria-busy");
    campos.forEach((campo, indice) => { campo.disabled = estados[indice]; });
  }
}

export function iniciar(accion) {
  Promise.resolve().then(accion).catch(mostrarError);
}
