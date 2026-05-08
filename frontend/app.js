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
      <a href="dashboard.html">Dashboard</a>
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

const editNameEl = document.getElementById("editName");
if (editNameEl) editNameEl.value = user.name || "";

const editJobEl = document.getElementById("editJob");
if (editJobEl) editJobEl.value = user.jobTitle || "";

const editLinkedinEl = document.getElementById("editLinkedin");
if (editLinkedinEl) editLinkedinEl.value = user.linkedin || "";

const editBioEl = document.getElementById("editBio");
if (editBioEl) editBioEl.value = user.bio || "";

const programmeEl = document.getElementById("editProgramme");
if (programmeEl) programmeEl.value = user.programme || "";

const yearEl = document.getElementById("editYear");
if (yearEl) yearEl.value = user.graduationYear || "";

const industryEl = document.getElementById("editIndustry");
if (industryEl) industryEl.value = user.industry || "";

const locationEl = document.getElementById("editLocation");
if (locationEl) locationEl.value = user.location || "";


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
    loadStats();

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
    document.getElementById("bids").innerText = data.totalBids || 0;
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
  const programme = document.getElementById("editProgramme").value;
const graduationYear = document.getElementById("editYear").value;
const industry = document.getElementById("editIndustry").value;
const location = document.getElementById("editLocation").value;

  const msg = document.getElementById("profileMessage");
  msg.innerHTML = ""; // 🔥 ADD THIS
  const btn = document.querySelector(".profile-section button");

  // VALIDATION
  if (!name || !job || !programme || !graduationYear || !industry || !location) {
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
  profileImage: image,
  programme,
  graduationYear,
  industry,
  location
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
  msg.className = "";
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
  msg.className = "";
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
  const token = document.getElementById("token").value.trim();
  const password = document.getElementById("newPassword").value.trim();

  const errorEl = document.getElementById("error");
  const successEl = document.getElementById("success");

  errorEl.innerText = "";
  successEl.innerText = "";

  if (!token || !password) {
    errorEl.innerText = "Please enter reset token and new password";
    clearMsg(errorEl);
    return;
  }

  const btn = document.querySelector("#resetSection button");
  btn.disabled = true;
  btn.innerText = "Resetting...";

  fetch(API + "/api/auth/reset-password/" + token, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ password })
  })
    .then(async res => {
      const data = await res.json();

      if (!res.ok) {
        const validationMsg =
          data.errors && data.errors.length
            ? data.errors[0].msg
            : data.message || "Reset failed";

        throw new Error(validationMsg);
      }

      return data;
    })
    .then(data => {
      localStorage.setItem(
        "successMsg",
        data.message || "Password reset successful"
      );

      window.location.href = "login.html";
    })
    .catch(err => {
      errorEl.innerText = err.message;
      successEl.innerText = "";
      clearMsg(errorEl);
    })
    .finally(() => {
      btn.disabled = false;
      btn.innerText = "Reset Password";
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
  msg.innerText = ""; 
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

      localStorage.setItem("apiKey", data.key);

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
  const list = document.getElementById("keyList");
  if (!list) return;

  // ✅ Show loading BEFORE request
  list.innerHTML = "<div class='empty'>Loading...</div>";

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
      // ✅ Clear loading AFTER data arrives
      list.innerHTML = "";

      // ✅ Empty state
      if (!data || data.length === 0) {
        list.innerHTML = "<div class='empty'>No API keys yet</div>";
        return;
      }

      // ✅ Render keys
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
      list.innerHTML = "<div class='empty'>Error loading keys</div>";
    });
}

