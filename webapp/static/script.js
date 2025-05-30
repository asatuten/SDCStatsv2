const scoreboard = document.getElementById('scoreboard');

function displayScoreboard(data, region) {
  scoreboard.innerHTML = '';
  if (!data.info || !Array.isArray(data.info.participants)) {
    scoreboard.textContent = 'Unexpected match data';
    return;
  }

  const teams = { 100: [], 200: [] };
  data.info.participants.forEach(p => {
    teams[p.teamId].push(p);
  });

  const ddragonVersion = '15.11.1';
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

      const riotName = p.riotIdGameName || p.riotIdName;
      const riotTag = p.riotIdTagline;
      let summonerCell = p.summonerName;
      if (riotName && riotTag) {
        const riotId = `${riotName}#${riotTag}`;
        summonerCell = `<a href="/player?region=${encodeURIComponent(region)}&riot_id=${encodeURIComponent(riotId)}">${p.summonerName}</a>`;
      }

      row.innerHTML = `<td>${summonerCell}</td>` +
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

const matchForm = document.getElementById('matchForm');
if (matchForm) {
  matchForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const region = document.getElementById('region').value;
    const matchId = document.getElementById('matchId').value.trim();
    const output = document.getElementById('matchOutput');
    if (!region || !matchId) {
      output.textContent = 'Region and Match ID are required';
      return;
    }
    output.textContent = 'Loading...';
    scoreboard && (scoreboard.innerHTML = '');
    fetch(`/api/match?region=${encodeURIComponent(region)}&match_id=${encodeURIComponent(matchId)}`)
      .then(r => r.json())
      .then(data => {
        output.textContent = '';
        if (data.error) {
          output.textContent = 'Error: ' + data.error;
          return;
        }
        displayScoreboard(data, region);
      })
      .catch(err => {
        output.textContent = 'Error: ' + err;
      });
  });
}

const matchesEl = document.getElementById('matches');

function displayMatches(data, region) {
  matchesEl.innerHTML = '';
  if (!data.matches || !Array.isArray(data.matches)) {
    matchesEl.textContent = 'Unexpected player data';
    return;
  }

  const table = document.createElement('table');
  table.className = 'table table-custom table-striped';
  table.innerHTML = '<thead><tr><th>Match ID</th><th>Champion</th><th>K / D / A</th><th>Result</th></tr></thead>';

  const tbody = document.createElement('tbody');
  data.matches.forEach(m => {
    const row = document.createElement('tr');
    const matchLink = `<a href="/?region=${encodeURIComponent(region)}&match_id=${encodeURIComponent(m.match_id)}">${m.match_id}</a>`;
    row.innerHTML = `<td>${matchLink}</td>` +
                    `<td>${m.champion}</td>` +
                    `<td>${m.kills} / ${m.deaths} / ${m.assists}</td>` +
                    `<td>${m.win ? 'Win' : 'Loss'}</td>`;
    tbody.appendChild(row);
  });

  table.appendChild(tbody);
  matchesEl.appendChild(table);
}

const playerForm = document.getElementById('playerForm');
if (playerForm) {
  playerForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const region = document.getElementById('playerRegion').value;
    const riotId = document.getElementById('riotId').value.trim();
    const out = document.getElementById('playerOutput');
    if (!region || !riotId) {
      out.textContent = 'Region and Riot ID are required';
      return;
    }
    out.textContent = 'Loading...';
    matchesEl.innerHTML = '';
    fetch(`/api/player?region=${encodeURIComponent(region)}&riot_id=${encodeURIComponent(riotId)}`)
      .then(r => r.json())
      .then(data => {
        out.textContent = '';
        if (data.error) {
          out.textContent = 'Error: ' + data.error;
          return;
        }
        displayMatches(data, region);
      })
      .catch(err => {
        out.textContent = 'Error: ' + err;
      });
  });
}

// Auto-fetch data when query parameters are present
document.addEventListener('DOMContentLoaded', function() {
  const params = new URLSearchParams(window.location.search);
  const regionParam = params.get('region');
  const matchIdParam = params.get('match_id') || params.get('matchId');
  if (matchForm && matchIdParam) {
    if (regionParam) document.getElementById('region').value = regionParam;
    document.getElementById('matchId').value = matchIdParam;
    matchForm.dispatchEvent(new Event('submit'));
  }
  const riotIdParam = params.get('riot_id') || params.get('riotId');
  if (playerForm && riotIdParam) {
    if (regionParam) document.getElementById('playerRegion').value = regionParam;
    document.getElementById('riotId').value = riotIdParam;
    playerForm.dispatchEvent(new Event('submit'));
  }
});
