from flask import Flask, render_template, jsonify, request
from dotenv import load_dotenv
from riot_api import RiotAPI

load_dotenv()  # load environment variables from .env if present

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
