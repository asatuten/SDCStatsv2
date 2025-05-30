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
  fetch(`/api/match?region=${encodeURIComponent(region)}&match_id=${encodeURIComponent(matchId)}`)
    .then(r => r.json())
    .then(data => {
      output.textContent = JSON.stringify(data, null, 2);
    })
    .catch(err => {
      output.textContent = 'Error: ' + err;
    });
});
