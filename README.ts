public static string Substitute(string inputText, string oldText, string newText, int? instanceNumber = null)
{
    if (instanceNumber == null)
        return inputText.Replace(oldText, newText);

    int count = 0;
    int index = 0;

    while ((index = inputText.IndexOf(oldText, index)) != -1)
    {
        count++;
        if (count == instanceNumber.Value)
        {
            return inputText.Substring(0, index) 
                 + newText 
                 + inputText.Substring(index + oldText.Length);
        }
        index += oldText.Length;
    }

    // Instance not found, return original
    return inputText;
}

-------

 public static string TrimFunc(string inputText)
{
    return inputText?.Trim();
}

---------

 public static string Mid(string inputText, int startPosition, int numberOfCharacters)
{
    if (string.IsNullOrEmpty(inputText) || startPosition < 1)
        return string.Empty;

    int start = startPosition - 1;
    int length = Math.Min(numberOfCharacters, inputText.Length - start);

    return inputText.Substring(start, length);
}

------

 public static bool IsNumber(string inputText)
{
    return decimal.TryParse(inputText?.Trim(), out _);
}

----
 public static bool IsBlank(string inputText)
{
    return string.IsNullOrWhiteSpace(inputText);
}

---
 public static string TrimFunc(string inputText)
{
    return inputText?.Trim();
}

----
 public static string Substitute(string inputText, string oldText, string newText, int? instanceNumber = null)
{
    if (instanceNumber == null)
        return inputText.Replace(oldText, newText);

    int count = 0;
    int index = 0;

    while ((index = inputText.IndexOf(oldText, index)) != -1)
    {
        count++;
        if (count == instanceNumber.Value)
        {
            return inputText.Substring(0, index) 
                 + newText 
                 + inputText.Substring(index + oldText.Length);
        }
        index += oldText.Length;
    }

    // Instance not found, return original
    return inputText;
}


