import { auth, db } from "./firebase-config.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export let currentUser = null;

const authForm = document.getElementById("authForm");
const logoutBtn = document.getElementById("logoutBtn");

authForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const mode = window.pactaAuthMode || "login";

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const name = document.getElementById("name").value.trim();

  try {
    if (mode === "register") {
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await setDoc(doc(db, "users", result.user.uid), {
        name: name || email,
        email,
        createdAt: Date.now()
      });

    } else {
      await signInWithEmailAndPassword(auth, email, password);
    }

  } catch (error) {
    alert(error.message);
  }
});

logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
});

onAuthStateChanged(auth, (user) => {
  currentUser = user;

  const authView = document.getElementById("authView");
  const homeView = document.getElementById("homeView");

  if (user) {
    authView.classList.remove("active");
    homeView.classList.add("active");
    logoutBtn.classList.remove("hidden");

    import("./groups.js").then((module) => {
      module.listenGroups();
    });

  } else {
    authView.classList.add("active");
    homeView.classList.remove("active");
    logoutBtn.classList.add("hidden");
  }
});
