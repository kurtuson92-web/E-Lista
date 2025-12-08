document.addEventListener('DOMContentLoaded', async () => {
  const email = localStorage.getItem('userEmail');
  let username = localStorage.getItem('username');

  if (!email) { 
    window.location.href = '/home'; 
    return; 
  }

  // Display username in header
  document.getElementById('usernameDisplay').textContent = username || '';

  const creditDisplay = document.getElementById('totalCredit');
  const creditsList = document.getElementById('creditsList');

  // Modal elements
  const accountUsername = document.getElementById('accountUsername');
  const creditModal = document.getElementById('creditModal');
  const modalTitle = document.getElementById('modalTitle');
  const creditAmount = document.getElementById('creditAmount');
  const creditSource = document.getElementById('creditSource');
  const submitCredit = document.getElementById('submitCredit');
  const closeCreditModal = document.getElementById('closeCreditModal');

  let creditAction = 'add';

  function openCreditModal(action) {
    creditAction = action;
    modalTitle.textContent = action === 'add' ? 'Deposit' : 'Spend';
    creditAmount.value = '';
    creditSource.value = '';
    creditModal.style.display = 'flex';
  }

  closeCreditModal.addEventListener('click', () => creditModal.style.display = 'none');
  creditModal.addEventListener('click', (e) => { if (e.target === creditModal) creditModal.style.display = 'none'; });

  submitCredit.addEventListener('click', async () => {
    const amount = creditAmount.value;
    const source = creditSource.value;
    if (!amount || !source) return alert('Please fill both fields');

    await fetch(creditAction === 'add' ? '/add-credit' : '/reduce-credit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, amount, source })
    });

    await loadCredit();
    creditModal.style.display = 'none';
  });

  async function loadCredit() {
    const res = await fetch('/get-credit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();

    creditDisplay.textContent = '₱' + Number(data.total).toLocaleString();

    creditsList.innerHTML = '';
    data.credits.forEach(c => {
  const item = document.createElement('li');
  item.innerHTML = `
    <span class="credit-amount" style="color:${c.amount>=0?'green':'red'}">
      ${c.amount >= 0 ? '+' : ''}₱${Number(c.amount).toLocaleString()}
    </span>
    <span class="credit-source">${c.source}</span>
    <span class="credit-date">${new Date(c.date).toLocaleString()}</span>
  `;
  item.classList.add('credit-item');
  creditsList.appendChild(item);
});

  }

  await loadCredit();

  document.getElementById('addCredit').addEventListener('click', () => openCreditModal('add'));
  document.getElementById('reduceCredit').addEventListener('click', () => openCreditModal('reduce'));

  // --- ACCOUNT MODAL ---
  const usernameDisplay = document.getElementById('usernameDisplay');
  const accountModal = document.getElementById('accountModal');
  const closeAccountModal = document.getElementById('closeAccountModal');
  const accountEmail = document.getElementById('accountEmail');
  const logoutBtnModal = document.getElementById('logoutBtnModal');

  usernameDisplay.addEventListener('click', () => {
    username = localStorage.getItem("username");
    accountUsername.textContent = "Username: " + (username || "");
    accountEmail.textContent = "Email: " + email;
    accountModal.style.display = 'flex';
  });

  closeAccountModal.addEventListener('click', () => accountModal.style.display = 'none');
  window.addEventListener('click', (e) => { if (e.target === accountModal) accountModal.style.display = 'none'; });

  logoutBtnModal.addEventListener('click', () => {
    localStorage.removeItem('userEmail');
    localStorage.removeItem('username');
    window.location.href = '/home';
  });

  // --- CHANGE USERNAME MODAL ---
  const changeUsernameBtn = document.getElementById("changeUsernameBtnInModal");
  const changeUsernameModal = document.getElementById("changeUsernameModal");
  const changeUsernameClose = document.querySelector(".changeUsernameClose");
  const saveUsernameBtn = document.getElementById("saveUsernameBtn");

  changeUsernameBtn.addEventListener("click", () => {
    document.getElementById("newUsername").value = "";
    changeUsernameModal.style.display = "flex";
  });

  changeUsernameClose.addEventListener("click", () => changeUsernameModal.style.display = "none");

  window.addEventListener("click", (e) => {
    if (e.target === changeUsernameModal) changeUsernameModal.style.display = "none";
  });

  saveUsernameBtn.addEventListener("click", async () => {
    const newName = document.getElementById("newUsername").value.trim();
    if (!newName) return alert("Please enter a valid username.");

    try {
      const res = await fetch("/update-username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newUsername: newName })
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem("username", newName);
        document.getElementById("usernameDisplay").textContent = newName;
        accountUsername.textContent = "Username: " + newName;
        alert("Username updated successfully!");
        changeUsernameModal.style.display = "none";
      } else {
        alert("Failed to update username.");
      }
    } catch (err) {
      alert("Server error.");
    }
  });

  // --- CHANGE PASSWORD MODAL ---
  const changePasswordBtn = document.getElementById("changePasswordBtnInModal");
  const changePasswordModal = document.getElementById("changePasswordModal");
  const changePasswordClose = document.querySelector(".changePasswordClose");
  const savePasswordBtn = document.getElementById("savePasswordBtn");

  changePasswordBtn.addEventListener("click", () => {
    document.getElementById("currentPassword").value = "";
    document.getElementById("newPassword").value = "";
    document.getElementById("confirmNewPassword").value = "";
    changePasswordModal.style.display = "flex";
  });

  changePasswordClose.addEventListener("click", () => changePasswordModal.style.display = "none");

  window.addEventListener("click", (e) => {
    if (e.target === changePasswordModal) changePasswordModal.style.display = "none";
  });

  savePasswordBtn.addEventListener("click", async () => {
    const current = document.getElementById("currentPassword").value.trim();
    const newPass = document.getElementById("newPassword").value.trim();
    const confirmPass = document.getElementById("confirmNewPassword").value.trim();

    if (!current || !newPass || !confirmPass) return alert("Please fill all fields.");
    if (newPass !== confirmPass) return alert("New passwords do not match.");

    try {
      const res = await fetch("/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, currentPassword: current, newPassword: newPass })
      });
      const data = await res.json();
      if (data.success) {
        alert("Password updated successfully!");
        changePasswordModal.style.display = "none";
      } else {
        alert(data.message || "Failed to update password.");
      }
    } catch (err) {
      alert("Server error.");
    }
  });

});
