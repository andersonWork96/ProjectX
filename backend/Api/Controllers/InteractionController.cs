using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProjectX.Application.Contracts;
using ProjectX.Application.Services;

namespace ProjectX.Api.Controllers;

[ApiController]
[Route("api")]
[Authorize]
public class InteractionController : ControllerBase
{
    private readonly IInteractionService _interactionService;

    public InteractionController(IInteractionService interactionService)
    {
        _interactionService = interactionService;
    }

    private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");

    // ===== LIKES =====
    [HttpPost("posts/{postId}/like")]
    public async Task<IActionResult> ToggleLike(int postId)
    {
        var liked = await _interactionService.ToggleLikeAsync(GetUserId(), postId);
        return Ok(new { liked });
    }

    // ===== COMMENTS =====
    [HttpPost("posts/{postId}/comments")]
    public async Task<ActionResult<CommentResponse>> AddComment(int postId, [FromBody] CommentRequest request)
    {
        var comment = await _interactionService.AddCommentAsync(GetUserId(), postId, request.Text);
        return comment is not null ? Ok(comment) : NotFound();
    }

    [AllowAnonymous]
    [HttpGet("posts/{postId}/comments")]
    public async Task<ActionResult<List<CommentResponse>>> GetComments(
        int postId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var comments = await _interactionService.GetCommentsAsync(postId, page, pageSize);
        return Ok(comments);
    }

    [HttpDelete("comments/{commentId}")]
    public async Task<IActionResult> DeleteComment(int commentId)
    {
        var deleted = await _interactionService.DeleteCommentAsync(commentId, GetUserId());
        return deleted ? Ok(new { message = "Comentário deletado." }) : NotFound();
    }

    // ===== FOLLOW =====
    [HttpPost("users/{userId}/follow")]
    public async Task<IActionResult> ToggleFollow(int userId)
    {
        var followed = await _interactionService.ToggleFollowAsync(GetUserId(), userId);
        return Ok(new { followed });
    }

    // ===== INTEREST =====
    [HttpPost("users/{userId}/interest")]
    public async Task<IActionResult> ToggleInterest(int userId)
    {
        var interested = await _interactionService.ToggleInterestAsync(GetUserId(), userId);
        return Ok(new { interested });
    }

    // ===== NOTIFICATIONS =====
    [HttpGet("notifications")]
    public async Task<ActionResult<List<NotificationResponse>>> GetNotifications(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var notifications = await _interactionService.GetNotificationsAsync(GetUserId(), page, pageSize);
        return Ok(notifications);
    }

    [HttpPost("notifications/read")]
    public async Task<IActionResult> MarkNotificationsRead()
    {
        await _interactionService.MarkNotificationsReadAsync(GetUserId());
        return Ok(new { message = "Notificações marcadas como lidas." });
    }

    [HttpGet("notifications/unread-count")]
    public async Task<IActionResult> GetUnreadCount()
    {
        var count = await _interactionService.GetUnreadCountAsync(GetUserId());
        return Ok(new { count });
    }
}
