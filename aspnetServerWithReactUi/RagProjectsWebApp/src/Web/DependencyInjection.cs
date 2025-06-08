using Azure.Identity;
using RagProjectsWebApp.Application.Common.Interfaces;
using RagProjectsWebApp.Infrastructure.Data;
using RagProjectsWebApp.Web.Services;
using Microsoft.AspNetCore.Mvc;
using Amazon.S3;
using Microsoft.Extensions.Options;
using RagProjectsWebApp.Application.Common.Models;
using Amazon.Runtime;
using Microsoft.AspNetCore.Builder;


namespace Microsoft.Extensions.DependencyInjection;

public static class DependencyInjection
{
    public static void AddWebServices(this IHostApplicationBuilder builder)
    {
        builder.Services.AddDatabaseDeveloperPageExceptionFilter();

        builder.Services.AddScoped<IUser, CurrentUser>();

        builder.Services.AddHttpContextAccessor();
        builder.Services.AddHealthChecks()
            .AddDbContextCheck<ApplicationDbContext>();

        builder.Services.AddExceptionHandler<CustomExceptionHandler>();

        builder.Services.AddRazorPages();

        // Customise default API behaviour
        builder.Services.Configure<ApiBehaviorOptions>(options =>
            options.SuppressModelStateInvalidFilter = true);

        builder.Services.AddEndpointsApiExplorer();

        builder.Services.AddOpenApiDocument((configure, sp) =>
        {
            configure.Title = "RagProjectsWebApp API";

        });

        builder.Services.Configure<S3Settings>(builder.Configuration.GetSection("S3Settings"));

        builder.Services.AddSingleton<IAmazonS3>(sp =>
        {
            var s3Settings = sp.GetRequiredService<IOptions<S3Settings>>().Value;
            var credentials = new BasicAWSCredentials(s3Settings.AccessKey, s3Settings.SecretKey);
            var config = new AmazonS3Config
            {
                RegionEndpoint = Amazon.RegionEndpoint.GetBySystemName(s3Settings.Region),

            };
            return new AmazonS3Client(credentials, config);
        });
        var ragUri = builder.Configuration.GetConnectionString("RagSystemUrl");
        builder.Services
            .AddHttpClient<IProcessFileClient, ProcessFileClient>(client =>
            {
                client.BaseAddress = new Uri("http://localhost:8000");
                client.Timeout = TimeSpan.FromSeconds(10);
            });
    }

    public static void AddKeyVaultIfConfigured(this IHostApplicationBuilder builder)
    {
        var keyVaultUri = builder.Configuration["AZURE_KEY_VAULT_ENDPOINT"];
        if (!string.IsNullOrWhiteSpace(keyVaultUri))
        {
            builder.Configuration.AddAzureKeyVault(
                new Uri(keyVaultUri),
                new DefaultAzureCredential());
        }
    }
}
