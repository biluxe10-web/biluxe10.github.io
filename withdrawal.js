  // js/withdrawal.js
import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { doc, getDoc, collection, addDoc, query, where, orderBy, getDocs, serverTimestamp, updateDoc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const availBalance = document.getElementById('avail-balance');
const amountEl = document.getElementById('wd-amount');
const methodEl = document.getElementById('wd-method');
const btnReq = document.getElementById('wd-request');
const wdBody = document.getElementById('wd-body');
const wdMsg = document.getElementById('wd-msg');

function rupee(x){ return '₹'+Number(x||0).toLocaleString('en-IN', {maximumFractionDigits:0}); }

onAuthStateChanged(auth, async (user)=>{
  if(!user) return window.location.href='index.html';
  const uid = user.uid;
  // load balance (live)
  const eSnap = await getDoc(doc(db,'earnings',uid));
  if(eSnap.exists()){
    const d = eSnap.data();
    availBalance.textContent = rupee(d.wallet_balance || 0);
  } else availBalance.textContent = rupee(0);

  // load history
  const q = query(collection(db,'withdrawals'), where('user_id','==',uid), orderBy('created_at','desc'));
  const snap = await getDocs(q);
  if(snap.empty) wdBody.innerHTML = '<tr><td colspan="4" style="color:var(--muted)">No requests</td></tr>';
  else{
    wdBody.innerHTML = '';
    snap.forEach(s=>{
      const t = s.data();
      const date = t.created_at ? (t.created_at.toDate ? t.created_at.toDate().toLocaleString() : new Date(t.created_at).toLocaleString()) : '';
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>₹${t.amount}</td><td>${t.method}</td><td>${date}</td><td>${t.status||'pending'}</td>`;
      wdBody.appendChild(tr);
    });
  }
});

if(btnReq){
  btnReq.addEventListener('click', async ()=>{
    wdMsg.style.display='none';
    const user = auth.currentUser;
    if(!user) return window.location.href='index.html';
    const uid = user.uid;
    const amt = Number(amountEl.value || 0);
    const method = methodEl.value.trim();
    if(!amt || amt <=0){ wdMsg.textContent='Enter valid amount'; wdMsg.style.display='block'; return; }
    if(!method){ wdMsg.textContent='Enter UPI or account details'; wdMsg.style.display='block'; return; }

    // check balance
    const eRef = doc(db,'earnings',uid);
    const eSnap = await getDoc(eRef);
    const bal = eSnap.exists() ? (eSnap.data().wallet_balance||0) : 0;
    if(amt > bal){ wdMsg.textContent='Insufficient balance'; wdMsg.style.display='block'; return; }

    // create withdrawal request
    await addDoc(collection(db,'withdrawals'), {
      user_id: uid,
      amount: amt,
      method,
      status: 'pending',
      created_at: serverTimestamp()
    });

    // reduce wallet_balance (optional immediate adjust)
    await updateDoc(eRef, { wallet_balance: bal - amt });

    wdMsg.style.color='green'; wdMsg.textContent='Withdrawal requested'; wdMsg.style.display='block';
    setTimeout(()=>location.reload(),1000);
  });
               }
