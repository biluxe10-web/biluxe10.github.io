// js/team.js
import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const teamBody = document.getElementById('team-body');

onAuthStateChanged(auth, async (user)=>{
  if(!user) return window.location.href='index.html';
  const uid = user.uid;
  teamBody.innerHTML = '<tr><td colspan="4" style="color:var(--muted)">Loading...</td></tr>';
  const q = query(collection(db,'team'), where('user_id','==',uid));
  const snap = await getDocs(q);
  if(snap.empty){ teamBody.innerHTML = '<tr><td colspan="4" style="color:var(--muted)">No team members yet</td></tr>'; return; }
  teamBody.innerHTML = '';
  for(const docItem of snap.docs){
    const r = docItem.data();
    const joined = r.joined_at ? (r.joined_at.toDate ? r.joined_at.toDate().toLocaleDateString() : new Date(r.joined_at).toLocaleDateString()) : '-';
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${r.member_name || '-'}</td><td>${r.member_id || '-'}</td><td>${r.plan||'-'}</td><td>${joined}</td>`;
    teamBody.appendChild(tr);
  }
});
