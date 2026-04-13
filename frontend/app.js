// Base API URL for backend server
const API = "http://localhost:5000";

// Stores uploaded profile image URL (Cloudinary)
let uploadedImage = "";

// Determine if current page is public (no authentication required)
const isPublicPage =
  window.location.pathname.includes("login.html") ||
  window.location.pathname.includes("register.html") ||
  window.location.pathname.includes("index.html") ||
  window.location.pathname.includes("reset.html"); 

// Redirect unauthenticated users to login page
if (!isPublicPage && !localStorage.getItem("token")) {
  window.location.href = "login.html";
}

function showEditForm() {
  const container = document.getElementById("editContainer");

  // 🔥 toggle open/close
  if (container.innerHTML !== "") {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = `
    <div class="card" style="margin-top:20px;">
      <h3>Edit Profile</h3>

      <input id="editName" placeholder="Name">
      <input id="editJob" placeholder="Job Title">
      <input id="editBio" placeholder="Bio">
      <input id="editLinkedin" placeholder="LinkedIn">

      <button onclick="saveProfile()">Save</button>
    </div>
  `;
}


// ================= API CALLS =================

// Automatically clear messages (success/error) after 3 seconds
function clearMsg(msg) {
  setTimeout(() => {
    if (msg) msg.innerText = "";
  }, 3000);
}
// FEATURED
function loadFeatured() {
  fetch(API + "/api/profile/featured")
    .then(res => {
      if (!res.ok) {
        return { data: null };
      }
      return res.json();
    })
    .then(data => {
      const el = document.getElementById("featured");

      if (!data.data) {
        el.innerHTML = "No featured alumni today";
        return;
      }

      el.innerHTML = `
  <div class="featured-card">
  <h3 class="winner-title">🏆 Influencer of the Day</h3>
    <img src="${data.data.profileImage || 'https://via.placeholder.com/100'}" class="featured-img"/>

    <h3>${data.data.name}</h3>
    <p>${data.data.jobTitle}</p>
    <p>${data.data.bio || ""}</p>
  </div>
`;
    })
    .catch(() => {
      document.getElementById("featured").innerText = "Error loading";
    });
}
function loadAppearance() {
  fetch(API + "/api/profile", {
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token")
    }
  })
    .then(res => {
  if (res.status === 401) {
    logout();
    return;
  }
  if (!res.ok) throw new Error("Failed to load appearance");
  return res.json();
})
    .then(data => {
      const user = data.user || data;

      document.getElementById("appearanceCount").innerText =
        user.appearanceCount || 0;
    });
}
// Dynamically render navbar based on login state
function loadNavbar() {
  const nav = document.getElementById("navLinks");
  if (!nav) return;

  const token = localStorage.getItem("token");

  // NOT LOGGED IN
  if (!token) {
    nav.innerHTML = `
      <a href="index.html">Home</a>
      <a href="register.html">Register</a>
      <a href="login.html">Login</a>
    `;
  }

  // LOGGED IN
  else {
    nav.innerHTML = `
      <a href="index.html">Home</a>
      <a href="profile.html">Profile</a>
      <a href="manage.html">Manage</a>
      <a href="bids.html">Bids</a>
      <span onclick="logout()">Logout</span>
    `;
  }
}
// Adjust UI for guests (hide features, show login prompts)
function handleGuestView() {
  const token = localStorage.getItem("token");

  const stats = document.getElementById("statsSection");
  const result = document.getElementById("liveStatus");
  const bidAmount = document.getElementById("bidAmount");
  const usage = document.getElementById("usageCard");

  // NOT LOGGED IN
  if (!token) {
    if (stats) {
      stats.innerHTML = `
        <p style="color:#facc15; text-align:center;">
          Login to view your bidding stats and participate
        </p>
      `;
    }

    if (result) {
  result.innerText = "Login to place bids";
  result.style.color = "#facc15";
}

if (bidAmount) {
  bidAmount.innerText = "Login to place bids";
  bidAmount.style.color = "#facc15";
}
    if (usage) {
      usage.style.display = "none";
    }
  }
}

