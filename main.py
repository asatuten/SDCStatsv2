import argparse
import json
from typing import List

from riot_api import RiotAPI


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Fetch League of Legends match data")
    parser.add_argument("region", help="Riot region, e.g. na1, euw1")
    parser.add_argument("match_ids", nargs="+", help="Match IDs to fetch")
    parser.add_argument("--api-key", help="Riot API key; otherwise uses RIOT_API_KEY env var")
    parser.add_argument("--output", help="Output JSON file (default: stdout)")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    api = RiotAPI(api_key=args.api_key)

    matches: List[dict] = []
    for match_id in args.match_ids:
        data = api.get_match(args.region, match_id)
        matches.append(data)

    if args.output:
        with open(args.output, "w", encoding="utf-8") as f:
            json.dump(matches, f, indent=2)
    else:
        print(json.dumps(matches, indent=2))


if __name__ == "__main__":
    main()
