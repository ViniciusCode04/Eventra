using System.Text.Json;
using System.Text.Json.Serialization;

namespace JobProcessor.API.DTOs;

public record CreateJobRequest(
    string Type,
    JsonElement Payload
);