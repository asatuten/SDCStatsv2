import os
from typing import Dict, Any, List

import requests


class RiotAPI:
    """Simple wrapper around the Riot Games API."""

    def __init__(self, api_key: str | None = None):
        self.api_key = api_key or os.environ.get("RIOT_API_KEY")
        if not self.api_key:
            raise ValueError("Riot API key must be provided via argument or RIOT_API_KEY env var")

        self._region_map = {
            # Americas routing group
            "na1": "americas",
            "br1": "americas",
            "la1": "americas",
            "la2": "americas",
            "oc1": "americas",
            # Europe routing group
            "euw1": "europe",
            "eun1": "europe",
            "tr1": "europe",
            "ru": "europe",
            # Asia routing group
            "kr": "asia",
            "jp1": "asia",
        }

    def _headers(self) -> Dict[str, str]:
        return {"X-Riot-Token": self.api_key}

    def _cluster(self, region: str) -> str:
        """Map a platform region (e.g. na1) to its routing cluster."""
        return self._region_map.get(region.lower(), region)

    def get_match(self, region: str, match_id: str) -> Dict[str, Any]:
        """Fetch match data from the Riot API."""
        url = f"https://{region}.api.riotgames.com/lol/match/v5/matches/{match_id}"
        resp = requests.get(url, headers=self._headers(), timeout=10)
        resp.raise_for_status()
        return resp.json()

    def get_account_by_riot_id(self, game_name: str, tag_line: str) -> Dict[str, Any]:
        """Fetch account information using Riot ID."""
        url = f"https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/{game_name}/{tag_line}"
        resp = requests.get(url, headers=self._headers(), timeout=10)
        resp.raise_for_status()
        return resp.json()

    def get_matches_for_puuid(self, region: str, puuid: str, count: int = 10) -> List[str]:
        """Return a list of recent match IDs for the given player."""
        cluster = self._cluster(region)
        url = (
            f"https://{cluster}.api.riotgames.com/lol/match/v5/matches/by-puuid/{puuid}/ids"
            f"?start=0&count={count}"
        )
        resp = requests.get(url, headers=self._headers(), timeout=10)
        resp.raise_for_status()
        return resp.json()
