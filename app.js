/* ====== ELEMENTS ====== */
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
const addBtn = document.getElementById("addBtn");

const sessionFilterMonth = document.getElementById("sessionFilterMonth");
const sessionFilterPeriod = document.getElementById("sessionFilterPeriod");

let sessions = JSON.parse(localStorage.getItem("sessions")) || [];
let editIndex = null;

/* ====== TRANSLATIONS ====== */
const translations = {
  en: {
    subtitle: "Commission Calculator",
    add: "Add Session",
    sessions: "Sessions",
    totalDate: "View Total by Date",
    total2Week: "Total by 2-Week Period",
    export: "Export 2-Week PDF",
    salaryMonth: "Total Salary by Month",
    total: "Total Commission",
    deleteConfirm: "Delete this session?",
    noData: "No sessions found"
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
    deleteConfirm: "Padam sesi ini?",
    noData: "Tiada data dijumpai"
  }
};

/* ====== PACKAGES ====== */
const centerPackages = [
  { label: "60 min / RM150", price: 150 },
  { label: "90 min / RM210", price: 210 },
  { label: "120 min / RM250", price: 250 },
  { label: "60 + 30 / RM220", price: 220 },
  { label: "90 + 30 / RM260", price: 260 },
  { label: "120 + 30 / RM300", price: 300 },
  { label: "60 + 30 + 30 / RM280", price: 280 },
  { label: "90 + 30 + 30 / RM320", price: 320 },
  { label: "120 + 30 + 30 / RM360", price: 360 }
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

/* ====== INIT DATES ====== */
const today = new Date();
date.valueAsDate = today;
filterDate.valueAsDate = today;
filterMonth.value = today.toISOString().slice(0,7);
filterSalaryMonth.value = today.toISOString().slice(0,7);
sessionFilterMonth.value = today.toISOString().slice(0,7);
filterPeriod.value = today.getDate() <= 14 ? "1" : "2";
sessionFilterPeriod.value = filterPeriod.value;

/* ====== FUNCTIONS ====== */
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

function packageChange(){
  otherPriceBox.style.display = packageSelect.value==="other"?"block":"none";
}

/* ====== ADD / EDIT SESSION ====== */
function addCommission(){
  const price = packageSelect.value==="other" ? Number(otherPrice.value) : Number(packageSelect.value);
  const rate = serviceType.value === "movman" ? 0.5 : Number(serviceType.value);
  const dateVal = date.value;
  if(!price || !dateVal) { alert("Please enter valid data"); return; }

  const commission = price * rate;
  if(editIndex!==null){
    sessions[editIndex] = { price, rate, commission, date: dateVal, type: serviceType.value };
    editIndex = null;
  } else {
    sessions.push({ price, rate, commission, date: dateVal, type: serviceType.value });
  }

  localStorage.setItem("sessions", JSON.stringify(sessions));
  otherPrice.value = "";
  populatePackages();
  date.valueAsDate = new Date();
  render();
}

/* ====== RENDER SESSIONS ====== */
function render(){
  list.innerHTML = "";
  const month = sessionFilterMonth.value;
  const period = sessionFilterPeriod.value;
  const [y,m] = month.split("-").map(Number);
  const filtered = sessions.filter(s=>{
    const d = new Date(s.date);
    const day = d.getDate();
    return d.getFullYear()===y && d.getMonth()+1===m && (period==="1"? day<=14 : day>=15);
  });

  if(filtered.length===0){
    list.innerHTML = `<li>${translations[languageSelect.value].noData}</li>`;
  } else {
    filtered.forEach((s,i)=>{
      list.innerHTML += `
      <li class="session-row">
        <div>
          RM ${s.price} × ${(s.rate*100).toFixed(0)}%<br>
          <b>RM ${s.commission.toFixed(2)}</b>
        </div>
        <div class="session-date">${s.date}</div>
        <div>
          <button onclick="editSession(${i})">✏️</button>
          <button onclick="deleteSession(${i})">🗑️</button>
        </div>
      </li>`;
    });
  }

  updateTotals();
}

function editSession(i){
  const s = sessions[i];
  serviceType.value = s.type;
  populatePackages();

  let matched = [...packageSelect.options].some(o=>{
    if(Number(o.value)===s.price){ packageSelect.value=o.value; return true; }
  });

  if(!matched){ packageSelect.value="other"; otherPriceBox.style.display="block"; otherPrice.value=s.price; }

  date.value = s.date;
  editIndex = i;
}

function deleteSession(i){
  if(confirm(translations[languageSelect.value].deleteConfirm)){
    sessions.splice(i,1);
    localStorage.setItem("sessions", JSON.stringify(sessions));
    render();
  }
}

/* ====== TOTALS ====== */
function updateTotals(){
  const total = sessions.reduce((a,b)=>a+b.commission,0);
  totalEl.textContent = `RM ${total.toFixed(2)}`;

  const d = filterDate.value;
  totalByDate.textContent = sessions.filter(s=>s.date===d).reduce((a,b)=>a+b.commission,0).toFixed(2);

  const [y,m] = filterMonth.value.split("-").map(Number);
  const p = filterPeriod.value;
  totalByPeriod.textContent = sessions.filter(s=>{
    const d = new Date(s.date);
    const day = d.getDate();
    return d.getFullYear()===y && d.getMonth()+1===m && (p==="1"? day<=14 : day>=15);
  }).reduce((a,b)=>a+b.commission,0).toFixed(2);

  const [sy,sm] = filterSalaryMonth.value.split("-").map(Number);
  totalSalaryByMonth.textContent = sessions.filter(s=>{
    const d = new Date(s.date);
    return d.getFullYear()===sy && d.getMonth()+1===sm;
  }).reduce((a,b)=>a+b.commission,0).toFixed(2);
}

/* ====== PDF EXPORT ====== */
function export2WeekPDF(){
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const [y,m] = filterMonth.value.split("-").map(Number);
  const period = filterPeriod.value;
  const data = sessions.filter(s=>{
    const d = new Date(s.date);
    const day = d.getDate();
    return d.getFullYear()===y && d.getMonth()+1===m && (period==="1"? day<=14 : day>=15);
  });

  if(data.length===0){ alert(translations[languageSelect.value].noData); return; }

  doc.setFontSize(18);
  doc.text("TeMan Wellness", 14, 20);
  doc.setFontSize(12);
  doc.text("2-Week Salary Report", 14, 28);
  doc.text(`Period: ${filterMonth.value} - ${period==="1"?"1–14":"15–End"}`, 14, 34);

  const tableData = data.map((s,i)=>[
    i+1, s.date, `RM ${s.price.toFixed(2)}`, `${(s.rate*100).toFixed(0)}%`, `RM ${s.commission.toFixed(2)}`
  ]);

  doc.autoTable({
    startY: 40,
    head: [["No","Date","Price Paid","Rate","Commission"]],
    body: tableData,
    styles: { fontSize:10, cellPadding:3 },
    headStyles: { fillColor:[41,128,185], textColor:255 },
    alternateRowStyles: { fillColor:[245,245,245] },
    margin:{ left:14, right:14 }
  });

  const total = data.reduce((sum,s)=>sum+s.commission,0);
  const finalY = doc.lastAutoTable.finalY || 40;
  doc.setFontSize(12);
  doc.text(`TOTAL COMMISSION: RM ${total.toFixed(2)}`, 14, finalY
