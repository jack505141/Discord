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
using Fleck;
using WebSocketSharp;
using System.Net;
using System.Net.Sockets;
using System.Text.Json;

namespace WpfApp1
{
    /// <summary>
    /// MultiConect.xaml 的互動邏輯
    /// </summary>
    public partial class MultiConect : Window
    {
        private ConnectionManager _connectionManager;
        private string _localIP = "";

        public MultiConect()
        {
            InitializeComponent();
            _connectionManager = ConnectionManager.Instance;
            SubscribeToEvents();
            InitializeUI();
        }

        private void SubscribeToEvents()
        {
            // 訂閱全域連線管理器的事件
            _connectionManager.OnLog += (message, level) =>
            {
                Dispatcher.Invoke(() =>
                {
                    AddLog(message, (MessageLogLevel)(int)level);
                });
            };

            _connectionManager.OnServerStatusChanged += (isRunning) =>
            {
                Dispatcher.Invoke(() =>
                {
                    UpdateServerUI(isRunning);
                });
            };

            _connectionManager.OnClientStatusChanged += (isConnected) =>
            {
                Dispatcher.Invoke(() =>
                {
                    UpdateClientUI(isConnected);
                });
            };

            _connectionManager.OnClientCountChanged += (count) =>
            {
                Dispatcher.Invoke(() =>
                {
                    txtConnectedClients.Text = $"已連線客戶端: {count}";
                });
            };
        }

        private void InitializeUI()
        {
            // 取得並顯示本機IP
            _localIP = GetLocalIPAddress();
            txtServerIP.Text = $"本機IP: {_localIP} ← 其他電腦請用此IP連線";
            
            // 設定輸入框的 Placeholder 效果
            SetPlaceholder();
            
            AddLog("系統初始化完成", MessageLogLevel.Info);
            AddLog("💡 提示：連線會保持在背景運行，即使關閉此視窗", MessageLogLevel.Info);
            AddLog($"💡 本機IP: {_localIP}", MessageLogLevel.Info);
            AddLog("💡 跨電腦連線：請點「跨機連線」按鈕自動填入本機IP", MessageLogLevel.Info);

            // 同步當前連線狀態
            UpdateServerUI(_connectionManager.IsServerRunning);
            UpdateClientUI(_connectionManager.IsClientConnected);
            txtConnectedClients.Text = $"已連線客戶端: {_connectionManager.ConnectedClientCount}";
        }

        private void SetPlaceholder()
        {
            // 設定初始 Placeholder 樣式
            if (string.IsNullOrEmpty(txtServerAddress.Text))
            {
                txtServerAddress.Text = "輸入伺服器IP，例如：192.168.1.100";
                txtServerAddress.Foreground = new SolidColorBrush(Colors.Gray);
                txtServerAddress.FontStyle = FontStyles.Italic;
            }
        }

        private void TxtServerAddress_GotFocus(object sender, RoutedEventArgs e)
        {
            // 當焦點進入時，清除 Placeholder
            if (txtServerAddress.Text == "輸入伺服器IP，例如：192.168.1.100")
            {
                txtServerAddress.Text = "";
                txtServerAddress.Foreground = new SolidColorBrush(Colors.Black);
                txtServerAddress.FontStyle = FontStyles.Normal;
            }
        }

        #region 快速測試功能

        private void BtnOpenNewWindow_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                var newWindow = new MultiConect();
                newWindow.Show();
                AddLog("✅ 已開啟新視窗", MessageLogLevel.Success);
            }
            catch (Exception ex)
            {
                AddLog($"開啟新視窗失敗: {ex.Message}", MessageLogLevel.Error);
                MessageBox.Show($"開啟新視窗失敗: {ex.Message}", "錯誤", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private void BtnQuickTestLocal_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                txtServerAddress.Text = "127.0.0.1";
                txtServerAddress.Foreground = new SolidColorBrush(Colors.Black);
                txtServerAddress.FontStyle = FontStyles.Normal;
                txtClientPort.Text = "5000";
                AddLog("✅ 已設定為本機測試模式 (127.0.0.1:5000)", MessageLogLevel.Success);
                AddLog("💡 適用於同一台電腦的多視窗測試", MessageLogLevel.Info);
            }
            catch (Exception ex)
            {
                AddLog($"設定失敗: {ex.Message}", MessageLogLevel.Error);
            }
        }