// Revoke selected API key
function revokeKey(id) {
    const msg = document.getElementById("apiMsg");
  msg.innerText = ""; 
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
let jobChartInstance;
let companyChartInstance;
let certChartInstance;
let usageChartInstance;
let bidChartInstance;
let industryChartInstance;
let locationChartInstance;
let yearChartInstance;


function showNoDataMessage(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const parent = canvas.parentElement;

  // remove old message
  const oldMsg = parent.querySelector(".no-data-msg");
  if (oldMsg) oldMsg.remove();

  const loading = parent.querySelector(".loading-msg");
  if (loading) loading.remove();

  // clear canvas
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // destroy chart if exists
  if (canvasId === "jobChart" && jobChartInstance) jobChartInstance.destroy();
if (canvasId === "companyChart" && companyChartInstance) companyChartInstance.destroy();
if (canvasId === "certChart" && certChartInstance) certChartInstance.destroy();
if (canvasId === "usageChart" && usageChartInstance) usageChartInstance.destroy();
if (canvasId === "bidChart" && bidChartInstance) bidChartInstance.destroy();
if (canvasId === "industryChart" && industryChartInstance) industryChartInstance.destroy();
if (canvasId === "yearChart" && yearChartInstance) yearChartInstance.destroy();
if (canvasId === "locationChart" && locationChartInstance) locationChartInstance.destroy();

  // show message
  const msg = document.createElement("p");
  msg.className = "no-data-msg";
  msg.style.color = "#aaa";
  msg.style.textAlign = "center";
  msg.innerText = "No data available for selected filters";

  parent.appendChild(msg);

  const insight = document.getElementById(canvasId.replace("Chart", "Insight"));
if (insight) insight.innerText = "No insights available";
}

function showLoading(chartId) {
  const canvas = document.getElementById(chartId);
  if (!canvas) return;

  const parent = canvas.parentElement;

  // 🔥 CLEAR OLD CHART VISUALLY
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 🔥 REMOVE OLD LOADING (if any)
  const old = parent.querySelector(".loading-msg");
  if (old) old.remove();

  // 🔥 DIM CANVAS (nice UI touch)
  canvas.style.opacity = "0.3";

  // 🔥 ADD LOADING TEXT
  parent.insertAdjacentHTML(
    "beforeend",
    "<p class='loading-msg' style='color:#aaa;text-align:center;'>Loading...</p>"
  );
}

function removeLoading(chartId) {
  const canvas = document.getElementById(chartId);
  if (!canvas) return;

  const parent = canvas.parentElement;

  // remove loading text
  const el = parent.querySelector(".loading-msg");
  if (el) el.remove();

  // 🔥 RESTORE VISIBILITY
  canvas.style.opacity = "1";
}
function loadAnalytics(filters = {}) {
  // CLEAR OLD INSIGHTS BEFORE LOADING
[
  "jobInsight",
  "companyInsight",
  "certInsight",
  "usageInsight",
  "bidInsight",
  "industryInsight",
  "locationInsight",
  "yearInsight"
].forEach(id => {
  const el = document.getElementById(id);
  if (el) {
  el.innerText = "";
  el.style.color = "#ccc"; // reset color
}
});
// 🔥 CLEAR OLD CHARTS + MESSAGES BEFORE LOADING
[
  "jobChart",
  "companyChart",
  "certChart",
  "usageChart",
  "bidChart",
  "industryChart",
  "locationChart",
  "yearChart"
].forEach(id => {
  const canvas = document.getElementById(id);
  if (!canvas) return;

  const parent = canvas.parentElement;

  // remove old messages
  const msg = parent.querySelector(".no-data-msg");
  if (msg) msg.remove();

  const loading = parent.querySelector(".loading-msg");
  if (loading) loading.remove();

  // clear canvas
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});
  const query = new URLSearchParams(filters).toString();
  const token = localStorage.getItem("token");

  if (!token) {
    console.log("No token → analytics blocked");
    return;
  }

  const apiKey = localStorage.getItem("apiKey");

  if (!apiKey) {
    console.log("No API key found");
    return;
  }

  const headers = {
    "Authorization": "Bearer " + token,
    "x-api-key": apiKey
  };

  // ===== JOBS =====
  showLoading("jobChart");
  fetch(API + "/api/analytics/jobs?" + query, { headers })
    .then(async res => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Jobs error");
      return data;
    })
    .then(data => {
      removeLoading("jobChart");
      if (!Array.isArray(data) || data.length === 0 || data[0]?._id === "No Data") {
    showNoDataMessage("jobChart");

    document.getElementById("jobInsight").innerText =
    "No insights available";
    return;
  }
const parent = document.getElementById("jobChart").parentElement;
const oldMsg = parent.querySelector(".no-data-msg");
if (oldMsg) oldMsg.remove();

      data.sort((a, b) => b.count - a.count);

      if (jobChartInstance) jobChartInstance.destroy();
      jobChartInstance = new Chart(document.getElementById("jobChart"), {
        type: "bar",
        data: {
          labels: data.map(d => d._id || "Not Specified"),
          datasets: [{
            label: "Jobs",
            data: data.map(d => d.count)
          }]
        },
options: {
  responsive: true,
  maintainAspectRatio: false
}
      });
      const top = data[0]?._id || "Not Specified";

document.getElementById("jobInsight").innerText =
  `Most common job: ${top} — indicates strong demand for this role, suggesting the curriculum is aligned with industry needs.`;

const insight = document.getElementById("jobInsight");

if (data[0].count > 50) {
  insight.style.color = "red";
} else if (data[0].count > 20) {
  insight.style.color = "orange";
} else {
  insight.style.color = "lightgreen";
}
    })
    .catch(err => {
      removeLoading("jobChart");
  showNoDataMessage("jobChart");
  console.log("Jobs:", err.message);
});

  // ===== COMPANIES =====
  showLoading("companyChart");
  fetch(API + "/api/analytics/companies?" + query, { headers })
    .then(async res => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Companies error");
      return data;
    })
    .then(data => {
      removeLoading("companyChart");
      if (!Array.isArray(data) || data.length === 0 || data[0]?._id === "No Data") {
    showNoDataMessage("companyChart");

    document.getElementById("companyInsight").innerText = "No insights available";
    return;
  }

const parent = document.getElementById("companyChart").parentElement;
const oldMsg = parent.querySelector(".no-data-msg");
if (oldMsg) oldMsg.remove();

      data.sort((a, b) => b.count - a.count);

      if (companyChartInstance) companyChartInstance.destroy();
      companyChartInstance = new Chart(document.getElementById("companyChart"), {
        type: "pie",
        data: {
          labels: data.map(d => d._id || "Not Specified"),
          datasets: [{
            data: data.map(d => d.count)
          }]
        },
options: {
  responsive: true,
  maintainAspectRatio: false
}
      });
      const top = data[0]?._id || "Not Specified";
document.getElementById("companyInsight").innerText =
  `Top employer: ${top} — indicates strong recruitment relationship or industry demand from this company.`;

  const insight = document.getElementById("companyInsight");

if (data[0].count > 50) {
  insight.style.color = "red";
} else if (data[0].count > 20) {
  insight.style.color = "orange";
} else {
  insight.style.color = "lightgreen";
}
    })
    .catch(err => {
      removeLoading("companyChart");
  showNoDataMessage("companyChart");
  console.log("Companies:", err.message);
});

  // ===== CERTIFICATIONS =====
  showLoading("certChart");
  fetch(API + "/api/analytics/certifications?" + query, { headers })
    .then(async res => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Cert error");
      return data;
    })
    .then(data => {
      removeLoading("certChart"); 
      if (!Array.isArray(data) || data.length === 0 || data[0]?._id === "No Data") {
    showNoDataMessage("certChart");

    document.getElementById("certInsight").innerText = "No insights available";
    return;
  }
  data.sort((a, b) => b.count - a.count);

const chartType = data.length >= 3 ? "radar" : "doughnut";

const parent = document.getElementById("certChart").parentElement;
const oldMsg = parent.querySelector(".no-data-msg");
if (oldMsg) oldMsg.remove();

      if (certChartInstance) certChartInstance.destroy();
      certChartInstance = new Chart(document.getElementById("certChart"), {
        type: chartType,
        data: {
          labels: data.map(d => d._id || "Not Specified"),
          datasets: [{
            label: "Certifications",
            data: data.map(d => d.count)
          }]
        },
options: {
  responsive: true,
  maintainAspectRatio: false
}
      });
      const top = data[0]?._id || "Not Specified";
document.getElementById("certInsight").innerText =
  `High interest in ${top} certifications suggests a potential skills gap that could be addressed in curriculum development.`;

  const insight = document.getElementById("certInsight");

if (data[0].count > 50) {
  insight.style.color = "red";
} else if (data[0].count > 20) {
  insight.style.color = "orange";
} else {
  insight.style.color = "lightgreen";
}
    })
    .catch(err => {
      removeLoading("certChart");
  showNoDataMessage("certChart");
  console.log("Cert:", err.message);
});

  // ===== USAGE =====
  showLoading("usageChart");
  fetch(API + "/api/analytics/usage?" + query, { headers })
    .then(async res => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Usage error");
      return data;
    })
    .then(data => {
      removeLoading("usageChart");
  if (!Array.isArray(data) || data.length === 0 || data[0]?._id === "No Data") {
    showNoDataMessage("usageChart");

    document.getElementById("usageInsight").innerText = "No insights available";
    return;
  }
  data.sort((a, b) => b.count - a.count);

const parent = document.getElementById("usageChart").parentElement;
const oldMsg = parent.querySelector(".no-data-msg");
if (oldMsg) oldMsg.remove();

  if (usageChartInstance) usageChartInstance.destroy();
  usageChartInstance = new Chart(document.getElementById("usageChart"), {
    type: "bar",
    data: {
      labels: data.map(d => d._id || "Not Specified"), 
      datasets: [{
        label: "API Usage", 
        data: data.map(d => d.count)
      }]
    },
options: {
  responsive: true,
  maintainAspectRatio: false
}
  });
  const top = data[0]?._id || "Not Specified";
document.getElementById("usageInsight").innerText =
  `Most used endpoint: ${top} — highlights which analytics are most valuable to stakeholders.`;

  const insight = document.getElementById("usageInsight");

if (data[0].count > 50) {
  insight.style.color = "red";
} else if (data[0].count > 20) {
  insight.style.color = "orange";
} else {
  insight.style.color = "lightgreen";
}
})
    .catch(err => {
      removeLoading("usageChart");
  showNoDataMessage("usageChart");
  console.log("Usage:", err.message);
});

