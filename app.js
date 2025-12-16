// ---------- Data ----------
const packages = {
  center: [
    {name: "60 minutes / RM 150", price: 150},
    {name: "90 minutes / RM 210", price: 210},
    {name: "120 minutes / RM 250", price: 250},
    {name: "60 mins massage + 30 mins / RM 220", price: 220},
    {name: "90 mins massage + 30 mins / RM 260", price: 260},
    {name: "120 mins massage + 30 mins / RM 300", price: 300},
    {name: "60 mins +30+30 / RM 280", price: 280},
    {name: "90 mins +30+30 / RM 320", price: 320},
    {name: "120 mins +30+30 / RM 360", price: 360}
  ],
  home: [
    {name: "60 minutes / RM 150", price: 150},
    {name: "90 minutes / RM 220", price: 220},
    {name: "120 minutes / RM 280", price: 280}
  ]
};

let sessions = JSON.parse(localStorage.getItem("sessions")) || [];
let editIndex = null;

// ---------- DOM Elements ----------
const serviceTypeEl = document.getElementById("serviceType");
const packageSelectEl = document.getElementById("packageSelect");
const dateEl = document.getElementById("date");
const otherPriceContainer = document.getElementById("otherPriceContainer");
const otherPriceEl = document.getElementById("otherPrice");

// Auto-set today's date
dateEl.valueAsDate = new Date();
const today = new Date();
document.getElementById("filterDate").valueAsDate = today;
document.getElementById("filterMonth").value = today.toISOString().slice(0,7);
document.getElementById("filterSalaryMonth").value = today.toISOString().slice(0,7);
document.getElementById("filterPeriod").value = (today.getDate() <= 14) ? "1" : "2";

// ---------- Functions ----------

// Populate package dropdown dynamically
function populatePackages() {
  const type = serviceTypeEl.value;
  packageSelectEl.innerHTML = "";

  const list = type === "0.35" ? packages.center : packages.home;
  list.forEach(p => {
    const option = document.createElement("option");
    option.value = p.price;
    option.textContent = p.name;
    packageSelectEl.appendChild(option);
  });

  const other = document.createElement("option");
  other.value = "other";
  other.textContent = "Others";
  packageSelectEl.appendChild(other);

  otherPriceContainer.style.display = "none";
  otherPriceEl.value = "";
}

// Show/hide custom price input
function packageChange() {
  if(packageSelectEl.value === "other") {
    otherPriceContainer.style.display = "block";
  } else {
    otherPriceContainer.style.display = "none";
  }
}

// Add or update session
function addCommission() {
  let price = packageSelectEl.value === "other" ? Number(otherPriceEl.value) : Number(packageSelectEl.value);
  const rate = Number(serviceTypeEl.value);
  const date = dateEl.value;

  if(!price || !date) {
    alert("Please enter valid price and date");
    return;
  }

  const commission = price * rate;

  if(editIndex !== null) {
    sessions[editIndex] = { price, rate, commission, date };
    editIndex = null;
  } else {
    sessions.push({ price, rate, commission, date });
  }

  localStorage.setItem("sessions", JSON.stringify(sessions));

  // Reset inputs
  packageSelectEl.selectedIndex = 0;
  otherPriceContainer.style.display = "none";
  otherPriceEl.value = "";
  dateEl.valueAsDate = new Date();

  render();
}

// Edit session
function editSession(index) {
  const s = sessions[index];
  serviceTypeEl.value = s.rate === 0.35 ? "0.35" : "0.50";
  populatePackages();

  let foundOption = false;
  for(let i=0; i<packageSelectEl.options.length; i++){
    if(Number(packageSelectEl.options[i].value) === s.price){
      packageSelectEl.selectedIndex = i;
      foundOption = true;
      break;
    }
  }
  if(!foundOption){
    packageSelectEl.value = "other";
    otherPriceContainer.style.display = "block";
    otherPriceEl.value = s.price;
  } else {
    otherPriceContainer.style.display = "none";
  }

  dateEl.value = s.date;
  editIndex = index;
}

// Delete session
function deleteSession(index) {
  if(confirm("Are you sure you want to delete this session?")){
    sessions.splice(index,1);
    localStorage.setItem("sessions", JSON.stringify(sessions));
    render();
  }
}

// ---------- Render ----------
function render() {
  const list = document.getElementById("list");
  const totalEl = document.getElementById("total");
  list.innerHTML = "";
  let total = 0;

  sessions.forEach((s,index)=>{
    total += s.commission;
    list.innerHTML += `
      <li class="session-row">
        <div>
          RM ${s.price} × ${(s.rate*100)}%<br>
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

// ---------- Totals ----------
document.getElementById("filterDate").addEventListener("change", updateTotalByDate);
function updateTotalByDate(){
  const selectedDate = document.getElementById("filterDate").value;
  const total = sessions.filter(s=>s.date===selectedDate).reduce((sum,s)=>sum+s.commission,0);
  document.getElementById("totalByDate").textContent = total.toFixed(2);
}

document.getElementById("filterMonth").addEventListener("change", updateTotalByPeriod);
document.getElementById("filterPeriod").addEventListener("change", updateTotalByPeriod);
function updateTotalByPeriod(){
  const month = document.getElementById("filterMonth").value;
  const period = document.getElementById("filterPeriod").value;
  if(!month){ document.getElementById("totalByPeriod").textContent="0.00"; return; }
  const [year, mon] = month.split("-").map(Number);
  const total = sessions.filter(s=>{
    const d = new Date(s.date);
    return d.getFullYear()===year && (d.getMonth()+1)===mon;
  }).filter(s=>{
    const day = new Date(s.date).getDate();
    return period==="1"? day<=14 : day>=15;
  }).reduce((sum,s)=>sum+s.commission,0);
  document.getElementById("totalByPeriod").textContent = total.toFixed(2);
}

document.getElementById("filterSalaryMonth").addEventListener("change", updateTotalSalaryByMonth);
function updateTotalSalaryByMonth(){
  const month = document.getElementById("filterSalaryMonth").value;
  if(!month){ document.getElementById("totalSalaryByMonth").textContent="0.00"; return; }
  const [year, mon] = month.split("-").map(Number);
  const total = sessions.filter(s=>{
    const d = new Date(s.date);
    return d.getFullYear()===year && (d.getMonth()+1)===mon;
  }).reduce((sum,s)=>sum+s.commission,0);
  document.getElementById("totalSalaryByMonth").textContent = total.toFixed(2);
}

// ---------- Init ----------
populatePackages();
render();
