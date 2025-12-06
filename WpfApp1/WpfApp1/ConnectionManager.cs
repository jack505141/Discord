using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Windows;
using Fleck;
using WebSocketSharp;

namespace WpfApp1
{
    /// <summary>
    /// 全域 WebSocket 連線管理器
    /// 管理伺服器和客戶端連線，不受視窗生命週期影響
    /// </summary>
    public class ConnectionManager
    {
        private static ConnectionManager? _instance;
        private static readonly object _lock = new object();

        // 伺服器相關
        private WebSocketServer? _server;
        private List<IWebSocketConnection> _connectedClients = new List<IWebSocketConnection>();
        private bool _isServerRunning = false;
        private int _serverPort = 5000;

        // 客戶端相關
        private WebSocketSharp.WebSocket? _client;
        private bool _isClientConnected = false;
        private string _clientId = "";

        // 事件：用於通知 UI 更新
        public event Action<string, LogLevel>? OnLog;
        public event Action<int>? OnClientCountChanged;
        public event Action<bool>? OnServerStatusChanged;
        public event Action<bool>? OnClientStatusChanged;
        public event Action<string>? OnActionReceived; // 接收到需要執行的動作

        public enum LogLevel
        {
            Info,
            Success,
            Warning,
            Error
        }

        // 單例模式
        public static ConnectionManager Instance
        {
            get
            {
                if (_instance == null)
                {
                    lock (_lock)
                    {
                        if (_instance == null)
                        {
                            _instance = new ConnectionManager();
                        }
                    }
                }
                return _instance;
            }
        }

        private ConnectionManager()
        {
            FleckLog.Level = Fleck.LogLevel.Error;
        }

        #region 屬性

        public bool IsServerRunning => _isServerRunning;
        public bool IsClientConnected => _isClientConnected;
        public int ConnectedClientCount => _connectedClients.Count;
        public int ServerPort => _serverPort;

        #endregion

        #region 伺服器功能

        public bool StartServer(int port)
        {
            try
            {
                if (_isServerRunning)
                {
                    Log("伺服器已在運行中", LogLevel.Warning);
                    return false;
                }

                _serverPort = port;
                _server = new WebSocketServer($"ws://0.0.0.0:{port}");

                _server.Start(socket =>
                {
                    socket.OnOpen = () =>
                    {
                        Application.Current?.Dispatcher.Invoke(() =>
                        {
                            _connectedClients.Add(socket);
                            Log($"客戶端已連線: {socket.ConnectionInfo.ClientIpAddress}:{socket.ConnectionInfo.ClientPort}", LogLevel.Success);
                            OnClientCountChanged?.Invoke(_connectedClients.Count);
                        });
                    };

                    socket.OnClose = () =>
                    {
                        Application.Current?.Dispatcher.Invoke(() =>
                        {
                            _connectedClients.Remove(socket);
                            Log($"客戶端已斷線: {socket.ConnectionInfo.ClientIpAddress}:{socket.ConnectionInfo.ClientPort}", LogLevel.Warning);
                            OnClientCountChanged?.Invoke(_connectedClients.Count);
                        });
                    };

                    socket.OnMessage = message =>
                    {
                        Application.Current?.Dispatcher.Invoke(() =>
                        {
                            HandleServerMessage(socket, message);
                        });
                    };

                    socket.OnError = error =>
                    {
                        Application.Current?.Dispatcher.Invoke(() =>
                        {
                            Log($"伺服器錯誤: {error.Message}", LogLevel.Error);
                        });
                    };
                });

                _isServerRunning = true;
                Log($"伺服器已啟動，監聽埠號: {port}", LogLevel.Success);
                OnServerStatusChanged?.Invoke(true);
                return true;
            }
            catch (Exception ex)
            {
                Log($"啟動伺服器失敗: {ex.Message}", LogLevel.Error);
                return false;
            }
        }

