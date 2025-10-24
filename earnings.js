// js/earnings.js
import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { doc, onSnapshot, collection, query, where, orderBy, getDocs } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const activeVal = document.getElementById('active-val');
const passiveVal = document.getElementById('passive-val');
const adsVal = document.getElementById('ads-val');
const totalVal = document.getElementById('total-val');
const earnBody = document.getElementById('earn-body');

function rupee(x){ return '₹'+Number(x||0).toLocaleString('en-IN', {maximumFractionDigits:0}); }

onAuthStateChanged(auth, async (user)=>{
  if(!user) return window.location.href='index.html';
  const uid = user.uid;

  // live earnings
  const eRef = doc(db,'earnings',uid);
  onSnapshot(eRef, snap=>{
    if(!snap.exists()) return;
    const d = snap.data();
    activeVal.textContent = rupee(d.active_commission || 0);
    passiveVal.textContent = rupee(d.passive_commission || 0);
    adsVal.textContent = rupee(d.ads_commission || 0);
    totalVal.textContent = rupee(d.total_earning || 0);
  });

  // history (transactions)
  earnBody.innerHTML = '<tr><td colspan="4" style="color:var(--muted)">Loading...</td></tr>';
  const q = query(collection(db,'transactions'), where('user_id','==',uid), orderBy('date','desc'));
  const snap = await getDocs(q);
  if(snap.empty){ earnBody.innerHTML = '<tr><td colspan="4" style="color:var(--muted)">No records</td></tr>'; return; }
  earnBody.innerHTML = '';
  snap.forEach(d=>{
    const t = d.data();
    const date = t.date ? (t.date.toDate ? t.date.toDate().toLocaleString() : new Date(t.date).toLocaleString()) : '';
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${t.type}</td><td>${rupee(t.amount)}</td><td>${date}</td><td>${t.status||'done'}</td>`;
    earnBody.appendChild(tr);
  });
});
