let sessions = JSON.parse(localStorage.getItem("sessions")) || [];

function addCommission() {
  const price = Number(document.getElementById("price").value);
  const rate = Number(document.getElementById("serviceType").value);

  if (!price) return alert("Please enter amount");

  const commission = price * rate;

  sessions.push({
    price,
    rate,
    commission
  });

  localStorage.setItem("sessions", JSON.stringify(sessions));
  document.getElementById("price").value = "";
  render();
}

function render() {
  const list = document.getElementById("list");
  const totalEl = document.getElementById("total");

  list.innerHTML = "";
  let total = 0;

  sessions.forEach((s) => {
    total += s.commission;
    list.innerHTML += `
      <li>
        RM ${s.price} × ${(s.rate * 100)}%  
        <br><b>Commission: RM ${s.commission.toFixed(2)}</b>
      </li>
    `;
  });

  totalEl.textContent = `RM ${total.toFixed(2)}`;
}

render();
