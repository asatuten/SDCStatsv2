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


if __name__ == '__main__':
    app.run(debug=True)
