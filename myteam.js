// js/myteam.js
import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const teamBody = document.getElementById('team-body');

onAuthStateChanged(auth, async (user)=>{
  if(!user) return window.location.href='index.html';
  const uid = user.uid;
  teamBody.innerHTML = '<tr><td colspan="4" style="color:var(--muted)">Loading...</td></tr>';
  // find referrals where referred_by = current user's uid
  const q = query(collection(db,'referrals'), where('referrer_uid','==', uid));
  const snap = await getDocs(q);
  if(snap.empty){ teamBody.innerHTML = '<tr><td colspan="4" style="color:var(--muted)">No team members yet</td></tr>'; return; }
  teamBody.innerHTML = '';
  for(const docItem of snap.docs){
    const r = docItem.data();
    // fetch user info of referred
    const targetRef = await db.collection ? null : null; // fallback for some envs
    // Use simple approach: if referred_user_name saved in referrals, show it else show uid
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${r.member_name || r.referred_uid || 'Member'}</td><td>${r.referred_uid || r.member_uid || '-'}</td><td>${r.plan||'-'}</td><td>${r.joined_at ? new Date(r.joined_at.seconds*1000).toLocaleDateString() : '-'}</td>`;
    teamBody.appendChild(tr);
  }
});
