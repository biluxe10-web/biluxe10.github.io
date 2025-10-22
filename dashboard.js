// js/dashboard.js
import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { doc, getDoc, collection, query, where, orderBy, limit, getDocs } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const displayName = document.getElementById('display-name');
const displayUid = document.getElementById('display-uid');
const cardTotal = document.getElementById('card-total');
const cardWallet = document.getElementById('card-wallet');
const cardActive = document.getElementById('card-active');
const cardPassive = document.getElementById('card-passive');
const recentBody = document.getElementById('recent-body');
const avatar = document.getElementById('avatar');

onAuthStateChanged(auth, async (user)=>{
  if(!user) return window.location.href = 'index.html';
  const uid = user.uid;
  displayUid.textContent = 'UID: ' + uid;
  // fetch user profile
  const uRef = doc(db, 'users', uid);
  const uSnap = await getDoc(uRef);
  if(uSnap.exists()){
    const d = uSnap.data();
    displayName.textContent = d.name || 'Member';
    if(d.profile_url) avatar.style.backgroundImage = `url(${d.profile_url})`;
    else avatar.textContent = (d.name||'U').slice(0,1).toUpperCase();
  }
  // fetch earnings
  const eRef = doc(db, 'earnings', uid);
  const eSnap = await getDoc(eRef);
  if(eSnap.exists()){
    const e = eSnap.data();
    cardTotal.textContent = '₹' + (e.total_earning || 0);
    cardWallet.textContent = '₹' + (e.wallet_balance || 0);
    cardActive.textContent = '₹' + (e.active_commission || 0);
    cardPassive.textContent = '₹' + (e.passive_commission || 0);
  }

  // recent transactions
  recentBody.innerHTML = '<tr><td colspan="4" style="color:var(--muted)">Loading...</td></tr>';
  const txq = query(collection(db, 'transactions'), where('user_id','==', uid), orderBy('created_at','desc'), limit(6));
  const txSnap = await getDocs(txq);
  if(txSnap.empty){ recentBody.innerHTML = '<tr><td colspan="4" style="color:var(--muted)">No transactions</td></tr>'; return; }
  recentBody.innerHTML = '';
  txSnap.forEach(docItem=>{
    const t = docItem.data();
    const date = t.created_at ? new Date(t.created_at.seconds * 1000).toLocaleString() : '';
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${t.type||'Txn'}</td><td>₹${t.amount||0}</td><td>${date}</td><td>${t.status||'done'}</td>`;
    recentBody.appendChild(tr);
  });
});
