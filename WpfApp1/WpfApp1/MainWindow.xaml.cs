using System;
using System.Diagnostics;
using System.IO;
using System.Text;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;
using Path = System.IO.Path;
using WpfAnimatedGif;
using System.Reflection;
using WpfApp1.ModuelFactory;
using System.Text.Json;

namespace WpfApp1
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : Window
    {
        private gitlibrary gitLibrary = new gitlibrary();
        private static MainWindow instance;
        Rigister rigister = new Rigister();
        private List<string> updatedFiles = new();
        public MainWindow()
        {
            //if (!LoginWindow.IsAuthenticated)
            //{
            //    LoginWindow loginWindow = new LoginWindow();
            //    loginWindow.ShowDialog(); // **等待密碼輸入**

            //    if (!LoginWindow.IsAuthenticated) // ❌ 密碼錯誤或關閉視窗
            //    {
            //        Application.Current.Shutdown(); // **關閉應用程式**
            //        return;
            //    }
            //}

            //instance = this; // **將當前視窗設為單例**
            CommandManager.RegisterModule("Kiosk", new UpdateModel());
            CommandManager.OnLog = msg => AppendStatus(msg);
           
            InitializeComponent();
            LoadCurrentConfigName();
            LoadJsonMenu();

        }

        protected override void OnClosed(EventArgs e)
        {
            instance = null; // **視窗關閉時，釋放單例**
            base.OnClosed(e);
        }
        public void InstallGit_Click(object sender, RoutedEventArgs e)
        {
            NavigationService.NavigateTo<Instal>(this);
        }

        public async void UpdateGit_Click(object sender, RoutedEventArgs e)
        {
            if (GitPathTextBox.Text == "") return;
            AppendStatus("更新中");
            bool result = await gitLibrary.PullAsync(GitPathTextBox.Text);
            if (result)
            {
                AppendStatus("更新完成");
            }
            else
            {
                MessageBox.Show("Git Pull 失敗，請檢查遠端儲存庫", "錯誤", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }
        public void Checkout_Click(object sender, RoutedEventArgs e)
        {
            if (GitPathTextBox.Text=="") return;
            List<string> clonedRepos = new List<string>();
            clonedRepos.Add(GitPathTextBox.Text);
            







            BranchSelectionWindow branchSelectionWindow = new BranchSelectionWindow(clonedRepos);
            branchSelectionWindow.Show();
            this.Close();
        }

        private void AppendStatus(string message)
        {
            
            StatusTextBox.AppendText($"{DateTime.Now}: {message}\n");
            
            StatusTextBox.ScrollToEnd();
        }

        public async void Assemble_Click(object sender, RoutedEventArgs e)
        {

            ShowLoading(); // 顯示 Loading
            await Task.Delay(100); // 讓 UI 有時間更新 Loading 畫面

            string[] requiredPaths = { "C:/kioskclientbase", "C:/kioskclientcontent", "C:/kioskclientconfig", "C:/kioskclienthtml" };
            string targetPath = "C:/ITKiosk";

            // 檢查所有目錄是否存在
            foreach (var path in requiredPaths)
            {
                if (!System.IO.Directory.Exists(path))
                {
                    MessageBox.Show($"缺少必要的目錄: {path}", "錯誤", MessageBoxButton.OK, MessageBoxImage.Error);
                    HideLoading(); // 立即隱藏 Loading，避免持續顯示
                    return;
                }
            }

            try
            {
                await Task.Run(() =>
                {
                    // 如果目標目錄不存在，建立目標目錄
                    if (!Directory.Exists(targetPath))
                    {
                        Directory.CreateDirectory(targetPath);
                        Dispatcher.Invoke(() => AppendStatus("目錄 C:/ITKiosk 已成功建立"));
                    }

                    // 複製檔案和資料夾，排除 .vs、.git 和 .gitignore
                    InnerCopy("C:/kioskclientbase", targetPath, exclude: new[] { ".vs", ".git", ".gitignore" },null);
                    InnerCopy("C:/kioskclientconfig", targetPath, exclude: new[] { ".vs", ".git", ".gitignore" }, null);
                    InnerCopy("C:/kioskclienthtml", targetPath, exclude: new[] { ".vs", ".git", ".gitignore" }, null);
                    InnerCopy("C:/kioskclientcontent", targetPath, exclude: new[] { ".vs", ".git", ".gitignore" }, null);
                    SaveUpdateLog(updatedFiles);
                    Dispatcher.Invoke(() => AppendStatus("🚀 複製完成！"));
                });
            }
            catch (Exception ex)
            {
                MessageBox.Show($"執行過程中發生錯誤: {ex.Message}", "錯誤", MessageBoxButton.OK, MessageBoxImage.Error);
            }
            finally
            {
                HideLoading(); // 確保不管發生什麼錯誤，最後都會隱藏 Loading
            }
        }


        private void CopyDirectory(string sourceDir, string destinationDir, string[] exclude)
        {
            // 讀取 config 名稱
            string configNamePath = Path.Combine(AppContext.BaseDirectory, "Config", "last_config.txt");
            if (!File.Exists(configNamePath))
            {
                MessageBox.Show("找不到 last_config.txt，請先指定設定檔");
                return;
            }

            string configName = File.ReadAllText(configNamePath).Trim();
            string jsonPath = Path.Combine(AppContext.BaseDirectory, "Storage", configName);

            if (!File.Exists(jsonPath))
            {
                MessageBox.Show($"找不到設定內容檔案：{jsonPath}");
                return;
            }

            // 讀取 JSON 清單
         
           
            var rawPaths = JsonSerializer.Deserialize<List<string>>(File.ReadAllText(jsonPath));
          
            var allowedSet = new HashSet<string>(rawPaths, StringComparer.OrdinalIgnoreCase);

            // 開始複製
            InnerCopy(sourceDir, destinationDir, exclude, allowedSet);
        }
        private void InnerCopy(string sourceDir, string destinationDir, string[] exclude, HashSet<string> allowedSet)
        {
            if (!Directory.Exists(sourceDir))
                throw new DirectoryNotFoundException($"來源目錄不存在: {sourceDir}");

            if (!Directory.Exists(destinationDir))
                Directory.CreateDirectory(destinationDir);

            // ✅ 第一段：處理該目錄下的檔案
            foreach (var file in Directory.GetFiles(sourceDir))
            {
                string fileName = Path.GetFileName(file); // ✅ 統一小寫比對

                if (ShouldExclude(fileName, exclude)) continue;

                // ❌ 如果檔名在 allowedSet 中，就不要更新（跳過）
                if (allowedSet != null && allowedSet.Contains(fileName.ToLower()))
                {
                    continue;
                }

                string destFile = Path.Combine(destinationDir, fileName);

                try
                {
                    if(allowedSet!=null)
                    {
                        Common.BackupPathWithStructure(destFile);
                    }
                    
                    File.Copy(file, destFile, overwrite: true);
                }
                catch (IOException)
                {
                    try
                    {
                        File.Delete(destFile);
                        File.Copy(file, destFile, overwrite: true);
                    }
                    catch (Exception ex)
                    {
                        // 可以選擇記錄錯誤訊息
                        MessageBox.Show($"複製失敗（已嘗試刪除原始檔案）：{fileName}，錯誤訊息：{ex.Message}");
                        continue;
                    }
                }

                updatedFiles.Add(destFile); // ✅ 強制更新成功才加入
            }

            // ✅ 第二段：進入每個子資料夾遞迴
            foreach (var dir in Directory.GetDirectories(sourceDir))
            {
                if (ShouldExclude(Path.GetFileName(dir), exclude)) continue;

                string destDir = Path.Combine(destinationDir, Path.GetFileName(dir));
                InnerCopy(dir, destDir, exclude, allowedSet); // 🔁 遞迴呼叫
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


        private bool ShouldExclude(string name, string[] exclude)
        {
            foreach (var pattern in exclude)
            {
                if (name.Equals(pattern, StringComparison.OrdinalIgnoreCase))
                {
                    return true;
                }
            }
            return false;
        }

        public async void ALL_Assemble_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                ShowLoading();
                await Task.Delay(100); // 讓 UI 有時間刷新 Loading 畫面

                string[] requiredPaths = { "C:/kioskclientbase", "C:/kioskclientcontent", "C:/kioskclientconfig", "C:/kioskclienthtml" };
                string targetPath = "C:/ITKiosk";
                bool allSucceeded = true;

                Dispatcher.Invoke(() => AppendStatus("準備更新---------------------------"));

                await Task.Run(async () =>
                {
                    foreach (var path in requiredPaths)
                    {
                        if (!System.IO.Directory.Exists(path))
                        {
                            Dispatcher.Invoke(() => AppendStatus($"❌ 缺少必要的目錄: {path}"));
                            allSucceeded = false;
                            continue;
                        }

                        Dispatcher.Invoke(() => AppendStatus($"🔄 開始更新資料夾: {path}"));

                        bool fetch = await gitLibrary.PullAsync(path);
                        Dispatcher.Invoke(() => AppendStatus($"開始抓repo: {fetch}"));

                        bool success = await gitLibrary.PullAsync(path);

                        Dispatcher.Invoke(() =>
                        {
                            if (success)
                            {
                                AppendStatus($"✅ 資料夾更新成功: {path}");
                            }
                            else
                            {
                                AppendStatus($"❌ 資料夾更新失敗: {path}");
                                allSucceeded = false;
                            }
                        });
                    }

                    Dispatcher.Invoke(() =>
                    {
                        if (allSucceeded)
                        {
                            AppendStatus("🎉 所有資料夾已成功同步完成！");
                        }
                        else
                        {
                            AppendStatus("⚠️ 部分資料夾同步失敗，已跳過檔案複製！");
                        }
                    });

                    // **✅ 只有 Git 更新完全成功，才進行檔案複製**
                    if (allSucceeded)
                    {
                        Dispatcher.Invoke(() => AppendStatus("📂 開始複製檔案..."));

                        CopyDirectory("C:/kioskclientbase", targetPath, exclude: new[] { ".vs", ".git", ".gitignore" });
                        CopyDirectory("C:/kioskclienthtml", targetPath, exclude: new[] { ".vs", ".git", ".gitignore" });
                        CopyDirectory("C:/kioskclientcontent", targetPath, exclude: new[] { ".vs", ".git", ".gitignore" });
                        CopyDirectory("C:/kioskclientbase", targetPath, exclude: new[] { ".vs", ".git", ".gitignore" });
                        SaveUpdateLog(updatedFiles);
                        Dispatcher.Invoke(() => AppendStatus("🚀 Kiosk 更新完成！"));
                    }
                });

                HideLoading(); // **確保 Loading 一定會關閉**
            }
            catch (Exception ex)
            {

                AppendStatus("發生錯誤"+ex.Message);
                HideLoading();
            }
          
        }





        public async void Backup_Click(object sender, RoutedEventArgs e)
        {
            ShowLoading(); // 顯示 Loading
            await Task.Delay(100); // 讓 UI 有時間更新 Loading 畫面

            string originkIOSK = "C:/ITKiosk";
            if (!Directory.Exists(originkIOSK))
            {
                MessageBox.Show($"❌ 缺少必要的目錄: {originkIOSK}", "錯誤", MessageBoxButton.OK, MessageBoxImage.Error);
                HideLoading(); // 如果資料夾不存在，隱藏 Loading
                return;
            }

            string date = DateTime.Now.ToString("yyyyMMdd");
            string backupDir = $"C:/ITKiosk_bak_{date}";

            try
            {
                await Task.Run(() =>
                {
                    Directory.CreateDirectory(backupDir);

                    // 執行複製
                    InnerCopy(originkIOSK, backupDir, exclude: new[] { ".vs", ".git", ".gitignore" },null);

                    // 確保 UI 更新在 UI 執行緒
                    Dispatcher.Invoke(() => AppendStatus($"✅ 備份成功: {backupDir}"));
                });
            }
            catch (Exception ex)
            {
                Dispatcher.Invoke(() => MessageBox.Show($"❌ 備份過程中發生錯誤: {ex.Message}", "錯誤", MessageBoxButton.OK, MessageBoxImage.Error));
            }
            finally
            {
                HideLoading(); // **確保無論成功或失敗都隱藏 Loading**
            }
        }



        public async void Modifyconfig_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                string projectRoot = AppContext.BaseDirectory;
                var Kioskid = rigister.GetKiosk();
                string url = "https://kms.fonticket.com/";
                string input = GitPathTextBox.Text.Trim();
                if (input.StartsWith("Url", StringComparison.OrdinalIgnoreCase))
                {
                    var parts = input.Split(' ', 2, StringSplitOptions.RemoveEmptyEntries);
                    if (parts.Length == 2)
                    {
                        url = parts[1];
                        AppendStatus($"✅ 使用自訂網址：{url}");
                    }
                    else
                    {
                        AppendStatus("⚠️ 格式錯誤：請使用 ChangeUrl [你的網址]");
                        MessageBox.Show("請輸入格式為：ChangeUrl https://你的網址", "格式錯誤", MessageBoxButton.OK, MessageBoxImage.Warning);
                        return;
                    }
                }
                string batchFilePath = Path.Combine(projectRoot, "UpdateBat", "StartSetup.bat");
                string filePath = Path.Combine(projectRoot, "UpdateBat", "UpdateConfig.dat");
                AppendStatus("KioskID:"+ Kioskid);
                // **檢查批次檔案是否存在**
                if (!File.Exists(batchFilePath))
                {
                    AppendStatus($"❌ 找不到批次檔: {batchFilePath}");
                    MessageBox.Show($"找不到批次檔: {batchFilePath}", "錯誤", MessageBoxButton.OK, MessageBoxImage.Error);
                    return;
                }

                if (!File.Exists(filePath))
                {
                    AppendStatus($"❌ 找不到設定檔: {filePath}");
                    MessageBox.Show($"找不到設定檔: {filePath}", "錯誤", MessageBoxButton.OK, MessageBoxImage.Error);
                    return;
                }

                ShowLoading();
                await Task.Delay(100); // 讓 UI 有時間刷新 Loading 畫面

                try
                {
                    // **覆寫 updateConfig.dat**
                    File.WriteAllLines(filePath, new string[] { Kioskid, url });
                    AppendStatus("✅ updateConfig.dat 更新成功！");

                    // **執行批次檔 (放入 Task.Run，避免 UI 凍結)**
                    await Task.Run(() =>
                    {
                        try
                        {
                            ProcessStartInfo psi = new ProcessStartInfo
                            {
                                FileName = batchFilePath,
                                UseShellExecute = false,
                                WorkingDirectory = Path.GetDirectoryName(batchFilePath) ?? AppContext.BaseDirectory, // 修正可能的 null 值
                                RedirectStandardOutput = true,
                                RedirectStandardError = true,
                                CreateNoWindow = true
                            };

                            using (Process process = Process.Start(psi))
                            {
                                if (process == null) throw new Exception("❌ 批次檔無法啟動");

                                string output = process.StandardOutput.ReadToEnd();
                                string error = process.StandardError.ReadToEnd();
                                process.WaitForExit();

                                // **確保 UI 存在時才更新**
                                if (Application.Current != null)
                                {
                                    Dispatcher.Invoke(() =>
                                    {
                                        AppendStatus("✅ 批次執行完成");
                                        if (!string.IsNullOrWhiteSpace(error))
                                        {
                                            AppendStatus("❌ 批次檔錯誤:\n" + error);
                                            MessageBox.Show("批次檔錯誤:\n" + error, "錯誤", MessageBoxButton.OK, MessageBoxImage.Error);
                                        }
                                    });
                                }
                            }
                        }
                        catch (Exception ex)
                        {
                            // **確保異常不會讓 Task 崩潰**
                            if (Application.Current != null)
                            {
                                Dispatcher.Invoke(() =>
                                {
                                    AppendStatus($"❌ 執行批次檔時發生錯誤: {ex.Message}");
                                    MessageBox.Show($"執行批次檔時發生錯誤:\n{ex.Message}", "錯誤", MessageBoxButton.OK, MessageBoxImage.Error);
                                });
                            }
                        }
                    });
                }
                catch (Exception ex)
                {
                    AppendStatus($"❌ 發生錯誤: {ex.Message}");
                }
            }
            finally
            {
                HideLoading(); // **確保 Loading 一定會關閉**
            }
        }
        private void GitPathTextBox_TextChanged(object sender, TextChangedEventArgs e)
        {
            string input = GitPathTextBox.Text.ToLower().Trim(); // 🔍 轉小寫 & 移除前後空格
    //        Dictionary<string, string> keywordToButtonText = new Dictionary<string, string>
    //{
    //    { "52653760", "42760988" },
    //            {"update","Kiosk" },
               
      
    //};

    //        // 🔍 找出符合的關鍵字
    //        string matchedKeyword = keywordToButtonText.Keys.FirstOrDefault(k => input.Contains(k));
             if (GitPathTextBox.Text == "ff") this.Close();
            if (GitPathTextBox.Text == "Lock")
            {
                NavigationService.NavigateTo<LoginWindow>(this);
            }
            if (GitPathTextBox.Text == "Save")
            {
               // NavigationService.NavigateTo<Storage>(this);
            }
           
           
            //if (matchedKeyword != null)
            //{
                
            //    AssembleKiosk.Visibility = Visibility.Visible; 
            //}
            //else
            //{
            //    AssembleKiosk.Visibility = Visibility.Collapsed; 
            //}
        }

        private void GitPathTextBox_KeyDown(object sender, KeyEventArgs e)
        {
            if (e.Key == Key.Enter)
            {
                string input = GitPathTextBox.Text.Trim();
                if (!string.IsNullOrEmpty(input))
                {
                   
                    CommandManager.Execute(input); 
                    GitPathTextBox.Clear();
                }

               
                e.Handled = true;
            }
        }

        private void LoadJsonMenu()
        {
            try
            {
                string storagePath = System.IO.Path.Combine(AppContext.BaseDirectory, "Storage");

                if (!Directory.Exists(storagePath))
                {
                    Directory.CreateDirectory(storagePath);
                }

                var jsonFiles = Directory.GetFiles(storagePath, "*.json")
                                         .Select(System.IO.Path.GetFileName)
                                         .ToList();

                if (jsonFiles.Count == 0)
                {
                    // 加一筆假的「無檔案」用項目，當作資料來源顯示用
                    jsonFiles.Add("-- 尚無儲存檔案 --");
                    JsonSelector.ItemsSource = jsonFiles;
                    JsonSelector.SelectedIndex = 0;
                    JsonSelector.IsEnabled = false; // 不允許選取
                }
                else
                {
                    JsonSelector.ItemsSource = jsonFiles;
                    JsonSelector.SelectedIndex = 0;
                    JsonSelector.IsEnabled = true;
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"載入 JSON 清單失敗：{ex.Message}");
            }
        }


        private void SaveCurrentSelection_Click(object sender, RoutedEventArgs e)
        {
            string selectedConfig = JsonSelector.SelectedItem?.ToString()?.Trim();

            if (string.IsNullOrEmpty(selectedConfig))
            {
                MessageBox.Show("請先從下拉選單選擇一個 Config 名稱");
                return;
            }

            // 儲存到 last_config.txt
            string path = Path.Combine(AppContext.BaseDirectory, "Config", "last_config.txt");
            Directory.CreateDirectory(Path.GetDirectoryName(path));
            File.WriteAllText(path, selectedConfig);

            // 更新畫面上的顯示
            CurrentJsonLabel.Text = $"目前使用設定：{selectedConfig}";
            MessageBox.Show($"已設定為目前使用的 Config：{selectedConfig}", "儲存成功", MessageBoxButton.OK, MessageBoxImage.Information);
        }
        private void SaveLastUsedConfigName(string fileName)
        {
            string path = Path.Combine(AppContext.BaseDirectory, "Config", "last_config.txt");
            File.WriteAllText(path, fileName);
        }

        private string LoadLastUsedConfigName()
        {
            string path = Path.Combine(AppContext.BaseDirectory, "Config", "last_config.txt");
            return File.Exists(path) ? File.ReadAllText(path) : null;
        }
        private void LoadCurrentConfigName()
        {
            string path = Path.Combine(AppContext.BaseDirectory, "Config", "last_config.txt");
            if (File.Exists(path))
            {
                string fileName = File.ReadAllText(path);
                CurrentJsonLabel.Text = $"目前使用設定：{fileName}";
            }
            else
            {
                CurrentJsonLabel.Text = "目前尚未載入儲存檔案";
            }
        }

        private void SaveUpdateLog(List<string> updatedFiles)
        {
            string historyFolder = Path.Combine(AppContext.BaseDirectory, "History");
            if (!Directory.Exists(historyFolder))
                Directory.CreateDirectory(historyFolder);

            // 用日期時間當檔名
            string logFileName = $"update_{DateTime.Now:yyyyMMdd_HHmmss}.log";
            string logPath = Path.Combine(historyFolder, logFileName);

            File.WriteAllLines(logPath, updatedFiles);
        }

        private void History_Search(object sender, RoutedEventArgs e)
        {
            NavigationService.NavigateTo<History>(this);
        }




    }
}
