// js/withdrawal.js
import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { doc, getDoc, collection, addDoc, query, where, orderBy, getDocs, serverTimestamp, updateDoc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const availBal = document.getElementById('availBal');
const wdAmount = document.getElementById('wdAmount');
const wdMethod = document.getElementById('wdMethod');
const wdRequest = document.getElementById('wdRequest');
const wdBody = document.getElementById('wdBody');
const wdMsg = document.getElementById('wdMsg');

function rupee(x){return '₹'+Number(x||0).toLocaleString('en-IN');}

onAuthStateChanged(auth, async (user)=>{
  if(!user) return location.href='index.html';
  const uid = user.uid;
  const eSnap = await getDoc(doc(db,'earnings',uid));
  if(eSnap.exists()) availBal.textContent = rupee(eSnap.data().wallet_balance || 0);
  else availBal.textContent = rupee(0);

  const q = query(collection(db,'withdrawals'), where('uid','==',uid), orderBy('requestedAt','desc'));
  const snap = await getDocs(q);
  if(snap.empty) wdBody.innerHTML = '<tr><td colspan="4" style="color:#6b7280">No requests</td></tr>';
  else{
    wdBody.innerHTML = '';
    snap.forEach(s=>{
      const t = s.data();
      const date = t.requestedAt && t.requestedAt.toDate ? t.requestedAt.toDate().toLocaleString() : (t.requestedAt||'');
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>₹${t.amount}</td><td>${t.method}</td><td>${date}</td><td>${t.status||'pending'}</td>`;
      wdBody.appendChild(tr);
    });
  }
});

if(wdRequest){
  wdRequest.addEventListener('click', async ()=>{
    wdMsg.style.display='none';
    const user = auth.currentUser; if(!user) return location.href='index.html';
    const uid = user.uid;
    const amt = Number(wdAmount.value || 0);
    const method = wdMethod.value.trim();
    if(!amt || amt<=0){ wdMsg.textContent='Enter a valid amount'; wdMsg.style.display='block'; return; }
    if(!method){ wdMsg.textContent='Provide UPI or bank details'; wdMsg.style.display='block'; return; }

    const eRef = doc(db,'earnings',uid);
    const eSnap = await getDoc(eRef);
    const bal = eSnap.exists() ? (eSnap.data().wallet_balance||0) : 0;
    if(amt > bal){ wdMsg.textContent='Insufficient balance'; wdMsg.style.display='block'; return; }

    await addDoc(collection(db,'withdrawals'), { uid, amount:amt, method, status:'pending', requestedAt: serverTimestamp() });
    await updateDoc(eRef, { wallet_balance: bal - amt });
    wdMsg.style.color='green'; wdMsg.textContent='Withdrawal requested'; wdMsg.style.display='block';
    setTimeout(()=>location.reload(),1000);
  });
}
