import "./auth.js";
import { activeGroupId, showView } from "./groups.js";

document.addEventListener("click", async (event) => {
  const goHome = event.target.closest("[data-go-home]");

  if (goHome) {
    showView("homeView");
  }

  const navButton = event.target.closest("[data-nav]");

  if (!navButton) return;

  const target = navButton.dataset.nav;

  if (target !== "home" && !activeGroupId) {
    alert("Primero abre un grupo.");
    showView("homeView");
    return;
  }

  document.querySelectorAll(".bottom-nav button").forEach(btn => {
    btn.classList.remove("active");
  });

  navButton.classList.add("active");

  if (target === "home") {
    showView("homeView");
  }

  if (target === "group") {
    showView("groupView");
  }

  if (target === "balances") {
    showView("balancesView");

    const balances = await import("./balances.js");
    balances.renderBalancesView();
  }
});
