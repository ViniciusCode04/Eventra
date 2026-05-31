using JobProcessor.Application;
using JobProcessor.Infrastructure;
using JobProcessor.Infrastructure.Messaging;

var builder = Host.CreateApplicationBuilder(args);

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddHostedService<RabbitMQConsumer>();

var host = builder.Build();
host.Run();