// ===== BID TRENDS =====
showLoading("bidChart");
fetch(API + "/api/analytics/bids?" + query, { headers })
  .then(async res => {
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Bids error");
    return data;
  })
  .then(data => {
    removeLoading("bidChart");
    if (!Array.isArray(data) || data.length === 0 || data[0]?._id === "No Data") {
    showNoDataMessage("bidChart");

    document.getElementById("bidInsight").innerText = "No insights available";
    return;
  }

const parent = document.getElementById("bidChart").parentElement;
const oldMsg = parent.querySelector(".no-data-msg");
if (oldMsg) oldMsg.remove();

    if (bidChartInstance) bidChartInstance.destroy();
    bidChartInstance = new Chart(document.getElementById("bidChart"), {
      type: "line",
      data: {
        labels: data.map(d => "Day " + d._id),
        datasets: [{
          label: "Total Bid Amount",
          data: data.map(d => d.total),
          fill: false,
          tension: 0.3
        }]
      },
options: {
  responsive: true,
  maintainAspectRatio: false
}
    });
    const peak = data.reduce((max, d) => d.total > max.total ? d : max, data[0]);

document.getElementById("bidInsight").innerText =
  `Peak bidding on Day ${peak._id} — indicates highest competition for visibility on this day.`;

  const insight = document.getElementById("bidInsight");

if (peak.total > 5000) {
  insight.style.color = "red";
} else if (peak.total > 2000) {
  insight.style.color = "orange";
} else {
  insight.style.color = "lightgreen";
}
  })
  .catch(err => {
    removeLoading("bidChart");
  showNoDataMessage("bidChart");
  console.log("Bids:", err.message);
});

