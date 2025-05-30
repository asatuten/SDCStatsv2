function renderGeneral(data) {
  const container = document.getElementById('general');
  container.innerHTML = `
    <table class="table table-bordered table-custom">
      <tbody>
        <tr><th>Win Rate</th><td>${data.winRate}%</td></tr>
        <tr><th>KDA Ratio</th><td>${data.kda}</td></tr>
        <tr><th>Average CS</th><td>${data.cs}</td></tr>
        <tr><th>Gold Earned</th><td>${data.gold}</td></tr>
        <tr><th>Damage Dealt</th><td>${data.damage}</td></tr>
      </tbody>
    </table>`;
}

function renderChampions(champs) {
  const container = document.getElementById('champions');
  let rows = champs.map(c => `
    <tr>
      <td>${c.name}</td>
      <td>${c.games}</td>
      <td>${c.winRate}%</td>
      <td>${c.kda}</td>
      <td>${c.cs}</td>
      <td>${c.gold}</td>
    </tr>`).join('');
  container.innerHTML = `
    <table class="table table-striped table-custom">
      <thead>
        <tr>
          <th>Champion</th><th>Games</th><th>Win Rate</th><th>KDA</th><th>CS</th><th>Gold</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function renderStats(data) {
  const container = document.getElementById('stats');
  let matchRows = data.matches.map(m => `
    <tr><td>${m.date}</td><td>${m.opponent}</td><td>${m.result}</td></tr>`).join('');
  container.innerHTML = `
    <h4>Recent Matches</h4>
    <table class="table table-bordered table-custom mb-4">
      <thead><tr><th>Date</th><th>Opponent</th><th>Result</th></tr></thead>
      <tbody>${matchRows}</tbody>
    </table>
    <h4>Performance Trends</h4>
    <canvas id="winRateChart" height="100"></canvas>
    <h4 class="mt-4">Role Distribution</h4>
    <canvas id="roleChart" height="100"></canvas>
    <h4 class="mt-4">Objective Control</h4>
    <ul>
      <li>Dragons: ${data.objectiveControl.dragons}</li>
      <li>Barons: ${data.objectiveControl.barons}</li>
      <li>Towers: ${data.objectiveControl.towers}</li>
    </ul>`;
  renderCharts(data);
}

function renderCharts(data) {
  const winCtx = document.getElementById('winRateChart').getContext('2d');
  new Chart(winCtx, {
    type: 'line',
    data: {
      labels: data.winRateHistory.map(p => p.date),
      datasets: [{
        label: 'Win Rate',
        data: data.winRateHistory.map(p => p.winRate),
        borderColor: 'blue',
        fill: false
      }]
    },
    options: {scales: {y: {min: 0, max: 100}}}
  });

  const roleCtx = document.getElementById('roleChart').getContext('2d');
  new Chart(roleCtx, {
    type: 'pie',
    data: {
      labels: Object.keys(data.roleDistribution),
      datasets: [{
        data: Object.values(data.roleDistribution),
        backgroundColor: ['red','green','blue','orange','purple']
      }]
    }
  });
}

fetch('/api/profile')
  .then(r => r.json())
  .then(data => {
    const p = data.player;
    renderGeneral(p.general);
    renderChampions(p.champions);
    renderStats(p);
  });
