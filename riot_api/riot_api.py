import os
from typing import Dict, Any

import requests


class RiotAPI:
    """Simple wrapper around the Riot Games API."""

    def __init__(self, api_key: str | None = None):
        self.api_key = api_key or os.environ.get("RIOT_API_KEY")
        if not self.api_key:
            raise ValueError("Riot API key must be provided via argument or RIOT_API_KEY env var")

    def _headers(self) -> Dict[str, str]:
        return {"X-Riot-Token": self.api_key}

    def get_match(self, region: str, match_id: str) -> Dict[str, Any]:
        """Fetch match data from the Riot API."""
        url = f"https://{region}.api.riotgames.com/lol/match/v5/matches/{match_id}"
        resp = requests.get(url, headers=self._headers(), timeout=10)
        resp.raise_for_status()
        return resp.json()
