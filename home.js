document.addEventListener('DOMContentLoaded', () => {
  const signupBtn = document.getElementById('signupBtn');
  const signupModal = document.getElementById('signupModal');
  const loginModal = document.getElementById('loginModal');
  const closeSignup = document.getElementById('closeSignup');
  const closeLogin = document.getElementById('closeLogin');
  const switchToSignup = document.getElementById('switchToSignup');

  window.openModal = (type) => {
    if (type === "login") loginModal.style.display = "block";
    if (type === "signup") signupModal.style.display = "block";
  };

  signupBtn.addEventListener('click', () => signupModal.style.display = 'block');
  closeSignup.addEventListener('click', () => signupModal.style.display = 'none');
  closeLogin.addEventListener('click', () => loginModal.style.display = 'none');

  window.addEventListener('click', (e) => {
    if (e.target === signupModal) signupModal.style.display = 'none';
    if (e.target === loginModal) loginModal.style.display = 'none';
  });

  switchToSignup.addEventListener('click', () => {
    loginModal.style.display = 'none';
    signupModal.style.display = 'block';
  });

  // SIGNUP
  const signupForm = document.getElementById('signupForm');
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('signupUsername').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;

    try {
  const res = await fetch('/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password })
  });

  const data = await res.json();

  if (res.ok && data.success) {
    localStorage.setItem('userEmail', email);
    localStorage.setItem('username', username);
    window.location.href = '/dashboard';
  } else {
    alert(data.message || 'Signup failed. Try again.');
  }
} catch (err) {
  console.error(err);
  alert('Signup error. Check console.');
}

  });

  // LOGIN
  const loginForm = document.getElementById('loginForm');
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
      const res = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (data.exists) {
        localStorage.setItem('userEmail', email);
        localStorage.setItem('username', data.username); // ✅ store username from server
        window.location.href = '/dashboard';
      } else {
        alert('Invalid email or password.');
      }
    } catch (err) {
      console.error(err);
      alert('Login error.');
    }
  });
});

// About Us Modal
const aboutModal = document.getElementById("aboutModal");
const aboutLink = document.getElementById("aboutLink");
const closeAbout = document.getElementById("closeAbout");

aboutLink.addEventListener("click", (e) => {
  e.preventDefault();
  aboutModal.style.display = "block";
});

closeAbout.addEventListener("click", () => {
  aboutModal.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === aboutModal) {
    aboutModal.style.display = "none";
  }
});



// FORGOT PASSWORD
const forgotPasswordBtn = document.getElementById("forgotPasswordBtn");
const forgotPasswordModal = document.getElementById("forgotPasswordModal");
const closeForgot = document.getElementById("closeForgot");
const forgotForm = document.getElementById("forgotForm");

forgotPasswordBtn.addEventListener("click", () => {
  forgotPasswordModal.style.display = "flex";
});

closeForgot.addEventListener("click", () => {
  forgotPasswordModal.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === forgotPasswordModal) forgotPasswordModal.style.display = "none";
});

forgotForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("forgotEmail").value;
  const username = document.getElementById("forgotUsername").value;
  const newPassword = document.getElementById("forgotNewPassword").value;

  try {
    const res = await fetch("/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, username, newPassword })
    });

    const data = await res.json();

    if (data.success) {
      alert("Password reset successfully!");
      forgotPasswordModal.style.display = "none";
    } else {
      alert(data.message || "Failed to reset password.");
    }
  } catch (err) {
    alert("Server error.");
    console.error(err);
  }
});
