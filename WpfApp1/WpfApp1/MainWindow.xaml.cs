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
        private List<string> droppedFilePaths = new();
        Rigister rigister = new Rigister();
        private List<string> updatedFiles = new();
        private ConnectionManager _connectionManager;

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
            
            // 初始化連線管理器
            _connectionManager = ConnectionManager.Instance;
            SubscribeToConnectionEvents();
            
            LoadCurrentConfigName();
            LoadJsonMenu();
            TryLoadDroppedFiles();
        }

        private void SubscribeToConnectionEvents()
        {
            _connectionManager.OnServerStatusChanged += (isRunning) =>
            {
                Dispatcher.Invoke(() => UpdateConnectionStatus());
            };

            _connectionManager.OnClientStatusChanged += (isConnected) =>
            {
                Dispatcher.Invoke(() => UpdateConnectionStatus());
            };

            _connectionManager.OnActionReceived += (message) =>
            {
                Dispatcher.Invoke(() => HandleReceivedAction(message));
            };

            UpdateConnectionStatus();
        }

        private void UpdateConnectionStatus()
        {
            if (_connectionManager.IsServerRunning)
            {
                txtConnectionStatus.Text = $"🟢 伺服器運行中 ({_connectionManager.ConnectedClientCount} 個客戶端)";
                txtConnectionStatus.Foreground = new SolidColorBrush(Colors.Green);
            }
            else if (_connectionManager.IsClientConnected)
            {
                txtConnectionStatus.Text = "🟢 已連線到伺服器";
                txtConnectionStatus.Foreground = new SolidColorBrush(Colors.Green);
            }
            else
            {
                txtConnectionStatus.Text = "🔴 未連線";
                txtConnectionStatus.Foreground = new SolidColorBrush(Colors.Red);
            }
        }

        private void BtnOpenMultiConnect_Click(object sender, RoutedEventArgs e)
        {
            var multiConnectWindow = new MultiConect();
            multiConnectWindow.Show();
        }

        private void HandleReceivedAction(string message)
        {
            try
            {
                var jsonDoc = System.Text.Json.JsonDocument.Parse(message);
                var root = jsonDoc.RootElement;
                var actionName = root.GetProperty("actionName").GetString();
                
                AppendStatus($"🔄 收到同步動作: {actionName}");

                switch (actionName)
                {
                    case "UpdateGit":
                        AppendStatus("⚡ 執行同步動作: 更新Git");
                        UpdateGit_Click(null, null);
                        break;

                    case "AssembleKiosk":
                        AppendStatus("⚡ 執行同步動作: 組裝Kiosk");
                        Assemble_Click(null, null);
                        break;

                    case "ALL_Assemble":
                        AppendStatus("⚡ 執行同步動作: 一鍵更新");
                        ALL_Assemble_Click(null, null);
                        break;

                    case "Backup":
                        AppendStatus("⚡ 執行同步動作: 備份Kiosk");
                        Backup_Click(null, null);
                        break;

                    case "ModifyConfig":
                        AppendStatus("⚡ 執行同步動作: 更改Config");
                        Modifyconfig_Click(null, null);
                        break;

                    default:
                        AppendStatus($"⚠️ 未知的同步動作: {actionName}");
                        break;
                }
            }
            catch (Exception ex)
            {
                AppendStatus($"❌ 處理同步動作時發生錯誤: {ex.Message}");
            }
        }

        private void BroadcastAction(string actionName, object? payload = null)
        {
            if (chkAutoSync.IsChecked == true)
            {
                if (_connectionManager.IsServerRunning)
                {
                    _connectionManager.BroadcastAction(actionName, payload);
                    AppendStatus($"📡 已廣播動作: {actionName}");
                }
                else if (_connectionManager.IsClientConnected)
                {
                    _connectionManager.SendAction(actionName, payload);
                    AppendStatus($"📡 已發送動作: {actionName}");
                }
            }
        }

        protected override void OnClosed(EventArgs e)
        {
            instance = null; // **視窗關閉時，釋放單例**
            base.OnClosed(e);
        }

        public void InstallGit_Click(object sender, RoutedEventArgs e)
        {
            BroadcastAction("InstallGit");
            NavigationService.NavigateTo<Instal>(this);
        }

        public async void UpdateGit_Click(object sender, RoutedEventArgs e)
        {
            if (GitPathTextBox.Text == "") return;
            BroadcastAction("UpdateGit", new { path = GitPathTextBox.Text });
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
            BroadcastAction("Checkout");
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
            BroadcastAction("AssembleKiosk");
            ShowLoading();
            await Task.Delay(100);
            string[] requiredPaths;
            if (droppedFilePaths.Count == 0)
            {
                requiredPaths = new string[]
                {
                    "C:/kioskclientbase",
                    "C:/kioskclientcontent",
                    "C:/kioskclientconfig",
                    "C:/kioskclienthtml"
                };
            }
            else
            {
                requiredPaths = droppedFilePaths.ToArray();
            }
            string targetPath = "C:/ITKiosk";

            foreach (var path in requiredPaths)
            {
                if (!System.IO.Directory.Exists(path))
                {
                    MessageBox.Show($"缺少必要的目錄: {path}", "錯誤", MessageBoxButton.OK, MessageBoxImage.Error);
                    HideLoading();
                    return;
                }
            }

            try
            {
                await Task.Run(() =>
                {
                    if (!Directory.Exists(targetPath))
                    {
                        Directory.CreateDirectory(targetPath);
                        Dispatcher.Invoke(() => AppendStatus("目錄 C:/ITKiosk 已成功建立"));
                    }

                    if (droppedFilePaths.Count > 0)
                    {
                        Dispatcher.Invoke(() => AppendStatus("目前使用config的設定"));
                        foreach (var sourcePath in droppedFilePaths)
                        {
                            if (Directory.Exists(sourcePath))
                            {
                                Dispatcher.Invoke(() => AppendStatus("抓取資料來源:" + sourcePath));
                                InnerCopy(sourcePath, targetPath, exclude: new[] { ".vs", ".git", ".gitignore" }, null);
                            }
                            else
                            {
                                Dispatcher.Invoke(() => AppendStatus("無此目錄:" + sourcePath));
                            }
                        }
                    }
                    else
                    {
                        InnerCopy("C:/kioskclientbase", targetPath, exclude: new[] { ".vs", ".git", ".gitignore" }, null);
                        InnerCopy("C:/kioskclientconfig", targetPath, exclude: new[] { ".vs", ".git", ".gitignore" }, null);
                        InnerCopy("C:/kioskclienthtml", targetPath, exclude: new[] { ".vs", ".git", ".gitignore" }, null);
                        InnerCopy("C:/kioskclientcontent", targetPath, exclude: new[] { ".vs", ".git", ".gitignore" }, null);
                    }
                  
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
                HideLoading();
            }
        }

        public async void ALL_Assemble_Click(object sender, RoutedEventArgs e)
        {
            BroadcastAction("ALL_Assemble");
            try
            {
                ShowLoading();
                await Task.Delay(100);
                string[] requiredPaths = { };
                if (droppedFilePaths.Count == 0)
                {
                    requiredPaths = new string[]
                    {
                        "C:/kioskclientbase",
                        "C:/kioskclientcontent",
                        "C:/kioskclientconfig",
                        "C:/kioskclienthtml"
                    };
                }
                else
                {
                    requiredPaths = droppedFilePaths.ToArray();
                }
                   
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

                HideLoading();
            }
            catch (Exception ex)
            {
                AppendStatus("發生錯誤" + ex.Message);
                HideLoading();
            }
        }

        public async void Backup_Click(object sender, RoutedEventArgs e)
        {
            BroadcastAction("Backup");
            ShowLoading();
            await Task.Delay(100);

            string originkIOSK = "C:/ITKiosk";
            if (!Directory.Exists(originkIOSK))
            {
                MessageBox.Show($"❌ 缺少必要的目錄: {originkIOSK}", "錯誤", MessageBoxButton.OK, MessageBoxImage.Error);
                HideLoading();
                return;
            }

            string date = DateTime.Now.ToString("yyyyMMdd");
            string backupDir = $"C:/ITKiosk_bak_{date}";

            try
            {
                await Task.Run(() =>
                {
                    Directory.CreateDirectory(backupDir);
                    InnerCopy(originkIOSK, backupDir, exclude: new[] { ".vs", ".git", ".gitignore" }, null);
                    Dispatcher.Invoke(() => AppendStatus($"✅ 備份成功: {backupDir}"));
                });
            }
            catch (Exception ex)
            {
                Dispatcher.Invoke(() => MessageBox.Show($"❌ 備份過程中發生錯誤: {ex.Message}", "錯誤", MessageBoxButton.OK, MessageBoxImage.Error));
            }
            finally
            {
                HideLoading();
            }
        }

        public async void Modifyconfig_Click(object sender, RoutedEventArgs e)
        {
            BroadcastAction("ModifyConfig");
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
                AppendStatus("KioskID:" + Kioskid);

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
                await Task.Delay(100);

                try
                {
                    File.WriteAllLines(filePath, new string[] { Kioskid, url });
                    AppendStatus("✅ updateConfig.dat 更新成功！");

                    await Task.Run(() =>
                    {
                        try
                        {
                            ProcessStartInfo psi = new ProcessStartInfo
                            {
                                FileName = batchFilePath,
                                UseShellExecute = false,
                                WorkingDirectory = Path.GetDirectoryName(batchFilePath) ?? AppContext.BaseDirectory,
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
                HideLoading();
            }
        }

        private void TryLoadDroppedFiles()
        {
            string configPath = Path.Combine(AppContext.BaseDirectory, "assembleconfig", "dropped_files.txt");

            if (File.Exists(configPath))
            {
                var lines = File.ReadAllLines(configPath).Where(line => !string.IsNullOrWhiteSpace(line)).ToList();

                if (lines.Any())
                {
                    droppedFilePaths = lines;
                    AppendStatus($"🔧 偵測到 {lines.Count} 個檔案路徑，將使用 config 指定的資料來源");
                    return;
                }
            }
        }

        private void CopyDirectory(string sourceDir, string destinationDir, string[] exclude)
        {
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

            var rawPaths = JsonSerializer.Deserialize<List<string>>(File.ReadAllText(jsonPath));
            var allowedSet = new HashSet<string>(rawPaths, StringComparer.OrdinalIgnoreCase);

            InnerCopy(sourceDir, destinationDir, exclude, allowedSet);
        }

        private void InnerCopy(string sourceDir, string destinationDir, string[] exclude, HashSet<string> allowedSet)
        {
            if (!Directory.Exists(sourceDir))
                throw new DirectoryNotFoundException($"來源目錄不存在: {sourceDir}");

            if (!Directory.Exists(destinationDir))
                Directory.CreateDirectory(destinationDir);

            foreach (var file in Directory.GetFiles(sourceDir))
            {
                string fileName = Path.GetFileName(file);

                if (ShouldExclude(fileName, exclude)) continue;

                if (allowedSet != null && allowedSet.Contains(fileName.ToLower()))
                {
                    continue;
                }

                string destFile = Path.Combine(destinationDir, fileName);

                try
                {
                    if (allowedSet != null)
                    {
                        Common.BackupPathWithStructure(destFile);
                    }
                    
                    File.Copy(file, destFile, overwrite: true);
                    updatedFiles.Add(destFile);
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
                        MessageBox.Show($"複製失敗（已嘗試刪除原始檔案）：{fileName}，錯誤訊息：{ex.Message}");
                        continue;
                    }
                }
            }

            foreach (var dir in Directory.GetDirectories(sourceDir))
            {
                if (ShouldExclude(Path.GetFileName(dir), exclude)) continue;

                string destDir = Path.Combine(destinationDir, Path.GetFileName(dir));
                InnerCopy(dir, destDir, exclude, allowedSet);
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

        private void GitPathTextBox_TextChanged(object sender, TextChangedEventArgs e)
        {
            string input = GitPathTextBox.Text.ToLower().Trim();
            if (GitPathTextBox.Text == "ff") this.Close();
            if (GitPathTextBox.Text == "Lock")
            {
                NavigationService.NavigateTo<LoginWindow>(this);
            }
            if (GitPathTextBox.Text == "Save")
            {
               // NavigationService.NavigateTo<Storage>(this);
            }
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
                    jsonFiles.Add("-- 尚無儲存檔案 --");
                    JsonSelector.ItemsSource = jsonFiles;
                    JsonSelector.SelectedIndex = 0;
                    JsonSelector.IsEnabled = false;
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

            string path = Path.Combine(AppContext.BaseDirectory, "Config", "last_config.txt");
            Directory.CreateDirectory(Path.GetDirectoryName(path));
            File.WriteAllText(path, selectedConfig);

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