        public void StopServer()
        {
            try
            {
                if (_server != null)
                {
                    var shutdownMessage = JsonSerializer.Serialize(new
                    {
                        type = "server_shutdown",
                        timestamp = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss")
                    });

                    foreach (var client in _connectedClients.ToList())
                    {
                        try
                        {
                            client.Send(shutdownMessage);
                            client.Close();
                        }
                        catch { }
                    }

                    _connectedClients.Clear();
                    _server.Dispose();
                    _server = null;
                }

                _isServerRunning = false;
                Log("伺服器已停止", LogLevel.Warning);
                OnServerStatusChanged?.Invoke(false);
                OnClientCountChanged?.Invoke(0);
            }
            catch (Exception ex)
            {
                Log($"停止伺服器時發生錯誤: {ex.Message}", LogLevel.Error);
            }
        }

        private void HandleServerMessage(IWebSocketConnection socket, string message)
        {
            try
            {
                var jsonDoc = JsonDocument.Parse(message);
                var root = jsonDoc.RootElement;
                var messageType = root.GetProperty("type").GetString();

                switch (messageType)
                {
                    case "auth":
                        var clientId = root.GetProperty("clientId").GetString();
                        Log($"客戶端驗證: {clientId}", LogLevel.Success);

                        var response = JsonSerializer.Serialize(new
                        {
                            type = "auth_response",
                            status = "success",
                            clientId = clientId,
                            timestamp = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss")
                        });
                        socket.Send(response);
                        break;

                    case "action":
                    case "test":
                        // 廣播給其他客戶端
                        BroadcastMessage(message, socket);
                        break;

                    default:
                        Log($"未知的訊息類型: {messageType}", LogLevel.Warning);
                        break;
                }
            }
            catch (Exception ex)
            {
                Log($"處理訊息時發生錯誤: {ex.Message}", LogLevel.Error);
            }
        }

        #endregion

        #region 客戶端功能

        public bool ConnectToServer(string address, int port)
        {
            try
            {
                if (_isClientConnected)
                {
                    Log("已經連線到伺服器", LogLevel.Warning);
                    return false;
                }

                string url = $"ws://{address}:{port}";
                Log($"正在連線到伺服器: {url}", LogLevel.Info);

                _client = new WebSocketSharp.WebSocket(url);
                _clientId = $"Client-{Environment.MachineName}-{DateTime.Now:HHmmss}";

                _client.OnOpen += (sender, e) =>
                {
                    Application.Current?.Dispatcher.Invoke(() =>
                    {
                        _isClientConnected = true;
                        Log($"成功連線到伺服器: {url}", LogLevel.Success);
                        OnClientStatusChanged?.Invoke(true);

                        // 發送認證訊息
                        var authMessage = JsonSerializer.Serialize(new
                        {
                            type = "auth",
                            clientId = _clientId,
                            timestamp = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss")
                        });
                        _client.Send(authMessage);
                    });
                };

                _client.OnMessage += (sender, e) =>
                {
                    Application.Current?.Dispatcher.Invoke(() =>
                    {
                        HandleClientMessage(e.Data);
                    });
                };

                _client.OnError += (sender, e) =>
                {
                    Application.Current?.Dispatcher.Invoke(() =>
                    {
                        Log($"客戶端錯誤: {e.Message}", LogLevel.Error);
                    });
                };

                _client.OnClose += (sender, e) =>
                {
                    Application.Current?.Dispatcher.Invoke(() =>
                    {
                        _isClientConnected = false;
                        Log($"已從伺服器斷線", LogLevel.Warning);
                        OnClientStatusChanged?.Invoke(false);
                    });
                };

                _client.Connect();
                return true;
            }
            catch (Exception ex)
            {
                Log($"連線失敗: {ex.Message}", LogLevel.Error);
                return false;
            }
        }

