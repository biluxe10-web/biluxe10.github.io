// js/support.js
import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { collection, addDoc, query, where, orderBy, getDocs, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const spSubject = document.getElementById('spSubject');
const spMessage = document.getElementById('spMessage');
const spSend = document.getElementById('spSend');
const spBody = document.getElementById('spBody');
const spMsg = document.getElementById('spMsg');

onAuthStateChanged(auth, async (user)=>{
  if(!user) return location.href='index.html';
  const uid = user.uid;
  spBody.innerHTML = '<tr><td colspan="3" style="color:#6b7280">Loading...</td></tr>';
  const q = query(collection(db,'support_tickets'), where('uid','==',uid), orderBy('createdAt','desc'));
  const snap = await getDocs(q);
  if(snap.empty) spBody.innerHTML = '<tr><td colspan="3" style="color:#6b7280">No tickets</td></tr>';
  else{
    spBody.innerHTML = '';
    snap.forEach(d=>{
      const r = d.data();
      const date = r.createdAt && r.createdAt.toDate ? r.createdAt.toDate().toLocaleString() : (r.createdAt||'');
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${r.subject}</td><td>${date}</td><td>${r.status||'open'}</td>`;
      spBody.appendChild(tr);
    });
  }
});

if(spSend){
  spSend.addEventListener('click', async ()=>{
    spMsg.style.display='none';
    const user = auth.currentUser; if(!user) return location.href='index.html';
    const uid = user.uid;
    const subject = spSubject.value.trim(); const message = spMessage.value.trim();
    if(!subject || !message){ spMsg.textContent='Subject and message required'; spMsg.style.display='block'; return; }
    await addDoc(collection(db,'support_tickets'), { uid, subject, message, status:'open', createdAt: serverTimestamp() });
    spMsg.style.color='green'; spMsg.textContent='Ticket sent'; spMsg.style.display='block';
    spSubject.value=''; spMessage.value=''; setTimeout(()=>location.reload(),900);
  });
}
