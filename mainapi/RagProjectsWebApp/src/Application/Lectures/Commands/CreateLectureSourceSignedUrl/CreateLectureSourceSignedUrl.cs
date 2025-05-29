using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.Extensions.Options;
using RagProjectsWebApp.Application.Common.Dtos;
using RagProjectsWebApp.Application.Common.Interfaces;
using RagProjectsWebApp.Application.Common.Models;

namespace RagProjectsWebApp.Application.Lectures.Commands.CreateLectureSourceSignedUrl;

public record CreateLectureSourceSignedUrlCommand : IRequest<SignedUrlDto>
{
    public int LectureId { get; init; }
    public string FileName { get; init; } = string.Empty;
    public string ContentType { get; init; } = string.Empty;
}

public class CreateLectureSourceSignedUrlCommandHandler : IRequestHandler<CreateLectureSourceSignedUrlCommand, SignedUrlDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IAmazonS3 _amazonS3;
    private readonly IOptions<S3Settings> _s3Settings;
    private readonly IUserService _userService;

    public CreateLectureSourceSignedUrlCommandHandler(IApplicationDbContext context, IAmazonS3 amazonS3, IOptions<S3Settings> s3Settings, IUserService userService)
    {
        _context = context;
        _amazonS3 = amazonS3;
        _s3Settings = s3Settings;
        _userService = userService;
    }

    public async Task<SignedUrlDto> Handle(CreateLectureSourceSignedUrlCommand request, CancellationToken cancellationToken)
    {
        var user = await _userService.GetOrCreateAppUser(cancellationToken);
        var lecture = await _context.Lectures
            .FirstOrDefaultAsync(p => p.Id == request.LectureId && p.Project.AuthorId == user.Id, cancellationToken);
        if (lecture == null)
        {
            throw new Exception($"Lecture with ID {request.LectureId} does not exist or you do not have permission to access it.");
        }
        var keyPath = $"lectures/project-{lecture.ProjectId}-lecture-{lecture.Id}-{request.FileName}";
        var s3request = new GetPreSignedUrlRequest
        {
            BucketName = _s3Settings.Value.BucketName,
            Key = keyPath,
            Verb = HttpVerb.PUT,
            Expires = DateTime.UtcNow.AddMinutes(15),
            ContentType = request.ContentType,
            Metadata =
            {
                ["project-id"] = lecture.ProjectId.ToString(),
            }
        };

        string preSignedUrl = _amazonS3.GetPreSignedURL(s3request);

        return new SignedUrlDto
        {
            Url = preSignedUrl,
            Path = preSignedUrl.Split('?')[0],
            ProjectId = lecture.ProjectId,
        };
    }
}