// Fetch and display user profile data (profile & manage views)
function loadProfile() {
  const isProfilePage = document.body.classList.contains("profile");
  const isManagePage = document.body.classList.contains("manage");
  fetch(API + "/api/profile", {
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token")
    }
  })
    .then(res => {
  if (res.status === 401) {
    logout();
    return;
  }
  if (!res.ok) throw new Error("Failed to load profile");
  return res.json();
})
    .then(data => {

  const user = data.user || data;

  // Store profile image URL for future updates
  uploadedImage = user.profileImage || "";

  const nameEl = document.getElementById("name");
if (nameEl) nameEl.innerText = user.name || "Your Name";

const jobEl = document.getElementById("job");
if (jobEl) jobEl.innerText = user.jobTitle || "Current Job Title";

const bioEl = document.getElementById("bio");
if (bioEl) bioEl.innerText = user.bio || "No bio added yet.";

const linkedinEl = document.getElementById("linkedin");
if (linkedinEl) linkedinEl.innerText = user.linkedin || "No link added";

  const img = document.querySelector(".profile-img img");
  // SHOW IMAGE IN MANAGE PAGE
const avatar = document.querySelector(".avatar");
if (avatar) {
  avatar.style.backgroundImage = `url(${user.profileImage || "https://i.pravatar.cc/150"})`;
  avatar.style.backgroundSize = "cover";
  avatar.style.backgroundPosition = "center";
}
if (img) {
  img.src = user.profileImage || "https://i.pravatar.cc/150";
}

// Render degrees list (profile view vs manage view)
const degreeList = document.getElementById("degreeList");

if (degreeList) {
  if (!user.degrees || user.degrees.length === 0) {
    degreeList.innerHTML = "<div class='empty'>No qualifications added yet</div>";
  } else {
    degreeList.innerHTML = user.degrees
  .filter(d => d.title || d.name)
  .map((d, i) => {

    if (isProfilePage) {
      return `
        <li class="profile-item-card">
          ${d.title || d.name || "No qualification"}
        </li>
      `;
    }

    if (isManagePage) {
      return `
        <li class="list-item">
          <span class="item-text">
            • ${d.title || d.name || "No qualification"}
          </span>

          <div class="item-actions">
            <button class="icon-btn" onclick='openModal("degree", ${i})'>✏️</button>
            <button class="icon-btn delete" onclick="deleteDegree(${i})">❌</button>
          </div>
        </li>
      `;
    }

  }).join("");
  }
}

// Render certifications list
const certList = document.getElementById("certList");

if (certList) {
  if (!user.certifications || user.certifications.length === 0) {
    certList.innerHTML = "<div class='empty'>No certifications added yet</div>";
  } else {
    certList.innerHTML = user.certifications
  .filter(c => c.name || c.title)
  .map((c, i) => {

    if (isProfilePage) {
      return `
        <li class="profile-item-card">
          ${c.name || c.title || "No certification"}
        </li>
      `;
    }

    if (isManagePage) {
      return `
        <li class="list-item">
          <span class="item-text">
            • ${c.name || c.title || "No certification"}
          </span>

          <div class="item-actions">
            <button class="icon-btn" onclick='openModal("certification", ${i})'>✏️</button>
            <button class="icon-btn delete" onclick="deleteCertification(${i})">❌</button>
          </div>
        </li>
      `;
    }

  }).join("");
  }
}

// Render licences list
const licenceList = document.getElementById("licenceList");

if (licenceList) {
  if (!user.licences || user.licences.length === 0) {
    licenceList.innerHTML = "<div class='empty'>No licences added yet</div>";
  } else {
    licenceList.innerHTML = user.licences
  .filter(l => l.name || l.title)
  .map((l, i) => {

    if (isProfilePage) {
      return `
        <li class="profile-item-card">
          ${l.name || l.title || "No licence"}
        </li>
      `;
    }

    if (isManagePage) {
      return `
        <li class="list-item">
          <span class="item-text">
            • ${l.name || l.title || "No licence"}
          </span>

          <div class="item-actions">
            <button class="icon-btn" onclick='openModal("licence", ${i})'>✏️</button>
            <button class="icon-btn delete" onclick="deleteLicence(${i})">❌</button>
          </div>
        </li>
      `;
    }

  }).join("");
  }
}

// Render courses list
const courseList = document.getElementById("courseList");

if (courseList) {
  if (!user.courses || user.courses.length === 0) {
    courseList.innerHTML = "<div class='empty'>No courses added yet</div>";
  } else {
    courseList.innerHTML = user.courses
  .filter(c => c.name || c.title)
  .map((c, i) => {

    if (isProfilePage) {
      return `
        <li class="profile-item-card">
          ${c.name || c.title || "No course"}
        </li>
      `;
    }

    if (isManagePage) {
      return `
        <li class="list-item">
          <span class="item-text">
            • ${c.name || c.title || "No course"}
          </span>

          <div class="item-actions">
            <button class="icon-btn" onclick='openModal("course", ${i})'>✏️</button>
            <button class="icon-btn delete" onclick="deleteCourse(${i})">❌</button>
          </div>
        </li>
      `;
    }

  }).join("");
  }
}

// Render employment history
const employmentList = document.getElementById("employmentList");
if (employmentList && user.employment) {
  employmentList.innerHTML = user.employment
  .filter(e => e.company || e.title || e.name)
  .map((e, i) => {

    if (isProfilePage) {
      return `
        <li class="profile-item-card">
          ${e.company || e.title || e.name || "No job"}
        </li>
      `;
    }

    if (isManagePage) {
      return `
        <li class="list-item">
          <span class="item-text">
            • ${e.company || e.title || e.name || "No job"}
          </span>

          <div class="item-actions">
            <button class="icon-btn" onclick='openModal("employment", ${i})'>✏️</button>
            <button class="icon-btn delete" onclick="deleteEmployment(${i})">❌</button>
          </div>
        </li>
      `;
    }

  }).join("");
}
});
}

// ================= ADD PROFILE ITEMS =================
// Functions to add degree, certification, licence, course, and employment

function addDegree() {
  const name = document.getElementById("degreeName").value.trim();

  const msg = document.getElementById("degreeMsg"); 
  msg.innerText = ""; // CLEAR OLD MESSAGE

  if (!name) {
    msg.innerText = "❌ Degree name is required";
    msg.className = "error";
    clearMsg(msg);
    return;
  }

  fetch(API + "/api/profile/degree", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("token")
    },
    body: JSON.stringify({
      title: document.getElementById("degreeName").value,
      institution: document.getElementById("degreeInstitute").value,
      url: document.getElementById("degreeUrl").value,
      date: document.getElementById("degreeDate").value
    })
  }).then(() => {
    msg.innerText = "✅ Degree added successfully!";
msg.className = "success";

// clear inputs
document.getElementById("degreeName").value = "";
document.getElementById("degreeInstitute").value = "";
document.getElementById("degreeUrl").value = "";
document.getElementById("degreeDate").value = "";

// auto hide
clearMsg(msg);

    loadProfile();
    loadCompletion();
  });
}

