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
using Path = System.IO.Path;

namespace WpfApp1
{
    /// <summary>
    /// BranchSelectionWindow.xaml 的互動邏輯
    /// </summary>
    public partial class BranchSelectionWindow : Window
    {
        public gitlibrary gitLibrary = new gitlibrary();
        private Dictionary<string, ComboBox> branchSelectors = new Dictionary<string, ComboBox>();
        public BranchSelectionWindow(List<string> repositories)
        {
            InitializeComponent();
            
            LoadBranchesAsync(repositories);
        }
        private async void LoadBranchesAsync(List<string> repositories)
        {
            foreach (var repoPath in repositories)
            {
                if (Directory.Exists(repoPath))
                {
                    // 建立標題 (顯示 Repository 名稱)
                    TextBlock repoTitle = new TextBlock
                    {
                        Text = $"儲存庫: {Path.GetFileName(repoPath)}",
                        FontWeight = FontWeights.Bold,
                        Margin = new Thickness(0, 10, 0, 5)
                    };
                    BranchSelectionContainer.Children.Add(repoTitle);

                    // 取得所有分支
                    List<string> branches = await gitLibrary.GetBranchesAsync(repoPath);

                    if (branches.Count > 0)
                    {
                        // 建立 ComboBox 來顯示分支選擇
                        ComboBox branchSelector = new ComboBox
                        {
                            Width = 300,
                            Margin = new Thickness(0, 0, 0, 10)
                        };

                        foreach (var branch in branches)
                        {
                            branchSelector.Items.Add(branch);
                        }

                        branchSelector.SelectedIndex = 0; // 預設選中第一個
                        BranchSelectionContainer.Children.Add(branchSelector);

                        // 存儲選擇器對應的 Repository Path
                        branchSelectors[repoPath] = branchSelector;
                    }
                    else
                    {
                        BranchSelectionContainer.Children.Add(new TextBlock { Text = "無可用分支", Margin = new Thickness(0, 0, 0, 10) });
                    }
                }
            }
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

        private async void ConfirmBranchSelection_Click(object sender, RoutedEventArgs e)
        {
            ShowLoading(); // **顯示 Loading 畫面**
            await Task.Delay(100); // **確保 UI 及時更新 Loading 畫面**

            Dictionary<string, string> selectedBranches = new Dictionary<string, string>();

            foreach (var entry in branchSelectors)
            {
                string repoPath = entry.Key;
                string selectedBranch = entry.Value.SelectedItem?.ToString();

                if (string.IsNullOrWhiteSpace(selectedBranch))
                {
                    MessageBox.Show("請為所有儲存庫選擇一個分支！", "錯誤", MessageBoxButton.OK, MessageBoxImage.Warning);
                    HideLoading(); // **確保 UI 不會卡住**
                    return;
                }

                // **轉換 `remotes/origin/branchName` -> `branchName`**
                string branchName = selectedBranch.Replace("remotes/origin/", "");
                selectedBranches[repoPath] = branchName;
            }

            await Task.Run(async () =>
            {
                foreach (var entry in selectedBranches)
                {
                    string repoPath = entry.Key;
                    string branchName = entry.Value;

                    try
                    {
                        bool branchExists = await gitLibrary.BranchExists(repoPath, branchName);

                        if (branchExists)
                        {
                            await gitLibrary.Checkout(repoPath, branchName);
                        }
                        else
                        {
                            // **如果分支不存在，則創建並切換到新分支**
                            await gitLibrary.CheckoutNewBranch(repoPath, branchName);
                        }
                    }
                    catch (Exception ex)
                    {
                        // **確保 UI 只在錯誤時顯示錯誤訊息**
                        Dispatcher.Invoke(() =>
                        {
                            MessageBox.Show($"❌ 切換分支失敗: {ex.Message}", "錯誤", MessageBoxButton.OK, MessageBoxImage.Warning);
                        });
                    }
                }
            });

            HideLoading(); // **所有 Git 操作完成後，隱藏 Loading**

            MainWindow installWindow = new MainWindow();
            installWindow.Show();
            this.Close();
        }



    }
}

