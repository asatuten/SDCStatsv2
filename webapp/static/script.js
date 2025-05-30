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

  const ddragonVersion = '13.24.1';
  const champBase = `https://ddragon.leagueoflegends.com/cdn/${ddragonVersion}/img/champion/`;
  const itemBase = `https://ddragon.leagueoflegends.com/cdn/${ddragonVersion}/img/item/`;

  Object.entries(teams).forEach(([teamId, players]) => {
    const header = document.createElement('h3');
    header.textContent = teamId === '100' ? 'Blue Team' : 'Red Team';
    scoreboard.appendChild(header);

    const table = document.createElement('table');
    table.className = 'table table-custom table-striped mb-4';

    const thead = document.createElement('thead');
    thead.innerHTML = '<tr><th>Summoner</th><th>Champion</th><th>K / D / A</th><th>CS</th><th>Items</th></tr>';
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    players.forEach(p => {
      const row = document.createElement('tr');
      const champImg = `<img class="champion-icon me-1" src="${champBase}${p.championName}.png" alt="${p.championName}">`;
      const items = [p.item0, p.item1, p.item2, p.item3, p.item4, p.item5];
      const itemImgs = items.map(id => id ? `<img class="item-icon me-1" src="${itemBase}${id}.png" alt="">` : '').join('');
      row.innerHTML = `<td>${p.summonerName}</td>` +
                      `<td>${champImg}${p.championName}</td>` +
                      `<td>${p.kills} / ${p.deaths} / ${p.assists}</td>` +
                      `<td>${p.totalMinionsKilled}</td>` +
                      `<td>${itemImgs}</td>`;
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
