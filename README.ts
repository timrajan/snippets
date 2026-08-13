using System.Collections.ObjectModel;
using System.ComponentModel;
using System.IO;
using System.Runtime.CompilerServices;
using System.Windows;
using TestRecorder.Models;
using TestRecorder.Services;
using MessageBox = System.Windows.MessageBox;
using MediaBrushes = System.Windows.Media.Brushes;
using System.Windows.Controls;

namespace TestRecorder;

public class FieldMapping : INotifyPropertyChanged
{
    private string _fieldName = string.Empty;
    private string _fieldValue = string.Empty;
    private string _dataTableHeader = string.Empty;
    private string _actionType = "type";

    public string FieldName
    {
        get => _fieldName;
        set
        {
            if (_fieldName == value) return;
            _fieldName = value;
            OnPropertyChanged();
        }
    }

    public string FieldValue
    {
        get => _fieldValue;
        set
        {
            if (_fieldValue == value) return;
            _fieldValue = value;
            OnPropertyChanged();
        }
    }

    public string DataTableHeader
    {
        get => _dataTableHeader;
        set
        {
            if (_dataTableHeader == value) return;
            _dataTableHeader = value;
            OnPropertyChanged();
        }
    }

    public string ActionType
    {
        get => _actionType;
        set
        {
            if (_actionType == value) return;
            _actionType = value;
            OnPropertyChanged();
        }
    }

    public event PropertyChangedEventHandler? PropertyChanged;

    private void OnPropertyChanged([CallerMemberName] string? propertyName = null) =>
        PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
}

public partial class RecorderToolbar : Window
{
    private readonly TestCase _testCase;
    private readonly string _outputFolder;
    private readonly FileGeneratorService _fileGenerator;
    private readonly CdpRecorderService _recorderService;
    private readonly List<string> _recordedLines = new();

    private bool _isStopping;
    private bool _isHighlightBusy;

    private string _pendingValidationRole = string.Empty;
    private string _pendingValidationName = string.Empty;

    private string CsvPath => Path.Combine(_outputFolder, "test-data.csv");

    public ObservableCollection<FieldMapping> Fields { get; } = new();

    public RecorderToolbar(
        TestCase testCase,
        string outputFolder,
        AxMapperService axMapper,
        FileGeneratorService fileGenerator)
    {
        InitializeComponent();

        _testCase = testCase;
        _outputFolder = outputFolder;
        _fileGenerator = fileGenerator;
        _recorderService = new CdpRecorderService(axMapper);

        FieldItemsControl.ItemsSource = Fields;

        PageLabel.Text = string.IsNullOrWhiteSpace(_testCase.Id) ? "Recording" : _testCase.Id;
        MethodLabel.Text = "recordedSteps";

        _recorderService.LineRecorded += OnLineRecorded;
        _recorderService.LineCountUpdated += OnLineCountUpdated;
        _recorderService.ValidationTargetCaptured += OnValidationTargetCaptured;

        Loaded += async (_, _) => await StartRecordingAsync();
    }

    private async Task StartRecordingAsync()
    {
        var connected = await _recorderService.ConnectAsync();
        if (!connected)
        {
            MessageBox.Show(
                "Could not connect to Chrome.\nStart Chrome with --remote-debugging-port=9222 and try again.",
                "Connection Error",
                MessageBoxButton.OK,
                MessageBoxImage.Error);

            Close();
        }
    }

    private void OnLineRecorded(string line)
    {
        Dispatcher.Invoke(() => _recordedLines.Add(line));
    }

    private void OnLineCountUpdated(int lineCount)
    {
        Dispatcher.Invoke(() => { LinesLabel.Text = $"Lines captured: {lineCount}"; });
    }

    private void OnValidationTargetCaptured(string role, string name)
    {
        Dispatcher.Invoke(() =>
        {
            _pendingValidationRole = string.IsNullOrWhiteSpace(role) ? string.Empty : role.ToLowerInvariant();
            _pendingValidationName = name;

            ValidationElementTypeText.Text = string.IsNullOrWhiteSpace(role) ? "Unknown" : role;
            ValidationElementNameText.Text = string.IsNullOrWhiteSpace(name) ? "(no accessible name)" : name;

            IsDisplayedCheckBox.IsChecked = false;
            ApplyValidationButton.IsEnabled = false;

            HeaderLevelComboBox.SelectedIndex = 0;
            HeaderLevelPanel.Visibility = IsHeaderRole(_pendingValidationRole)
                ? Visibility.Visible
                : Visibility.Collapsed;

            ValidationPane.Visibility = Visibility.Visible;

            _isHighlightBusy = false;
            HighlightButton.IsEnabled = true;
            HighlightButton.Content = "HIGHLIGHT & VALIDATE";
        });
    }

