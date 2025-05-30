using RiotApi;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.UseStaticFiles();

var api = new RiotAPI();

app.MapGet("/", async context =>
{
    context.Response.ContentType = "text/html";
    await context.Response.SendFileAsync(Path.Combine("wwwroot", "index.html"));
});

app.MapGet("/player", async context =>
{
    context.Response.ContentType = "text/html";
    await context.Response.SendFileAsync(Path.Combine("wwwroot", "player.html"));
});

app.MapGet("/api/match", async (HttpContext context) =>
{
    var matchId = context.Request.Query["match_id"].ToString();
    var region = context.Request.Query["region"].ToString();
    if (string.IsNullOrEmpty(matchId) || string.IsNullOrEmpty(region))
    {
        context.Response.StatusCode = 400;
        await context.Response.WriteAsJsonAsync(new { error = "match_id and region parameters are required" });
        return;
    }
    try
    {
        var data = await api.GetMatchAsync(api.Cluster(region), matchId);
        await context.Response.WriteAsJsonAsync(data.RootElement);
    }
    catch (Exception e)
    {
        context.Response.StatusCode = 500;
        await context.Response.WriteAsJsonAsync(new { error = e.Message });
    }
});

app.MapGet("/api/player", async (HttpContext context) =>
{
    var riotId = context.Request.Query["riot_id"].ToString();
    var region = context.Request.Query["region"].ToString();
    if (string.IsNullOrEmpty(riotId) || string.IsNullOrEmpty(region))
    {
        context.Response.StatusCode = 400;
        await context.Response.WriteAsJsonAsync(new { error = "riot_id and region parameters are required" });
        return;
    }
    if (!riotId.Contains('#'))
    {
        context.Response.StatusCode = 400;
        await context.Response.WriteAsJsonAsync(new { error = "riot_id must be in the form name#TAG" });
        return;
    }

    var parts = riotId.Split('#', 2);
    var gameName = parts[0];
    var tagLine = parts[1];

    try
    {
        var account = await api.GetAccountByRiotIdAsync(gameName, tagLine);
        var puuid = account.RootElement.GetProperty("puuid").GetString();
        if (string.IsNullOrEmpty(puuid))
        {
            await context.Response.WriteAsJsonAsync(new { matches = Array.Empty<object>() });
            return;
        }
        var matchIds = await api.GetMatchesForPuuidAsync(region, puuid, 10);
        var matches = new List<object>();
        foreach (var id in matchIds)
        {
            var match = await api.GetMatchAsync(api.Cluster(region), id);
            var participants = match.RootElement.GetProperty("info").GetProperty("participants");
            foreach (var p in participants.EnumerateArray())
            {
                if (p.GetProperty("puuid").GetString() == puuid)
                {
                    matches.Add(new
                    {
                        match_id = id,
                        champion = p.GetProperty("championName").GetString(),
                        kills = p.GetProperty("kills").GetInt32(),
                        deaths = p.GetProperty("deaths").GetInt32(),
                        assists = p.GetProperty("assists").GetInt32(),
                        win = p.GetProperty("win").GetBoolean()
                    });
                    break;
                }
            }
        }
        await context.Response.WriteAsJsonAsync(new { matches });
    }
    catch (Exception e)
    {
        context.Response.StatusCode = 500;
        await context.Response.WriteAsJsonAsync(new { error = e.Message });
    }
});

app.Run();
