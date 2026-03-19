using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProjectX.Application.Contracts;
using ProjectX.Application.Services;
using ProjectX.Infrastructure.Helpers;

namespace ProjectX.Api.Controllers;

[ApiController]
[Route("api/posts")]
public class PostController : ControllerBase
{
    private readonly IPostService _postService;

    public PostController(IPostService postService)
    {
        _postService = postService;
    }

    private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<PostResponse>> Create(
        [FromForm] string? caption,
        [FromForm] List<IFormFile> images)
    {
        var userId = GetUserId();
        var imageDataUris = new List<string>();

        foreach (var image in images)
        {
            var dataUri = await ImageHelper.ToBase64DataUri(image);
            imageDataUris.Add(dataUri);
        }

        var result = await _postService.CreateAsync(userId, caption, imageDataUris);
        return Ok(result);
    }

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _postService.DeleteAsync(id, GetUserId());
        return deleted ? Ok(new { message = "Post deletado." }) : NotFound();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<PostResponse>> GetById(int id)
    {
        var userId = GetUserId();
        var post = await _postService.GetByIdAsync(id, userId);
        return post is not null ? Ok(post) : NotFound();
    }

    [HttpGet("feed")]
    public async Task<ActionResult<PagedResponse<PostResponse>>> GetFeed(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var userId = GetUserId();
        var feed = await _postService.GetFeedAsync(userId, page, pageSize);
        return Ok(feed);
    }

    [HttpGet("user/{userId}")]
    public async Task<ActionResult<PagedResponse<PostResponse>>> GetUserPosts(
        int userId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var currentUserId = GetUserId();
        var posts = await _postService.GetUserPostsAsync(userId, currentUserId, page, pageSize);
        return Ok(posts);
    }
}
