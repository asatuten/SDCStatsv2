const scoreboard = document.getElementById('scoreboard');
const ddragonVersion = '15.11.1';
const champBase = `https://ddragon.leagueoflegends.com/cdn/${ddragonVersion}/img/champion/`;
const itemBase = `https://ddragon.leagueoflegends.com/cdn/${ddragonVersion}/img/item/`;
const queueNames = { 420: 'Ranked Solo/Duo', 440: 'Ranked Flex', 400: 'Draft Pick', 430: 'Blind Pick', 450: 'ARAM' };
let allMatches = [];

function calcScore(kda, csPerMin, kp, dmgPerMin) {
  let score = Math.min(kda / 5, 1) * 4 +
              Math.min(csPerMin / 10, 1) * 2 +
              (kp / 100) * 2 +
              Math.min(dmgPerMin / 1000, 1) * 2;
  score = Math.min(score, 10);
  return score;
}

function displayScoreboard(data, region) {
  scoreboard.innerHTML = '';
  if (!data.info || !Array.isArray(data.info.participants)) {
    scoreboard.textContent = 'Unexpected match data';
    return;
  }

  // Match summary
  const info = data.info;
  const start = new Date(info.gameStartTimestamp || info.gameCreation);
  const durMin = Math.floor(info.gameDuration / 60);
  const durSec = info.gameDuration % 60;
  const queue = queueNames[info.queueId] || `Queue ${info.queueId}`;
  const summary = document.createElement('div');
  summary.className = 'mb-2';
  summary.textContent = `${queue} • ${start.toLocaleString()} • Duration ${durMin}:${durSec.toString().padStart(2,'0')} • ${info.gameMode}`;
  scoreboard.appendChild(summary);

  const teams = { 100: [], 200: [] };
  data.info.participants.forEach(p => {
    teams[p.teamId].push(p);
  });

  Object.entries(teams).forEach(([teamId, players]) => {
    const header = document.createElement('h3');
    const isBlue = teamId === '100';
    header.textContent = isBlue ? 'Blue Team' : 'Red Team';
    header.className = isBlue ? 'text-primary' : 'text-danger';
    scoreboard.appendChild(header);

    const table = document.createElement('table');
    table.className = `table table-custom table-striped mb-4 ${isBlue ? 'team-blue' : 'team-red'}`;

    const thead = document.createElement('thead');
    thead.innerHTML = '<tr><th>Summoner</th><th>Champion</th><th>K / D / A</th><th>KDA</th><th>CS</th><th>CS/Min</th><th>KP%</th><th>DMG/Min</th><th>Score</th><th>Items</th></tr>';

    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    const teamKills = players.reduce((sum, x) => sum + x.kills, 0);
    players.forEach(p => {
      const row = document.createElement('tr');

      const summonerTd = document.createElement('td');
      const riotName = p.riotIdGameName || p.riotIdName;
      const riotTag = p.riotIdTagline;
      if (riotName && riotTag) {
        const riotId = `${riotName}#${riotTag}`;
        const link = document.createElement('a');
        link.href = `/player?region=${encodeURIComponent(region)}&riot_id=${encodeURIComponent(riotId)}`;

        link.textContent = riotId;

        summonerTd.appendChild(link);
      } else {
        summonerTd.textContent = p.summonerName;
      }
      row.appendChild(summonerTd);

      const champTd = document.createElement('td');
      const champImg = document.createElement('img');
      champImg.className = 'champion-icon me-1';
      champImg.src = `${champBase}${p.championName}.png`;
      champImg.alt = p.championName;
      champTd.appendChild(champImg);
      champTd.appendChild(document.createTextNode(p.championName));

      row.appendChild(champTd);

      // K/D/A column
      const kdaTd = document.createElement('td');
      kdaTd.textContent = `${p.kills} / ${p.deaths} / ${p.assists}`;
      row.appendChild(kdaTd);

      // KDA ratio
      const ratioTd = document.createElement('td');
      const ratio = ( (p.kills + p.assists) / Math.max(1, p.deaths) ).toFixed(2);
      ratioTd.textContent = ratio;
      row.appendChild(ratioTd);

      // CS column
      const csCount = p.totalMinionsKilled + (p.neutralMinionsKilled || 0);
      const csTd = document.createElement('td');
      csTd.textContent = csCount;
      row.appendChild(csTd);

      // CS per minute
      const cspmTd = document.createElement('td');
      const csPerMin = csCount / (p.timePlayed / 60);
      cspmTd.textContent = csPerMin.toFixed(1);
      row.appendChild(cspmTd);

      // Kill participation
      const kpTd = document.createElement('td');
      const kp = teamKills > 0 ? ((p.kills + p.assists) / teamKills) * 100 : 0;
      kpTd.textContent = Math.round(kp);
      row.appendChild(kpTd);

      // Damage per minute
      const dmgTd = document.createElement('td');
      const dmgPerMin = p.totalDamageDealtToChampions / (p.timePlayed / 60);
      dmgTd.textContent = dmgPerMin.toFixed(1);
      row.appendChild(dmgTd);

      const scoreTd = document.createElement('td');
      const score = calcScore(parseFloat(ratio), csPerMin, kp, dmgPerMin);
      scoreTd.textContent = score.toFixed(1);
      row.appendChild(scoreTd);

      // Items column
      const itemsTd = document.createElement('td');
      const items = [p.item0, p.item1, p.item2, p.item3, p.item4, p.item5];
      items.forEach(id => {
        if (!id) return;
        const itemImg = document.createElement('img');
        itemImg.className = 'item-icon me-1';
        itemImg.src = `${itemBase}${id}.png`;
        itemImg.alt = '';
        itemsTd.appendChild(itemImg);
      });
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

function renderMatches(matches, region) {
  matchesEl.innerHTML = '';
  if (!matches || !Array.isArray(matches) || matches.length === 0) {
    matchesEl.textContent = 'No matches found';
    return;
  }

  const table = document.createElement('table');
  table.className = 'table table-custom table-striped';
  table.innerHTML = '<thead><tr><th>Match ID</th><th>Champion</th><th>K / D / A</th><th>KDA</th><th>CS</th><th>CS/Min</th><th>KP%</th><th>DMG/Min</th><th>Score</th><th>Result</th></tr></thead>';

  const tbody = document.createElement('tbody');
  matches.forEach(m => {
    const row = document.createElement('tr');

    const matchTd = document.createElement('td');
    const link = document.createElement('a');
    link.href = `/?region=${encodeURIComponent(region)}&match_id=${encodeURIComponent(m.match_id)}`;
    link.textContent = m.match_id;
    matchTd.appendChild(link);

    row.appendChild(matchTd);

    const champTd = document.createElement('td');
    const champImg = document.createElement('img');
    champImg.className = 'champion-icon me-1';
    champImg.src = `${champBase}${m.champion}.png`;
    champImg.alt = m.champion;
    champTd.appendChild(champImg);
    champTd.appendChild(document.createTextNode(m.champion));
    row.appendChild(champTd);

    const kdaTd = document.createElement('td');
    kdaTd.textContent = `${m.kills} / ${m.deaths} / ${m.assists}`;
    row.appendChild(kdaTd);

    const ratioTd = document.createElement('td');
    ratioTd.textContent = m.kda.toFixed(2);
    row.appendChild(ratioTd);

    const csTd = document.createElement('td');
    csTd.textContent = m.cs;
    row.appendChild(csTd);

    const cspmTd = document.createElement('td');
    cspmTd.textContent = m.cs_per_min.toFixed(1);
    row.appendChild(cspmTd);

    const kpTd = document.createElement('td');
    kpTd.textContent = Math.round(m.kp);
    row.appendChild(kpTd);

    const dmgTd = document.createElement('td');
    dmgTd.textContent = m.dmg_per_min.toFixed(1);
    row.appendChild(dmgTd);

    const scoreTd = document.createElement('td');
    scoreTd.textContent = m.score.toFixed(1);
    row.appendChild(scoreTd);

    const resultTd = document.createElement('td');
    resultTd.textContent = m.win ? 'Win' : 'Loss';

    row.appendChild(resultTd);

    tbody.appendChild(row);
  });

  table.appendChild(tbody);
  matchesEl.appendChild(table);
}

const playerForm = document.getElementById('playerForm');
const filterPanel = document.getElementById('filterPanel');
const filterChampion = document.getElementById('filterChampion');
const filterResult = document.getElementById('filterResult');
const filterKda = document.getElementById('filterKda');
const applyFiltersBtn = document.getElementById('applyFilters');

function applyFilters(region) {
  let matches = allMatches;
  const champVal = filterChampion.value.trim().toLowerCase();
  const resultVal = filterResult.value;
  const kdaVal = parseFloat(filterKda.value);
  matches = matches.filter(m => {
    if (champVal && !m.champion.toLowerCase().includes(champVal)) return false;
    if (resultVal === 'win' && !m.win) return false;
    if (resultVal === 'loss' && m.win) return false;
    if (!isNaN(kdaVal) && m.kda < kdaVal) return false;
    return true;
  });
  renderMatches(matches, region);
}

if (applyFiltersBtn) {
  applyFiltersBtn.addEventListener('click', function() {
    const region = document.getElementById('playerRegion').value;
    applyFilters(region);
  });
}

if (playerForm) {
  playerForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const region = document.getElementById('playerRegion').value;
    const riotId = document.getElementById('riotId').value.trim();
    const count = document.getElementById('matchCount').value || 10;
    const out = document.getElementById('playerOutput');
    if (!region || !riotId) {
      out.textContent = 'Region and Riot ID are required';
      return;
    }
    out.textContent = 'Loading...';
    matchesEl.innerHTML = '';
    filterPanel.style.display = 'none';
    fetch(`/api/player?region=${encodeURIComponent(region)}&riot_id=${encodeURIComponent(riotId)}&count=${count}`)
      .then(r => r.json())
      .then(data => {
        out.textContent = '';
        if (data.error) {
          out.textContent = 'Error: ' + data.error;
          return;
        }
        allMatches = data.matches;
        filterPanel.style.display = 'block';
        applyFilters(region);
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
  const countParam = params.get('count');
  if (playerForm && riotIdParam) {
    if (regionParam) document.getElementById('playerRegion').value = regionParam;
    document.getElementById('riotId').value = riotIdParam;
    if (countParam) document.getElementById('matchCount').value = countParam;
    playerForm.dispatchEvent(new Event('submit'));
  }
});
