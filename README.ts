public static string DecimalToHex(long decimalValue, int? digits = null)
{
    string hex = decimalValue.ToString("X");

    if (digits.HasValue)
        return hex.PadLeft(digits.Value, '0');

    return hex;
}
