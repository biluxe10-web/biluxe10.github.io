// js/dashboard.js
import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { doc, onSnapshot, collection, query, where, orderBy, limit, getDocs } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const userNameEl = document.getElementById('userName');
const userIdEl = document.getElementById('userId');
const avatarEl = document.getElementById('avatar');
const todayEarning = document.getElementById('todayEarning');
const weekEarning = document.getElementById('weekEarning');
const monthEarning = document.getElementById('monthEarning');
const totalEarning = document.getElementById('totalEarning');
const refLink = document.getElementById('refLink');
const copyBtn = document.getElementById('copyBtn');
const recentBody = document.getElementById('recentBody');

function rupee(x){return '₹'+Number(x||0).toLocaleString('en-IN');}

onAuthStateChanged(auth, async (user)=>{
  if(!user) return location.href='index.html';
  const uid = user.uid;
  userIdEl.textContent = `UID: ${uid}`;

  // live user doc
  const uRef = doc(db,'users',uid);
  onSnapshot(uRef, snap=>{
    if(!snap.exists()) return;
    const d = snap.data();
    userNameEl.textContent = d.name || 'Member';
    if(d.photoURL) avatarEl.style.backgroundImage = `url(${d.photoURL})`;
    else avatarEl.textContent = (d.name||'U').slice(0,1).toUpperCase();
    refLink.value = `${location.origin}/index.html?ref=${d.referralCode || uid}`;
  });

  // earnings doc live
  const eRef = doc(db,'earnings',uid);
  onSnapshot(eRef, snap=>{
    if(!snap.exists()) return;
    const d = snap.data();
    todayEarning.textContent = rupee(d.todayEarnings || d.today || 0);
    weekEarning.textContent = rupee(d.weekEarnings || d.last7 || 0);
    monthEarning.textContent = rupee(d.monthEarnings || d.last30 || 0);
    totalEarning.textContent = rupee(d.totalEarnings || d.total || 0);
  });

  // recent txs
  recentBody.innerHTML = '<tr><td colspan="4" style="color:#6b7280">Loading...</td></tr>';
  const txQ = query(collection(db,'transactions'), where('uid','==',uid), orderBy('date','desc'), limit(6));
  const txSnap = await getDocs(txQ);
  if(txSnap.empty) recentBody.innerHTML = '<tr><td colspan="4" style="color:#6b7280">No transactions</td></tr>';
  else{
    recentBody.innerHTML = '';
    txSnap.forEach(docSnap=>{
      const t = docSnap.data();
      const date = t.date && t.date.toDate ? t.date.toDate().toLocaleString() : (t.date||'');
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${t.type||'Txn'}</td><td>${rupee(t.amount)}</td><td>${date}</td><td>${t.status||'done'}</td>`;
      recentBody.appendChild(tr);
    });
  }
});

if(copyBtn){
  copyBtn.addEventListener('click', ()=>{
    navigator.clipboard.writeText(refLink.value);
    copyBtn.textContent='Copied';
    setTimeout(()=>copyBtn.textContent='Copy',1400);
  });
             }
