// js/earnings.js
import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { doc, onSnapshot, collection, query, where, orderBy, getDocs } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const activeVal = document.getElementById('activeVal');
const passiveVal = document.getElementById('passiveVal');
const adsVal = document.getElementById('adsVal');
const totalVal = document.getElementById('totalVal');
const earnBody = document.getElementById('earnBody');

function rupee(x){return '₹'+Number(x||0).toLocaleString('en-IN');}

onAuthStateChanged(auth, async (user)=>{
  if(!user) return location.href='index.html';
  const uid = user.uid;
  const eRef = doc(db,'earnings',uid);
  onSnapshot(eRef, snap=>{
    if(!snap.exists()) return;
    const d = snap.data();
    activeVal.textContent = rupee(d.active_commission || 0);
    passiveVal.textContent = rupee(d.passive_commission || 0);
    adsVal.textContent = rupee(d.ads_commission || 0);
    totalVal.textContent = rupee(d.totalEarnings || d.total || 0);
  });

  earnBody.innerHTML = '<tr><td colspan="4" style="color:#6b7280">Loading...</td></tr>';
  const q = query(collection(db,'transactions'), where('uid','==',uid), orderBy('date','desc'));
  const snap = await getDocs(q);
  if(snap.empty) earnBody.innerHTML = '<tr><td colspan="4" style="color:#6b7280">No records</td></tr>';
  else{
    earnBody.innerHTML='';
    snap.forEach(d=>{
      const t = d.data();
      const date = t.date && t.date.toDate ? t.date.toDate().toLocaleString() : (t.date||'');
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${t.type}</td><td>${rupee(t.amount)}</td><td>${date}</td><td>${t.status||'done'}</td>`;
      earnBody.appendChild(tr);
    });
  }
});
