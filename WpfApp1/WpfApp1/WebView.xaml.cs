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
using Microsoft.Win32;

namespace WpfApp1
{
    /// <summary>
    /// WebView.xaml 的互動邏輯
    /// </summary>
    public partial class WebView : Window
    {
        private string currentHtmlPath = string.Empty;

        public WebView()
        {
            InitializeComponent();
            InitializeWebView();
        }

        private async void InitializeWebView()
        {
            try
            {
                await webView.EnsureCoreWebView2Async(null);
                
                // 禁用開發者工具（F12）和右鍵菜單
                if (webView.CoreWebView2 != null)
                {
                    webView.CoreWebView2.Settings.AreDevToolsEnabled = false;
                    webView.CoreWebView2.Settings.AreDefaultContextMenusEnabled = false;
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"初始化 WebView2 時發生錯誤：{ex.Message}\n\n請確保已安裝 WebView2 Runtime。", 
                    "錯誤", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private void Window_DragEnter(object sender, DragEventArgs e)
        {
            if (e.Data.GetDataPresent(DataFormats.FileDrop))
            {
                string[] files = (string[])e.Data.GetData(DataFormats.FileDrop);
                if (files.Length > 0 && IsHtmlFile(files[0]))
                {
                    e.Effects = DragDropEffects.Copy;
                }
                else
                {
                    e.Effects = DragDropEffects.None;
                }
            }
            else
            {
                e.Effects = DragDropEffects.None;
            }
        }

        private void Window_DragOver(object sender, DragEventArgs e)
        {
            e.Handled = true;
        }

        private void Window_Drop(object sender, DragEventArgs e)
        {
            if (e.Data.GetDataPresent(DataFormats.FileDrop))
            {
                string[] files = (string[])e.Data.GetData(DataFormats.FileDrop);
                if (files.Length > 0 && IsHtmlFile(files[0]))
                {
                    LoadHtmlFile(files[0]);
                }
                else
                {
                    MessageBox.Show("請拖放 HTML 檔案 (.html 或 .htm)", "檔案格式錯誤", 
                        MessageBoxButton.OK, MessageBoxImage.Warning);
                }
            }
        }

        private void DropZone_DragEnter(object sender, DragEventArgs e)
        {
            if (e.Data.GetDataPresent(DataFormats.FileDrop))
            {
                string[] files = (string[])e.Data.GetData(DataFormats.FileDrop);
                if (files.Length > 0 && IsHtmlFile(files[0]))
                {
                    DropZone.Background = new SolidColorBrush(Color.FromRgb(52, 152, 219));
                    DropZone.BorderBrush = new SolidColorBrush(Color.FromRgb(41, 128, 185));
                    e.Effects = DragDropEffects.Copy;
                }
            }
            e.Handled = true;
        }

        private void DropZone_DragLeave(object sender, DragEventArgs e)
        {
            DropZone.Background = new SolidColorBrush(Color.FromRgb(236, 240, 241));
            DropZone.BorderBrush = new SolidColorBrush(Color.FromRgb(189, 195, 199));
            e.Handled = true;
        }

        private void DropZone_Drop(object sender, DragEventArgs e)
        {
            DropZone.Background = new SolidColorBrush(Color.FromRgb(236, 240, 241));
            DropZone.BorderBrush = new SolidColorBrush(Color.FromRgb(189, 195, 199));
            
            if (e.Data.GetDataPresent(DataFormats.FileDrop))
            {
                string[] files = (string[])e.Data.GetData(DataFormats.FileDrop);
                if (files.Length > 0 && IsHtmlFile(files[0]))
                {
                    LoadHtmlFile(files[0]);
                }
            }
            e.Handled = true;
        }

        private bool IsHtmlFile(string filePath)
        {
            string extension = System.IO.Path.GetExtension(filePath).ToLower();
            return extension == ".html" || extension == ".htm";
        }

        private async void LoadHtmlFile(string filePath)
        {
            try
            {
                if (!File.Exists(filePath))
                {
                    MessageBox.Show("檔案不存在！", "錯誤", MessageBoxButton.OK, MessageBoxImage.Error);
                    return;
                }

                currentHtmlPath = filePath;
                
                // 顯示載入中
                ShowLoading();

                // 確保 WebView2 已初始化
                if (webView.CoreWebView2 == null)
                {
                    await webView.EnsureCoreWebView2Async(null);
                }

                // 載入 HTML 檔案
                string fileUri = new Uri(filePath).AbsoluteUri;
                webView.Source = new Uri(fileUri);

                // 隱藏拖放區域，顯示 WebView
                DropZone.Visibility = Visibility.Collapsed;
                webView.Visibility = Visibility.Visible;
                ReloadButton.IsEnabled = true;

                Title = $"WebView - {System.IO.Path.GetFileName(filePath)}";
            }
            catch (Exception ex)
            {
                HideLoading();
                MessageBox.Show($"載入 HTML 檔案時發生錯誤：{ex.Message}", "錯誤", 
                    MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private void OpenFileButton_Click(object sender, RoutedEventArgs e)
        {
            OpenFileDialog openFileDialog = new OpenFileDialog
            {
                Filter = "HTML 檔案 (*.html;*.htm)|*.html;*.htm|所有檔案 (*.*)|*.*",
                Title = "選擇 HTML 檔案"
            };

            if (openFileDialog.ShowDialog() == true)
            {
                LoadHtmlFile(openFileDialog.FileName);
            }
        }

        private void ReloadButton_Click(object sender, RoutedEventArgs e)
        {
            if (!string.IsNullOrEmpty(currentHtmlPath) && File.Exists(currentHtmlPath))
            {
                LoadHtmlFile(currentHtmlPath);
            }
            else if (webView.CoreWebView2 != null)
            {
                webView.CoreWebView2.Reload();
            }
        }

        private void BackButton_Click(object sender, RoutedEventArgs e)
        {
            NavigationService.NavigateTo<MainWindow>(this);
        }

        private void WebView_NavigationStarting(object sender, Microsoft.Web.WebView2.Core.CoreWebView2NavigationStartingEventArgs e)
        {
            ShowLoading();
        }

        private void WebView_NavigationCompleted(object sender, Microsoft.Web.WebView2.Core.CoreWebView2NavigationCompletedEventArgs e)
        {
            HideLoading();
            
            if (!e.IsSuccess)
            {
                MessageBox.Show($"載入失敗：{e.WebErrorStatus}", "載入錯誤", 
                    MessageBoxButton.OK, MessageBoxImage.Warning);
            }
        }

        private void ShowLoading()
        {
            LoadingOverlay.Visibility = Visibility.Visible;
        }

        private void HideLoading()
        {
            LoadingOverlay.Visibility = Visibility.Collapsed;
        }
    }
}
