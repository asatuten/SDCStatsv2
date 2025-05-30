const scoreboard = document.getElementById('scoreboard');

function displayScoreboard(data) {
  scoreboard.innerHTML = '';
  if (!data.info || !Array.isArray(data.info.participants)) {
    scoreboard.textContent = 'Unexpected match data';
    return;
  }

  const teams = { 100: [], 200: [] };
  data.info.participants.forEach(p => {
    teams[p.teamId].push(p);
  });

  Object.entries(teams).forEach(([teamId, players]) => {
    const header = document.createElement('h3');
    header.textContent = teamId === '100' ? 'Blue Team' : 'Red Team';
    scoreboard.appendChild(header);

    const table = document.createElement('table');
    table.className = 'table table-custom table-striped mb-4';

    const thead = document.createElement('thead');
    thead.innerHTML = '<tr><th>Summoner</th><th>Champion</th><th>K / D / A</th><th>CS</th></tr>';
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    players.forEach(p => {
      const row = document.createElement('tr');
      row.innerHTML = `<td>${p.summonerName}</td>` +
                      `<td>${p.championName}</td>` +
                      `<td>${p.kills} / ${p.deaths} / ${p.assists}</td>` +
                      `<td>${p.totalMinionsKilled}</td>`;
      tbody.appendChild(row);
    });
    table.appendChild(tbody);
    scoreboard.appendChild(table);
  });
}

document.getElementById('matchForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const region = document.getElementById('region').value;
  const matchId = document.getElementById('matchId').value.trim();
  const output = document.getElementById('matchOutput');
  if (!region || !matchId) {
    output.textContent = 'Region and Match ID are required';
    return;
  }
  output.textContent = 'Loading...';
  scoreboard.innerHTML = '';
  fetch(`/api/match?region=${encodeURIComponent(region)}&match_id=${encodeURIComponent(matchId)}`)
    .then(r => r.json())
    .then(data => {
      output.textContent = '';
      if (data.error) {
        output.textContent = 'Error: ' + data.error;
        return;
      }
      displayScoreboard(data);
    })
    .catch(err => {
      output.textContent = 'Error: ' + err;
    });
});
