auth.onAuthStateChanged(user=>{
  if(!user){window.location.href="index.html";}
  else{
    const uid=user.uid;
    db.collection("users").doc(uid).get().then(doc=>{
      if(doc.exists){
        const data=doc.data();
        document.getElementById("earnings-today").innerText=`₹${data.earnings_today||0}`;
        document.getElementById("earnings-week").innerText=`₹${data.earnings_week||0}`;
        document.getElementById("earnings-month").innerText=`₹${data.earnings_month||0}`;
        document.getElementById("earnings-total").innerText=`₹${data.earnings_total||0}`;
        document.getElementById("balance").innerText=`₹${data.balance||0}`;
      }
    });

    // Fetch transactions
    db.collection("transactions").where("userId","==",uid).orderBy("date","desc").get().then(snapshot=>{
      const tbody=document.getElementById("transactions-body");
      tbody.innerHTML="";
      snapshot.forEach(doc=>{
        const t=doc.data();
        const row=document.createElement("tr");
        row.innerHTML=`<td>${t.date.toDate().toLocaleDateString()}</td>
                       <td>₹${t.amount}</td>
                       <td>${t.type}</td>
                       <td>${t.status}</td>
                       <td>${t.source}</td>`;
        tbody.appendChild(row);
      });
    });
  }
});
