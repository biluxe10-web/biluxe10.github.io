// js/dashboard.js
initBackgroundAudio();
authGuard(user=>{
  const uid = user.uid;
  db.collection('users').doc(uid).get().then(doc=>{
    if(!doc.exists) return;
    const d = doc.data();
    document.getElementById('earnings-today').innerText = '₹' + (d.earnings_today||0);
    document.getElementById('earnings-week').innerText = '₹' + (d.earnings_week||0);
    document.getElementById('earnings-month').innerText = '₹' + (d.earnings_month||0);
    document.getElementById('earnings-total').innerText = '₹' + (d.earnings_total||0);
    document.getElementById('balance').innerText = '₹' + (d.balance||0);
    document.getElementById('rank').innerText = d.rank||'Affiliate';
  });
});
document.getElementById('muteBtn')?.addEventListener('click',()=>toggleSoundButton(document.getElementById('muteBtn')));
