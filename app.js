// Load sessions from LocalStorage
let sessions = JSON.parse(localStorage.getItem("sessions")) || [];

// Auto-set today’s date
document.getElementById("date").valueAsDate = new Date();

// Add new commission session
function addCommission() {
  const price = Number(document.getElementById("price").value);
  const rate = Number(document.getElementById("serviceType").value);
  const date = document.getElementById("date").value;

  if (!price || !date) {
    alert("Please enter amount and date");
    return;
  }

  const commission = price * rate;

  sessions.push({ price, rate, commission, date });
  localStorage.setItem("sessions", JSON.stringify(sessions));

  document.getElementById("price").value = "";
  document.getElementById("date").valueAsDate = new Date();

  render();
}

// Render session list and total
function render() {
  const list = document.getElementById("list");
  const totalEl = document.getElementById("total");

  list.innerHTML = "";
  let total = 0;

  sessions.forEach((s) => {
    total += s.commission;

    list.innerHTML += `
      <li class="session-row">
        <div>
          RM ${s.price} × ${(s.rate*100)}%<br>
          <b>RM ${s.commission.toFixed(2)}</b>
        </div>
        <div class="session-date">${s.date}</div>
      </li>
    `;
  });

  totalEl.textContent = `RM ${total.toFixed(2)}`;

  updateTotalByDate();
  updateTotalByPeriod();
  updateTotalSalaryByMonth();
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
// Total by 2-week period (based on selected month)
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
      if(period === "1") return day >=1 && day <=14;
      return day >=15;
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
