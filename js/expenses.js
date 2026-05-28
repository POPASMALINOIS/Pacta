import { db } from "./firebase-config.js";
import { currentUser } from "./auth.js";
import { activeGroupId, activeMembers, showView } from "./groups.js";

import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const addExpenseBtn = document.getElementById("addExpenseBtn");
const cancelExpenseBtn = document.getElementById("cancelExpenseBtn");
const expenseForm = document.getElementById("expenseForm");
const expensesList = document.getElementById("expensesList");
const expenseParticipants = document.getElementById("expenseParticipants");
const expenseDate = document.getElementById("expenseDate");

let unsubscribeExpenses = null;

addExpenseBtn.addEventListener("click", () => {
  prepareExpenseForm();
  showView("expenseView");
});

cancelExpenseBtn.addEventListener("click", () => {
  showView("groupView");
});

expenseForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const description = document.getElementById("expenseDescription").value.trim();
  const amount = Number(document.getElementById("expenseAmount").value);
  const date = document.getElementById("expenseDate").value;

  const participants = Array
    .from(document.querySelectorAll("[data-participant]:checked"))
    .map(input => input.value);

  if (!description || !amount || participants.length === 0) {
    alert("Completa descripción, importe y participantes.");
    return;
  }

  await addDoc(collection(db, "groups", activeGroupId, "expenses"), {
    description,
    amount,
    date,
    paidBy: currentUser.uid,
    createdBy: currentUser.uid,
    participants,
    status: "active",
    createdAt: Date.now(),
    updatedAt: Date.now()
  });

  expenseForm.reset();
  showView("groupView");

  const balances = await import("./balances.js");
  balances.calculateBalance();
});

export function prepareExpenseForm() {
  if (expenseDate && !expenseDate.value) {
    expenseDate.value = new Date().toISOString().slice(0, 10);
  }

  renderParticipantChecks();
}

export function renderParticipantChecks() {
  if (!expenseParticipants) return;

  expenseParticipants.innerHTML = "";

  activeMembers.forEach(member => {
    const label = document.createElement("label");
    label.className = "check-item";

    label.innerHTML = `
      <input 
        type="checkbox" 
        data-participant 
        value="${member.uid}" 
        checked
      />
      <span class="user-dot" style="background:${member.color || "#18352d"}"></span>
      <span>${member.name || member.email}</span>
    `;

    expenseParticipants.appendChild(label);
  });
}

export function listenExpenses() {
  if (!activeGroupId) return;

  if (unsubscribeExpenses) {
    unsubscribeExpenses();
  }

  const q = query(
    collection(db, "groups", activeGroupId, "expenses"),
    orderBy("createdAt", "desc")
  );

  unsubscribeExpenses = onSnapshot(q, async (snapshot) => {
    expensesList.innerHTML = "";

    if (snapshot.empty) {
      expensesList.innerHTML = `
        <div class="item">
          <div class="item-title">Sin gastos todavía</div>
          <div class="item-sub">Añade el primer gasto del grupo.</div>
        </div>
      `;
    }

    snapshot.forEach((docSnap) => {
      const expense = docSnap.data();

      const payer = activeMembers.find(m => m.uid === expense.paidBy);

      const item = document.createElement("div");
      item.className = "item";

      item.innerHTML = `
        <div class="item-main">
          <div>
            <div class="item-title">${expense.description}</div>
            <div class="item-sub">
              Pagó ${payer?.name || payer?.email || "usuario"} · 
              ${expense.participants?.length || 0} participantes
            </div>
          </div>

          <div class="amount">${expense.amount.toFixed(2)} €</div>
        </div>
      `;

      expensesList.appendChild(item);
    });

    const balances = await import("./balances.js");
    balances.calculateBalance();
  });
}
