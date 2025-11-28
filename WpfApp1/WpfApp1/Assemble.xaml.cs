using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Shapes;

namespace WpfApp1
{
    /// <summary>
    /// Assemble.xaml 的互動邏輯
    /// </summary>
    public partial class Assemble : Window
    {
        private List<string> droppedFiles = new List<string>();

        public Assemble()
        {
            InitializeComponent();
            LoadDroppedFilesFromConfig();
        }

        private void Window_DragOver(object sender, DragEventArgs e)
        {
            e.Effects = DragDropEffects.Copy;
            e.Handled = true;
        }

        private void Border_DragOver(object sender, DragEventArgs e)
        {
            e.Effects = DragDropEffects.Copy;
            e.Handled = true;
        }
        private void LoadDroppedFilesFromConfig()
        {
            string configPath = System.IO.Path.Combine(AppContext.BaseDirectory, "assembleconfig", "dropped_files.txt");

            if (File.Exists(configPath))
            {
                var lines = File.ReadAllLines(configPath)
                                .Where(line => !string.IsNullOrWhiteSpace(line))
                                .ToList();

                droppedFiles = lines;

                FileListBox.Items.Clear();
                foreach (var file in droppedFiles)
                {
                    FileListBox.Items.Add(file);
                }

                FileCountText.Text = $"目前已有 {droppedFiles.Count} 筆拖曳資料";
            }
            else
            {
                FileCountText.Text = "未找到任何已儲存的拖曳資料";
            }
        }

        private void Border_Drop(object sender, DragEventArgs e)
        {
            if (e.Data.GetDataPresent(DataFormats.FileDrop))
            {
                string[] files = (string[])e.Data.GetData(DataFormats.FileDrop);
                string configFolder = System.IO.Path.Combine(AppContext.BaseDirectory, "assembleconfig");

                // 建立資料夾（若不存在）
                if (!Directory.Exists(configFolder))
                    Directory.CreateDirectory(configFolder);

                string configPath = System.IO.Path.Combine(configFolder, "dropped_files.txt");

                foreach (var file in files)
                {
                    if (!droppedFiles.Contains(file))
                    {
                        droppedFiles.Add(file);
                        FileListBox.Items.Add(file);

                        // 寫入檔案，每次 append 一筆
                        File.AppendAllText(configPath, file + Environment.NewLine);
                    }
                }

                FileCountText.Text = $"已拖曳 {droppedFiles.Count} 個檔案";
            }
        }

        private void Window_Drop(object sender, DragEventArgs e)
        {
            Border_Drop(sender, e); // 處理視窗拖曳
        }
        private void BackButton_Click(object sender, RoutedEventArgs e)
        {
            NavigationService.NavigateTo<MainWindow>(this);
        }
        private void FileListBox_KeyDown(object sender, KeyEventArgs e)
        {
            if (e.Key == Key.Delete)
            {
                var selectedItems = FileListBox.SelectedItems.Cast<string>().ToList();

                if (!selectedItems.Any())
                    return;

                var result = MessageBox.Show($"是否要刪除這 {selectedItems.Count} 筆資料？",
                                             "確認刪除",
                                             MessageBoxButton.YesNo,
                                             MessageBoxImage.Warning);

                if (result == MessageBoxResult.Yes)
                {
                    foreach (var item in selectedItems)
                    {
                        droppedFiles.Remove(item);
                    }

                    foreach (var item in selectedItems)
                    {
                        FileListBox.Items.Remove(item);
                    }

                    FileCountText.Text = $"目前已有 {droppedFiles.Count} 筆拖曳資料";

                    string configPath = System.IO.Path.Combine(AppContext.BaseDirectory, "assembleconfig", "dropped_files.txt");
                    File.WriteAllLines(configPath, droppedFiles);

                   
                }
            }
        }
    }
}