    private async void OnHighlightClick(object sender, RoutedEventArgs e)
    {
        if (_isHighlightBusy || _isStopping)
        {
            return;
        }

        try
        {
            _isHighlightBusy = true;
            HighlightButton.IsEnabled = false;
            HighlightButton.Content = "DRAW IN BROWSER...";
            await _recorderService.EnableHighlightModeAsync();
        }
        catch (Exception ex)
        {
            _isHighlightBusy = false;
            HighlightButton.IsEnabled = true;
            HighlightButton.Content = "HIGHLIGHT & VALIDATE";
            MessageBox.Show($"Failed to start highlight mode: {ex.Message}", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
        }
    }

    private static bool IsHeaderRole(string role)
    {
        return role == "header" ||
               role == "heading" ||
               role == "h1" || role == "h2" || role == "h3" ||
               role == "h4" || role == "h5" || role == "h6";
    }

    private void OnValidationOptionChanged(object sender, RoutedEventArgs e)
    {
        ApplyValidationButton.IsEnabled = IsDisplayedCheckBox.IsChecked == true;
    }

    private void OnCancelValidationClick(object sender, RoutedEventArgs e)
    {
        ValidationPane.Visibility = Visibility.Collapsed;
        HeaderLevelPanel.Visibility = Visibility.Collapsed;
        HeaderLevelComboBox.SelectedIndex = 0;
        _pendingValidationRole = string.Empty;
        _pendingValidationName = string.Empty;
    }

    private string GetSelectedHeaderLevel()
    {
        if (HeaderLevelComboBox.SelectedItem is ComboBoxItem item)
        {
            return item.Content?.ToString()?.Trim().ToLowerInvariant() ?? "default";
        }

        return "default";
    }

    private void OnApplyValidationClick(object sender, RoutedEventArgs e)
    {
        if (IsDisplayedCheckBox.IsChecked != true)
        {
            return;
        }

        if (string.IsNullOrWhiteSpace(_pendingValidationName))
        {
            MessageBox.Show("Captured element has no accessible name.", "Validation", MessageBoxButton.OK, MessageBoxImage.Warning);
            return;
        }

        string line;

        switch (_pendingValidationRole)
        {
            case "radio": //This will be done after the demo
                line = $"await RadioComponent(this.#page, \"{EscapeTsString(_pendingValidationName)}\");";
                break;

            case "button":
                line = $"await ButtonComponent(this.#page, \"{EscapeTsString(_pendingValidationName)}\");";
                break;

            case "header":
                var selectedLevel = GetSelectedHeaderLevel();
                if (selectedLevel == "default")
                {
                    line = $"await HeaderComponent(this.#page, \"{EscapeTsString(_pendingValidationName)}\");";
                }
                else if (selectedLevel.Length == 2 &&
                         selectedLevel[0] == 'h' &&
                         int.TryParse(selectedLevel[1].ToString(), out var level) &&
                         level >= 1 && level <= 6)
                {
                    line = $"await HeaderComponent(this.#page, \"{EscapeTsString(_pendingValidationName)}\", {level});";
                }
                else
                {
                    line = $"await HeaderComponent(this.#page, \"{EscapeTsString(_pendingValidationName)}\");";
                }
                break;

            case "heading":
                selectedLevel = GetSelectedHeaderLevel();
                if (selectedLevel == "default")
                {
                    line = $"await HeaderComponent(this.#page, \"{EscapeTsString(_pendingValidationName)}\");";
                }
                else if (selectedLevel.Length == 2 &&
                         selectedLevel[0] == 'h' &&
                         int.TryParse(selectedLevel[1].ToString(), out var level) &&
                         level >= 1 && level <= 6)
                {
                    line = $"await HeaderComponent(this.#page, \"{EscapeTsString(_pendingValidationName)}\", {level});";
                }
                else
                {
                    line = $"await HeaderComponent(this.#page, \"{EscapeTsString(_pendingValidationName)}\");";
                }
                break;

            case "h1":
                selectedLevel = GetSelectedHeaderLevel();
                if (selectedLevel == "default")
                {
                    line = $"await HeaderComponent(this.#page, \"{EscapeTsString(_pendingValidationName)}\");";
                }
                else if (selectedLevel.Length == 2 &&
                         selectedLevel[0] == 'h' &&
                         int.TryParse(selectedLevel[1].ToString(), out var level) &&
                         level >= 1 && level <= 6)
                {
                    line = $"await HeaderComponent(this.#page, \"{EscapeTsString(_pendingValidationName)}\", {level});";
                }
                else
                {
                    line = $"await HeaderComponent(this.#page, \"{EscapeTsString(_pendingValidationName)}\");";
                }
                break;

            default:
                MessageBox.Show($"'{_pendingValidationRole}' is not mapped yet.", "Validation", MessageBoxButton.OK, MessageBoxImage.Information);
                return;
        }

        if (!_recordedLines.Contains(line))
        {
            _recordedLines.Add(line);
            LinesLabel.Text = $"Lines captured: {_recordedLines.Count}";
        }

        ValidationPane.Visibility = Visibility.Collapsed;
        HeaderLevelPanel.Visibility = Visibility.Collapsed;
        HeaderLevelComboBox.SelectedIndex = 0;
        _pendingValidationRole = string.Empty;
        _pendingValidationName = string.Empty;
    }

    private static string EscapeTsString(string value)
    {
        return value.Replace("\\", "\\\\").Replace("\"", "\\\"");
    }

    private async void OnStopClick(object sender, RoutedEventArgs e)
    {
        if (_isStopping)
        {
            return;
        }

        try
        {
            _isStopping = true;
            StopButton.IsEnabled = false;
            HighlightButton.IsEnabled = false;
            ValidationPane.Visibility = Visibility.Collapsed;

            await _recorderService.StopAsync();
            _recorderService.ExportCsv(_outputFolder);

            LoadFieldsFromCsv(CsvPath);

            FieldEditorPanel.Visibility = Visibility.Visible;
            RecordingDot.Fill = MediaBrushes.Gray;
            LinesLabel.Text = $"Recording stopped. Fields captured: {Fields.Count}";
        }
        catch (Exception ex)
        {
            MessageBox.Show($"Failed to stop recording: {ex.Message}", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
            StopButton.IsEnabled = true;
            HighlightButton.IsEnabled = true;
            _isStopping = false;
        }
    }

    private void OnGenerateCodeClick(object sender, RoutedEventArgs e)
    {
        try
        {
            SaveFieldsToCsv(CsvPath);
            _fileGenerator.GeneratePageFileFromCsv(_testCase, _outputFolder, _recordedLines, CsvPath);
            Close();
        }
        catch (Exception ex)
        {
            MessageBox.Show($"Failed to generate code: {ex.Message}", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
        }
    }

    private void LoadFieldsFromCsv(string csvPath)
    {
        Fields.Clear();

        if (!File.Exists(csvPath))
        {
            return;
        }

        var lines = File.ReadAllLines(csvPath);
        foreach (var line in lines.Skip(1))
        {
            if (string.IsNullOrWhiteSpace(line))
            {
                continue;
            }

            var parts = ParseCsvLine(line);
            if (parts.Count < 3)
            {
                continue;
            }

            var fieldName = GetCsvColumn(parts, 1).Trim();
            var fieldValue = GetCsvColumn(parts, 2).Trim();
            var actionType = GetCsvColumn(parts, 3).Trim().ToLowerInvariant();
            var dataTableHeader = GetCsvColumn(parts, 5).Trim();

            if (string.IsNullOrWhiteSpace(fieldName))
            {
                continue;
            }

            Fields.Add(new FieldMapping
            {
                FieldName = fieldName,
                FieldValue = fieldValue,
                ActionType = string.IsNullOrWhiteSpace(actionType) ? "type" : actionType,
                DataTableHeader = string.IsNullOrWhiteSpace(dataTableHeader)
                    ? SuggestDataTableHeader(fieldName)
                    : dataTableHeader
            });
        }
    }


    private static string GetCsvColumn(IReadOnlyList<string> columns, int index)
    {
        return index >= 0 && index < columns.Count ? columns[index] : string.Empty;
    }

    private static List<string> ParseCsvLine(string line)
    {
        var result = new List<string>();
        var sb = new System.Text.StringBuilder();
        var inQuotes = false;

        for (var i = 0; i < line.Length; i++)
        {
            var c = line[i];

            if (c == '"')
            {
                if (inQuotes && i + 1 < line.Length && line[i + 1] == '"')
                {
                    sb.Append('"');
                    i++;
                }
                else
                {
                    inQuotes = !inQuotes;
                }

                continue;
            }

            if (c == ',' && !inQuotes)
            {
                result.Add(sb.ToString());
                sb.Clear();
                continue;
            }

            sb.Append(c);
        }

        result.Add(sb.ToString());
        return result;
    }

    private static string SuggestDataTableHeader(string fieldName)
    {
        var cleaned = fieldName
            .Replace("Enter your ", "")
            .Replace("Select your ", "")
            .Replace("Choose your ", "")
            .Replace("Enter ", "")
            .Replace("Select ", "")
            .Trim();

        var words = cleaned.Split(new[] { ' ', '-', '_' }, StringSplitOptions.RemoveEmptyEntries);
        return string.Join("", words.Select(w => char.ToUpper(w[0]) + w[1..].ToLower()));
    }

    private void SaveFieldsToCsv(string csvPath)
    {
        var sb = new System.Text.StringBuilder();
        sb.AppendLine("StepNumber,FieldName,FieldValue,ActionType,Timestamp,DataTableHeader");

        var stepNumber = 1;
        foreach (var field in Fields)
        {
            var actionType = string.IsNullOrWhiteSpace(field.ActionType) ? "type" : field.ActionType;

            sb.AppendLine(
                $"{stepNumber}," +
                $"{EscapeCsvValue(field.FieldName)}," +
                $"{EscapeCsvValue(field.FieldValue)}," +
                $"{EscapeCsvValue(actionType)}," +
                $"{DateTime.Now:yyyy-MM-dd HH:mm:ss}," +
                $"{EscapeCsvValue(field.DataTableHeader)}");

            stepNumber++;
        }

        File.WriteAllText(csvPath, sb.ToString());
    }

    private static string EscapeCsvValue(string value)
    {
        if (value.Contains(',') || value.Contains('"') || value.Contains('\n'))
        {
            return $"\"{value.Replace("\"", "\"\"")}\"";
        }

        return value;
    }
}
