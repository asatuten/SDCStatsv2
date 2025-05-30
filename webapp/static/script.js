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

      const summonerTd = document.createElement('td');
      const riotName = p.riotIdGameName || p.riotIdName;
      const riotTag = p.riotIdTagline;
      if (riotName && riotTag) {
        const riotId = `${riotName}#${riotTag}`;
        const link = document.createElement('a');
        link.href = `/player?region=${encodeURIComponent(region)}&riot_id=${encodeURIComponent(riotId)}`;
        link.textContent = p.summonerName;
        summonerTd.appendChild(link);
      } else {
        summonerTd.textContent = p.summonerName;
      }

      const champTd = document.createElement('td');
      const champImg = document.createElement('img');
      champImg.className = 'champion-icon me-1';
      champImg.src = `${champBase}${p.championName}.png`;
      champImg.alt = p.championName;
      champTd.appendChild(champImg);
      champTd.appendChild(document.createTextNode(p.championName));

      const kdaTd = document.createElement('td');
      kdaTd.textContent = `${p.kills} / ${p.deaths} / ${p.assists}`;

      const csTd = document.createElement('td');
      csTd.textContent = p.totalMinionsKilled;

      const itemsTd = document.createElement('td');
      const items = [p.item0, p.item1, p.item2, p.item3, p.item4, p.item5];
      items.forEach(id => {
        if (id) {
          const img = document.createElement('img');
          img.className = 'item-icon me-1';
          img.src = `${itemBase}${id}.png`;
          img.alt = '';
          itemsTd.appendChild(img);
        }
      });

      row.appendChild(summonerTd);
      row.appendChild(champTd);
      row.appendChild(kdaTd);
      row.appendChild(csTd);
      row.appendChild(itemsTd);

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

    const matchTd = document.createElement('td');
    const link = document.createElement('a');
    link.href = `/?region=${encodeURIComponent(region)}&match_id=${encodeURIComponent(m.match_id)}`;
    link.textContent = m.match_id;
    matchTd.appendChild(link);

    const champTd = document.createElement('td');
    champTd.textContent = m.champion;

    const kdaTd = document.createElement('td');
    kdaTd.textContent = `${m.kills} / ${m.deaths} / ${m.assists}`;

    const resultTd = document.createElement('td');
    resultTd.textContent = m.win ? 'Win' : 'Loss';

    row.appendChild(matchTd);
    row.appendChild(champTd);
    row.appendChild(kdaTd);
    row.appendChild(resultTd);
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
