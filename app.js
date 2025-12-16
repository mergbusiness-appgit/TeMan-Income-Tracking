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

// Render session list and totals
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
  updateTotalAll();

  // Update filters if already selected
  const filterDate = document.getElementById("filterDate").value;
  if(filterDate) document.getElementById("filterDate").dispatchEvent(new Event("change"));
  const filterPeriod = document.getElementById("filterPeriod").value;
  if(filterPeriod) document.getElementById("filterPeriod").dispatchEvent(new Event("change"));
}

// Update total sum of all commissions
function updateTotalAll() {
  const total = sessions.reduce((sum, s) => sum + s.commission, 0);
  document.getElementById("totalAll").textContent = total.toFixed(2);
}

// Filter by date
document.getElementById("filterDate").addEventListener("change", function() {
  const selectedDate = this.value;
  const total = sessions
    .filter(s => s.date === selectedDate)
    .reduce((sum, s) => sum + s.commission, 0);
  document.getElementById("totalByDate").textContent = total.toFixed(2);
});

// Filter by 2-week period
document.getElementById("filterPeriod").addEventListener("change", function() {
  const period = this.value;
  const total = sessions
    .filter(s => {
      const day = new Date(s.date).getDate();
      if(period === "1") return day >= 1 && day <= 14;
      return day >= 15;
    })
    .reduce((sum, s) => sum + s.commission, 0);
  document.getElementById("totalByPeriod").textContent = total.toFixed(2);
});

// Initial render
render();