function addCertification() {
  const name = document.getElementById("certName").value.trim();

  const msg = document.getElementById("certMsg");
  msg.innerText = "";

  if (!name) {
    msg.innerText = "❌ Certification name is required";
    msg.className = "error";
    clearMsg(msg);
    return;
  }

  fetch(API + "/api/profile/certification", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("token")
    },
    body: JSON.stringify({
      name: document.getElementById("certName").value,
      organisation: document.getElementById("certOrg").value,
      url: document.getElementById("certUrl").value,
      date: document.getElementById("certDate").value
    })
  }).then(() => {
    msg.innerText = "✅ Certification added successfully!";
msg.className = "success";

document.getElementById("certName").value = "";
document.getElementById("certOrg").value = "";
document.getElementById("certUrl").value = "";
document.getElementById("certDate").value = "";

clearMsg(msg);
    loadProfile();
    loadCompletion();
  });
}
function addLicence() {
  const name = document.getElementById("licenceName").value.trim();

  const msg = document.getElementById("licenceMsg");
  msg.innerText = "";

  if (!name) {
    msg.innerText = "❌ Licence name is required";
    msg.className = "error";
    clearMsg(msg);
    return;
  }

  fetch(API + "/api/profile/licence", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("token")
    },
    body: JSON.stringify({
      name: document.getElementById("licenceName").value,
      body: document.getElementById("licenceBody").value,
      url: document.getElementById("licenceUrl").value,
      date: document.getElementById("licenceDate").value
    })
  }).then(() => {
    msg.innerText = "✅ Licence added successfully!";
msg.className = "success";

document.getElementById("licenceName").value = "";
document.getElementById("licenceBody").value = "";
document.getElementById("licenceUrl").value = "";
document.getElementById("licenceDate").value = "";

clearMsg(msg);
    loadProfile();
    loadCompletion();
  });
}
function addCourse() {
  const name = document.getElementById("courseName").value.trim();

  const msg = document.getElementById("courseMsg");
  msg.innerText = "";

  if (!name) {
    msg.innerText = "❌ Course name is required";
    msg.className = "error";
    clearMsg(msg);
    return;
  }

  fetch(API + "/api/profile/course", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("token")
    },
    body: JSON.stringify({
      name: document.getElementById("courseName").value,
      provider: document.getElementById("courseProvider").value,
      url: document.getElementById("courseUrl").value,
      date: document.getElementById("courseDate").value
    })
  }).then(() => {
    msg.innerText = "✅ Course added successfully!";
msg.className = "success";

document.getElementById("courseName").value = "";
document.getElementById("courseProvider").value = "";
document.getElementById("courseUrl").value = "";
document.getElementById("courseDate").value = "";

clearMsg(msg);

    loadProfile();
    loadCompletion();
  });
}

function addEmployment() {
  const company = document.getElementById("employmentName").value.trim();
  const title = document.getElementById("employmentTitle").value.trim();

  const msg = document.getElementById("employmentMsg");
  msg.innerText = "";

  if (!company || !title) {
    msg.innerText = "❌ Company Name and Job Title are required";
    msg.className = "error";
    clearMsg(msg);
    return;
  }

  fetch(API + "/api/profile/employment", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("token")
    },
    body: JSON.stringify({
      company: document.getElementById("employmentName").value,
      title: document.getElementById("employmentTitle").value,
      startDate: document.getElementById("startDate").value,
      endDate: document.getElementById("endDate").value,
      description: document.getElementById("employmentDesc").value
    })
  }).then(() => {
    msg.innerText = "✅ Employment added successfully!";
msg.className = "success";

document.getElementById("employmentName").value = "";
document.getElementById("employmentTitle").value = "";
document.getElementById("startDate").value = "";
document.getElementById("endDate").value = "";
document.getElementById("employmentDesc").value = "";

clearMsg(msg);
    loadProfile();
    loadCompletion();
  });
}

// ================= DELETE PROFILE ITEMS =================
// Remove items from profile by index

function deleteDegree(index) {
  fetch(API + "/api/profile/degree/" + index, {
    method: "DELETE",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token")
    }
  }).then(() => {
  loadProfile();
  loadCompletion(); 
});
}

function deleteCertification(index) {
  fetch(API + "/api/profile/certification/" + index, {
    method: "DELETE",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token")
    }
  }).then(() => {
  loadProfile();
  loadCompletion(); 
});
}

function deleteLicence(index) {
  fetch(API + "/api/profile/licence/" + index, {
    method: "DELETE",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token")
    }
  }).then(() => {
  loadProfile();
  loadCompletion(); 
});
}

function deleteCourse(index) {
  fetch(API + "/api/profile/course/" + index, {
    method: "DELETE",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token")
    }
  }).then(() => {
  loadProfile();
  loadCompletion(); 
});
}

function deleteEmployment(index) {
  fetch(API + "/api/profile/employment/" + index, {
    method: "DELETE",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token")
    }
  }).then(() => {
  loadProfile();
  loadCompletion(); 
});
}

