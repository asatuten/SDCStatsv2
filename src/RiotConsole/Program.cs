using RiotApi;
using System.Text.Json;

if (args.Length < 2)
{
    Console.WriteLine("Usage: RiotConsole <region> <match_id> [<match_id> ...] [--api-key KEY] [--output file]");
    return;
}

string region = args[0];
var matchIds = new List<string>();
string? apiKey = null;
string? output = null;

for (int i = 1; i < args.Length; i++)
{
    if (args[i] == "--api-key" && i + 1 < args.Length)
    {
        apiKey = args[++i];
    }
    else if (args[i] == "--output" && i + 1 < args.Length)
    {
        output = args[++i];
    }
    else
    {
        matchIds.Add(args[i]);
    }
}

if (matchIds.Count == 0)
{
    Console.WriteLine("No match IDs provided.");
    return;
}

var api = new RiotAPI(apiKey);
var matches = new List<JsonDocument>();

foreach (var id in matchIds)
{
    var match = await api.GetMatchAsync(region, id);
    matches.Add(match);
}

var options = new JsonSerializerOptions { WriteIndented = true };
var jsonList = matches.Select(m => m.RootElement).ToList();
string json = JsonSerializer.Serialize(jsonList, options);

if (!string.IsNullOrEmpty(output))
{
    await File.WriteAllTextAsync(output, json);
}
else
{
    Console.WriteLine(json);
}
