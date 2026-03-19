using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjectX.Application.Contracts;
using ProjectX.Application.Services;

namespace ProjectX.Api.Controllers;

[ApiController]
[Route("api/chats")]
[Authorize]
public class ChatController : ControllerBase
{
    private readonly IChatService _chatService;

    public ChatController(IChatService chatService)
    {
        _chatService = chatService;
    }

    private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");

    // Solicitações
    [HttpPost("request/{creatorId}")]
    public async Task<IActionResult> SendRequest(int creatorId, [FromBody] SendChatRequestDto request)
    {
        var result = await _chatService.SendChatRequestAsync(GetUserId(), creatorId, request.Message);
        return result is not null ? Ok(result) : BadRequest(new { message = "Não foi possível enviar solicitação. Verifique seus limites." });
    }

    [HttpGet("request-status/{creatorId}")]
    public async Task<IActionResult> GetRequestStatus(int creatorId,
        [FromServices] ProjectX.Infrastructure.Data.AppDbContext db)
    {
        var userId = GetUserId();
        var request = await db.ChatRequests
            .Where(r => r.FromUserId == userId && r.ToCreatorId == creatorId)
            .OrderByDescending(r => r.CreatedAt)
            .FirstOrDefaultAsync();

        if (request is null) return Ok(new { status = "none" });
        return Ok(new { status = request.Status });
    }

    [HttpGet("requests/pending")]
    public async Task<ActionResult<List<ChatRequestDto>>> GetPendingRequests()
    {
        return Ok(await _chatService.GetPendingRequestsAsync(GetUserId()));
    }

    [HttpPost("requests/{requestId}/respond")]
    public async Task<IActionResult> RespondToRequest(int requestId, [FromQuery] bool accept)
    {
        var result = await _chatService.RespondToRequestAsync(requestId, GetUserId(), accept);
        return result ? Ok(new { message = accept ? "Aceito." : "Recusado." }) : NotFound();
    }

    // VIP direct chat
    [HttpPost("vip/{creatorId}")]
    public async Task<IActionResult> StartVipChat(int creatorId)
    {
        var chat = await _chatService.StartVipChatAsync(GetUserId(), creatorId);
        return chat is not null ? Ok(chat) : BadRequest(new { message = "Necessário assinatura VIP." });
    }

    // Chats
    [HttpGet]
    public async Task<ActionResult<List<ChatResponse>>> GetChats()
    {
        return Ok(await _chatService.GetChatsAsync(GetUserId()));
    }

    [HttpPost("{chatId}/messages")]
    public async Task<ActionResult<MessageResponse>> SendMessage(int chatId, [FromBody] MessageRequest request)
    {
        return Ok(await _chatService.SendMessageAsync(chatId, GetUserId(), request.Text));
    }

    [HttpGet("{chatId}/messages")]
    public async Task<ActionResult<List<MessageResponse>>> GetMessages(int chatId, [FromQuery] int page = 1, [FromQuery] int pageSize = 30)
    {
        return Ok(await _chatService.GetMessagesAsync(chatId, GetUserId(), page, pageSize));
    }

    [HttpPost("{chatId}/read")]
    public async Task<IActionResult> MarkRead(int chatId)
    {
        await _chatService.MarkMessagesReadAsync(chatId, GetUserId());
        return Ok(new { message = "Lidas." });
    }
}
