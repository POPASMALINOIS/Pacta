import "./auth.js";

document.addEventListener("click", (event) => {
  const goHome = event.target.closest("[data-go-home]");

  if (goHome) {
    document.querySelectorAll(".view").forEach(view => {
      view.classList.remove("active");
    });

    document.getElementById("homeView").classList.add("active");
  }
});
