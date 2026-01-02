/* ================= ELEMENTS ================= */
const serviceType = document.getElementById("serviceType");
const packageSelect = document.getElementById("packageSelect");
const otherPriceBox = document.getElementById("otherPriceBox");
const otherPrice = document.getElementById("otherPrice");

const date = document.getElementById("date");
const list = document.getElementById("list");
const totalEl = document.getElementById("total");

const filterDate = document.getElementById("filterDate");
const totalByDate = document.getElementById("totalByDate");

const filterMonth = document.getElementById("filterMonth");
const filterPeriod = document.getElementById("filterPeriod");
const totalByPeriod = document.getElementById("totalByPeriod");

const filterSalaryMonth = document.getElementById("filterSalaryMonth");
const totalSalaryByMonth = document.getElementById("totalSalaryByMonth");

const languageSelect = document.getElementById("languageSelect");

/* ================= DATA ================= */
let sessions = JSON.parse(localStorage.getItem("sessions")) || [];
let editIndex = null;

/* ================= TRANSLATION ================= */
const translations = {
  en: {
    subtitle: "Commission Calculator",
    add: "Add Session",
    sessions: "Sessions",
    totalDate: "Total by Date",
    total2Week: "Total by 2-Week Period",
    export: "Export 2-Week PDF",
    salaryMonth: "Total Salary by Month",
    total: "Total Commission",
    noData: "No sessions for selected period"
  },
  bm: {
    subtitle: "Kiraan Komisen",
    add: "Tambah Sesi",
    sessions: "Senarai Sesi",
    totalDate: "Jumlah Mengikut Tarikh",
    total2Week: "Jumlah 2 Minggu",
    export: "Eksport PDF 2 Minggu",
    salaryMonth: "Jumlah Gaji Bulanan",
    total: "Jumlah Komisen",
    noData: "Tiada sesi untuk tempoh dipilih"
  }
};

/* ================= PACKAGES ================= */
const centerPackages = [
  { label: "60 min / RM150", price: 150 },
  { label: "90 min / RM210", price: 210 },
  { label: "120 min / RM250", price: 250 }
];

const homePackages = [
  { label: "60 min / RM150", price: 150 },
  { label: "90 min / RM220", price: 220 },
  { label: "120 min / RM280", price: 280 }
];

const movmanPackages = [
  { label: "60 min / RM139", price: 139 },
  { label: "90 min / RM189", price: 189 },
  { label: "120 min / RM239", price: 239 }
];

/* ================= INIT DATE ================= */
const today = new Date();
date.valueAsDate = today;
filterDate.valueAsDate = today;
filterMonth.value = today.toISOString().slice(0,7);
filterSalaryMonth.value = today.toISOString().slice(0,7);
filterPeriod.value = today.getDate() <= 14 ? "1" : "2";

/* ================= PACKAGE LOGIC ================= */
function populatePackages(){
  packageSelect.innerHTML = "";
  let packages = [];

  if(serviceType.value === "0.35") packages = centerPackages;
  else if(serviceType.value === "0.50") packages = homePackages;
  else if(serviceType.value === "movman") packages = movmanPackages;

  packages.forEach(p=>{
    const opt = document.createElement("option");
    opt.value = p.price;
    opt.textContent = p.label;
    packageSelect.appendChild(opt);
  });

  const otherOpt = document.createElement("option");
  otherOpt.value = "other";
  otherOpt.textContent = "Others";
  packageSelect.appendChild(otherOpt);

  otherPriceBox.style.display = "none";
}

packageSelect.onchange = () => {
  otherPriceBox.style.display = packageSelect.value === "other" ? "block" : "none";
};

serviceType.onchange = populatePackages;

/* ================= ADD SESSION ================= */
function addCommission(){
  const price = packageSelect.value === "other"
    ? Number(otherPrice.value)
    : Number(packageSelect.value);

  const rate = serviceType.value === "movman" ? 0.5 : Number(serviceType.value);
  const dateVal = date.value;

  if(!price || !dateVal){
    alert("Invalid input");
    return;
  }

  const commission = price * rate;

  const data = { price, rate, commission, date: dateVal };

  if(editIndex !== null){
    sessions[editIndex] = data;
    editIndex = null;
  } else {
    sessions.push(data);
  }

  localStorage.setItem("sessions", JSON.stringify(sessions));
  otherPrice.value = "";
  populatePackages();
  render();
}

