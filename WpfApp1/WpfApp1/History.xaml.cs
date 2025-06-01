// History.xaml.cs
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Windows;
using System.Windows.Controls;

namespace WpfApp1
{
    public partial class History : Window
    {
        private List<string> currentLogLines = new();

        public History()
        {
            InitializeComponent();
            LoadLogList();
        }

        private void LoadLogList()
        {
            string historyFolder = Path.Combine(AppContext.BaseDirectory, "History");
            if (!Directory.Exists(historyFolder)) return;

            var logFiles = Directory.GetFiles(historyFolder, "*.log")
                                    .Select(Path.GetFileName)
                                    .OrderByDescending(f => f)
                                    .ToList();

            LogSelector.ItemsSource = logFiles;

            if (logFiles.Any())
            {
                LogSelector.SelectedIndex = 0;
            }
        }

        private void LogSelector_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            if (LogSelector.SelectedItem == null) return;

            string selectedFile = LogSelector.SelectedItem.ToString();
            string path = Path.Combine(AppContext.BaseDirectory, "History", selectedFile);

            if (File.Exists(path))
            {
                var lines = File.ReadAllLines(path).ToList();
                currentLogLines = lines;
                LogContentBox.Text = string.Join("\n", lines);

                if (lines.Count > 2)
                {
                    SummaryText.Text = $"更新時間：{lines[0].Replace("更新時間：", "")}，共 {lines.Count - 3} 筆檔案";
                }
                else
                {
                    SummaryText.Text = "無摘要可顯示";
                }
            }
        }

        private void GoBack_Click(object sender, RoutedEventArgs e)
        {
            NavigationService.NavigateTo<MainWindow>(this);
        }

        private void SearchBox_TextChanged(object sender, TextChangedEventArgs e)
        {
            if (currentLogLines == null || currentLogLines.Count == 0) return;

            string keyword = SearchBox.Text.Trim();
            if (string.IsNullOrWhiteSpace(keyword))
            {
                LogContentBox.Text = string.Join("\n", currentLogLines);
                return;
            }

            var filtered = currentLogLines.Where(l => l.Contains(keyword, StringComparison.OrdinalIgnoreCase));
            LogContentBox.Text = string.Join("\n", filtered);
        }

        private void ExportJson_Click(object sender, RoutedEventArgs e)
        {
            if (currentLogLines == null || currentLogLines.Count == 0)
            {
                MessageBox.Show("目前無任何紀錄可匯出。", "提示", MessageBoxButton.OK, MessageBoxImage.Information);
                return;
            }

            var data = currentLogLines.Skip(3); // 跳過標頭
            string json = JsonSerializer.Serialize(data, new JsonSerializerOptions { WriteIndented = true });
            string savePath = Path.Combine(AppContext.BaseDirectory, "History", $"export_{DateTime.Now:yyyyMMdd_HHmmss}.json");
            File.WriteAllText(savePath, json);
            MessageBox.Show($"已匯出為 JSON：\n{savePath}", "完成", MessageBoxButton.OK, MessageBoxImage.Information);
        }

        private void DeleteLog_Click(object sender, RoutedEventArgs e)
        {
            if (LogSelector.SelectedItem == null) return;

            string file = LogSelector.SelectedItem.ToString();
            string path = Path.Combine(AppContext.BaseDirectory, "History", file);

            if (File.Exists(path))
            {
                var result = MessageBox.Show($"確定要刪除檔案：{file}？", "確認刪除", MessageBoxButton.YesNo, MessageBoxImage.Warning);
                if (result == MessageBoxResult.Yes)
                {
                    File.Delete(path);
                    MessageBox.Show("紀錄已刪除。", "刪除成功", MessageBoxButton.OK, MessageBoxImage.Information);
                    LoadLogList();
                    LogContentBox.Clear();
                    SummaryText.Text = string.Empty;
                }
            }
        }
    }
}