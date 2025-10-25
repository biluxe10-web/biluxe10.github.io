// js/team.js
import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const teamBody = document.getElementById('teamBody');

onAuthStateChanged(auth, async (user)=>{
  if(!user) return location.href='index.html';
  const uid = user.uid;
  teamBody.innerHTML = '<tr><td colspan="4" style="color:#6b7280">Loading...</td></tr>';
  const q = query(collection(db,'team'), where('uid','==',uid));
  const snap = await getDocs(q);
  if(snap.empty){ teamBody.innerHTML = '<tr><td colspan="4" style="color:#6b7280">No team members</td></tr>'; return; }
  teamBody.innerHTML = '';
  snap.forEach(docSnap=>{
    const r = docSnap.data();
    const joined = r.joinDate && r.joinDate.toDate ? r.joinDate.toDate().toLocaleDateString() : (r.joinDate||'-');
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${r.memberName||'-'}</td><td>${r.memberId||'-'}</td><td>${r.plan||'-'}</td><td>${joined}</td>`;
    teamBody.appendChild(tr);
  });
});
