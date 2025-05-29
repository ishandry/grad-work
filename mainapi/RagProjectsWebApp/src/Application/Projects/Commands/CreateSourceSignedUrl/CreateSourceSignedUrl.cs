using RagProjectsWebApp.Application.Common.Dtos;
using RagProjectsWebApp.Application.Common.Interfaces;
using Amazon.S3;
using Microsoft.Extensions.Options;
using RagProjectsWebApp.Application.Common.Models;
using Amazon.S3.Model;
using RagProjectsWebApp.Application.Common.Security;
using RagProjectsWebApp.Application.Common.Services;
using RagProjectsWebApp.Domain.Entities;

namespace RagProjectsWebApp.Application.Projects.Commands.CreateSourceSignedUrl;

[Authorize]
public record CreateSourceSignedUrlCommand : IRequest<SignedUrlDto>
{
    public int ProjectId { get; init; }
    public string FileName { get; init; } = string.Empty;
    public string ContentType { get; init; } = string.Empty;
}

public class CreateSourceSignedUrlCommandHandler : IRequestHandler<CreateSourceSignedUrlCommand, SignedUrlDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IAmazonS3 _amazonS3;
    private readonly IOptions<S3Settings> _s3Settings;
    private readonly IUserService _userService;

    public CreateSourceSignedUrlCommandHandler(IApplicationDbContext context, IAmazonS3 amazonS3, IOptions<S3Settings> s3Settings, IUserService userService)
    {
        _context = context;
        _amazonS3 = amazonS3;
        _s3Settings = s3Settings;
        _userService = userService;
    }

    public async Task<SignedUrlDto> Handle(CreateSourceSignedUrlCommand request, CancellationToken cancellationToken)
    {
        var user = await _userService.GetOrCreateAppUser(cancellationToken);
        var projectExists = await _context.Projects
            .AnyAsync(p => p.Id == request.ProjectId && p.AuthorId == user.Id, cancellationToken);
        if (!projectExists)
        {
            throw new Exception($"Project with ID {request.ProjectId} does not exist or you do not have permission to access it.");
        }
        var keyPath = $"projects/project-{request.ProjectId}-source-{request.FileName}";
        var s3request = new GetPreSignedUrlRequest
        {
            BucketName = _s3Settings.Value.BucketName,
            Key = keyPath,
            Verb = HttpVerb.PUT,
            Expires = DateTime.UtcNow.AddMinutes(1500),
            ContentType = request.ContentType,
            Metadata =
            {
                ["project-id"] = request.ProjectId.ToString(),
            }
        };

        string preSignedUrl = _amazonS3.GetPreSignedURL(s3request);

        return new SignedUrlDto
        {
            Url = preSignedUrl,
            Path = preSignedUrl.Split('?')[0],
            ProjectId = request.ProjectId,
        };

    }
}