showLoading("industryChart");
fetch(API + "/api/analytics/industry?" + query, { headers })
  .then(res => res.json())
  .then(data => {
    removeLoading("industryChart");
    if (!Array.isArray(data) || data.length === 0 || data[0]?._id === "No Data") {
      showNoDataMessage("industryChart");

      document.getElementById("industryInsight").innerText = "No insights available";
      return;
    }

    const parent = document.getElementById("industryChart").parentElement;
    const oldMsg = parent.querySelector(".no-data-msg");
    if (oldMsg) oldMsg.remove();

    data.sort((a, b) => b.count - a.count);

    if (industryChartInstance) industryChartInstance.destroy();

    industryChartInstance = new Chart(document.getElementById("industryChart"), {
      type: "pie",
      data: {
        labels: data.map(d => d._id || "Not Specified"),
        datasets: [{
          data: data.map(d => d.count)
        }]
      },
options: {
  responsive: true,
  maintainAspectRatio: false
}
    });
    const top = data[0]?._id || "Not Specified";
document.getElementById("industryInsight").innerText =
  `Top industry: ${top} — indicates the primary employment sector, helping guide curriculum focus towards this industry.`;

  const insight = document.getElementById("industryInsight");

if (data[0].count > 50) {
  insight.style.color = "red";
} else if (data[0].count > 20) {
  insight.style.color = "orange";
} else {
  insight.style.color = "lightgreen";
}
  })
  .catch(err => {
    removeLoading("industryChart");
    showNoDataMessage("industryChart");
    console.log("Industry:", err.message);
  });

  showLoading("locationChart");
