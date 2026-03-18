using ProjectX.Application.Contracts;

namespace ProjectX.Application.Services;

public interface IChatService
{
    Task<ChatResponse?> GetOrCreateChatAsync(int userId, int otherUserId);
    Task<List<ChatResponse>> GetChatsAsync(int userId);
    Task<MessageResponse> SendMessageAsync(int chatId, int senderId, string text);
    Task<List<MessageResponse>> GetMessagesAsync(int chatId, int userId, int page, int pageSize);
    Task MarkMessagesReadAsync(int chatId, int userId);
}
