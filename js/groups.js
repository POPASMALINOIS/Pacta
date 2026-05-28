import {
  db
} from "./firebase-config.js";

import {
  currentUser
} from "./auth.js";

import {
  activeGroupId
} from "./groups.js";

import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const addExpenseBtn =
  document.getElementById("addExpenseBtn");

const expenseView =
  document.getElementById("expenseView");

const groupView =
  document.getElementById("groupView");

const expenseForm =
  document.getElementById("expenseForm");

const expensesList =
  document.getElementById("expensesList");

addExpenseBtn.onclick = () => {

  groupView.classList.remove("active");

  expenseView.classList.add("active");
};

expenseForm.addEventListener("submit", async (e) => {

  e.preventDefault();

  const description =
    document.getElementById(
      "expenseDescription"
    ).value;

  const amount =
    parseFloat(
      document.getElementById(
        "expenseAmount"
      ).value
    );

  try {

    await addDoc(
      collection(
        db,
        "groups",
        activeGroupId,
        "expenses"
      ),
      {
        description,
        amount,
        paidBy: currentUser.uid,
        createdBy: currentUser.uid,
        createdAt: Date.now()
      }
    );

    expenseForm.reset();

    expenseView.classList.remove("active");

    groupView.classList.add("active");

  } catch (err) {

    alert(err.message);
  }
});

export function listenExpenses() {

  const q = query(
    collection(
      db,
      "groups",
      activeGroupId,
      "expenses"
    ),
    orderBy("createdAt", "desc")
  );

  onSnapshot(q, (snapshot) => {

    expensesList.innerHTML = "";

    snapshot.forEach((docSnap) => {

      const expense = docSnap.data();

      const card =
        document.createElement("div");

      card.className = "expense-card";

      card.innerHTML = `
        <div class="expense-row">

          <div class="expense-name">
            ${expense.description}
          </div>

          <div class="expense-amount">
            ${expense.amount.toFixed(2)} €
          </div>

        </div>

        <div class="expense-meta">
          Gasto registrado
        </div>
      `;

      expensesList.appendChild(card);
    });
  });
}
