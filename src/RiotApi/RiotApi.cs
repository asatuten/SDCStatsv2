using System.Text.Json;
using System.Net.Http.Headers;

namespace RiotApi;

public class RiotAPI
{
    private readonly string _apiKey;
    private readonly HttpClient _http;
    private readonly Dictionary<string, string> _regionMap = new()
    {
        // Americas routing group
        ["na1"] = "americas",
        ["br1"] = "americas",
        ["la1"] = "americas",
        ["la2"] = "americas",
        ["oc1"] = "americas",
        // Europe routing group
        ["euw1"] = "europe",
        ["eun1"] = "europe",
        ["tr1"] = "europe",
        ["ru"] = "europe",
        // Asia routing group
        ["kr"] = "asia",
        ["jp1"] = "asia"
    };

    public RiotAPI(string? apiKey = null)
    {
        _apiKey = apiKey ?? Environment.GetEnvironmentVariable("RIOT_API_KEY") ?? string.Empty;
        if (string.IsNullOrEmpty(_apiKey))
            throw new ArgumentException("Riot API key must be provided via argument or RIOT_API_KEY env var");
        _http = new HttpClient();
        _http.DefaultRequestHeaders.Add("X-Riot-Token", _apiKey);
    }

    private string MapCluster(string region)
    {
        return _regionMap.TryGetValue(region.ToLowerInvariant(), out var cluster) ? cluster : region;
    }

    public string Cluster(string region) => MapCluster(region);

    public async Task<JsonDocument> GetMatchAsync(string region, string matchId)
    {
        var url = $"https://{region}.api.riotgames.com/lol/match/v5/matches/{matchId}";
        using var resp = await _http.GetAsync(url);
        resp.EnsureSuccessStatusCode();
        var content = await resp.Content.ReadAsStringAsync();
        return JsonDocument.Parse(content);
    }

    public async Task<JsonDocument> GetAccountByRiotIdAsync(string gameName, string tagLine)
    {
        var gameNameQ = Uri.EscapeDataString(gameName);
        var tagLineQ = Uri.EscapeDataString(tagLine);
        var url = $"https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/{gameNameQ}/{tagLineQ}";
        using var resp = await _http.GetAsync(url);
        resp.EnsureSuccessStatusCode();
        var content = await resp.Content.ReadAsStringAsync();
        return JsonDocument.Parse(content);
    }

    public async Task<IReadOnlyList<string>> GetMatchesForPuuidAsync(string region, string puuid, int count = 10)
    {
        var cluster = Cluster(region);
        var url = $"https://{cluster}.api.riotgames.com/lol/match/v5/matches/by-puuid/{puuid}/ids?start=0&count={count}";
        using var resp = await _http.GetAsync(url);
        resp.EnsureSuccessStatusCode();
        var content = await resp.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<List<string>>(content) ?? new List<string>();
    }
}