// Fetch profile completion percentage from backend
function loadCompletion() {
  fetch(API + "/api/profile", {
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token")
    }
  })
    .then(res => {
      if (!res.ok) throw new Error("Request failed");
      return res.json();
    })
    .then(data => {
      const percent = data.completion || 0;

      // just update UI directly
      updateCompletionUI(percent);
    })
    .catch(() => {
      const text = document.getElementById("completionText");
      if (text) text.innerText = "Error";
    });
}
// Update progress bar UI based on completion percentage
function updateCompletionUI(percent) {
  const bar = document.getElementById("progressBar");
  const text = document.getElementById("completionText");

  if (bar) {
    bar.style.width = percent + "%";

    if (percent < 40) {
      bar.style.background = "#ef4444";
    } else if (percent < 70) {
      bar.style.background = "#facc15";
    } else {
      bar.style.background = "#22c55e";
    }
  }

  if (text) {
    text.innerText = percent + "%";
  }
}

// ================= BIDDING FUNCTIONS =================

// Place a new bid or update existing bid
function placeBid() {
    const msg = document.getElementById("bidMsg");
  msg.innerText = ""; 

  const btn = document.querySelector(".place-btn"); // give button a class
  if (btn) btn.disabled = true;

  fetch(API + "/api/bids", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + localStorage.getItem("token")
    },
    body: JSON.stringify({
      amount: document.getElementById("amount").value
    })
  })
  .then(async res => {
  if (res.status === 401) {
    logout();
    return;
  }

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Error placing bid");
  }

  return data;
})
  .then(data => {
msg.innerText = "✅ " + (data.message || "Bid placed");
msg.className = "success";
clearMsg(msg);

    loadMyBid();
    loadBidHistory();
    loadBidStatus();
    loadMonthlyLimit();
    loadLiveStatus();

    document.getElementById("amount").value = "";
  })
  .catch(err => {
msg.innerText = "❌ " + err.message;
msg.className = "error";
clearMsg(msg);
    console.error(err);
  })
  .finally(() => {
    if (btn) btn.disabled = false; // re-enable button
  });
}
// Fetch user's current bid for today
function loadMyBid() {
  fetch(API + "/api/bids/me", {
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token")
    }
  })
    .then(res => {
  if (res.status === 401) {
    logout();
    return;
  }
  if (!res.ok) return { amount: null };
  return res.json();
})
    .then(data => {
      document.getElementById("myBid").innerText =
        data.amount
          ? `Rs.${data.amount} (${data.status})`
          : "No bid yet";
    })
    .catch(() => {
      document.getElementById("myBid").innerText = "No bid yet";
    });
}
// Retrieve user's bid history
function loadBidHistory() {
  fetch(API + "/api/bids/all", {
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token")
    }
  })
    .then(res => {
  if (res.status === 401) {
    logout();
    return;
  }
  if (!res.ok) throw new Error("Failed to load history");
  return res.json();
})
    .then(data => {
      const list = document.getElementById("bidHistory");

      list.innerHTML = data
        .map(
          bid => `
          <li>
            Rs.${bid.amount} - ${bid.status}
          </li>
        `
        )
        .join("");
    });
}
// Cancel today's bid
function cancelBid() {
    const msg = document.getElementById("bidMsg");
  msg.innerText = ""; 
  fetch(API + "/api/bids", {
    method: "DELETE",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token")
    }
  })
    .then(async res => {
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Error cancelling bid");
  }

  return data;
})
    .then(data => {
msg.innerText = "✅ " + data.message;
msg.className = "success";
clearMsg(msg);

      // update bid page
const myBid = document.getElementById("myBid");
if (myBid) myBid.innerText = "No bid yet";


// update bids page status
const bidStatus = document.getElementById("bidStatus");
if (bidStatus) bidStatus.innerText = "No bid yet";

// update dashboard
const status = document.getElementById("liveStatus");
if (status) {
  status.innerText = "No bid placed yet for today";
  status.style.color = "#facc15";
}

const bidAmount = document.getElementById("bidAmount");
if (bidAmount) {
  bidAmount.innerText = "No bid placed yet for today";
  bidAmount.style.color = "#facc15";
}

        loadMyBid();        
        loadBidStatus();    
        loadBidHistory();
        loadMonthlyLimit();
    })
  .catch(err => {
    msg.innerText = "❌ " + err.message;
    msg.className = "error";
    clearMsg(msg);
  });
}

