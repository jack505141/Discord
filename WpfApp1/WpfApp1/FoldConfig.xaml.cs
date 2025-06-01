// FoldConfig.xaml.cs
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Windows;
using System.Windows.Controls;
using System.ComponentModel;
using System.Runtime.CompilerServices;

namespace WpfApp1
{
    public partial class FoldConfig : Window
    {
        public FoldConfig()
        {
            InitializeComponent();
        }

        private void LoadFolder_Click(object sender, RoutedEventArgs e)
        {
            string path = FolderPathBox.Text.Trim();
            if (!Directory.Exists(path))
            {
                MessageBox.Show("找不到資料夾，請確認路徑。", "錯誤", MessageBoxButton.OK, MessageBoxImage.Error);
                return;
            }

            var root = LoadFolder(path);
            FolderTreeView.ItemsSource = new List<FileItem> { root };
        }

        private FileItem LoadFolder(string path)
        {
            var item = new FileItem
            {
                Name = Path.GetFileName(path),
                FullPath = path,
                IsDirectory = true,
                Children = new List<FileItem>()
            };

            foreach (var dir in Directory.GetDirectories(path))
            {
                var childDir = LoadFolder(dir);
                childDir.Parent = item;
                item.Children.Add(childDir);
            }

            foreach (var file in Directory.GetFiles(path))
            {
                var fileItem = new FileItem
                {
                    Name = Path.GetFileName(file),
                    FullPath = file,
                    IsDirectory = false,
                    Children = new List<FileItem>(),
                    Parent = item
                };
                item.Children.Add(fileItem);
            }

            return item;
        }

        private void SaveSelection_Click(object sender, RoutedEventArgs e)
        {
            if (FolderTreeView.ItemsSource == null)
            {
                MessageBox.Show("請先載入資料夾。", "提醒", MessageBoxButton.OK, MessageBoxImage.Information);
                return;
            }

            string fileName = SaveNameBox.Text.Trim();
            if (string.IsNullOrWhiteSpace(fileName))
            {
                MessageBox.Show("請輸入儲存檔名。", "提醒", MessageBoxButton.OK, MessageBoxImage.Information);
                return;
            }

            if (!fileName.EndsWith(".json", StringComparison.OrdinalIgnoreCase))
                fileName += ".json";

            var selectedFiles = GetSelectedFileNames(FolderTreeView.ItemsSource.Cast<FileItem>());

            string savePath = Path.Combine(AppContext.BaseDirectory, "Storage");
            if (!Directory.Exists(savePath))
                Directory.CreateDirectory(savePath);

            File.WriteAllText(Path.Combine(savePath, fileName), JsonSerializer.Serialize(selectedFiles, new JsonSerializerOptions { WriteIndented = true }));
            if (MessageBox.Show("已儲存選取檔案名稱。", "成功", MessageBoxButton.OK, MessageBoxImage.Information) == MessageBoxResult.OK)
            {
                NavigationService.NavigateTo<MainWindow>(this);
            }
        }

        private List<string> GetSelectedFileNames(IEnumerable<FileItem> items)
        {
            var result = new List<string>();
            foreach (var item in items)
            {
                if (item.IsChecked && !item.IsDirectory)
                    result.Add(item.Name);
                if (item.Children != null)
                    result.AddRange(GetSelectedFileNames(item.Children));
            }
            return result;
        }

        private void Goback_Click(object sender, RoutedEventArgs e)
        {
            NavigationService.NavigateTo<MainWindow>(this);
        }
    }

    public class FileItem : INotifyPropertyChanged
    {
        private bool _isChecked;

        public string Name { get; set; }
        public string FullPath { get; set; }
        public bool IsDirectory { get; set; }
        public List<FileItem> Children { get; set; } = new();
        public FileItem Parent { get; set; }

        public bool IsChecked
        {
            get => _isChecked;
            set
            {
                if (_isChecked != value)
                {
                    _isChecked = value;
                    OnPropertyChanged();

                    if (Children != null)
                    {
                        foreach (var child in Children)
                        {
                            child.IsChecked = value;
                        }
                    }

                    if (!value)
                    {
                        PropagateUncheckUp(this);
                    }
                }
            }
        }

        public event PropertyChangedEventHandler PropertyChanged;

        protected void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }

        private void PropagateUncheckUp(FileItem current)
        {
            if (current.Parent != null && current.Parent.IsChecked)
            {
                current.Parent._isChecked = false;
                current.Parent.OnPropertyChanged(nameof(IsChecked));
                PropagateUncheckUp(current.Parent);
            }
        }
    }
   
    
}
