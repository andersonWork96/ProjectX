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

    // ===== CHAT REQUESTS =====

    public async Task<ChatRequestDto?> SendChatRequestAsync(int fromUserId, int toCreatorId, string message)
    {
        if (fromUserId == toCreatorId) return null;

        var creator = await _db.Users.FindAsync(toCreatorId);
        if (creator is null || !creator.IsCreator) return null;

        var user = await _db.Users.FindAsync(fromUserId);

        // Admin (permissão 1) pode iniciar chat direto
        if (user!.Permission == 1)
        {
            var u1 = Math.Min(fromUserId, toCreatorId);
            var u2 = Math.Max(fromUserId, toCreatorId);
            var adminChat = await _db.Chats.FirstOrDefaultAsync(c => c.User1Id == u1 && c.User2Id == u2);
            if (adminChat is null)
            {
                adminChat = new Chat { User1Id = u1, User2Id = u2, IsVip = true, CreatedAt = DateTime.UtcNow };
                _db.Chats.Add(adminChat);
                await _db.SaveChangesAsync();
            }
            return new ChatRequestDto(0, fromUserId, user.Name, user.AvatarUrl, message, "accepted", DateTime.UtcNow);
        }

        // Verificar se é VIP (VIP não precisa de request)
        var vipSub = await _db.Subscriptions.FirstOrDefaultAsync(s =>
            s.SubscriberId == fromUserId && s.CreatorId == toCreatorId &&
            s.PlanType == "vip" && s.PaymentStatus == "active" &&
            (s.EndDate == null || s.EndDate > DateTime.UtcNow));
        if (vipSub is not null) return null; // VIP usa StartVipChatAsync

        // Verificar se já tem request pendente
        var existing = await _db.ChatRequests.FirstOrDefaultAsync(r =>
            r.FromUserId == fromUserId && r.ToCreatorId == toCreatorId && r.Status == "pending");
        if (existing is not null) return null;

        // Verificar se foi rejeitado nos últimos 7 dias
        var rejected = await _db.ChatRequests.FirstOrDefaultAsync(r =>
            r.FromUserId == fromUserId && r.ToCreatorId == toCreatorId &&
            r.Status == "rejected" && r.RespondedAt > DateTime.UtcNow.AddDays(-7));
        if (rejected is not null) return null;

        // Verificar limites diários por plano
        var todayCount = await _db.ChatRequests.CountAsync(r =>
            r.FromUserId == fromUserId && r.CreatedAt.Date == DateTime.UtcNow.Date);

        int dailyLimit = user.PlatformPlan switch
        {
            "elite" => int.MaxValue,
            "premium" => 5,
            _ => 1
        };
        if (todayCount >= dailyLimit) return null;

        var request = new ChatRequest
        {
            FromUserId = fromUserId,
            ToCreatorId = toCreatorId,
            Message = message,
            CreatedAt = DateTime.UtcNow
        };
        _db.ChatRequests.Add(request);

        _db.Notifications.Add(new Notification
        {
            UserId = toCreatorId, Type = "chat_request", ReferenceId = fromUserId,
            MessageText = $"{user.Name} quer conversar com você.", CreatedAt = DateTime.UtcNow
        });

        await _db.SaveChangesAsync();

        return new ChatRequestDto(request.Id, fromUserId, user.Name, user.AvatarUrl, message, "pending", request.CreatedAt);
    }

    public async Task<List<ChatRequestDto>> GetPendingRequestsAsync(int creatorId)
    {
        return await _db.ChatRequests
            .Include(r => r.FromUser)
            .Where(r => r.ToCreatorId == creatorId && r.Status == "pending" && r.FromUser.Permission != 1)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new ChatRequestDto(
                r.Id, r.FromUserId, r.FromUser.Name, r.FromUser.AvatarUrl,
                r.Message, r.Status, r.CreatedAt))
            .ToListAsync();
    }

    public async Task<bool> RespondToRequestAsync(int requestId, int creatorId, bool accept)
    {
        var request = await _db.ChatRequests.FirstOrDefaultAsync(r => r.Id == requestId && r.ToCreatorId == creatorId);
        if (request is null || request.Status != "pending") return false;

        request.Status = accept ? "accepted" : "rejected";
        request.RespondedAt = DateTime.UtcNow;

        if (accept)
        {
            // Criar chat
            var u1 = Math.Min(request.FromUserId, creatorId);
            var u2 = Math.Max(request.FromUserId, creatorId);
            var existingChat = await _db.Chats.FirstOrDefaultAsync(c => c.User1Id == u1 && c.User2Id == u2);
            Chat chatObj;
            if (existingChat is null)
            {
                chatObj = new Chat { User1Id = u1, User2Id = u2, CreatedAt = DateTime.UtcNow, LastMessageAt = DateTime.UtcNow };
                _db.Chats.Add(chatObj);
                await _db.SaveChangesAsync(); // Salvar para ter o ID
            }
            else
            {
                chatObj = existingChat;
            }

            // Adicionar a mensagem da solicitação como primeira mensagem do chat
            _db.Messages.Add(new Message
            {
                ChatId = chatObj.Id,
                SenderId = request.FromUserId,
                Text = request.Message,
                CreatedAt = request.CreatedAt
            });

            _db.Notifications.Add(new Notification
            {
                UserId = request.FromUserId, Type = "chat_accepted", ReferenceId = chatObj.Id,
                MessageText = "Sua solicitação de chat foi aceita!", CreatedAt = DateTime.UtcNow
            });
        }
        else
        {
            _db.Notifications.Add(new Notification
            {
                UserId = request.FromUserId, Type = "chat_rejected", ReferenceId = creatorId,
                MessageText = "Sua solicitação de chat foi recusada.", CreatedAt = DateTime.UtcNow
            });
        }

        await _db.SaveChangesAsync();
        return true;
    }

    // ===== VIP DIRECT CHAT =====

    public async Task<ChatResponse?> StartVipChatAsync(int userId, int creatorId)
    {
        if (userId == creatorId) return null;

        var currentUser = await _db.Users.FindAsync(userId);
        bool isAdmin = currentUser?.Permission == 1;

        if (!isAdmin)
        {
            var vipSub = await _db.Subscriptions.FirstOrDefaultAsync(s =>
                s.SubscriberId == userId && s.CreatorId == creatorId &&
                s.PlanType == "vip" && s.PaymentStatus == "active" &&
                (s.EndDate == null || s.EndDate > DateTime.UtcNow));
            if (vipSub is null) return null;
        }

        var u1 = Math.Min(userId, creatorId);
        var u2 = Math.Max(userId, creatorId);
        var chat = await _db.Chats.FirstOrDefaultAsync(c => c.User1Id == u1 && c.User2Id == u2);
        if (chat is null)
        {
            chat = new Chat { User1Id = u1, User2Id = u2, IsVip = true, CreatedAt = DateTime.UtcNow };
            _db.Chats.Add(chat);
            await _db.SaveChangesAsync();
        }
        else if (!chat.IsVip)
        {
            chat.IsVip = true;
            await _db.SaveChangesAsync();
        }

        return await MapToResponse(chat, userId);
    }

    // ===== CHAT =====

    public async Task<List<ChatResponse>> GetChatsAsync(int userId)
    {
        var currentUser = await _db.Users.FindAsync(userId);
        bool iAmAdmin = currentUser?.Permission == 1;

        var chats = await _db.Chats
            .Where(c => c.User1Id == userId || c.User2Id == userId)
            .OrderByDescending(c => c.LastMessageAt ?? c.CreatedAt)
            .ToListAsync();

        var responses = new List<ChatResponse>();
        foreach (var chat in chats)
        {
            // Se NÃO sou admin, esconder chats com admin (fantasma)
            if (!iAmAdmin)
            {
                var otherUserId = chat.User1Id == userId ? chat.User2Id : chat.User1Id;
                var otherUser = await _db.Users.FindAsync(otherUserId);
                if (otherUser?.Permission == 1) continue; // Admin invisível
            }

            var response = await MapToResponse(chat, userId);
            if (response is not null) responses.Add(response);
        }
        return responses;
    }

    public async Task<MessageResponse> SendMessageAsync(int chatId, int senderId, string text)
    {
        var message = new Message
        {
            ChatId = chatId, SenderId = senderId, Text = text, CreatedAt = DateTime.UtcNow
        };
        _db.Messages.Add(message);

        var chat = await _db.Chats.FindAsync(chatId);
        var senderUser = await _db.Users.FindAsync(senderId);
        bool isGhost = senderUser?.Permission == 1;

        if (chat is not null)
        {
            chat.LastMessageAt = DateTime.UtcNow;

            if (!isGhost)
            {
                var receiverId = chat.User1Id == senderId ? chat.User2Id : chat.User1Id;
                _db.Notifications.Add(new Notification
                {
                    UserId = receiverId, Type = "message", ReferenceId = chatId,
                    MessageText = $"{senderUser!.Name} enviou uma mensagem.", CreatedAt = DateTime.UtcNow
                });
            }
        }
        await _db.SaveChangesAsync();

        return new MessageResponse(message.Id, senderId, senderUser!.Name, text, message.CreatedAt, null);
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
            lastMessage?.Text, chat.LastMessageAt, unreadCount, chat.IsVip
        );
    }
}