function loadStats() {
  fetch(API + "/api/bids/stats", {
    headers: {
      "Authorization": "Bearer " + localStorage.getItem("token")
    }
  })
  .then(res => {
  if (res.status === 401) {
    logout();
    return;
  }
  if (!res.ok) throw new Error("Failed to load stats");
  return res.json();
})
  .then(data => {
    document.getElementById("bids").innerText = data.bids || 0;
    document.getElementById("wins").innerText = data.wins || 0;
  })
  .catch(() => {
    document.getElementById("bids").innerText = "0";
    document.getElementById("wins").innerText = "0";
  });
}
function loadBidStatus() {
  fetch(API + "/api/bids/me", {
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token")
    }
  })
    .then(res => {
      if (!res.ok) return {};
      return res.json();
    })
    .then(data => {
      const amountEl = document.getElementById("bidAmount");
      const statusEl = document.getElementById("bidStatus");

      // no bid
if (!data?.amount) {
  if (amountEl) {
    amountEl.innerText = "No bid placed yet for today";
    amountEl.style.color = "#facc15";
  }
  if (statusEl) {
    statusEl.innerText = "No bid yet";
  }
  return;
}

// pending
if (data.status === "pending") {
  if (amountEl) {
    amountEl.innerText = `Your bid: Rs.${data.amount} (pending)`;
    amountEl.style.color = "#facc15";
  }
  if (statusEl) {
    statusEl.innerText = `Rs.${data.amount} (pending)`;
  }
}
      else if (data.status === "won") {
  if (amountEl) {
    amountEl.innerText = `You won 🎉 (Rs.${data.amount})`;
    amountEl.style.color = "#22c55e";
  }
  if (statusEl) {
    statusEl.innerText = `Rs.${data.amount} (won)`;
  }
}
else if (data.status === "lost") {
  if (amountEl) {
    amountEl.innerText = `You lost (Rs.${data.amount})`;
    amountEl.style.color = "#ef4444";
  }
  if (statusEl) {
    statusEl.innerText = `Rs.${data.amount} (lost)`;
  }
}
    })
    .catch(() => {
      document.getElementById("bidAmount").innerText = "Error loading";
    });
}
// Show if user is currently winning or losing
function loadLiveStatus() {
  fetch(API + "/api/bids/live-status", {
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token")
    }
  })
    .then(res => {
  if (!res.ok) throw new Error("Request failed");
  return res.json();
})
    .then(data => {
      const el = document.getElementById("liveStatus");

      if (!el) return;

      if (data.status === "winning") {
        el.innerText = "🟢 You are currently WINNING!";
      } else if (data.status === "not_winning") {
        el.innerText = "🔴 You are NOT winning";
      } else {
        el.innerText = "No bid yet";
      }
    })
    .catch(() => {
      const el = document.getElementById("liveStatus");
      if (el) el.innerText = "Error loading status";
    });
}
// Display user's monthly win limit usage
function loadMonthlyLimit() {
  fetch(API + "/api/bids/stats", {
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token")
    }
  })
  .then(res => {
  if (res.status === 401) {
    logout();
    return;
  }
  if (!res.ok) throw new Error("Failed to load limit");
  return res.json();
})
  .then(data => {
    const el = document.getElementById("limit");
    if (el) {
      el.innerText = `Monthly limit used: ${data.wins || 0} / 3`;
    }
  });
}
// Check if tomorrow's bidding slot is available
function loadSlot() {
  fetch(API + "/api/bids/slot", {
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token")
    }
  })
  .then(res => {
    if (res.status === 401) {
      logout();
      return;
    }
    if (!res.ok) throw new Error("Failed to load slot");
    return res.json();
  })
  .then(data => {
    if (!data) return;

    const el = document.getElementById("slot");

    if (el) {
      el.innerHTML = `Tomorrow's slot: 
        <span style="color:${data.available ? '#22c55e' : '#ef4444'}">
          ${data.available ? "Available" : "Taken"}
        </span>`;
    }
  })
  .catch(() => {
    document.getElementById("slot").innerText = "Error loading slot";
  });
}

// Update user profile and refresh completion status
function saveProfile() {
  const name = document.getElementById("editName").value.trim();
  const job = document.getElementById("editJob").value.trim();
  const linkedin = document.getElementById("editLinkedin").value.trim();
  const bio = document.getElementById("editBio").value.trim();
  const image = uploadedImage || undefined;

  const msg = document.getElementById("profileMessage");
  msg.innerHTML = ""; // 🔥 ADD THIS
  const btn = document.querySelector(".profile-section button");

  // VALIDATION
  if (!name || !job) {
    msg.innerHTML = "❌ Please fill all required fields";
    msg.className = "error";
    clearMsg(msg);
    return;
  }

  // LOADING
  msg.innerHTML = "⏳ Saving...";
  msg.className = "loading";
  btn.disabled = true;
  btn.innerText = "Saving...";

  fetch(API + "/api/profile", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + localStorage.getItem("token")
    },
    body: JSON.stringify({
      name,
      jobTitle: job,
      bio,
      linkedin,
      profileImage: image
    })
  })
 .then(async res => {
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Error updating profile");
  }

  return data;
})
  .then(data => {
    msg.innerHTML = "✅ Profile updated successfully!";
    msg.className = "success";
    setTimeout(() => {
  msg.innerHTML = "";
}, 3000);

    btn.disabled = false;
    btn.innerText = "Save Profile";

    updateCompletionUI(data.completion);
    loadProfile();
  })
  .catch(err => {
  msg.innerHTML = "❌ " + err.message;
    msg.className = "error";
    setTimeout(() => {
  msg.innerHTML = "";
}, 3000);

    btn.disabled = false;
    btn.innerText = "Save Profile";
  });
}
// ================= AUTHENTICATION =================

