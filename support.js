// js/support.js
import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { collection, addDoc, query, where, orderBy, getDocs, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const subj = document.getElementById('sp-subject');
const msgEl = document.getElementById('sp-message');
const btnSend = document.getElementById('sp-send');
const spBody = document.getElementById('sp-body');
const spMsg = document.getElementById('sp-msg');

onAuthStateChanged(auth, async (user)=>{
  if(!user) return window.location.href='index.html';
  const uid = user.uid;
  // load tickets
  spBody.innerHTML = '<tr><td colspan="3" style="color:var(--muted)">Loading...</td></tr>';
  const q = query(collection(db,'support_tickets'), where('user_id','==',uid), orderBy('created_at','desc'));
  const snap = await getDocs(q);
  if(snap.empty) spBody.innerHTML = '<tr><td colspan="3" style="color:var(--muted)">No tickets</td></tr>';
  else{
    spBody.innerHTML = '';
    snap.forEach(d=>{
      const r = d.data();
      const date = r.created_at ? new Date(r.created_at.seconds*1000).toLocaleString() : '';
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${r.subject}</td><td>${date}</td><td>${r.status||'open'}</td>`;
      spBody.appendChild(tr);
    });
  }
});

btnSend.addEventListener('click', async ()=>{
  spMsg.style.display='none';
  const user = auth.currentUser;
  if(!user) return window.location.href='index.html';
  const uid = user.uid;
  const subject = subj.value.trim();
  const message = msgEl.value.trim();
  if(!subject || !message){ spMsg.textContent='Subject and message required'; spMsg.style.display='block'; return; }
  await addDoc(collection(db,'support_tickets'), {
    user_id: uid,
    subject, message, status:'open', created_at: serverTimestamp()
  });
  spMsg.style.color='green'; spMsg.textContent='Ticket sent'; spMsg.style.display='block';
  subj.value=''; msgEl.value='';
  setTimeout(()=>location.reload(),900);
});
