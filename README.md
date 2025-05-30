# SDCStatsv2

This repository provides a simple Python template for fetching match data from the Riot Games API.  
You can supply your Riot API key via the `RIOT_API_KEY` environment variable or with the `--api-key` command line flag.

## Setup

1. Create a Python virtual environment (optional but recommended).
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Usage

Run the `main.py` script with a region code and one or more match IDs. For example:

```bash
python main.py na1 <match_id1> <match_id2>
```

Replace `<match_id1>` and `<match_id2>` with the match IDs you want to fetch. You can also specify `--output mydata.json` to write the results to a file.

## Example

```bash
export RIOT_API_KEY=your_api_key_here
python main.py na1 ABCDEFGHIJKLMN
```

This will print the JSON match data for the given match ID to stdout.

## Notes

- Custom games can be queried the same way as any other match. Once you have the match ID(s) for your custom games, pass them to `main.py`.
- This template focuses on fetching match data. You can extend it to store results in a database or perform any additional analysis you need.

## Web App

The `webapp` directory contains a small Flask application that renders a
demo player profile page using the mock data in `mock_data.json`.

1. From the project root, start the app:

   ```bash
   cd webapp
   python app.py
   ```

2. Open `http://127.0.0.1:5000/` in your browser to view the page.

The app does not require a Riot API key because it reads from
`mock_data.json`. You can modify `app.py` to query the real API if desired.