// Logout
function logout() {
  localStorage.removeItem("token");
  window.location.href = "index.html"; // ADD THIS
}
// Register new user
function register() {
  const btn = document.querySelector("button");
  btn.disabled = true;

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  fetch(API + "/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  })
  .then(res => res.json())
  .then(data => {
    if (data.token) {
  document.getElementById("success").innerHTML = `
    <div style="background:#1e293b; padding:15px; border-radius:8px; margin-top:10px;">
      <h3>📧 Verify your email</h3>

      <a href="http://localhost:5000/api/auth/verify/${data.token}" target="_blank"
         style="display:inline-block; margin-top:10px; background:#38bdf8; padding:8px 12px; border-radius:6px; color:black; text-decoration:none;">
         Click to verify
      </a>

      <p style="margin-top:10px;">Token:</p>
      <div style="background:#0f172a; padding:8px; border-radius:5px; font-size:12px; word-break:break-all;">
        ${data.token}
      </div>

      <p style="margin-top:10px;">
        Already verified? <a href="login.html">Login</a>
      </p>
    </div>
  `;

  document.getElementById("error").innerText = "";
}else {
   const errorEl = document.getElementById("error");
  errorEl.innerText =
    data.message ||
    (data.errors && data.errors[0].msg) ||
    "Something went wrong";

  document.getElementById("success").innerText = "";

  clearMsg(errorEl);
}
  })
  .catch(() => {
  const errorEl = document.getElementById("error");
  errorEl.innerText = "Server error";

  clearMsg(errorEl);
})
.finally(() => {
  btn.disabled = false;
});
}
// Login user and store JWT token
function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  document.getElementById("error").innerText = "";

  fetch(API + "/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  })
  .then(res => res.json())
  .then(data => {
    if (data.token) {
      localStorage.setItem("token", data.token);

      window.location.href = "index.html"; // go to dashboard
    } else {
      const errorEl = document.getElementById("error");

  errorEl.innerText =
    data.message || "Invalid login";

  clearMsg(errorEl); 
    }
  })
  .catch(() => {
    const errorEl = document.getElementById("error");
  errorEl.innerText = "Server error";

  clearMsg(errorEl);
  });
}
// Reset password using token
function resetPassword() {
  const email = document.getElementById("email").value;

  const errorEl = document.getElementById("error");
  const successEl = document.getElementById("success");

  // CLEAR OLD MESSAGES
  errorEl.innerText = "";
  successEl.innerText = "";

  if (!email) {
    errorEl.innerText = "Please enter your email";
    clearMsg(errorEl);
    return;
  }

  const btn = document.querySelector("#resetSection button");
  btn.disabled = true;

  const token = document.getElementById("token").value;
  const password = document.getElementById("newPassword").value;

  fetch(API + "/api/auth/reset-password/" + token, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password })
  })
  .then(async res => {
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Reset failed");
    }

    return data;
  })
  .then(data => {
    // CLEAR ERROR
    errorEl.innerText = "";

    // store success for login page
    localStorage.setItem(
      "successMsg",
      data.message || "Password reset successful"
    );

    window.location.href = "login.html";
  })
  .catch(err => {
    errorEl.innerText = err.message;
    successEl.innerText = "";

    clearMsg(errorEl); // timeout
  })
  .finally(() => {
    btn.disabled = false;
  });
}
// Request password reset token via email
function requestReset() {
  const email = document.getElementById("email").value;

  const errorEl = document.getElementById("error");
  const successEl = document.getElementById("success");

  errorEl.innerText = "";
  successEl.innerText = "";

  const btn = document.querySelector("#requestSection button");
  btn.disabled = true;

  if (!email) {
    errorEl.innerText = "Please enter your email";
    clearMsg(errorEl); 
    btn.disabled = false;
    return;
  }

  fetch(API + "/api/auth/request-password-reset", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email })
  })
  .then(async res => {
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Error sending reset token");
    }

    return data;
  })
  .then(data => {
    successEl.innerText = data.message || "Token sent";
    errorEl.innerText = ""; 

    clearMsg(successEl); 

    document.getElementById("requestSection").style.display = "none";
    document.getElementById("resetSection").style.display = "block";
  })
  .catch(err => {
    errorEl.innerText = err.message;
    successEl.innerText = ""; // CLEAR SUCCESS

    clearMsg(errorEl); 
  })
  .finally(() => {
    btn.disabled = false;
  });
}
// Toggle password visibility (show/hide)
function togglePassword(inputId, el) {
  const input = document.getElementById(inputId);

  if (input.type === "password") {
    input.type = "text";
    el.innerText = "🙈";
  } else {
    input.type = "password";
    el.innerText = "👁️";
  }
}
// ================= IMAGE UPLOAD (Cloudinary) =================

const uploadBox = document.getElementById("uploadBox");
const fileInput = document.getElementById("fileInput");

if (uploadBox && fileInput) {

  // click → open file
  uploadBox.addEventListener("click", () => {
    fileInput.click();
  });

  // file selected
  fileInput.addEventListener("change", handleImage);

  // drag over
  uploadBox.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadBox.classList.add("dragover");
  });

  // drag leave
  uploadBox.addEventListener("dragleave", () => {
    uploadBox.classList.remove("dragover");
  });

  // drop
  uploadBox.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadBox.classList.remove("dragover");

    const file = e.dataTransfer.files[0];
    handleImage({ target: { files: [file] } });
  });
}


