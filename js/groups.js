import { db } from "./firebase-config.js";
import { currentUser, currentProfile } from "./auth.js";

import {
  collection,
  addDoc,
  setDoc,
  doc,
  getDocs,
  query,
  where,
  onSnapshot,
  updateDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export let activeGroupId = null;
export let activeGroupName = null;
export let activeMembers = [];
export let activeGroupData = null;

const colors = [
  "#18352d",
  "#8a5a44",
  "#4c5f8a",
  "#8a6f2a",
  "#7d4f6d",
  "#2f6f73",
  "#9f4f3f"
];

const newGroupBtn = document.getElementById("newGroupBtn");
const groupForm = document.getElementById("groupForm");
const groupsList = document.getElementById("groupsList");
const groupTitle = document.getElementById("groupTitle");
const memberForm = document.getElementById("memberForm");
const memberEmail = document.getElementById("memberEmail");
const membersList = document.getElementById("membersList");
const adminPanel = document.getElementById("adminPanel");
const deleteGroupBtn = document.getElementById("deleteGroupBtn");

newGroupBtn.addEventListener("click", () => {
  showView("createGroupView");
});

groupForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = document.getElementById("groupName").value.trim();
  if (!name) return;

  const groupRef = await addDoc(collection(db, "groups"), {
    name,
    adminId: currentUser.uid,
    members: [currentUser.uid],
    status: "open",
    allowMembersToAddExpenses: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  });

  await setDoc(doc(db, "groups", groupRef.id, "members", currentUser.uid), {
    uid: currentUser.uid,
    email: currentProfile?.email || currentUser.email,
    name: currentProfile?.name || currentUser.email,
    role: "admin",
    color: colors[0],
    active: true,
    joinedAt: Date.now()
  });

  groupForm.reset();
  showView("homeView");
});

memberForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = memberEmail.value.trim().toLowerCase();

  if (!email || !activeGroupId) return;

  const usersQuery = query(
    collection(db, "users"),
    where("email", "==", email)
  );

  const result = await getDocs(usersQuery);

  if (result.empty) {
    alert("Ese usuario todavía no está registrado en Pacta.");
    return;
  }

  const userDoc = result.docs[0];
  const user = userDoc.data();

  const color = colors[activeMembers.length % colors.length];

  await setDoc(doc(db, "groups", activeGroupId, "members", user.uid), {
    uid: user.uid,
    email: user.email,
    name: user.name || user.email,
    role: "member",
    color,
    active: true,
    joinedAt: Date.now()
  });

  const freshMembers = [...new Set([...activeMembers.map(m => m.uid), user.uid])];

  await updateDoc(doc(db, "groups", activeGroupId), {
    members: freshMembers,
    updatedAt: Date.now()
  });

  memberEmail.value = "";
});

deleteGroupBtn.addEventListener("click", async () => {
  if (!activeGroupId || !activeGroupData) return;

  if (activeGroupData.adminId !== currentUser.uid) {
    alert("Solo el administrador puede eliminar este grupo.");
    return;
  }

  const ok = confirm("¿Seguro que quieres eliminar este grupo? Esta acción no se puede deshacer.");

  if (!ok) return;

  await deleteSubcollection("members");
  await deleteSubcollection("expenses");
  await deleteSubcollection("activity");
  await deleteSubcollection("settlements");

  await deleteDoc(doc(db, "groups", activeGroupId));

  activeGroupId = null;
  activeGroupName = null;
  activeMembers = [];
  activeGroupData = null;

  showView("homeView");
});

async function deleteSubcollection(name) {
  const snap = await getDocs(collection(db, "groups", activeGroupId, name));

  const deletions = [];

  snap.forEach(item => {
    deletions.push(
      deleteDoc(doc(db, "groups", activeGroupId, name, item.id))
    );
  });

  await Promise.all(deletions);
}

export function listenGroups() {
  if (!currentUser) return;

  const q = query(
    collection(db, "groups"),
    where("members", "array-contains", currentUser.uid)
  );

  onSnapshot(q, (snapshot) => {
    groupsList.innerHTML = "";

    if (snapshot.empty) {
      groupsList.innerHTML = `
        <div class="item">
          <div class="item-title">Todavía no tienes grupos</div>
          <div class="item-sub">Crea tu primer grupo para empezar a cuadrar gastos.</div>
        </div>
      `;
      return;
    }

    snapshot.forEach((documentSnapshot) => {
      const group = documentSnapshot.data();

      const item = document.createElement("div");
      item.className = "item";

      item.innerHTML = `
        <div class="item-main">
          <div>
            <div class="item-title">${group.name}</div>
            <div class="item-sub">${group.members?.length || 1} participantes · ${group.status}</div>
          </div>
          <div class="amount">Abrir</div>
        </div>
      `;

      item.addEventListener("click", () => {
        openGroup(documentSnapshot.id, group);
      });

      groupsList.appendChild(item);
    });
  });
}

export async function openGroup(groupId, group) {
  activeGroupId = groupId;
  activeGroupName = group.name;
  activeGroupData = group;

  groupTitle.textContent = group.name;

  if (group.adminId === currentUser.uid) {
    adminPanel.classList.remove("hidden");
  } else {
    adminPanel.classList.add("hidden");
  }

  showView("groupView");

  listenMembers();

  const expenses = await import("./expenses.js");
  expenses.listenExpenses();
  expenses.prepareExpenseForm();

  const balances = await import("./balances.js");
  balances.calculateBalance();
}

export function listenMembers() {
  if (!activeGroupId) return;

  const membersRef = collection(db, "groups", activeGroupId, "members");

  onSnapshot(membersRef, (snapshot) => {
    activeMembers = [];
    membersList.innerHTML = "";

    snapshot.forEach((docSnap) => {
      const member = docSnap.data();
      activeMembers.push(member);

      const pill = document.createElement("div");
      pill.className = "member-pill";

      pill.innerHTML = `
        <span class="user-dot" style="background:${member.color || "#18352d"}"></span>
        <span>${member.name || member.email}</span>
      `;

      membersList.appendChild(pill);
    });

    import("./expenses.js").then(module => {
      module.renderParticipantChecks();
    });

    import("./balances.js").then(module => {
      module.calculateBalance();
    });
  });
}

export function showView(viewId) {
  document.querySelectorAll(".view").forEach(view => {
    view.classList.remove("active");
  });

  document.getElementById(viewId).classList.add("active");
}
