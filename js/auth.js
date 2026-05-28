import {
  auth,
  db
} from "./firebase-config.js";

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

let isLogin = true;

const authForm = document.getElementById("authForm");

const loginTab = document.getElementById("loginTab");

const registerTab = document.getElementById("registerTab");

const nameField = document.getElementById("nameField");

const logoutBtn = document.getElementById("logoutBtn");

loginTab.onclick = () => {

  isLogin = true;

  loginTab.classList.add("active");

  registerTab.classList.remove("active");

  nameField.classList.add("hidden");
};

registerTab.onclick = () => {

  isLogin = false;

  registerTab.classList.add("active");

  loginTab.classList.remove("active");

  nameField.classList.remove("hidden");
};

authForm.addEventListener("submit", async (e) => {

  e.preventDefault();

  const email =
    document.getElementById("email").value;

  const password =
    document.getElementById("password").value;

  try {

    if (isLogin) {

      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

    } else {

      const name =
        document.getElementById("name").value;

      const result =
        await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

      await setDoc(
        doc(db, "users", result.user.uid),
        {
          name,
          email,
          createdAt: Date.now()
        }
      );
    }

  } catch (err) {

    alert(err.message);
  }
});

logoutBtn.onclick = async () => {

  await signOut(auth);
};

onAuthStateChanged(auth, (user) => {

  currentUser = user;

  if (user) {

    document
      .getElementById("authView")
      .classList.remove("active");

    document
      .getElementById("homeView")
      .classList.add("active");

    logoutBtn.classList.remove("hidden");

  } else {

    document
      .getElementById("authView")
      .classList.add("active");

    document
      .getElementById("homeView")
      .classList.remove("active");

    logoutBtn.classList.add("hidden");
  }
});