// Upload image to Cloudinary and store returned URL
function handleImage(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (file.size > 2 * 1024 * 1024) {
  uploadBox.innerText = "❌ Max 2MB allowed";

setTimeout(() => {
  uploadBox.innerText = "Drag & Drop Image Here or Click";
}, 2000);

return;
}

  uploadBox.innerText = "⏳ Uploading...";

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "alumni_upload"); // my preset

  fetch("https://api.cloudinary.com/v1_1/dwqvxx1q8/image/upload", {
    method: "POST",
    body: formData
  })
  .then(res => res.json())
  .then(data => {

  
  if (!data.secure_url) {
  uploadBox.innerText = "❌ Upload failed";

  setTimeout(() => {
    uploadBox.innerText = "Drag & Drop Image Here or Click";
  }, 2000);

  return;
}

  const imageUrl = data.secure_url;

    // store URL instead of base64
    uploadedImage = imageUrl;

    uploadBox.innerText = "✅ Image uploaded";

    setTimeout(() => {
  uploadBox.innerText = "Drag & Drop Image Here or Click";
}, 2000);

    // preview
    const avatar = document.querySelector(".avatar");
    if (avatar) {
      avatar.style.backgroundImage = `url(${imageUrl})`;
      avatar.style.backgroundSize = "cover";
      avatar.style.backgroundPosition = "center";
    }
  })
  .catch(() => {
  uploadBox.innerText = "❌ Upload failed";

  setTimeout(() => {
    uploadBox.innerText = "Drag & Drop Image Here or Click";
  }, 2000);
});
}
let currentEdit = { type: "", index: null };

// Open modal and load selected item for editing
function openModal(type, index) {
  currentEdit = { type, index };

  document.getElementById("modalTitle").innerText = "Edit " + type;

  fetch(API + "/api/profile", {
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token")
    }
  })
  .then(async res => {
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Error loading data");
  }

  return data;
})
  .then(data => {
    const user = data.user || data;

    let item;

    if (type === "degree") item = user.degrees[index];
    if (type === "certification") item = user.certifications[index];
    if (type === "licence") item = user.licences[index];
    if (type === "course") item = user.courses[index];
    if (type === "employment") item = user.employment[index];

    renderModalFields(type, item);
  });
}
function renderModalFields(type, item) {
  const container = document.getElementById("modalFields");

  if (type === "degree") {
    container.innerHTML = `
      <input id="m_title" value="${item.title || ""}">
      <input id="m_institution" value="${item.institution || ""}">
      <input id="m_url" value="${item.url || ""}">
      <input type="date" id="m_date" value="${item.date || ""}">
    `;
  }

  else if (type === "certification") {
    container.innerHTML = `
      <input id="m_name" value="${item.name || ""}">
      <input id="m_org" value="${item.organisation || ""}">
      <input id="m_url" value="${item.url || ""}">
      <input type="date" id="m_date" value="${item.date || ""}">
    `;
  }

  else if (type === "licence") {
    container.innerHTML = `
      <input id="m_name" value="${item.name || ""}">
      <input id="m_body" value="${item.body || ""}">
      <input id="m_url" value="${item.url || ""}">
      <input type="date" id="m_date" value="${item.date || ""}">
    `;
  }

  else if (type === "course") {
    container.innerHTML = `
      <input id="m_name" value="${item.name || ""}">
      <input id="m_provider" value="${item.provider || ""}">
      <input id="m_url" value="${item.url || ""}">
      <input type="date" id="m_date" value="${item.date || ""}">
    `;
  }

  else if (type === "employment") {
    container.innerHTML = `
      <input id="m_company" value="${item.company || ""}">
      <input id="m_title" value="${item.title || ""}">
      <input type="date" id="m_start" value="${item.startDate || ""}">
      <input type="date" id="m_end" value="${item.endDate || ""}">
      <textarea id="m_desc">${item.description || ""}</textarea>
    `;
  }

  document.getElementById("editModal").style.display = "flex";
}
function closeModal() {
  document.getElementById("editModal").style.display = "none";
}
// Save updated profile item via API
function saveModal() {
  const { type, index } = currentEdit;

  const saveBtn = document.querySelector(".modal-actions button:last-child");
  if (saveBtn) saveBtn.disabled = true;

  const msg = document.getElementById("modalMsg");
  if (msg) msg.innerText = "";

  let body = {};

  // DEGREE
  if (type === "degree") {
    const title = document.getElementById("m_title").value.trim();

    if (!title) {
      msg.innerText = "❌ Degree name is required";
      msg.className = "error";
      clearMsg(msg);
      if (saveBtn) saveBtn.disabled = false;
      return;
    }

    body = {
      title,
      institution: document.getElementById("m_institution").value,
      url: document.getElementById("m_url").value,
      date: document.getElementById("m_date").value
    };
  }

  // CERTIFICATION
  else if (type === "certification") {
    const name = document.getElementById("m_name").value.trim();

    if (!name) {
      msg.innerText = "❌ Certification name is required";
      msg.className = "error";
      clearMsg(msg);
      if (saveBtn) saveBtn.disabled = false;
      return;
    }

    body = {
      name,
      organisation: document.getElementById("m_org").value,
      url: document.getElementById("m_url").value,
      date: document.getElementById("m_date").value
    };
  }

  // LICENCE
  else if (type === "licence") {
    const name = document.getElementById("m_name").value.trim();

    if (!name) {
      msg.innerText = "❌ Licence name is required";
      msg.className = "error";
      clearMsg(msg);
      if (saveBtn) saveBtn.disabled = false;
      return;
    }

    body = {
      name,
      body: document.getElementById("m_body").value,
      url: document.getElementById("m_url").value,
      date: document.getElementById("m_date").value
    };
  }

  // COURSE
  else if (type === "course") {
    const name = document.getElementById("m_name").value.trim();

    if (!name) {
      msg.innerText = "❌ Course name is required";
      msg.className = "error";
      clearMsg(msg);
      if (saveBtn) saveBtn.disabled = false;
      return;
    }

    body = {
      name,
      provider: document.getElementById("m_provider").value,
      url: document.getElementById("m_url").value,
      date: document.getElementById("m_date").value
    };
  }

  // EMPLOYMENT
  else if (type === "employment") {
    const company = document.getElementById("m_company").value.trim();
    const title = document.getElementById("m_title").value.trim();

    if (!company || !title) {
      msg.innerText = "❌ Company Name and Job Title required";
      msg.className = "error";
      clearMsg(msg);
      if (saveBtn) saveBtn.disabled = false;
      return;
    }

    body = {
      company,
      title,
      startDate: document.getElementById("m_start").value,
      endDate: document.getElementById("m_end").value,
      description: document.getElementById("m_desc").value
    };
  }

  //  API CALL
  fetch(API + "/api/profile/" + type + "/" + index, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("token")
    },
    body: JSON.stringify(body)
  })
  .then(() => {
    msg.innerText = "✅ Updated successfully!";
    msg.className = "success";

    if (saveBtn) saveBtn.disabled = false;

    setTimeout(() => {
      closeModal();
      msg.innerText = "";
    }, 1500);

    loadProfile();
    loadCompletion();
  })
  .catch(() => {
    msg.innerText = "❌ Error updating";
    msg.className = "error";
    if (saveBtn) saveBtn.disabled = false;
    clearMsg(msg);
  });
}
// ================= API KEY MANAGEMENT =================

