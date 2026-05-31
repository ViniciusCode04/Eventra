using System.Text.Json;

namespace JobProcessor.Application;

internal static class JobPayloadJson
{
    public static readonly JsonSerializerOptions Options = new()
    {
        PropertyNameCaseInsensitive = true
    };
}
