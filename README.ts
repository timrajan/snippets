public static string TextFunc(string inputValue, string formatString)
{
    if (string.IsNullOrWhiteSpace(inputValue))
        return string.Empty;

    if (!DateTime.TryParse(inputValue.Trim(), out DateTime parsedDate))
        return string.Empty;

    return formatString switch
    {
        "yyyy,mm,dd" => parsedDate.ToString("yyyy,MM,dd"),
        _ => parsedDate.ToString("yyyy-MM-dd")
    };
}
