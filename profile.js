// js/profile.js
import { auth, db, storage } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { doc, getDoc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-storage.js";

const profName = document.getElementById('profName');
const profEmail = document.getElementById('profEmail');
const profPhone = document.getElementById('profPhone');
const profFile = document.getElementById('profFile');
const profAvatar = document.getElementById('profAvatar');
const saveProfile = document.getElementById('saveProfile');
const profMsg = document.getElementById('profMsg');

onAuthStateChanged(auth, async (user)=>{
  if(!user) return location.href='index.html';
  const uid = user.uid;
  profEmail.value = user.email || '';
  const uRef = doc(db,'users',uid);
  const uSnap = await getDoc(uRef);
  if(uSnap.exists()){
    const d = uSnap.data();
    profName.value = d.name || '';
    profPhone.value = d.phone || '';
    if(d.photoURL){ profAvatar.style.backgroundImage = `url(${d.photoURL})`; profAvatar.textContent = ''; }
    else profAvatar.textContent = (d.name||'U').slice(0,1).toUpperCase();
  }
});

if(saveProfile){
  saveProfile.addEventListener('click', async ()=>{
    profMsg.style.display='none';
    const user = auth.currentUser; if(!user) return location.href='index.html';
    const uid = user.uid;
    try{
      let photoURL = null;
      if(profFile.files && profFile.files[0]){
        const f = profFile.files[0];
        const storageRef = ref(storage, `profiles/${uid}_${Date.now()}_${f.name}`);
        await uploadBytes(storageRef, f);
        photoURL = await getDownloadURL(storageRef);
      }
      const updates = { name: profName.value.trim(), phone: profPhone.value.trim(), updatedAt: serverTimestamp() };
      if(photoURL) updates.photoURL = photoURL;
      await updateDoc(doc(db,'users',uid), updates);
      profMsg.style.color='green'; profMsg.textContent='Profile saved'; profMsg.style.display='block';
      setTimeout(()=>profMsg.style.display='none',1400);
    } catch(e){
      profMsg.textContent = e.message; profMsg.style.display='block';
    }
  });
}