// Generate new API key for user
function generateKey() {
    const msg = document.getElementById("apiMsg");
  msg.innerText = ""; // ✅ ADD HERE
  fetch(API + "/api/keys", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token")
    }
  })
    .then(res => {
      if (!res.ok) throw new Error("Failed to generate key");
      return res.json();
    })
    .then(data => {
      const resultBox = document.getElementById("apiResult");
      const keyText = document.getElementById("apiKeyText");
      const revokeBtn = document.getElementById("revokeBtn");

      if (resultBox && keyText && revokeBtn) {
        resultBox.style.display = "block";
        keyText.innerText = data.key;
        revokeBtn.disabled = false;
        revokeBtn.onclick = null;
        revokeBtn.onclick = () => {
  if (keyText.innerText.includes("(revoked)")) {
    const msg = document.getElementById("apiMsg");
msg.innerText = "❌ Key already revoked";

clearMsg(msg);
    return;
  }

  revokeKey(data._id);
};
      }

      loadKeys(); // refresh list
    })
    .catch(() => {
      const msg = document.getElementById("apiMsg");
msg.innerText = "❌ Error generating API key";

clearMsg(msg);
    });
}
// Load and display user's API keys
function loadKeys() {
  fetch(API + "/api/keys", {
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token")
    }
  })
    .then(res => {
      if (!res.ok) throw new Error("Failed to load keys");
      return res.json();
    })
    .then(data => {
      const list = document.getElementById("keyList");
      if (!list) return;

      list.innerHTML = "<div class='empty'>Loading...</div>";

      // EMPTY STATE
      if (data.length === 0) {
        list.innerHTML = "<div class='empty'>No API keys yet</div>";
        return;
      }

      data.forEach(k => {
        const li = document.createElement("li");

        li.innerText = k.key;

if (!k.isActive) {
  li.innerText += " (revoked)";
  li.style.color = "red";
} else {
  li.style.color = "white";
}

        list.appendChild(li);
      });
    })
    .catch(() => {
      const list = document.getElementById("keyList");
      if (list) list.innerHTML = "<div class='empty'>Error loading keys</div>";
    });
}

// Revoke selected API key
function revokeKey(id) {
    const msg = document.getElementById("apiMsg");
  msg.innerText = ""; // ✅ ADD HERE
  fetch(API + "/api/keys/" + id + "/revoke", {
    method: "PUT",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token")
    }
  })
    .then(res => {
      if (!res.ok) throw new Error("Failed to revoke key");
    })
    .then(() => {
  const keyText = document.getElementById("apiKeyText");
  const btn = document.getElementById("revokeBtn");

  if (keyText && !keyText.innerText.includes("(revoked)")) {
    keyText.innerText += " (revoked)";
  }

  if (btn) btn.disabled = true;

  loadKeys();
})
    .catch(() => {
      const msg = document.getElementById("apiMsg");
msg.innerText = "❌ Error revoking key";

clearMsg(msg);
    });
}
// Fetch and display API usage count
function loadUsage() {
  fetch(API + "/api/usage", {
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token")
    }
  })
    .then(res => {
      if (!res.ok) throw new Error("Failed");
      return res.json();
    })
    .then(data => {
      const el = document.getElementById("usageText");
      if (!el) return;

      const count = data.count ?? 0;
      el.innerText = count;
    })
    .catch(() => {
      const el = document.getElementById("usageText");
      if (el) el.innerText = "Requests: 0";
    });
}
// OPEN MODAL
function openApiPanel() {
  const modal = document.getElementById("apiModal");
  if (modal) modal.style.display = "flex";

  // load ONLY when opened
  loadKeys();
  loadUsage();
}

// CLOSE MODAL
function closeApiPanel() {
  const modal = document.getElementById("apiModal");
  if (modal) modal.style.display = "none";
}

// CLOSE WHEN CLICK OUTSIDE 
window.onclick = function (e) {
  const modal = document.getElementById("apiModal");
  if (e.target === modal) {
    modal.style.display = "none";
  }
};


