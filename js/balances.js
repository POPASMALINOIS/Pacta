import {

  db

} from "./firebase-config.js";

import {

  activeGroupId

} from "./groups.js";

import {

  collection,

  getDocs

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export async function calculateBalance() {

  const snapshot =

    await getDocs(

      collection(

        db,

        "groups",

        activeGroupId,

        "expenses"

      )

    );

  let total = 0;

  snapshot.forEach((doc) => {

    total += doc.data().amount;

  });

  document.getElementById(

    "groupBalance"

  ).innerHTML = `

    <div class="eyebrow">

      Total gastado

    </div>

    <div class="balance-total">

      ${total.toFixed(2)} €

    </div>

  `;

}
