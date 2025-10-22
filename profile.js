// js/profile.js
import { auth, db, storage } from "./firebase.js";
import { onAuthStateChanged, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { doc, getDoc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-storage.js";

const nameEl = document.getElementById('prof-name');
const emailEl = document.getElementById('prof-email');
const phoneEl = document.getElementById('prof-phone');
const fileEl = document.getElementById('prof-file');
const avatar = document.getElementById('prof-avatar');
const saveBtn = document.getElementById('save-profile');
const msg = document.getElementById('prof-msg');

onAuthStateChanged(auth, async (user)=>{
  if(!user) return window.location.href='index.html';
  const uid = user.uid;
  emailEl.value = user.email;
  // load users doc
  const uSnap = await getDoc(doc(db,'users',uid));
  if(uSnap.exists()){
    const d = uSnap.data();
    nameEl.value = d.name || '';
    phoneEl.value = d.phone || '';
    if(d.profile_url) avatar.style.backgroundImage = `url(${d.profile_url})`;
    else avatar.textContent = (d.name||'U').slice(0,1).toUpperCase();
  }
});

saveBtn.addEventListener('click', async ()=>{
  msg.style.display='none';
  const user = auth.currentUser;
  if(!user) return window.location.href='index.html';
  const uid = user.uid;
  const newName = nameEl.value.trim();
  const newPhone = phoneEl.value.trim();
  try{
    let profile_url = null;
    if(fileEl.files && fileEl.files[0]){
      const f = fileEl.files[0];
      const storageRef = ref(storage, `profiles/${uid}_${Date.now()}_${f.name}`);
      await uploadBytes(storageRef, f);
      profile_url = await getDownloadURL(storageRef);
    }
    const updateData = { name: newName, phone: newPhone, updated_at: serverTimestamp() };
    if(profile_url) updateData.profile_url = profile_url;
    await updateDoc(doc(db,'users',uid), updateData);
    document.getElementById('prof-msg').style.color = 'green';
    document.getElementById('prof-msg').textContent = 'Profile updated';
    document.getElementById('prof-msg').style.display = 'block';
  } catch(e){
    msg.textContent = e.message; msg.style.display='block';
  }
});
