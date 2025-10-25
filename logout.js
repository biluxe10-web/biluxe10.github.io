// js/logout.js
import { auth } from "./firebase.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

const logoutEl = document.getElementById('logout') || document.getElementById('btn-logout');
if(logoutEl){
  logoutEl.addEventListener('click', async (e)=>{
    e.preventDefault();
    await signOut(auth);
    location.href = 'index.html';
  });
}
