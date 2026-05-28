import { auth, db } from "./firebase-config.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export let currentUser = null;
export let currentProfile = null;

const loginTab = document.getElementById("loginTab");
const registerTab = document.getElementById("registerTab");
const nameField = document.getElementById("nameField");
const authForm = document.getElementById("authForm");
const logoutBtn = document.getElementById("logoutBtn");
const bottomNav = document.getElementById("bottomNav");

let authMode = "login";

loginTab.addEventListener("click", () => {
  authMode = "login";
  loginTab.classList.add("active");
  registerTab.classList.remove("active");
  nameField.classList.add("hidden");
});

registerTab.addEventListener("click", () => {
  authMode = "register";
  registerTab.classList.add("active");
  loginTab.classList.remove("active");
  nameField.classList.remove("hidden");
});

authForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value.trim().toLowerCase();
  const password = document.getElementById("password").value.trim();
  const name = document.getElementById("name").value.trim();

  try {
    if (authMode === "register") {
      const result = await createUserWithEmailAndPassword(auth, email, password);

      const profile = {
        uid: result.user.uid,
        name: name || email,
        email,
        createdAt: Date.now()
      };

      await setDoc(doc(db, "users", result.user.uid), profile);

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

onAuthStateChanged(auth, async (user) => {
  currentUser = user;
  currentProfile = null;

  document.querySelectorAll(".view").forEach(view => {
    view.classList.remove("active");
  });

  if (user) {
    const profileSnap = await getDoc(doc(db, "users", user.uid));

    if (profileSnap.exists()) {
      currentProfile = profileSnap.data();
    } else {
      currentProfile = {
        uid: user.uid,
        name: user.email,
        email: user.email
      };
    }

    document.getElementById("homeView").classList.add("active");
    logoutBtn.classList.remove("hidden");
    bottomNav.classList.remove("hidden");

    const groups = await import("./groups.js");
    groups.listenGroups();

  } else {
    document.getElementById("authView").classList.add("active");
    logoutBtn.classList.add("hidden");
    bottomNav.classList.add("hidden");
  }
});
