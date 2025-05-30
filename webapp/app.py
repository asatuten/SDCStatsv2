from flask import Flask, render_template, jsonify, request
from dotenv import load_dotenv

import sys
from pathlib import Path

# Ensure the repo root is on the Python path so `riot_api` can be imported when
# running this file directly from the `webapp` directory.
ROOT_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT_DIR))

from riot_api import RiotAPI

# Load environment variables from the repository's `.env` file if present.
load_dotenv(ROOT_DIR / ".env")


app = Flask(__name__)

api = RiotAPI()


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/player')
def player_page():
    """Render the player lookup page."""
    return render_template('player.html')


@app.route('/api/match')
def match_data():
    match_id = request.args.get('match_id')
    region = request.args.get('region')
    if not match_id or not region:
        return jsonify({'error': 'match_id and region parameters are required'}), 400
    try:
        data = api.get_match(region, match_id)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    return jsonify(data)


@app.route('/api/player')
def player_data():
    riot_id = request.args.get('riot_id')
    region = request.args.get('region')
    if not riot_id or not region:
        return jsonify({'error': 'riot_id and region parameters are required'}), 400
    if '#' not in riot_id:
        return jsonify({'error': 'riot_id must be in the form name#TAG'}), 400

    game_name, tag_line = riot_id.split('#', 1)
    try:
        account = api.get_account_by_riot_id(game_name, tag_line)
        puuid = account['puuid']
        match_ids = api.get_matches_for_puuid(region, puuid, count=10)
        matches = []
        for mid in match_ids:
            match = api.get_match(api._cluster(region), mid)
            participant = next(
                (p for p in match.get('info', {}).get('participants', []) if p.get('puuid') == puuid),
                None,
            )
            if participant:
                matches.append({
                    'match_id': mid,
                    'champion': participant.get('championName'),
                    'kills': participant.get('kills'),
                    'deaths': participant.get('deaths'),
                    'assists': participant.get('assists'),
                    'win': participant.get('win'),
                })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

    return jsonify({'matches': matches})


if __name__ == '__main__':
    app.run(debug=True)
