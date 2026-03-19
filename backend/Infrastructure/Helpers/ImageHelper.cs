namespace ProjectX.Infrastructure.Helpers;

public static class ImageHelper
{
    public static async Task<string> ToBase64DataUri(IFormFile file)
    {
        using var ms = new MemoryStream();
        await file.CopyToAsync(ms);
        var bytes = ms.ToArray();
        var base64 = Convert.ToBase64String(bytes);
        var contentType = file.ContentType;
        return $"data:{contentType};base64,{base64}";
    }
}
