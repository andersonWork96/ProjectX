namespace ProjectX.Application.Contracts;

public record CommentRequest(string Text);

public record CommentResponse(
    int Id,
    int UserId,
    string UserName,
    string? UserAvatarUrl,
    string Text,
    DateTime CreatedAt
);

public record NotificationResponse(
    int Id,
    string Type,
    string Message,
    int? ReferenceId,
    bool Read,
    DateTime CreatedAt
);

public record ChatResponse(
    int Id,
    int OtherUserId,
    string OtherUserName,
    string? OtherUserAvatarUrl,
    string? LastMessage,
    DateTime? LastMessageAt,
    int UnreadCount
);

public record MessageRequest(string Text);

public record MessageResponse(
    int Id,
    int SenderId,
    string SenderName,
    string Text,
    DateTime CreatedAt,
    DateTime? ReadAt
);
