# SDCStatsv2 (.NET Edition)

This repository provides a minimal C# implementation for fetching match data from the Riot Games API. A console program and a small ASP.NET Core web application are included. Supply your Riot API key via the `RIOT_API_KEY` environment variable or with the `--api-key` command line flag.

## Setup

1. Install the .NET 6 SDK.
2. Restore the projects:
   ```bash
   dotnet restore
   ```

## Console Usage

Run the console application with a region code and one or more match IDs. For example:

```bash
dotnet run --project src/RiotConsole na1 <match_id1> <match_id2>
```

Add `--output mydata.json` to write the results to a file.

## Example

```bash
export RIOT_API_KEY=your_api_key_here
dotnet run --project src/RiotConsole na1 ABCDEFGHIJKLMN
```

This prints the JSON match data for the given match ID to stdout.

## Web App

The `src/WebApp` directory now uses ASP.NET Core MVC. Controllers provide API endpoints and Razor views replace the previous static HTML pages.

1. Ensure your `RIOT_API_KEY` is available in the environment.
2. Start the web server:
   ```bash
   dotnet run --project src/WebApp
   ```

3. Open `http://localhost:5000/` in your browser. Enter a region and match ID to fetch match data.
4. A Player Lookup page is available at `/player` where you can enter a Riot ID (`name#TAG`) to see recent matches. You can also specify how many games to fetch and filter them by champion, result or minimum KDA.
5. The scoreboard now calculates additional statistics like KDA ratio, CS per minute, kill participation and damage per minute for each participant. The match view also shows queue type, start time and duration.
