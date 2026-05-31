using System.Text.Json;

using JobProcessor.Application;

using JobProcessor.Application.Handlers;

using JobProcessor.Application.Interfaces;

using JobProcessor.Domain.Entities;

using Microsoft.Extensions.Logging.Abstractions;



namespace JobProcessor.Application.Tests.Handlers;



public class SendEmailJobHandlerTests

{

    private readonly FakeEmailSender _emailSender = new();

    private readonly SendEmailJobHandler _handler;



    public SendEmailJobHandlerTests()

    {

        _handler = new SendEmailJobHandler(_emailSender, NullLogger<SendEmailJobHandler>.Instance);

    }



    [Fact]

    public async Task HandleAsync_WithApiPayloadFormat_CompletesSuccessfully()

    {

        var job = new Job

        {

            Type = JobTypes.SendEmail,

            Payload = """{"to":"user@email.com","subject":"Hello"}"""

        };



        var exception = await Record.ExceptionAsync(() => _handler.HandleAsync(job));



        Assert.Null(exception);

        Assert.Equal("user@email.com", _emailSender.LastTo);

        Assert.Equal("Hello", _emailSender.LastSubject);

        Assert.Null(_emailSender.LastBody);

    }



    [Fact]

    public async Task HandleAsync_WithValidPayload_CompletesSuccessfully()

    {

        var job = CreateJob(new { to = "user@email.com", subject = "Hello", body = "Test body" });



        var exception = await Record.ExceptionAsync(() => _handler.HandleAsync(job));



        Assert.Null(exception);

        Assert.Equal("user@email.com", _emailSender.LastTo);

        Assert.Equal("Hello", _emailSender.LastSubject);

        Assert.Equal("Test body", _emailSender.LastBody);

    }



    [Fact]

    public async Task HandleAsync_CallsEmailSenderWithCorrectParameters()

    {

        var job = CreateJob(new { to = "destino@exemplo.com", subject = "Assunto teste", body = "Corpo do e-mail" });



        await _handler.HandleAsync(job);



        Assert.Equal("destino@exemplo.com", _emailSender.LastTo);

        Assert.Equal("Assunto teste", _emailSender.LastSubject);

        Assert.Equal("Corpo do e-mail", _emailSender.LastBody);

    }



    [Theory]

    [InlineData("{\"subject\":\"Hello\"}", "destinatário")]

    [InlineData("{\"to\":\"user@email.com\"}", "assunto")]

    [InlineData("{}", "destinatário")]

    public async Task HandleAsync_WithMissingFields_ThrowsInvalidOperationException(

        string payload,

        string missingField)

    {

        var job = new Job

        {

            Type = JobTypes.SendEmail,

            Payload = payload

        };



        var exception = await Assert.ThrowsAsync<InvalidOperationException>(

            () => _handler.HandleAsync(job));



        Assert.Contains(missingField, exception.Message, StringComparison.OrdinalIgnoreCase);

    }



    [Fact]

    public async Task HandleAsync_WithInvalidJson_ThrowsInvalidOperationException()

    {

        var job = new Job

        {

            Type = JobTypes.SendEmail,

            Payload = "not-json"

        };



        await Assert.ThrowsAsync<JsonException>(() => _handler.HandleAsync(job));

    }



    private static Job CreateJob(object payload) => new()

    {

        Id = Guid.NewGuid(),

        Type = JobTypes.SendEmail,

        Payload = JsonSerializer.Serialize(payload)

    };



    private sealed class FakeEmailSender : IEmailSender

    {

        public string? LastTo { get; private set; }

        public string? LastSubject { get; private set; }

        public string? LastBody { get; private set; }



        public Task SendAsync(string to, string subject, string? body, CancellationToken cancellationToken = default)

        {

            LastTo = to;

            LastSubject = subject;

            LastBody = body;

            return Task.CompletedTask;

        }

    }

}


