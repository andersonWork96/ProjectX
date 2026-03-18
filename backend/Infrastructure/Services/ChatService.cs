using Microsoft.EntityFrameworkCore;
using ProjectX.Application.Contracts;
using ProjectX.Application.Services;
using ProjectX.Domain.Entities;
using ProjectX.Infrastructure.Data;

namespace ProjectX.Infrastructure.Services;

public class ChatService : IChatService
{
    private readonly AppDbContext _db;

    public ChatService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<ChatResponse?> GetOrCreateChatAsync(int userId, int otherUserId)
    {
        if (userId == otherUserId) return null;

        var chat = await _db.Chats
            .FirstOrDefaultAsync(c =>
                (c.User1Id == userId && c.User2Id == otherUserId) ||
                (c.User1Id == otherUserId && c.User2Id == userId));

        if (chat is null)
        {
            chat = new Chat
            {
                User1Id = Math.Min(userId, otherUserId),
                User2Id = Math.Max(userId, otherUserId),
                CreatedAt = DateTime.UtcNow
            };
            _db.Chats.Add(chat);
            await _db.SaveChangesAsync();
        }

        return await MapToResponse(chat, userId);
    }

    public async Task<List<ChatResponse>> GetChatsAsync(int userId)
    {
        var chats = await _db.Chats
            .Where(c => c.User1Id == userId || c.User2Id == userId)
            .OrderByDescending(c => c.LastMessageAt ?? c.CreatedAt)
            .ToListAsync();

        var responses = new List<ChatResponse>();
        foreach (var chat in chats)
        {
            var response = await MapToResponse(chat, userId);
            if (response is not null)
                responses.Add(response);
        }
        return responses;
    }

    public async Task<MessageResponse> SendMessageAsync(int chatId, int senderId, string text)
    {
        var message = new Message
        {
            ChatId = chatId,
            SenderId = senderId,
            Text = text,
            CreatedAt = DateTime.UtcNow
        };

        _db.Messages.Add(message);

        var chat = await _db.Chats.FindAsync(chatId);
        if (chat is not null)
        {
            chat.LastMessageAt = DateTime.UtcNow;

            // Notificar o outro usuário
            var receiverId = chat.User1Id == senderId ? chat.User2Id : chat.User1Id;
            var sender = await _db.Users.FindAsync(senderId);
            _db.Notifications.Add(new Notification
            {
                UserId = receiverId,
                Type = "message",
                ReferenceId = chatId,
                MessageText = $"{sender!.Name} enviou uma mensagem.",
                CreatedAt = DateTime.UtcNow
            });
        }

        await _db.SaveChangesAsync();

        var user = await _db.Users.FindAsync(senderId);
        return new MessageResponse(message.Id, senderId, user!.Name, text, message.CreatedAt, null);
    }

    public async Task<List<MessageResponse>> GetMessagesAsync(int chatId, int userId, int page, int pageSize)
    {
        return await _db.Messages
            .Include(m => m.Sender)
            .Where(m => m.ChatId == chatId)
            .OrderByDescending(m => m.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(m => new MessageResponse(m.Id, m.SenderId, m.Sender.Name, m.Text, m.CreatedAt, m.ReadAt))
            .ToListAsync();
    }

    public async Task MarkMessagesReadAsync(int chatId, int userId)
    {
        await _db.Messages
            .Where(m => m.ChatId == chatId && m.SenderId != userId && m.ReadAt == null)
            .ExecuteUpdateAsync(s => s.SetProperty(m => m.ReadAt, DateTime.UtcNow));
    }

    private async Task<ChatResponse?> MapToResponse(Chat chat, int userId)
    {
        var otherUserId = chat.User1Id == userId ? chat.User2Id : chat.User1Id;
        var otherUser = await _db.Users.FindAsync(otherUserId);
        if (otherUser is null) return null;

        var lastMessage = await _db.Messages
            .Where(m => m.ChatId == chat.Id)
            .OrderByDescending(m => m.CreatedAt)
            .FirstOrDefaultAsync();

        var unreadCount = await _db.Messages
            .CountAsync(m => m.ChatId == chat.Id && m.SenderId != userId && m.ReadAt == null);

        return new ChatResponse(
            chat.Id, otherUserId, otherUser.Name, otherUser.AvatarUrl,
            lastMessage?.Text, chat.LastMessageAt, unreadCount
        );
    }
}
