let sessions = JSON.parse(localStorage.getItem("sessions")) || [];
let editIndex = null;

// AUTO DATE
const today = new Date();
date.valueAsDate = today;
filterDate.valueAsDate = today;
filterMonth.value = today.toISOString().slice(0,7);
filterSalaryMonth.value = filterMonth.value;
filterPeriod.value = today.getDate() <= 14 ? "1" : "2";

// PACKAGE
function packageChange(){
  otherPriceBox.style.display =
    packageSelect.value === "other" ? "block" : "none";
}

// ADD
function addSession(){
  let price = packageSelect.value === "other"
    ? Number(otherPrice.value)
    : Number(packageSelect.value);

  if(!price) return alert("Enter price");

  const rate = Number(serviceType.value);
  const commission = price * rate;

  const data = { date: date.value, price, rate, commission };

  editIndex !== null
    ? sessions[editIndex] = data
    : sessions.push(data);

  editIndex = null;
  localStorage.setItem("sessions", JSON.stringify(sessions));
  render();
}

// RENDER
function render(){
  sessionList.innerHTML = "";
  let total = 0;

  sessions.forEach((s,i)=>{
    total += s.commission;
    sessionList.innerHTML += `
      <li class="session">
        <div>
          RM${s.price} × ${(s.rate*100)}%<br>
          <b>RM ${s.commission.toFixed(2)}</b>
          <small>${s.date}</small>
        </div>
        <div>
          <button onclick="editSession(${i})">✏️</button>
          <button onclick="deleteSession(${i})">🗑️</button>
        </div>
      </li>`;
  });

  grandTotal.textContent = `RM ${total.toFixed(2)}`;
  calcTotals();
}

// EDIT
function editSession(i){
  const s = sessions[i];
  serviceType.value = s.rate;
  date.value = s.date;
  packageSelect.value = s.price;
  editIndex = i;
}

// DELETE
function deleteSession(i){
  if(confirm("Delete session?")){
    sessions.splice(i,1);
    localStorage.setItem("sessions", JSON.stringify(sessions));
    render();
  }
}

// TOTALS
function calcTotals(){
  const d = filterDate.value;
  totalByDate.textContent = sum(s=>s.date===d);

  const [y,m] = filterMonth.value.split("-").map(Number);
  totalByPeriod.textContent = sum(s=>{
    const dt=new Date(s.date);
    const day=dt.getDate();
    return dt.getFullYear()==y &&
           dt.getMonth()+1==m &&
           (filterPeriod.value=="1"?day<=14:day>=15);
  });

  totalByMonth.textContent = sum(s=>{
    const dt=new Date(s.date);
    return dt.getFullYear()==y && dt.getMonth()+1==m;
  });
}

function sum(fn){
  return sessions.filter(fn).reduce((a,b)=>a+b.commission,0).toFixed(2);
}

// PDF EXPORT
function exportPDF(){
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.text("TeMan Wellness Salary Report",14,16);

  doc.autoTable({
    startY: 24,
    head:[["Date","Service","Paid","%","Commission"]],
    body:sessions.map(s=>[
      s.date,
      s.rate==0.35?"Center":"Home",
      "RM"+s.price,
      s.rate*100+"%",
      "RM"+s.commission.toFixed(2)
    ])
  });

  doc.save("TeMan_Wellness_Salary.pdf");
}

render();
