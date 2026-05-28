const loginTab = document.getElementById("loginTab");
const registerTab = document.getElementById("registerTab");
const nameField = document.getElementById("nameField");

window.pactaAuthMode = "login";

loginTab.addEventListener("click", () => {
  window.pactaAuthMode = "login";

  loginTab.classList.add("active");
  registerTab.classList.remove("active");
  nameField.classList.add("hidden");
});

registerTab.addEventListener("click", () => {
  window.pactaAuthMode = "register";

  registerTab.classList.add("active");
  loginTab.classList.remove("active");
  nameField.classList.remove("hidden");
});

import("./auth.js").catch((error) => {
  console.error("Error cargando auth.js:", error);
});
