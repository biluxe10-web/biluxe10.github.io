// js/transactions.js
import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { collection, query, where, orderBy, getDocs } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const txBody = document.getElementById('txBody');

function rupee(x){return '₹'+Number(x||0).toLocaleString('en-IN');}

onAuthStateChanged(auth, async (user)=>{
  if(!user) return location.href='index.html';
  const uid = user.uid;
  txBody.innerHTML = '<tr><td colspan="4" style="color:#6b7280">Loading...</td></tr>';
  const q = query(collection(db,'transactions'), where('uid','==',uid), orderBy('date','desc'));
  const snap = await getDocs(q);
  if(snap.empty){ txBody.innerHTML = '<tr><td colspan="4" style="color:#6b7280">No transactions</td></tr>'; return; }
  txBody.innerHTML = '';
  snap.forEach(d=>{
    const t = d.data();
    const date = t.date && t.date.toDate ? t.date.toDate().toLocaleString() : (t.date||'');
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${t.type}</td><td>${rupee(t.amount)}</td><td>${date}</td><td>${t.status||'done'}</td>`;
    txBody.appendChild(tr);
  });
});
