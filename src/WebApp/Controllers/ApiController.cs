using Microsoft.AspNetCore.Mvc;
using RiotApi;
using System.Text.Json;

namespace WebApp.Controllers;

[ApiController]
[Route("api")]
public class ApiController : ControllerBase
{
    private readonly RiotAPI _api;

    public ApiController(RiotAPI api)
    {
        _api = api;
    }

    [HttpGet("match")]
    public async Task<IActionResult> GetMatch([FromQuery] string region, [FromQuery(Name = "match_id")] string matchId)
    {
        if (string.IsNullOrEmpty(region) || string.IsNullOrEmpty(matchId))
        {
            return BadRequest(new { error = "match_id and region parameters are required" });
        }
        try
        {
            var data = await _api.GetMatchAsync(_api.Cluster(region), matchId);
            return Ok(data.RootElement);
        }
        catch (Exception e)
        {
            return StatusCode(500, new { error = e.Message });
        }
    }

    [HttpGet("player")]
    public async Task<IActionResult> GetPlayer([FromQuery] string region,
        [FromQuery(Name = "riot_id")] string riotId,
        [FromQuery] int count = 10)

    {
        if (string.IsNullOrEmpty(region) || string.IsNullOrEmpty(riotId))
        {
            return BadRequest(new { error = "riot_id and region parameters are required" });
        }
        if (!riotId.Contains('#'))
        {
            return BadRequest(new { error = "riot_id must be in the form name#TAG" });
        }

        var parts = riotId.Split('#', 2);
        var gameName = parts[0];
        var tagLine = parts[1];
        try
        {
            var account = await _api.GetAccountByRiotIdAsync(gameName, tagLine);
            var puuid = account.RootElement.GetProperty("puuid").GetString();
            if (string.IsNullOrEmpty(puuid))
            {
                return Ok(new { matches = Array.Empty<object>() });
            }

            if (count < 1)
                count = 1;
            if (count > 100)
                count = 100;

            var matchIds = await _api.GetMatchesForPuuidAsync(region, puuid, count);

            var matches = new List<object>();
            foreach (var id in matchIds)
            {
                var match = await _api.GetMatchAsync(_api.Cluster(region), id);
                var participants = match.RootElement.GetProperty("info").GetProperty("participants");
                foreach (var p in participants.EnumerateArray())
                {
                    if (p.GetProperty("puuid").GetString() == puuid)
                    {
                        int teamId = p.GetProperty("teamId").GetInt32();
                        int teamKills = participants.EnumerateArray()
                            .Where(pp => pp.GetProperty("teamId").GetInt32() == teamId)
                            .Sum(pp => pp.GetProperty("kills").GetInt32());
                        double kills = p.GetProperty("kills").GetInt32();
                        double deaths = p.GetProperty("deaths").GetInt32();
                        double assists = p.GetProperty("assists").GetInt32();
                        double timePlayed = p.GetProperty("timePlayed").GetInt32();
                        double cs = p.GetProperty("totalMinionsKilled").GetInt32() + p.GetProperty("neutralMinionsKilled").GetInt32();
                        double kda = (kills + assists) / Math.Max(1, deaths);
                        double csPerMin = cs / (timePlayed / 60.0);
                        double kp = teamKills > 0 ? (kills + assists) / teamKills * 100.0 : 0.0;
                        double dmgPerMin = p.GetProperty("totalDamageDealtToChampions").GetInt32() / (timePlayed / 60.0);
                        double goldPerMin = p.GetProperty("goldEarned").GetInt32() / (timePlayed / 60.0);
                        double score =
                            Math.Min(kda / 5.0, 1.0) * 4 +
                            Math.Min(csPerMin / 10.0, 1.0) * 2 +
                            (kp / 100.0) * 2 +
                            Math.Min(dmgPerMin / 1000.0, 1.0) * 2;
                        score = Math.Round(Math.Min(score, 10.0), 1);
                        matches.Add(new
                        {
                            match_id = id,
                            champion = p.GetProperty("championName").GetString(),
                            kills = (int)kills,
                            deaths = (int)deaths,
                            assists = (int)assists,
                            win = p.GetProperty("win").GetBoolean(),
                            kda = Math.Round(kda, 2),
                            cs = (int)cs,
                            cs_per_min = Math.Round(csPerMin, 1),
                            kp = Math.Round(kp, 0),
                            dmg_per_min = Math.Round(dmgPerMin, 1),
                            gold_per_min = Math.Round(goldPerMin, 1),
                            score
                        });
                        break;
                    }
                }
            }
            return Ok(new { matches });
        }
        catch (Exception e)
        {
            return StatusCode(500, new { error = e.Message });
        }
    }
}
