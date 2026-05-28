import { db } from "./firebase-config.js";
import { activeGroupId, activeMembers } from "./groups.js";

import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const groupBalance = document.getElementById("groupBalance");

export async function calculateBalance() {
  if (!activeGroupId) return;

  const snapshot = await getDocs(
    collection(db, "groups", activeGroupId, "expenses")
  );

  const balances = {};
  const paid = {};
  const owed = {};

  activeMembers.forEach(member => {
    balances[member.uid] = 0;
    paid[member.uid] = 0;
    owed[member.uid] = 0;
  });

  let total = 0;

  snapshot.forEach(docSnap => {
    const expense = docSnap.data();

    if (expense.status !== "active") return;

    const amount = Number(expense.amount || 0);
    const participants = expense.participants || [];

    if (!participants.length) return;

    total += amount;

    paid[expense.paidBy] = (paid[expense.paidBy] || 0) + amount;
    balances[expense.paidBy] = (balances[expense.paidBy] || 0) + amount;

    const share = amount / participants.length;

    participants.forEach(userId => {
      owed[userId] = (owed[userId] || 0) + share;
      balances[userId] = (balances[userId] || 0) - share;
    });
  });

  let html = `
    <div class="summary-grid">
      <div>
        <p class="eyebrow">Total gastado</p>
        <div class="summary-number">${total.toFixed(2)} €</div>
      </div>
    </div>
  `;

  activeMembers.forEach(member => {
    const balance = balances[member.uid] || 0;

    let label = "Saldado";
    let cls = "neutral";

    if (balance > 0.009) {
      label = `Debe recibir ${balance.toFixed(2)} €`;
      cls = "positive";
    }

    if (balance < -0.009) {
      label = `Debe pagar ${Math.abs(balance).toFixed(2)} €`;
      cls = "negative";
    }

    html += `
      <div class="balance-row">
        <div>
          <strong>${member.name || member.email}</strong>
          <div class="item-sub">
            Pagó ${(paid[member.uid] || 0).toFixed(2)} € · 
            Le correspondía ${(owed[member.uid] || 0).toFixed(2)} €
          </div>
        </div>

        <div class="${cls}">
          ${label}
        </div>
      </div>
    `;
  });

  const settlements = calculateSettlements(balances);

  if (settlements.length) {
    html += `
      <div class="balance-row">
        <div>
          <strong>Pagos recomendados</strong>
          <div class="item-sub">
            Para saldar el grupo con el menor número de movimientos.
          </div>
        </div>
      </div>
    `;

    settlements.forEach(move => {
      const from = activeMembers.find(m => m.uid === move.from);
      const to = activeMembers.find(m => m.uid === move.to);

      html += `
        <div class="balance-row">
          <div>
            ${from?.name || from?.email} paga a ${to?.name || to?.email}
          </div>
          <div class="amount">${move.amount.toFixed(2)} €</div>
        </div>
      `;
    });
  }

  groupBalance.innerHTML = html;
}

function calculateSettlements(balances) {
  const debtors = [];
  const creditors = [];

  Object.entries(balances).forEach(([uid, amount]) => {
    const rounded = Math.round(amount * 100) / 100;

    if (rounded < -0.01) {
      debtors.push({
        uid,
        amount: Math.abs(rounded)
      });
    }

    if (rounded > 0.01) {
      creditors.push({
        uid,
        amount: rounded
      });
    }
  });

  const movements = [];

  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const amount = Math.min(debtors[i].amount, creditors[j].amount);

    movements.push({
      from: debtors[i].uid,
      to: creditors[j].uid,
      amount
    });

    debtors[i].amount -= amount;
    creditors[j].amount -= amount;

    if (debtors[i].amount < 0.01) i++;
    if (creditors[j].amount < 0.01) j++;
  }

  return movements;
}