fetch(API + "/api/analytics/locations?" + query, { headers })
  .then(res => res.json())
  .then(data => {
    removeLoading("locationChart");

    if (!Array.isArray(data) || data.length === 0 || data[0]?._id === "No Data") {
      showNoDataMessage("locationChart");
      document.getElementById("locationInsight").innerText = "No insights available";
      return;
    }

    const parent = document.getElementById("locationChart").parentElement;
    const oldMsg = parent.querySelector(".no-data-msg");
    if (oldMsg) oldMsg.remove();

    data.sort((a, b) => b.count - a.count);

    if (locationChartInstance) locationChartInstance.destroy();

    locationChartInstance = new Chart(document.getElementById("locationChart"), {
      type: "pie",
      data: {
        labels: data.map(d => d._id || "Not Specified"),
        datasets: [{
          label: "Alumni Locations",
          data: data.map(d => d.count)
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });

    const top = data[0]?._id || "Not Specified";

    document.getElementById("locationInsight").innerText =
      `Most alumni are located in ${top} — indicates the strongest geographic alumni presence.`;

    const insight = document.getElementById("locationInsight");

    if (data[0].count > 50) {
      insight.style.color = "red";
    } else if (data[0].count > 20) {
      insight.style.color = "orange";
    } else {
      insight.style.color = "lightgreen";
    }
  })
  .catch(err => {
    removeLoading("locationChart");
    showNoDataMessage("locationChart");
    console.log("Locations:", err.message);
  });

  showLoading("yearChart");
  fetch(API + "/api/analytics/years?" + query, { headers })
  .then(res => res.json())
  .then(data => {
    removeLoading("yearChart");
    if (!Array.isArray(data) || data.length === 0 || data[0]?._id === "No Data") {
      showNoDataMessage("yearChart");

      document.getElementById("yearInsight").innerText = "No insights available";
      return;
    }

    const parent = document.getElementById("yearChart").parentElement;
    const oldMsg = parent.querySelector(".no-data-msg");
    if (oldMsg) oldMsg.remove();

    data.sort((a, b) => b.count - a.count);

    if (yearChartInstance) yearChartInstance.destroy();

    yearChartInstance = new Chart(document.getElementById("yearChart"), {
      type: "bar",
      data: {
        labels: data.map(d => d._id),
        datasets: [{
          label: "Graduates",
          data: data.map(d => d.count)
        }]
      },
options: {
  responsive: true,
  maintainAspectRatio: false
}
    });
    const top = data[0]?._id || "Not Specified";
document.getElementById("yearInsight").innerText =
  `Most graduates in: ${top} — helps track trends in graduate output and employment timing.`;

  const insight = document.getElementById("yearInsight");

if (data[0].count > 50) {
  insight.style.color = "red";
} else if (data[0].count > 20) {
  insight.style.color = "orange";
} else {
  insight.style.color = "lightgreen";
}
  })
  .catch(err => {
    removeLoading("yearChart");
    showNoDataMessage("yearChart");
    console.log("Years:", err.message);
  });
}
// Export all analytics chart data into CSV format
// Includes jobs, companies, certifications, API usage,
// bid trends, industry distribution, locations, and graduation years
function exportChartsCSV() {
  const saved = JSON.parse(localStorage.getItem("filters")) || {};
const query = new URLSearchParams(saved).toString();
  const token = localStorage.getItem("token");
  const apiKey = localStorage.getItem("apiKey");

  if (!token || !apiKey) {
    alert("Login & API key required");
    return;
  }

  const headers = {
    Authorization: "Bearer " + token,
    "x-api-key": apiKey
  };

  Promise.all([
    fetch(API + "/api/analytics/jobs?" + query, { headers }).then(res => res.json()),
    fetch(API + "/api/analytics/companies?" + query, { headers }).then(res => res.json()),
    fetch(API + "/api/analytics/certifications?" + query, { headers }).then(res => res.json()),
    fetch(API + "/api/analytics/usage?" + query, { headers }).then(res => res.json()),
    fetch(API + "/api/analytics/bids?" + query, { headers }).then(res => res.json()),
    fetch(API + "/api/analytics/industry?" + query, { headers }).then(res => res.json()),
    fetch(API + "/api/analytics/locations?" + query, { headers }).then(res => res.json()),
    fetch(API + "/api/analytics/years?" + query, { headers }).then(res => res.json())
  ])
  .then(([jobs, companies, certs, usage, bids, industry, locations, years]) => {

    let csv = "Category,Label,Value\n";

    jobs.forEach(d => csv += `Jobs,${d._id || "Unknown"},${d.count}\n`);
    companies.forEach(d => csv += `Companies,${d._id || "Unknown"},${d.count}\n`);
    certs.forEach(d => csv += `Certifications,${d._id || "Unknown"},${d.count}\n`);
    usage.forEach(d => csv += `Usage,${d._id || "Unknown"},${d.count}\n`);
    bids.forEach(d => {
      csv += `Bids,Day ${d._id},${d.total}\n`;
    });

    industry.forEach(d => {
      csv += `Industry,${d._id || "Unknown"},${d.count}\n`;
    });

    locations.forEach(d => {
    csv += `Locations,${d._id || "Unknown"},${d.count}\n`;
    });

    years.forEach(d => {
      csv += `Years,${d._id},${d.count}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "analytics.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  })
  .catch(err => {
    console.log(err);
    alert("Export failed");
  });
}
// Export analytics dashboard summary into PDF format
// Includes selected filter values and report overview
function exportChartsPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Analytics Dashboard Report", 20, 20);

  doc.setFontSize(12);

  const programme = document.getElementById("programmeFilter").value || "All";
  const year = document.getElementById("yearFilter").value || "All";
  const industry = document.getElementById("industryFilter").value || "All";

  doc.text(`Programme: ${programme}`, 20, 40);
  doc.text(`Graduation Year: ${year}`, 20, 50);
  doc.text(`Industry: ${industry}`, 20, 60);

  doc.text("Charts generated based on selected filters.", 20, 80);

  doc.save("analytics-report.pdf");
}
// Export selected custom dashboard report metrics as CSV
// Includes only user-selected report sections
function exportCustomReportCSV() {
  const selected = [...document.querySelectorAll(".report-option:checked")]
    .map(cb => cb.value);

  let csv = "Metric,Value\n";

  if (selected.includes("totalAlumni")) {
    csv += `Total Alumni,${document.getElementById("totalAlumni").innerText}\n`;
  }

  if (selected.includes("totalCerts")) {
    csv += `Total Certifications,${document.getElementById("totalCerts").innerText}\n`;
  }

  if (selected.includes("totalJobs")) {
    csv += `Employment Records,${document.getElementById("totalJobs").innerText}\n`;
  }

  if (selected.includes("topIndustries")) {
    const industries = [...document.querySelectorAll("#dashboardTopIndustries li")]
      .map(li => li.innerText)
      .join(" | ");
    csv += `Top Industries,${industries}\n`;
  }

  if (selected.includes("topEmployers")) {
    const employers = [...document.querySelectorAll("#dashboardTopEmployers li")]
      .map(li => li.innerText)
      .join(" | ");
    csv += `Top Employers,${employers}\n`;
  }

  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "custom-report.csv";
  a.click();

  window.URL.revokeObjectURL(url);
}
// Export selected custom dashboard report metrics as PDF
// Generates a structured summary report for stakeholders
function exportCustomReportPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const selected = [...document.querySelectorAll(".report-option:checked")]
    .map(cb => cb.value);

  let y = 20;

  doc.setFontSize(18);
  doc.text("Custom Analytics Report", 20, y);
  y += 15;

  doc.setFontSize(12);

  if (selected.includes("totalAlumni")) {
    doc.text(`Total Alumni: ${document.getElementById("totalAlumni").innerText}`, 20, y);
    y += 10;
  }

  if (selected.includes("totalCerts")) {
    doc.text(`Total Certifications: ${document.getElementById("totalCerts").innerText}`, 20, y);
    y += 10;
  }

  if (selected.includes("totalJobs")) {
    doc.text(`Employment Records: ${document.getElementById("totalJobs").innerText}`, 20, y);
    y += 10;
  }

  if (selected.includes("topIndustries")) {
    const industries = [...document.querySelectorAll("#dashboardTopIndustries li")]
      .map(li => li.innerText)
      .join(", ");

    doc.text(`Top Industries: ${industries}`, 20, y);
    y += 10;
  }

  if (selected.includes("topEmployers")) {
    const employers = [...document.querySelectorAll("#dashboardTopEmployers li")]
      .map(li => li.innerText)
      .join(", ");

    doc.text(`Top Employers: ${employers}`, 20, y);
  }

  doc.save("custom-report.pdf");
}
function restoreCustomReportOptions() {
  const saved = JSON.parse(localStorage.getItem("customReportOptions")) || {};

  document.querySelectorAll(".report-option").forEach(option => {
    if (saved.hasOwnProperty(option.value)) {
      option.checked = saved[option.value];
    }

    option.addEventListener("change", () => {
      const current = {};

      document.querySelectorAll(".report-option").forEach(cb => {
        current[cb.value] = cb.checked;
      });

      localStorage.setItem("customReportOptions", JSON.stringify(current));
    });
  });
}
function applyFilters() {
  const programme = document.getElementById("programmeFilter").value;
  const year = document.getElementById("yearFilter").value;
  const industry = document.getElementById("industryFilter").value;

  const filters = {};
if (programme) filters.programme = programme;
if (year) filters.year = year;
if (industry) filters.industry = industry;

   localStorage.setItem("filters", JSON.stringify(filters));

  // reload charts with filters
  loadAnalytics(filters);
}
function resetFilters() {
  // clear dropdowns
  document.getElementById("programmeFilter").value = "";
  document.getElementById("yearFilter").value = "";
  document.getElementById("industryFilter").value = "";

  // remove saved filters
  localStorage.removeItem("filters");
  localStorage.removeItem("selectedChartPreset");

  const presetList = document.getElementById("chartPresetList");
  if (presetList) presetList.value = "";

  // reload default charts
  loadAnalytics();
}

function loadSummaryStats() {
  fetch(API + "/api/analytics/summary", {
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
      "x-api-key": localStorage.getItem("apiKey")
    }
  })
  .then(res => res.json())
  .then(data => {
    document.getElementById("totalAlumni").innerText = data.totalAlumni || 0;
    document.getElementById("totalCerts").innerText = data.totalCerts || 0;
    document.getElementById("totalJobs").innerText = data.totalJobs || 0;
  })
  .catch(err => {
    console.log("Summary error:", err);
  });
}
function loadDashboardTopStats() {
  const token = localStorage.getItem("token");
  const apiKey = localStorage.getItem("apiKey");

  const headers = {
    Authorization: "Bearer " + token,
    "x-api-key": apiKey
  };

  fetch(API + "/api/analytics/industry", { headers })
    .then(res => res.json())
    .then(data => {
      const list = document.getElementById("dashboardTopIndustries");
      if (!list) return;

      list.innerHTML = data.length
        ? data.slice(0, 3).map(d => `<li>${d._id || "Unknown"} (${d.count})</li>`).join("")
        : "<li>No data</li>";
    });

  fetch(API + "/api/analytics/companies", { headers })
    .then(res => res.json())
    .then(data => {
      const list = document.getElementById("dashboardTopEmployers");
      if (!list) return;

      list.innerHTML = data.length
        ? data.slice(0, 3).map(d => `<li>${d._id || "Unknown"} (${d.count})</li>`).join("")
        : "<li>No data</li>";
    });
}
function loadAlumni() {
  const programme = document.getElementById("programmeFilter").value;
  const year = document.getElementById("yearFilter").value;
  const industry = document.getElementById("industryFilter").value;

  localStorage.setItem("alumniFilters", JSON.stringify({
    programme,
    year,
    industry
  }));

  const params = new URLSearchParams();
  if (programme) params.append("programme", programme);
  if (year) params.append("year", year);
  if (industry) params.append("industry", industry);

  const token = localStorage.getItem("token");
  const apiKey = localStorage.getItem("apiKey");

  const tableBody = document.querySelector("#alumniTable tbody");
  const noDataMsg = document.getElementById("noDataMsg");

  tableBody.innerHTML = "<tr><td colspan='5'>Loading...</td></tr>";
  noDataMsg.innerText = "";

  fetch(API + "/api/alumni?" + params.toString(), {
    headers: {
      Authorization: "Bearer " + token,
      "x-api-key": apiKey
    }
  })
  .then(res => res.json())
  .then(data => {

    tableBody.innerHTML = "";

    if (!data.length) {
      noDataMsg.innerText = "No alumni found";
      return;
    }

    data.forEach(a => {
      const row = `
<tr>
  <td>${a.name || "Not Specified"}</td>
  <td>${a.userId?.email || "Not Specified"}</td>
  <td>${a.programme || "Not Specified"}</td>
  <td>${a.industry || "Not Specified"}</td>
  <td>${a.graduationYear || "Not Specified"}</td>
</tr>
`;
      tableBody.innerHTML += row;
    });

  })
  .catch(err => {
    tableBody.innerHTML = "";
    noDataMsg.innerText = "Error loading data";
    console.log(err);
  });
}
function resetAlumniFilters() {
  document.getElementById("programmeFilter").value = "";
  document.getElementById("yearFilter").value = "";
  document.getElementById("industryFilter").value = "";

  const presetList = document.getElementById("presetList");
  if (presetList) presetList.value = "";

  localStorage.removeItem("alumniFilters");

  loadAlumni();
}
function exportAlumniCSV() {
  const rows = document.querySelectorAll("#alumniTable tbody tr");

  let csv = "Name,Email,Programme,Industry,Year\n";

  rows.forEach(row => {
    const cols = row.querySelectorAll("td");
    if (cols.length) {
      csv += [
        cols[0].innerText,
        cols[1].innerText,
        cols[2].innerText,
        cols[3].innerText,
        cols[4].innerText
      ].join(",") + "\n";
    }
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "alumni.csv";
  a.click();
}
function exportAlumniPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  let y = 20;

  doc.setFontSize(16);
  doc.text("Alumni Report", 20, y);

  y += 15;

  const rows = document.querySelectorAll("#alumniTable tbody tr");

  rows.forEach((row, index) => {
    const cols = row.querySelectorAll("td");

    if (cols.length) {
      const line = [
        cols[0]?.innerText || "",
        cols[1]?.innerText || "",
        cols[2]?.innerText || "",
        cols[3]?.innerText || "",
        cols[4]?.innerText || ""
      ].join(" | ");

      doc.setFontSize(10);
      doc.text(line, 20, y);

      y += 10;

      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    }
  });

  doc.save("alumni-report.pdf");
}
function saveAlumniPreset() {
  const name = document.getElementById("presetName").value.trim();
  const msg = document.getElementById("presetMessage");

  msg.innerHTML = "";
  msg.className = "";

  if (!name) {
    msg.innerHTML = "❌ Please enter a preset name";
    msg.className = "error";
    clearMsg(msg);
    return;
  }

  const preset = {
    programme: document.getElementById("programmeFilter").value,
    year: document.getElementById("yearFilter").value,
    industry: document.getElementById("industryFilter").value
  };

  const presets = JSON.parse(localStorage.getItem("alumniPresets")) || {};
  presets[name] = preset;

  localStorage.setItem("alumniPresets", JSON.stringify(presets));

  document.getElementById("presetName").value = "";
  renderAlumniPresets();

  msg.innerHTML = "✅ Preset saved successfully";
  msg.className = "success";
  clearMsg(msg);
}

function renderAlumniPresets() {
  const list = document.getElementById("presetList");
  if (!list) return;

  const presets = JSON.parse(localStorage.getItem("alumniPresets")) || {};

  list.innerHTML = `<option value="" disabled selected>Load saved preset</option>`;

  Object.keys(presets).forEach(name => {
    list.innerHTML += `<option value="${name}">${name}</option>`;
  });
}

function loadAlumniPreset() {
  const name = document.getElementById("presetList").value;
  if (!name) return;

  const presets = JSON.parse(localStorage.getItem("alumniPresets")) || {};
  const preset = presets[name];

  if (!preset) return;

  document.getElementById("programmeFilter").value = preset.programme || "";
  document.getElementById("yearFilter").value = preset.year || "";
  document.getElementById("industryFilter").value = preset.industry || "";

  localStorage.setItem("alumniFilters", JSON.stringify(preset));

  loadAlumni();
}
function restoreAlumniFilters() {
  const saved = JSON.parse(localStorage.getItem("alumniFilters"));

  if (saved) {
    document.getElementById("programmeFilter").value = saved.programme || "";
    document.getElementById("yearFilter").value = saved.year || "";
    document.getElementById("industryFilter").value = saved.industry || "";
    loadAlumni();
  } else {
    loadAlumni();
  }
}
// Save current analytics filter selections as a reusable preset
// Stored in localStorage for quick future access
function saveChartPreset() {
  const name = document.getElementById("chartPresetName").value.trim();
  const msg = document.getElementById("chartPresetMessage");

  msg.innerHTML = "";
  msg.className = "";

  if (!name) {
    msg.innerHTML = "❌ Please enter a preset name";
    msg.className = "error";
    clearMsg(msg);
    return;
  }

  const preset = {
    programme: document.getElementById("programmeFilter").value,
    year: document.getElementById("yearFilter").value,
    industry: document.getElementById("industryFilter").value
  };

  const presets = JSON.parse(localStorage.getItem("chartPresets")) || {};
  presets[name] = preset;

  localStorage.setItem("chartPresets", JSON.stringify(presets));

  document.getElementById("chartPresetName").value = "";
  renderChartPresets();

  msg.innerHTML = "✅ Chart preset saved successfully";
  msg.className = "success";
  clearMsg(msg);
}
// Load all saved chart presets into dropdown list
// Also restores previously selected preset if available
function renderChartPresets() {
  const list = document.getElementById("chartPresetList");
  if (!list) return;

  const presets = JSON.parse(localStorage.getItem("chartPresets")) || {};

  list.innerHTML = `<option value="" disabled selected>Load saved preset</option>`;

  Object.keys(presets).forEach(name => {
    list.innerHTML += `<option value="${name}">${name}</option>`;
  });
  
  const selected = localStorage.getItem("selectedChartPreset");
  if (selected && presets[selected]) {
    list.value = selected;
  }
}
// Apply selected saved preset to analytics filters
// Automatically reloads charts using stored preset values
function loadChartPreset() {
  const name = document.getElementById("chartPresetList").value;
  if (!name) return;

  const presets = JSON.parse(localStorage.getItem("chartPresets")) || {};
  const preset = presets[name];

  if (!preset) return;

  document.getElementById("programmeFilter").value = preset.programme || "";
  document.getElementById("yearFilter").value = preset.year || "";
  document.getElementById("industryFilter").value = preset.industry || "";

  localStorage.setItem("filters", JSON.stringify(preset));
  localStorage.setItem("selectedChartPreset", name);

  loadAnalytics(preset);
}

function exportDashboardCSV() {
  let csv = "Metric,Value\n";

  csv += `Total Alumni,${document.getElementById("totalAlumni")?.innerText || "0"}\n`;
  csv += `Total Certifications,${document.getElementById("totalCerts")?.innerText || "0"}\n`;
  csv += `Employment Records,${document.getElementById("totalJobs")?.innerText || "0"}\n`;

  const industries = [...document.querySelectorAll("#dashboardTopIndustries li")]
    .map(li => li.innerText)
    .join(" | ");

  const employers = [...document.querySelectorAll("#dashboardTopEmployers li")]
    .map(li => li.innerText)
    .join(" | ");

  csv += `Top Industries,${industries || "No data"}\n`;
  csv += `Top Employers,${employers || "No data"}\n`;

  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "dashboard-summary.csv";
  a.click();

  window.URL.revokeObjectURL(url);
}
function exportDashboardPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const totalAlumni =
    document.getElementById("totalAlumni")?.innerText || "0";

  const totalCerts =
    document.getElementById("totalCerts")?.innerText || "0";

  const totalJobs =
    document.getElementById("totalJobs")?.innerText || "0";

  const industries =
    document.getElementById("dashboardTopIndustries")?.innerText || "No data";

  const employers =
    document.getElementById("dashboardTopEmployers")?.innerText || "No data";

  doc.setFontSize(18);
  doc.text("University Analytics Dashboard Report", 20, 20);

  doc.setFontSize(12);

  doc.text(`Total Alumni: ${totalAlumni}`, 20, 40);
  doc.text(`Total Certifications: ${totalCerts}`, 20, 50);
  doc.text(`Employment Records: ${totalJobs}`, 20, 60);

  doc.text("Top Industries:", 20, 80);
  doc.text(industries, 20, 90);

  doc.text("Top Employers:", 20, 120);
  doc.text(employers, 20, 130);

  doc.save("dashboard-report.pdf");
}
// Download an individual chart as PNG image
// Used for quick export of a single visual report
function downloadSingleChart(chartId, fileName) {
  const canvas = document.getElementById(chartId);
  if (!canvas) return;

  const link = document.createElement("a");
  link.download = fileName + ".png";
  link.href = canvas.toDataURL("image/png");
  link.click();
}
// Download all analytics charts together inside one PDF file
// Each chart is added with title and exported as visual report
function downloadAllChartsPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("p", "mm", "a4");

  const charts = [
    { id: "jobChart", title: "Job Distribution" },
    { id: "companyChart", title: "Top Employers" },
    { id: "certChart", title: "Curriculum Skills Gap Analysis" },
    { id: "usageChart", title: "API Usage" },
    { id: "bidChart", title: "Bid Trends" },
    { id: "industryChart", title: "Industry Distribution" },
    { id: "yearChart", title: "Graduation Year Distribution" },
    { id: "locationChart", title: "Geographic Distribution" }
  ];

  let y = 20;

  doc.setFontSize(18);
  doc.text("Analytics Chart Images Report", 20, y);
  y += 15;

  charts.forEach((chart, index) => {
    const canvas = document.getElementById(chart.id);
    if (!canvas) return;

    const imgData = canvas.toDataURL("image/png");

    if (y > 210) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(13);
    doc.text(chart.title, 20, y);
    y += 8;

    doc.addImage(imgData, "PNG", 20, y, 170, 75);
    y += 90;
  });

  doc.save("all-chart-images.pdf");
}