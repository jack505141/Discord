using System;
using System.Collections.Generic;
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
using System.IO;


namespace WpfApp1
{
    /// <summary>
    /// Instal.xaml 的互動邏輯
    /// </summary>
    public partial class Instal : Window
    {
        private gitlibrary gitLibrary = new gitlibrary();
        private int urlCount = 0;
        private const int MaxUrls = 5;
        public Instal()
        {
            InitializeComponent();
        }
        private void AddCloneUrl_Click(object sender, RoutedEventArgs e)
        {
            if (urlCount < MaxUrls)
            {
                TextBlock newTextBlock = new TextBlock
                {
                    Text = $"Clone URL {urlCount + 1}:",
                    Margin = new Thickness(0, 5, 0, 0)
                };

                TextBox newTextBox = new TextBox
                {
                    Width = 300,
                    Margin = new Thickness(0, 2, 0, 5)
                };

                CloneUrlContainer.Children.Add(newTextBlock);
                CloneUrlContainer.Children.Add(newTextBox);

                urlCount++;
            }
            else
            {
                MessageBox.Show("最多只能新增 5 個 Clone URL！", "提示", MessageBoxButton.OK, MessageBoxImage.Warning);
            }
        }

        private async void InstallAll_Click(object sender, RoutedEventArgs e)
        {
            ShowLoading(); // 顯示 Loading
            InstallAll.Visibility = Visibility.Collapsed;
            List<Task> cloneTasks = new List<Task>();

            try
            {
                foreach (var child in CloneUrlContainer.Children)
                {
                    if (child is TextBox textBox && !string.IsNullOrWhiteSpace(textBox.Text))
                    {
                        string repositoryUrl = textBox.Text;
                        string destinationPath = System.IO.Path.Combine("C:\\", GetRepoName(repositoryUrl));

                        try
                        {
                            // ✅ 確保 Git Clone 運行在背景執行緒
                            Task cloneTask = Task.Run(async () =>
                            {
                                await gitLibrary.CloneAsync(repositoryUrl, destinationPath);
                                Dispatcher.Invoke(() => StatusTextBox.AppendText($"✅ 完成 Clone: {repositoryUrl}\n"));
                            });

                            cloneTasks.Add(cloneTask);
                            Dispatcher.Invoke(() => StatusTextBox.AppendText($"🔄 開始 Clone: {repositoryUrl}\n"));
                        }
                        catch (Exception ex)
                        {
                            Dispatcher.Invoke(() =>
                            {
                                InstallAll.Visibility = Visibility.Visible;
                                StatusTextBox.AppendText($"❌ 錯誤: {ex.Message}\n");
                            });
                        }
                    }
                }

                await Task.WhenAll(cloneTasks); // 等待所有 Clone 完成
                Dispatcher.Invoke(() => StatusTextBox.AppendText("🚀 所有 Clone 完成！\n"));
            }
            catch (Exception ex)
            {
                Dispatcher.Invoke(() => MessageBox.Show($"❌ 發生錯誤: {ex.Message}", "錯誤", MessageBoxButton.OK, MessageBoxImage.Error));
            }
            finally
            {
                HideLoading(); // **確保無論成功或失敗都會隱藏 Loading**
                Dispatcher.Invoke(() => NextStepButton.Visibility = Visibility.Visible);
            }
        }

        private string GetRepoName(string repoUrl)
        {
            return repoUrl.Split('/').Last().Replace(".git", "");
        }
        private void NextStep_Click(object sender, RoutedEventArgs e)
        {
            List<string> clonedRepos = new List<string>();

            foreach (var child in CloneUrlContainer.Children)
            {
                if (child is TextBox textBox && !string.IsNullOrWhiteSpace(textBox.Text))
                {
                    string repoName = GetRepoName(textBox.Text);
                    string repoPath = System.IO.Path.Combine("C://", repoName);
                    clonedRepos.Add(repoPath);
                }
            }

            BranchSelectionWindow branchSelectionWindow = new BranchSelectionWindow(clonedRepos);
            branchSelectionWindow.Show();
            this.Close();
        }
        private void ShowLoading()
        {
            Dispatcher.Invoke(() =>
            {
                LoadingOverlay.Visibility = Visibility.Visible;
            }, System.Windows.Threading.DispatcherPriority.Render);
        }

        private void HideLoading()
        {
            Dispatcher.Invoke(() =>
            {
                LoadingOverlay.Visibility = Visibility.Collapsed;
            }, System.Windows.Threading.DispatcherPriority.Render);
        }



    }
}
