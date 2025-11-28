# WPF 主從同步系統（Host/Client）

> 目的：給 AI（或 Copilot）作為輸入，產生一個完整的 WPF C# 專案（Server + Client），實作多人連線、即時同步（主機驅動，其他節點同步主機動作）。

---

## 一、系統需求（Summary）

- 平台：.NET 7 或 .NET 6（請註明）
- UI：WPF (desktop)
- 通訊協定：WebSocket（主要）
- 架構：一台 **主機（Server / Host）**，多台 **客戶端（Client）**。主機廣播操作事件給所有客戶端；客戶端僅被動接收並套用。
- 支援網路環境：同一內網或跨網路（透過 Public IP、Port Forwarding、或 Tailscale/VPN、或 Cloudflare Tunnel)
- 安全性：Token 驗證、訊息簽章（選擇性）
- 日誌紀錄、重連機制、錯誤處理

---

## 二、交付物（要 AI 幫你產生）

1. Visual Studio Solution（Server、Client 各一個專案）
2. Server: WebSocket server 的完整實作（可使用 Fleck 或 WebSocketSharp 或 native System.Net.WebSockets + Kestrel）
3. Client: WPF UI + WebSocket client 的完整實作
4. README.md：如何本機測試、如何啟用 Port Forward 或 Tailscale、如何打包
5. Unit Tests（至少對訊息序列化、核心同步邏輯的測試）
6. 範例訊息格式與 Log

---

## 三、網路與部署指引（放進 README）

### 1) 同一內網
- 主機啟動 Server，監聽 `0.0.0.0:5000`（或可設定的 port）
- 客戶端用主機的內網 IPv4 連線（ex. `192.168.1.100:5000`）

### 2) 主機有 Public IP
- 開放防火牆 inbound port（例：5000），程式 Listen `0.0.0.0`。
- 如果在 NAT 後方，設定 Router Port Forwarding：外部 port -> 主機內部 IP + port。

### 3) 主機沒有 Public IP -> 推薦：Tailscale（或 ZeroTier / OpenVPN）
- 在主機與每個客戶端安裝 Tailscale，取得 Tailscale IP（例如 `100.x.x.x`）。
- 客戶端使用 Tailscale IP 連線，像在同一 LAN。

### 4) 可選：Cloudflare Tunnel / Ngrok（當無法改 Router）
- 在主機執行 Tunnel client，取得可公開存取的 URL（或 wss endpoint）。

---

## 四、協定 / 訊息格式（建議 JSON）

- 所有訊息用 UTF-8 encoded JSON
- 類型欄位 `type` 主控協定行為（例如 `heartbeat`, `action`, `state_sync`, `auth`）

範例：

```json
{
  "type": "auth",
  "token": "<JWT or shared token>",
  "clientId": "client-01"
}
```

```json
{
  "type": "action",
  "actionId": "move-123",
  "timestamp": "2025-11-27T08:00:00Z",
  "payload": {
    "cmd": "OpenWindow",
    "args": { "windowId": "win1", "title": "Hello" }
  }
}
```

```json
{
  "type": "state_sync",
  "state": { /* 可序列化的整個 app state snapshot */ }
}
```

---

## 五、Server 詳細需求（功能清單）

- 啟動 WebSocket Server 並接受多重連線
- 驗證連線（Token）
- 維護連線清單（clientId -> socket）
- 接收主機端內部 UI 操作（假設主機 UI 會把操作轉成 action 並送入 server）
- 廣播 action 給所有已通過驗證的 client（或只給 subset，視需求）
- 支援 `heartbeat` 與掉線檢測
- 日誌（每個 action 的時間、來源、是否成功）
- 提供 REST API（選用）來查詢當前 clients 或下發指令

---

## 六、Client 詳細需求（功能清單）

- 啟動時向 Server 連線並完成驗證
- 接收 `action` / `state_sync` 訊息並在 UI 執行相對應操作
- 接收 `state_sync` 並完整覆蓋或合併當前狀態
- 當與主機失去連線時，嘗試自動重連（exponential backoff）
- 可手動觸發重新同步（從 server 請求最新 snapshot）
- 紀錄本地 log（錯誤/警告/資訊）

---

## 七、建議的 C# 技術選型（給 AI）

- Server: `Fleck` 或 `WebSocketSharp`（簡單）或 `ASP.NET Core + WebSockets`（可擴充）
- Serialization: `System.Text.Json` 或 `Newtonsoft.Json`
- Logging: `Serilog` 或 `NLog`
- DI: `Microsoft.Extensions.DependencyInjection`
- Unit Test: `xUnit` 或 `NUnit`

