using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace RiotApi;

/// <summary>
/// Simple rate limiter that enforces both a per-second and a per-two-minute limit.
/// </summary>
public class RateLimiter
{
    private readonly int _perSecond;
    private readonly int _perTwoMinutes;
    private readonly Queue<DateTime> _lastSecond = new();
    private readonly Queue<DateTime> _lastTwoMinutes = new();
    private readonly object _lock = new();

    public RateLimiter(int perSecond, int perTwoMinutes)
    {
        _perSecond = perSecond;
        _perTwoMinutes = perTwoMinutes;
    }

    public async Task WaitAsync()
    {
        while (true)
        {
            TimeSpan? delay = null;
            lock (_lock)
            {
                var now = DateTime.UtcNow;
                Cleanup(now);
                if (_lastSecond.Count >= _perSecond)
                {
                    var diff = now - _lastSecond.Peek();
                    if (diff.TotalSeconds < 1)
                        delay = TimeSpan.FromSeconds(1) - diff;
                }
                if (!delay.HasValue && _lastTwoMinutes.Count >= _perTwoMinutes)
                {
                    var diff = now - _lastTwoMinutes.Peek();
                    if (diff.TotalMinutes < 2)
                        delay = TimeSpan.FromMinutes(2) - diff;
                }
                if (!delay.HasValue)
                {
                    _lastSecond.Enqueue(now);
                    _lastTwoMinutes.Enqueue(now);
                    return;
                }
            }
            await Task.Delay(delay.Value);
        }
    }

    private void Cleanup(DateTime now)
    {
        while (_lastSecond.Count > 0 && (now - _lastSecond.Peek()).TotalSeconds >= 1)
            _lastSecond.Dequeue();
        while (_lastTwoMinutes.Count > 0 && (now - _lastTwoMinutes.Peek()).TotalMinutes >= 2)
            _lastTwoMinutes.Dequeue();
    }
}
