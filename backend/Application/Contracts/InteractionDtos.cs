namespace ProjectX.Application.Contracts;

public record CommentRequest(string Text);

public record CommentResponse(
    int Id,
    int UserId,
    string UserName,
    string? UserAvatarUrl,
    string? UserPlatformPlan,
    string? SubscriptionBadge,
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

public record ChatRequestDto(
    int Id,
    int FromUserId,
    string FromUserName,
    string? FromUserAvatarUrl,
    string Message,
    string Status,
    DateTime CreatedAt
);

public record SendChatRequestDto(string Message);

public record ChatResponse(
    int Id,
    int OtherUserId,
    string OtherUserName,
    string? OtherUserAvatarUrl,
    string? LastMessage,
    DateTime? LastMessageAt,
    int UnreadCount,
    bool IsVip
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
