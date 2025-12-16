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

let sessions = JSON.parse(localStorage.getItem("sessions")) || [];
let editIndex = null;

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

/* ====== INIT DATES ====== */
const today = new Date();
date.valueAsDate = today;
filterDate.valueAsDate = today;
filterMonth.value = today.toISOString().slice(0,7);
filterSalaryMonth.value = today.toISOString().slice(0,7);
filterPeriod.value = today.getDate() <= 14 ? "1" : "2";

/* ====== FUNCTIONS ====== */
function populatePackages(){
  packageSelect.innerHTML = "";
  const packages = serviceType.value === "0.35" ? centerPackages : homePackages;
  packages.forEach(p => {
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

serviceType.addEventListener("change", populatePackages);
packageSelect.addEventListener("change", packageChange);

/* ====== ADD SESSION ====== */
function addCommission(){
  let price = packageSelect.value==="other"? Number(otherPrice.value) : Number(packageSelect.value);
  const rate = Number(serviceType.value);
  const dateVal = date.value;

  if(!price || !dateVal){ alert("Please enter valid data"); return; }

  const commission = price * rate;

  if(editIndex !== null){
    sessions[editIndex] = { price, rate, commission, date: dateVal };
    editIndex = null;
  } else {
    sessions.push({ price, rate, commission, date: dateVal });
  }

  localStorage.setItem("sessions", JSON.stringify(sessions));
  otherPrice.value = "";
  populatePackages();
  date.valueAsDate = new Date();
  render();
}

/* ====== RENDER ====== */
function render(){
  list.innerHTML = "";
  let total = 0;

  sessions.forEach((s,i)=>{
    total += s.commission;
    list.innerHTML += `
      <li class="session-row">
        <div>
          RM ${s.price} × ${s.rate*100}%<br>
          <b>RM ${s.commission.toFixed(2)}</b>
        </div>
        <div class="session-date">${s.date}</div>
        <div>
          <button onclick="editSession(${i})">✏️</button>
          <button onclick="deleteSession(${i})">🗑️</button>
        </div>
      </li>
    `;
  });

  totalEl.textContent = `RM ${total.toFixed(2)}`;
  updateTotalByDate();
  updateTotalByPeriod();
  updateTotalSalaryByMonth();
}

/* ====== EDIT / DELETE ====== */
function editSession(i){
  const s = sessions[i];
  serviceType.value = s.rate;
  populatePackages();

  let matched = false;
  [...packageSelect.options].forEach(o=>{
    if(Number(o.value)===s.price){ packageSelect.value=o.value; matched=true; }
  });

  if(!matched){
    packageSelect.value="other";
    otherPriceBox.style.display="block";
    otherPrice.value = s.price;
  }

  date.value = s.date;
  editIndex=i;
}

function deleteSession(i){
  if(confirm("Delete this session?")){
    sessions.splice(i,1);
    localStorage.setItem("sessions", JSON.stringify(sessions));
    render();
  }
}

/* ====== TOTALS ====== */
function updateTotalByDate(){
  const d = filterDate.value;
  totalByDate.textContent = sessions.filter(s=>s.date===d).reduce((a,b)=>a+b.commission,0).toFixed(2);
}

function updateTotalByPeriod(){
  const [y,m] = filterMonth.value.split("-").map(Number);
  const p = filterPeriod.value;
  totalByPeriod.textContent = sessions.filter(s=>{
    const d = new Date(s.date);
    const day = d.getDate();
    return d.getFullYear()===y && d.getMonth()+1===m && (p==="1"? day<=14 : day>=15);
  }).reduce((a,b)=>a+b.commission,0).toFixed(2);
}

function updateTotalSalaryByMonth(){
  const [y,m] = filterSalaryMonth.value.split("-").map(Number);
  totalSalaryByMonth.textContent = sessions.filter(s=>{
    const d = new Date(s.date);
    return d.getFullYear()===y && d.getMonth()+1===m;
  }).reduce((a,b)=>a+b.commission,0).toFixed(2);
}

filterDate.onchange = updateTotalByDate;
filterMonth.onchange = updateTotalByPeriod;
filterPeriod.onchange = updateTotalByPeriod;
filterSalaryMonth.onchange = updateTotalSalaryByMonth;

/* ====== EXPORT PDF 2-WEEK ====== */
function getSessionsBy2Week(){
  const month = filterMonth.value;
  const period = filterPeriod.value;
  if(!month) return [];
  const [year, mon] = month.split("-").map(Number);

  return sessions.filter(s=>{
    const d = new Date(s.date);
    const day = d.getDate();
    return d.getFullYear()===year && d.getMonth()+1===mon && (period==="1"? day<=14 : day>=15);
  });
}

function export2WeekPDF(){
  const data = getSessionsBy2Week();
  if(data.length===0){ alert("No sessions found for selected period"); return; }

  let total = 0;
  let content = `TeMan Wellness\n\n2-Week Salary Report\n\n`;
  data.forEach((s,i)=>{
    total+=s.commission;
    content+= `${i+1}. Date: ${s.date}\n   Price: RM ${s.price}\n   Commission: RM ${s.commission.toFixed(2)}\n\n`;
  });
  content+= `TOTAL COMMISSION: RM ${total.toFixed(2)}`;

  const blob = new Blob([content],{type:"application/pdf"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href=url;
  a.download = "TeMan_2Week_Salary.pdf";
  a.click();
  URL.revokeObjectURL(url);
}

/* ====== INITIALIZE ====== */
populatePackages();
render();
