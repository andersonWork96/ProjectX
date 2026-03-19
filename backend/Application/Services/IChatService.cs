using ProjectX.Application.Contracts;

namespace ProjectX.Application.Services;

public interface IChatService
{
    // Chat requests
    Task<ChatRequestDto?> SendChatRequestAsync(int fromUserId, int toCreatorId, string message);
    Task<List<ChatRequestDto>> GetPendingRequestsAsync(int creatorId);
    Task<bool> RespondToRequestAsync(int requestId, int creatorId, bool accept);

    // Chat
    Task<List<ChatResponse>> GetChatsAsync(int userId);
    Task<MessageResponse> SendMessageAsync(int chatId, int senderId, string text);
    Task<List<MessageResponse>> GetMessagesAsync(int chatId, int userId, int page, int pageSize);
    Task MarkMessagesReadAsync(int chatId, int userId);

    // VIP direct chat
    Task<ChatResponse?> StartVipChatAsync(int userId, int creatorId);
}
