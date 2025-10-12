const SUPABASE_URL = "https://cisbvzecomyueslqkmbd.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpc2J2emVjb215dWVzbHFrbWJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5MDMwNTIsImV4cCI6MjA3NTQ3OTA1Mn0.hUNwgoIt-hgh21a1WNqsGkC2QC6mpwAcio5ek86kAfc";

const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Menu toggle (for mobile)
const menuBtn = document.getElementById("menu-btn");
const sidebar = document.getElementById("sidebar");

menuBtn?.addEventListener("click", () => {
  sidebar.classList.toggle("active");
});

// Load user data
window.addEventListener("load", async () => {
  const { data } = await client.auth.getSession();
  const user = data?.session?.user;
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  document.getElementById("userName").textContent = user.email.split("@")[0];
  document.getElementById("userId").textContent = user.id.slice(0, 8);

  // Fetch some dummy values (replace with Supabase data later)
  document.getElementById("earnings").textContent = "₹3142";
  document.getElementById("withdrawals").textContent = "₹0";
  document.getElementById("refBonus").textContent = "₹1996";
  document.getElementById("teamCount").textContent = "4";
});

// Logout
document.getElementById("logout")?.addEventListener("click", async () => {
  await client.auth.signOut();
  window.location.href = "index.html";
});
