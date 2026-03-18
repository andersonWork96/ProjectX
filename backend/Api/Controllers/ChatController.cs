using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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

    [HttpPost("start/{otherUserId}")]
    public async Task<ActionResult<ChatResponse>> StartChat(int otherUserId)
    {
        var chat = await _chatService.GetOrCreateChatAsync(GetUserId(), otherUserId);
        return chat is not null ? Ok(chat) : BadRequest("Não é possível iniciar chat consigo mesmo.");
    }

    [HttpGet]
    public async Task<ActionResult<List<ChatResponse>>> GetChats()
    {
        var chats = await _chatService.GetChatsAsync(GetUserId());
        return Ok(chats);
    }

    [HttpPost("{chatId}/messages")]
    public async Task<ActionResult<MessageResponse>> SendMessage(int chatId, [FromBody] MessageRequest request)
    {
        var message = await _chatService.SendMessageAsync(chatId, GetUserId(), request.Text);
        return Ok(message);
    }

    [HttpGet("{chatId}/messages")]
    public async Task<ActionResult<List<MessageResponse>>> GetMessages(
        int chatId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 30)
    {
        var messages = await _chatService.GetMessagesAsync(chatId, GetUserId(), page, pageSize);
        return Ok(messages);
    }

    [HttpPost("{chatId}/read")]
    public async Task<IActionResult> MarkRead(int chatId)
    {
        await _chatService.MarkMessagesReadAsync(chatId, GetUserId());
        return Ok(new { message = "Mensagens marcadas como lidas." });
    }
}
