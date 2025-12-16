let sessions = JSON.parse(localStorage.getItem("sessions")) || [];
let editIndex = null;

// AUTO TODAY
const today = new Date();
date.valueAsDate = today;
syncFiltersToDate(today.toISOString().slice(0,10));

// PACKAGE
function packageChange() {
  otherPriceBox.style.display =
    packageSelect.value === "other" ? "block" : "none";
}

// ADD SESSION
function addSession() {
  const price = packageSelect.value === "other"
    ? Number(otherPrice.value)
    : Number(packageSelect.value);

  if (!price || !date.value) {
    alert("Please enter valid data");
    return;
  }

  const rate = Number(serviceType.value);
  const commission = price * rate;

  const data = {
    date: date.value,
    price,
    rate,
    commission
  };

  editIndex !== null
    ? sessions[editIndex] = data
    : sessions.push(data);

  editIndex = null;
  localStorage.setItem("sessions", JSON.stringify(sessions));

  syncFiltersToDate(date.value);
  render();
}

// 🔑 FIX FUNCTION — AUTO SYNC FILTERS
function syncFiltersToDate(dateStr) {
  const d = new Date(dateStr);

  filterDate.value = dateStr;

  const ym = d.toISOString().slice(0,7);
  filterMonth.value = ym;
  filterSalaryMonth.value = ym;

  filterPeriod.value = d.getDate() <= 14 ? "1" : "2";
}

// RENDER
function render() {
  sessionList.innerHTML = "";
  let total = 0;

  sessions.forEach((s, i) => {
    total += s.commission;

    sessionList.innerHTML += `
      <li class="session">
        <div>
          RM ${s.price} × ${(s.rate * 100)}%<br>
          <b>RM ${s.commission.toFixed(2)}</b><br>
          <small>${s.date}</small>
        </div>
        <div>
          <button onclick="editSession(${i})">✏️</button>
          <button onclick="deleteSession(${i})">🗑️</button>
        </div>
      </li>
    `;
  });

  grandTotal.textContent = `RM ${total.toFixed(2)}`;
  calcTotals();
}

// EDIT
function editSession(i) {
  const s = sessions[i];
  serviceType.value = s.rate;
  date.value = s.date;
  packageSelect.value = s.price;
  editIndex = i;
}

// DELETE
function deleteSession(i) {
  if (confirm("Delete this session?")) {
    sessions.splice(i, 1);
    localStorage.setItem("sessions", JSON.stringify(sessions));
    render();
  }
}

// TOTAL CALC
function calcTotals() {
  totalByDate.textContent = sum(s => s.date === filterDate.value);

  const [y, m] = filterMonth.value.split("-").map(Number);
  totalByPeriod.textContent = sum(s => {
    const d = new Date(s.date);
    const day = d.getDate();
    return d.getFullYear() === y &&
      d.getMonth() + 1 === m &&
      (filterPeriod.value === "1" ? day <= 14 : day >= 15);
  });

  totalByMonth.textContent = sum(s => {
    const d = new Date(s.date);
    return d.getFullYear() === y && d.getMonth() + 1 === m;
  });
}

function sum(fn) {
  return sessions.filter(fn)
    .reduce((a, b) => a + b.commission, 0)
    .toFixed(2);
}

// FILTER EVENTS
filterDate.onchange = calcTotals;
filterMonth.onchange = calcTotals;
filterPeriod.onchange = calcTotals;
filterSalaryMonth.onchange = calcTotals;

// PDF EXPORT (2-WEEK)
function exportPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.text("TeMan Wellness – Salary Report", 14, 16);

  doc.autoTable({
    startY: 24,
    head: [["Date", "Service", "Paid", "%", "Commission"]],
    body: sessions.map(s => [
      s.date,
      s.rate === 0.35 ? "Center" : "Home",
      "RM " + s.price,
      (s.rate * 100) + "%",
      "RM " + s.commission.toFixed(2)
    ])
  });

  doc.save("TeMan_Wellness_Salary.pdf");
}

// INIT
render();
