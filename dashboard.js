// js/dashboard.js
import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import {
  doc, onSnapshot, collection, query, where, orderBy, limit, getDocs
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const displayName = document.getElementById('display-name');
const displayUid = document.getElementById('display-uid');
const cardToday = document.getElementById('today-earn');
const cardWeek = document.getElementById('week-earn');
const cardMonth = document.getElementById('month-earn');
const cardAll = document.getElementById('all-earn');
const recentBody = document.getElementById('recent-body');
const avatar = document.getElementById('avatar');
const refInput = document.getElementById('ref-link');
const copyRefBtn = document.getElementById('copy-ref');
const shareWA = document.getElementById('share-wa');
const shareFB = document.getElementById('share-fb');
const shareSS = document.getElementById('share-ss');

function rupee(x){ return '₹' + Number(x||0).toLocaleString('en-IN', {maximumFractionDigits:0}); }

onAuthStateChanged(auth, async (user)=>{
  if(!user) return window.location.href='index.html';
  const uid = user.uid;
  displayUid.textContent = 'UID: ' + uid;

  // listen user doc
  const userRef = doc(db, 'users', uid);
  onSnapshot(userRef, snap=>{
    if(!snap.exists()) return;
    const data = snap.data();
    displayName.textContent = data.name || 'Member';
    if(data.profile_url) avatar.style.backgroundImage = `url(${data.profile_url})`;
    else avatar.textContent = (data.name||'U').slice(0,1).toUpperCase();
    // referral link (you can change domain)
    const link = `${location.origin}/${location.pathname.includes('github.io')? '' : ''}index.html?ref=${uid}`;
    if(refInput) refInput.value = link;
  });

  // listen earnings doc live
  const earnRef = doc(db, 'earnings', uid);
  onSnapshot(earnRef, snap=>{
    if(!snap.exists()) return;
    const d = snap.data();
    cardAll.textContent = rupee(d.total_earning || 0);
    cardToday.textContent = rupee(d.today || 0);
    cardWeek.textContent = rupee(d.last7 || 0);
    cardMonth.textContent = rupee(d.last30 || 0);
  });

  // recent transactions (latest 6)
  recentBody.innerHTML = '<tr><td colspan="4" style="color:var(--muted)">Loading...</td></tr>';
  const txQ = query(collection(db, 'transactions'), where('user_id','==', uid), orderBy('date','desc'), limit(6));
  const txSnap = await getDocs(txQ);
  if(txSnap.empty) {
    recentBody.innerHTML = '<tr><td colspan="4" style="color:var(--muted)">No transactions</td></tr>';
  } else {
    recentBody.innerHTML = '';
    txSnap.forEach(tdoc=>{
      const t = tdoc.data();
      const date = t.date ? (t.date.toDate ? t.date.toDate().toLocaleString() : new Date(t.date).toLocaleString()) : '';
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${t.type||'Txn'}</td><td>${rupee(t.amount||0)}</td><td>${date}</td><td>${t.status||'done'}</td>`;
      recentBody.appendChild(tr);
    });
  }

  // copy referral
  if(copyRefBtn && refInput){
    copyRefBtn.addEventListener('click', ()=>{ refInput.select(); navigator.clipboard.writeText(refInput.value); copyRefBtn.textContent='Copied'; setTimeout(()=>copyRefBtn.textContent='Copy',1200); });
  }

  // share handlers
  if(shareWA && refInput) shareWA.addEventListener('click', ()=> {
    const url = `https://wa.me/?text=${encodeURIComponent("Join Biluxe10: "+refInput.value)}`;
    window.open(url, '_blank');
  });
  if(shareFB && refInput) shareFB.addEventListener('click', ()=> {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(refInput.value)}`;
    window.open(url, '_blank');
  });
  if(shareSS && refInput) shareSS.addEventListener('click', ()=> {
    // Snapchat does not allow direct share url; open site for user
    window.open('https://snapchat.com', '_blank');
  });
});