---

## 八、範例程式碼（給 AI 參考）

### Server（簡單 Fleck 範例）

```csharp
// Server.cs  (示範用)
using Fleck;
using System.Text.Json;

public class HostServer
{
    private WebSocketServer _server;
    private List<IWebSocketConnection> _sockets = new List<IWebSocketConnection>();

    public void Start(int port = 5000)
    {
        _server = new WebSocketServer($"ws://0.0.0.0:{port}");
        _server.Start(socket =>
        {
            socket.OnOpen = () => { _sockets.Add(socket); };
            socket.OnClose = () => { _sockets.Remove(socket); };
            socket.OnMessage = msg => HandleMessage(socket, msg);
        });
    }

    private void HandleMessage(IWebSocketConnection socket, string msg)
    {
        var doc = JsonSerializer.Deserialize<JsonElement>(msg);
        var type = doc.GetProperty("type").GetString();
        if (type == "auth") { /* 驗證 */ }
        if (type == "action")
        {
            // 廣播給所有 client
            foreach (var s in _sockets)
            {
                if (s != socket) s.Send(msg);
            }
        }
    }
}
```

### Client（WPF 使用 WebSocketSharp 範例）

```csharp
// ClientWs.cs
using WebSocketSharp;
using System.Text.Json;

public class ClientWs
{
    private WebSocket _ws;
    public void Connect(string url, string token)
    {
        _ws = new WebSocket(url);
        _ws.OnMessage += (s, e) => OnMessage(e.Data);
        _ws.Connect();
        var auth = JsonSerializer.Serialize(new { type = "auth", token = token, clientId = "client-01" });
        _ws.Send(auth);
    }

    private void OnMessage(string data)
    {
        var doc = JsonSerializer.Deserialize<JsonElement>(data);
        var type = doc.GetProperty("type").GetString();
        if (type == "action")
        {
            // 將 action 轉回 UI 執行（Dispatcher.Invoke）
        }
    }
}
```

---

## 九、安全性與驗證（建議）

- 使用 Shared Token 或 JWT 驗證連線
- 對重要操作做簽章或 server-side 授權檢查（避免 client 直接下不可授權的操作）
- 若使用公網，建議：使用 TLS（wss://）或把 WebSocket 放在反向代理下（Nginx + TLS）

---

## 十、測試流程（步驟）

1. 本機：啟動 Server (localhost)，啟動一個 Client (localhost) 測試連線、廣播
2. 內網：在兩台機器上啟動，使用內網 IP 互連
3. 跨網路：若主機有 Public IP，從外網 client 測試連線
4. Tailscale：安裝 Tailscale 到各機並使用 Tailscale IP 測試
5. 測試斷線重連、訊息順序（是否有丟失）

---

## 十一、給 AI 的明確 Prompt（範例）

> 請幫我產生一個完整的 Visual Studio Solution，包含：
>
> - Server（.NET 7 Console 或 ASP.NET Core）：WebSocket Server，監聽可配置 port (預設5000)，支援多個 client、token 驗證、心跳與廣播機制，並把 log 存檔。
> - Client（WPF .NET 7）：包含基本 UI（連線設定、連線狀態、Log 視窗）、WebSocket Client（自動重連、驗證）、可接收 action 並在 UI 觸發模擬對應操作。
> - 使用 System.Text.Json 序列化訊息，訊息格式請遵照上方的 `type` 設計。
> - 提供 README.md 指示：如何在同內網測試、如何設定 Router Port Forward、如何用 Tailscale 測試。
> - 提供 Unit Tests（xUnit）：測試訊息序列化與核心同步邏輯。
> - 給出打包與部屬建議。

---

## 十二、交付格式

- 一個 `zip` 或 GitHub repository 結構：
```
/WpfSyncSolution
  /HostServer
  /WpfClient
  /tests
  README.md
```

---

## 十三、備註（可選功能）

- 支援 partial updates（只下送 delta）
- 支援多人編輯衝突處理（若需要雙向編輯）
- 加入 UI 的操作錄影/回放功能

---

## 十四、如需我調整

如果你要我把這份 MD 轉成 README.md 或 直接幫你產生完整的範例程式碼，我可以直接生成 Server 與 Client 的完整原始碼檔案。


---

*文件結束*