/* ================= FILTERED LIST ================= */
function getFilteredSessionsForList(){
  const [year, month] = filterMonth.value.split("-").map(Number);
  const period = filterPeriod.value;

  return sessions.filter(s=>{
    const d = new Date(s.date);
    const day = d.getDate();
    return (
      d.getFullYear() === year &&
      d.getMonth() + 1 === month &&
      (period === "1" ? day <= 14 : day >= 15)
    );
  });
}

/* ================= RENDER ================= */
function render(){
  list.innerHTML = "";
  let total = 0;
  const data = getFilteredSessionsForList();
  const lang = languageSelect.value;
  const t = translations[lang];

  if(data.length === 0){
    list.innerHTML = `<li style="text-align:center;color:#888;padding:12px">${t.noData}</li>`;
  }

  data.forEach(s=>{
    total += s.commission;
    const index = sessions.indexOf(s);

    list.innerHTML += `
      <li class="session-row">
        <div>
          RM ${s.price} × ${(s.rate*100).toFixed(0)}%<br>
          <b>RM ${s.commission.toFixed(2)}</b>
        </div>
        <div class="session-date">${s.date}</div>
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

/* ================= EDIT / DELETE ================= */
function editSession(i){
  const s = sessions[i];
  serviceType.value = s.rate === 0.5 ? "movman" : s.rate;
  populatePackages();

  let found = false;
  [...packageSelect.options].forEach(o=>{
    if(Number(o.value) === s.price){
      packageSelect.value = o.value;
      found = true;
    }
  });

  if(!found){
    packageSelect.value = "other";
    otherPriceBox.style.display = "block";
    otherPrice.value = s.price;
  }

  date.value = s.date;
  editIndex = i;
}

function deleteSession(i){
  if(confirm("Delete this session?")){
    sessions.splice(i,1);
    localStorage.setItem("sessions", JSON.stringify(sessions));
    render();
  }
}

/* ================= TOTALS ================= */
function updateTotalByDate(){
  totalByDate.textContent = sessions
    .filter(s=>s.date===filterDate.value)
    .reduce((a,b)=>a+b.commission,0)
    .toFixed(2);
}

function updateTotalByPeriod(){
  totalByPeriod.textContent = getFilteredSessionsForList()
    .reduce((a,b)=>a+b.commission,0)
    .toFixed(2);
}

function updateTotalSalaryByMonth(){
  const [y,m] = filterSalaryMonth.value.split("-").map(Number);
  totalSalaryByMonth.textContent = sessions
    .filter(s=>{
      const d = new Date(s.date);
      return d.getFullYear()===y && d.getMonth()+1===m;
    })
    .reduce((a,b)=>a+b.commission,0)
    .toFixed(2);
}

filterMonth.onchange = render;
filterPeriod.onchange = render;

/* ================= LANGUAGE ================= */
function applyLanguage(lang){
  const t = translations[lang];
  document.querySelector(".subtitle").textContent = t.subtitle;
  document.querySelector("button").textContent = t.add;
  document.querySelector("h3").textContent = "📋 " + t.sessions;
  document.querySelectorAll(".card.total h2")[0].textContent = t.totalDate;
  document.querySelectorAll(".card.total h2")[1].textContent = t.total2Week;
  document.querySelector(".export-btn").textContent = t.export;
  document.querySelectorAll(".card.total h2")[2].textContent = t.salaryMonth;
  document.querySelectorAll(".card.total h2")[3].textContent = t.total;
}

languageSelect.onchange = ()=>applyLanguage(languageSelect.value);

/* ================= PDF EXPORT ================= */
function export2WeekPDF(){
  const data = getFilteredSessionsForList();
  if(data.length === 0){
    alert("No data");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("TeMan Wellness", 14, 20);
  doc.setFontSize(12);
  doc.text("2-Week Salary Report", 14, 28);

  doc.autoTable({
    startY: 35,
    head: [["No","Date","Price","Rate","Commission"]],
    body: data.map((s,i)=>[
      i+1,
      s.date,
      `RM ${s.price}`,
      `${(s.rate*100).toFixed(0)}%`,
      `RM ${s.commission.toFixed(2)}`
    ]),
    styles:{fontSize:10},
    headStyles:{fillColor:[255,181,0]}
  });

  const total = data.reduce((a,b)=>a+b.commission,0);
  doc.text(`TOTAL: RM ${total.toFixed(2)}`,14,doc.lastAutoTable.finalY+10);
  doc.save("TeMan_2Week_Report.pdf");
}

/* ================= INIT ================= */
populatePackages();
render();
applyLanguage("en");