        public void DisconnectFromServer()
        {
            try
            {
                if (_client != null && _isClientConnected)
                {
                    _client.Close();
                    _client = null;
                    Log("已主動斷開與伺服器的連線", LogLevel.Info);
                }
            }
            catch (Exception ex)
            {
                Log($"斷線時發生錯誤: {ex.Message}", LogLevel.Error);
            }
        }

        private void HandleClientMessage(string message)
        {
            try
            {
                var jsonDoc = JsonDocument.Parse(message);
                var root = jsonDoc.RootElement;
                var messageType = root.GetProperty("type").GetString();

                Log($"收到訊息 [{messageType}]", LogLevel.Info);

                switch (messageType)
                {
                    case "auth_response":
                        Log("身份驗證成功", LogLevel.Success);
                        break;

                    case "action":
                        // 通知需要執行動作
                        OnActionReceived?.Invoke(message);
                        break;

                    case "test":
                        var content = root.GetProperty("content").GetString();
                        Log($"收到測試訊息: {content}", LogLevel.Info);
                        break;

                    case "server_shutdown":
                        Log("伺服器即將關閉", LogLevel.Warning);
                        break;

                    default:
                        Log($"未知的訊息類型: {messageType}", LogLevel.Warning);
                        break;
                }
            }
            catch (Exception ex)
            {
                Log($"處理伺服器訊息時發生錯誤: {ex.Message}", LogLevel.Error);
            }
        }

        #endregion

        #region 訊息發送功能

        /// <summary>
        /// 廣播動作給所有客戶端（從伺服器）
        /// </summary>
        public void BroadcastAction(string actionName, object? payload = null)
        {
            if (!_isServerRunning)
            {
                Log("伺服器未運行，無法廣播", LogLevel.Warning);
                return;
            }

            var message = JsonSerializer.Serialize(new
            {
                type = "action",
                actionName = actionName,
                payload = payload,
                timestamp = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss"),
                sender = "Server"
            });

            BroadcastMessage(message);
        }

        /// <summary>
        /// 發送動作到伺服器（從客戶端）
        /// </summary>
        public void SendAction(string actionName, object? payload = null)
        {
            if (!_isClientConnected || _client == null)
            {
                Log("未連線到伺服器，無法發送", LogLevel.Warning);
                return;
            }

            var message = JsonSerializer.Serialize(new
            {
                type = "action",
                actionName = actionName,
                payload = payload,
                timestamp = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss"),
                clientId = _clientId
            });

            _client.Send(message);
            Log($"已發送動作: {actionName}", LogLevel.Success);
        }

        /// <summary>
        /// 發送測試訊息
        /// </summary>
        public void SendTestMessage(string content)
        {
            var message = JsonSerializer.Serialize(new
            {
                type = "test",
                content = content,
                clientId = _isServerRunning ? "Server" : _clientId,
                timestamp = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss")
            });

            if (_isClientConnected && _client != null)
            {
                _client.Send(message);
                Log($"已發送測試訊息: {content}", LogLevel.Success);
            }
            else if (_isServerRunning)
            {
                BroadcastMessage(message);
                Log($"伺服器廣播測試訊息: {content}", LogLevel.Success);
            }
        }

        private void BroadcastMessage(string message, IWebSocketConnection? sender = null)
        {
            int broadcastCount = 0;
            foreach (var client in _connectedClients.ToList())
            {
                if (client != sender && client.IsAvailable)
                {
                    try
                    {
                        client.Send(message);
                        broadcastCount++;
                    }
                    catch (Exception ex)
                    {
                        Log($"廣播訊息失敗: {ex.Message}", LogLevel.Error);
                    }
                }
            }
            
            if (broadcastCount > 0)
            {
                Log($"訊息已廣播給 {broadcastCount} 個客戶端", LogLevel.Info);
            }
        }

        #endregion

        #region 輔助功能

        private void Log(string message, LogLevel level)
        {
            OnLog?.Invoke(message, level);
        }

        public void Cleanup()
        {
            StopServer();
            DisconnectFromServer();
        }

        #endregion
    }
}