        private void BtnUseLocalIP_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                if (string.IsNullOrEmpty(_localIP) || _localIP.Contains("錯誤") || _localIP.Contains("無法"))
                {
                    MessageBox.Show("無法取得本機IP位址，請手動輸入", "提示", MessageBoxButton.OK, MessageBoxImage.Warning);
                    return;
                }

                txtServerAddress.Text = _localIP;
                txtServerAddress.Foreground = new SolidColorBrush(Colors.Black);
                txtServerAddress.FontStyle = FontStyles.Normal;
                txtClientPort.Text = "5000";
                
                AddLog($"✅ 已自動填入本機IP: {_localIP}", MessageLogLevel.Success);
                AddLog("💡 適用於其他電腦連線到本機", MessageLogLevel.Info);
                AddLog("💡 如果要連線到其他電腦，請改為輸入對方的IP位址", MessageLogLevel.Info);
            }
            catch (Exception ex)
            {
                AddLog($"設定失敗: {ex.Message}", MessageLogLevel.Error);
            }
        }

        private void Back_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                AddLog("🏠 返回主視窗", MessageLogLevel.Info);
                AddLog("💡 提示：連線會保持在背景運行", MessageLogLevel.Info);
                
                // 使用 NavigationService 導航到主視窗
                NavigationService.NavigateTo<MainWindow>(this);
            }
            catch (Exception ex)
            {
                AddLog($"返回主視窗失敗: {ex.Message}", MessageLogLevel.Error);
                MessageBox.Show($"返回主視窗失敗: {ex.Message}", "錯誤", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        #endregion

        #region 伺服器功能

        private void BtnStartServer_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                if (!int.TryParse(txtServerPort.Text, out int port) || port < 1024 || port > 65535)
                {
                    MessageBox.Show("請輸入有效的埠號 (1024-65535)", "錯誤", MessageBoxButton.OK, MessageBoxImage.Error);
                    return;
                }

                if (_connectionManager.StartServer(port))
                {
                    AddLog($"💡 伺服器在背景運行，關閉此視窗不會停止伺服器", MessageLogLevel.Info);
                    AddLog($"💡 其他電腦請連線到: {_localIP}:{port}", MessageLogLevel.Info);
                    AddLog($"💡 回到主視窗的操作會自動同步到所有客戶端", MessageLogLevel.Info);
                }
            }
            catch (Exception ex)
            {
                AddLog($"啟動伺服器失敗: {ex.Message}", MessageLogLevel.Error);
                MessageBox.Show($"啟動伺服器失敗: {ex.Message}", "錯誤", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private void BtnStopServer_Click(object sender, RoutedEventArgs e)
        {
            _connectionManager.StopServer();
        }

        private void UpdateServerUI(bool isRunning)
        {
            if (isRunning)
            {
                btnStartServer.IsEnabled = false;
                btnStopServer.IsEnabled = true;
                btnSendTest.IsEnabled = true;
                txtServerPort.IsEnabled = false;
                txtServerStatus.Text = $"伺服器狀態: 運行中 (埠號: {_connectionManager.ServerPort})";
                txtServerStatus.Foreground = new SolidColorBrush(Colors.Green);
            }
            else
            {
                btnStartServer.IsEnabled = true;
                btnStopServer.IsEnabled = false;
                if (!_connectionManager.IsClientConnected)
                {
                    btnSendTest.IsEnabled = false;
                }
                txtServerPort.IsEnabled = true;
                txtServerStatus.Text = "伺服器狀態: 已停止";
                txtServerStatus.Foreground = new SolidColorBrush(Colors.Red);
            }
        }

        #endregion

        #region 客戶端功能

        private void BtnConnect_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                string serverAddress = txtServerAddress.Text.Trim();
                
                // 檢查是否為 Placeholder 文字
                if (string.IsNullOrEmpty(serverAddress) || 
                    serverAddress == "輸入伺服器IP，例如：192.168.1.100")
                {
                    MessageBox.Show("請輸入伺服器位址\n\n跨電腦連線請輸入實際IP（例如：192.168.1.100）\n同機測試請點擊「同機測試」按鈕", 
                        "提示", MessageBoxButton.OK, MessageBoxImage.Information);
                    return;
                }

                if (!int.TryParse(txtClientPort.Text, out int port) || port < 1024 || port > 65535)
                {
                    MessageBox.Show("請輸入有效的埠號 (1024-65535)", "錯誤", MessageBoxButton.OK, MessageBoxImage.Error);
                    return;
                }

                if (_connectionManager.ConnectToServer(serverAddress, port))
                {
                    AddLog($"💡 客戶端連線在背景保持，關閉此視窗不會斷線", MessageLogLevel.Info);
                    AddLog($"💡 主視窗的操作會接收同步", MessageLogLevel.Info);
                }
            }
            catch (Exception ex)
            {
                AddLog($"連線失敗: {ex.Message}", MessageLogLevel.Error);
                MessageBox.Show($"連線失敗: {ex.Message}\n\n請確認：\n1. 伺服器IP位址正確\n2. 伺服器已啟動\n3. 防火牆已開放", 
                    "連線錯誤", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private void BtnDisconnect_Click(object sender, RoutedEventArgs e)
        {
            _connectionManager.DisconnectFromServer();
        }

        private void UpdateClientUI(bool isConnected)
        {
            if (isConnected)
            {
                btnConnect.IsEnabled = false;
                btnDisconnect.IsEnabled = true;
                btnSendTest.IsEnabled = true;
                txtServerAddress.IsEnabled = false;
                txtClientPort.IsEnabled = false;
                txtClientStatus.Text = $"客戶端狀態: 已連線";
                txtClientStatus.Foreground = new SolidColorBrush(Colors.Green);
            }
            else
            {
                btnConnect.IsEnabled = true;
                btnDisconnect.IsEnabled = false;
                if (!_connectionManager.IsServerRunning)
                {
                    btnSendTest.IsEnabled = false;
                }
                txtServerAddress.IsEnabled = true;
                txtClientPort.IsEnabled = true;
                txtClientStatus.Text = $"客戶端狀態: 未連線";
                txtClientStatus.Foreground = new SolidColorBrush(Colors.Red);
            }
        }

        private void BtnSendTest_Click(object sender, RoutedEventArgs e)
        {
            _connectionManager.SendTestMessage(txtTestMessage.Text);
        }

        #endregion

        #region 輔助功能

        private enum MessageLogLevel
        {
            Info,
            Success,
            Warning,
            Error
        }

        private void AddLog(string message, MessageLogLevel level = MessageLogLevel.Info)
        {
            string timestamp = DateTime.Now.ToString("HH:mm:ss");
            string prefix = level switch
            {
                MessageLogLevel.Success => "[✓]",
                MessageLogLevel.Warning => "[!]",
                MessageLogLevel.Error => "[✗]",
                _ => "[i]"
            };

            string logMessage = $"{timestamp} {prefix} {message}\n";
            txtLog.AppendText(logMessage);
            txtLog.ScrollToEnd();
        }

        private void BtnClearLog_Click(object sender, RoutedEventArgs e)
        {
            txtLog.Clear();
            AddLog("日誌已清除", MessageLogLevel.Info);
        }

        private string GetLocalIPAddress()
        {
            try
            {
                var host = Dns.GetHostEntry(Dns.GetHostName());
                foreach (var ip in host.AddressList)
                {
                    if (ip.AddressFamily == AddressFamily.InterNetwork)
                    {
                        return ip.ToString();
                    }
                }
                return "無法取得IP位址";
            }
            catch (Exception ex)
            {
                return $"錯誤: {ex.Message}";
            }
        }

        protected override void OnClosing(System.ComponentModel.CancelEventArgs e)
        {
            // 取消訂閱事件，但不關閉連線
            // 連線會繼續在背景運行
            AddLog("視窗關閉，但連線保持運行", MessageLogLevel.Info);
            base.OnClosing(e);
        }

        #endregion
    }
}
