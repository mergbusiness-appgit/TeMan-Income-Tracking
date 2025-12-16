// Load sessions from LocalStorage
let sessions = JSON.parse(localStorage.getItem("sessions")) || [];

// Auto-set today's date in add session
document.getElementById("date").valueAsDate = new Date();

// Auto-set default filters
const today = new Date();
document.getElementById("filterDate").valueAsDate = today;
document.getElementById("filterMonth").value = today.toISOString().slice(0,7);
document.getElementById("filterSalaryMonth").value = today.toISOString().slice(0,7);
document.getElementById("filterPeriod").value = (today.getDate() <= 14) ? "1" : "2";

// Add or update session
let editIndex = null;

function addCommission() {
  const price = Number(document.getElementById("price").value);
  const rate = Number(document.getElementById("serviceType").value);
  const date = document.getElementById("date").value;

  if (!price || !date) {
    alert("Please enter amount and date");
    return;
  }

  const commission = price * rate;

  if(editIndex !== null) {
    // Update existing session
    sessions[editIndex] = { price, rate, commission, date };
    editIndex = null;
  } else {
    // Add new session
    sessions.push({ price, rate, commission, date });
  }

  localStorage.setItem("sessions", JSON.stringify(sessions));

  document.getElementById("price").value = "";
  document.getElementById("date").valueAsDate = new Date();

  render();
}

// Render sessions and totals
function render() {
  const list = document.getElementById("list");
  const totalEl = document.getElementById("total");

  list.innerHTML = "";
  let total = 0;

  sessions.forEach((s, index) => {
    total += s.commission;

    list.innerHTML += `
      <li class="session-row">
        <div>
          RM ${s.price} × ${(s.rate*100)}%<br>
          <b>RM ${s.commission.toFixed(2)}</b>
        </div>
        <div class="session-date">
          ${s.date}
        </div>
        <div>
          <button onclick="editSession(${index})">✏️</button>
          <button onclick="deleteSession(${index})">🗑️</button>
        </div>
      </li>
    `;
  });

  totalEl.textContent = `RM ${total.toFixed(2)}`;

  updateTotalByDate();
  updateTotalByPeriod();
  updateTotalSalaryByMonth();
}

// Edit session
function editSession(index) {
  const s = sessions[index];
  document.getElementById("price").value = s.price;
  document.getElementById("serviceType").value = s.rate;
  document.getElementById("date").value = s.date;
  editIndex = index;
}

// Delete session
function deleteSession(index) {
  if(confirm("Are you sure you want to delete this session?")) {
    sessions.splice(index,1);
    localStorage.setItem("sessions", JSON.stringify(sessions));
    render();
  }
}

// ----------------------
// Total by Date
document.getElementById("filterDate").addEventListener("change", updateTotalByDate);
function updateTotalByDate() {
  const selectedDate = document.getElementById("filterDate").value;
  const total = sessions
    .filter(s => s.date === selectedDate)
    .reduce((sum, s) => sum + s.commission, 0);
  document.getElementById("totalByDate").textContent = total.toFixed(2);
}

// ----------------------
// Total by 2-week period
document.getElementById("filterMonth").addEventListener("change", updateTotalByPeriod);
document.getElementById("filterPeriod").addEventListener("change", updateTotalByPeriod);

function updateTotalByPeriod() {
  const month = document.getElementById("filterMonth").value; // yyyy-mm
  const period = document.getElementById("filterPeriod").value;

  if (!month) {
    document.getElementById("totalByPeriod").textContent = "0.00";
    return;
  }

  const [year, mon] = month.split("-").map(Number);

  const total = sessions
    .filter(s => {
      const d = new Date(s.date);
      return d.getFullYear() === year && (d.getMonth()+1) === mon;
    })
    .filter(s => {
      const day = new Date(s.date).getDate();
      return period === "1" ? day <= 14 : day >= 15;
    })
    .reduce((sum, s) => sum + s.commission, 0);

  document.getElementById("totalByPeriod").textContent = total.toFixed(2);
}

// ----------------------
// Total Salary by Month
document.getElementById("filterSalaryMonth").addEventListener("change", updateTotalSalaryByMonth);
function updateTotalSalaryByMonth() {
  const month = document.getElementById("filterSalaryMonth").value; // yyyy-mm
  if(!month) {
    document.getElementById("totalSalaryByMonth").textContent = "0.00";
    return;
  }

  const [year, mon] = month.split("-").map(Number);

  const total = sessions
    .filter(s => {
      const d = new Date(s.date);
      return d.getFullYear() === year && (d.getMonth()+1) === mon;
    })
    .reduce((sum, s) => sum + s.commission, 0);

  document.getElementById("totalSalaryByMonth").textContent = total.toFixed(2);
}

// Initial render
render();
