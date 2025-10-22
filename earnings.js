
// js/earnings.js
import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { doc, getDoc, collection, query, where, orderBy, getDocs } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const activeVal = document.getElementById('activeVal');
const passiveVal = document.getElementById('passiveVal');
const adsVal = document.getElementById('adsVal');
const totalVal = document.getElementById('totalVal');
const earnBody = document.getElementById('earn-body');

onAuthStateChanged(auth, async (user)=>{
  if(!user) return window.location.href='index.html';
  const uid = user.uid;
  const eSnap = await getDoc(doc(db,'earnings',uid));
  if(eSnap.exists()){
    const d = eSnap.data();
    activeVal.textContent = '₹' + (d.active_commission||0);
    passiveVal.textContent = '₹' + (d.passive_commission||0);
    adsVal.textContent = '₹' + (d.ads_commission||0);
    totalVal.textContent = '₹' + (d.total_earning||0);
  }
  earnBody.innerHTML = '<tr><td colspan="4" style="color:var(--muted)">Loading...</td></tr>';
  const q = query(collection(db,'transactions'), where('user_id','==',uid), orderBy('created_at','desc'));
  const snap = await getDocs(q);
  if(snap.empty) { earnBody.innerHTML = '<tr><td colspan="4" style="color:var(--muted)">No records</td></tr>'; return; }
  earnBody.innerHTML = '';
  snap.forEach(doci=>{
    const t = doci.data();
    const date = t.created_at ? new Date(t.created_at.seconds*1000).toLocaleString() : '';
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${t.type}</td><td>₹${t.amount}</td><td>${date}</td><td>${t.status||'done'}</td>`;
    earnBody.appendChild(tr);
  });
});
