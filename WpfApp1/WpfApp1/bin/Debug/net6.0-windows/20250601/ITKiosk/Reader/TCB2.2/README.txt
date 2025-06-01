------------------------------------------------------
Product Name	: 端末機(EDC)與收銀機(ECR)連線程式
Version		: NEXSYS ECRTool-64 Ver2.3-Log
Date		: 2021.01.07
Length		: All length
------------------------------------------------------

[程式說明]：

●此程式用於端末機(EDC)與收銀機(ECR)連線API，程式會讀取InData.dat，然後送給EDC，並將EDC送回來的資料存到OutData.dat。
●此程式傳送的電文長度只要小於2044，一律可以執行。
●ComPort 設定為 COM1 ~ COM9

[環境要求]:

●Windows 64位元 作業系統

[各檔案說明]：

●Config.dat是通訊設定檔。
●ECRTool.exe 為程式執行檔。
●ECRToolDll.dll .DLL檔可由外部程式所呼叫。
●InData.dat是程式要讀取的檔案，會傳送給端末機(EDC)，檔名 "必須" 為"InData.dat"，依照ECR連線規格組相同長度的Data。
●OutData是程式自動產生，其內容是由端末機(EDC)傳送過來的資料，檔名 "會" 是OutData.dat。
●msvcr110.dll、msvcp110.dll這兩個檔案為Microsoft Visual Studio 2012 必要的函式庫。
●以上檔案 "必須" 一同放置在相同目錄下同一資料夾內。
●log_YYYYMMDD.txt為每日送收的記錄儲存，每個日期一個檔案，如不留存需自行砍檔。


[Config.dat 通訊設定檔說明]：

●內容格式順序如下：
 ◎第1列 : ComPort 編號。
 ◎第2列 : TimeOut 秒數。
 ◎第3列 : BaudRate。
 ◎第4列 : ByteSize Parity StopBits。
 ◎第5列 : Retry，通訊錯誤發生時的重試次數。
 ◎第6列 : DelayTimeEnable接收電文的延遲時間開關。(接收一個byte延遲5ms，正常使用預設N)

！注意！以上設定各列要緊鄰，也不能調換順序，
	各列設定的內容也不能有空格，請勿使用有空格名稱的檔案(InData.dat及OutData.dat)。


●Config.dat通訊設定檔範例（一）：
1
120
9600
8N1
3
N

●Config.dat通訊設定檔範例（二）：
1
120
9600
7ES1
3
N

[程式回傳的錯誤碼]:

●下列為無法收到正確的回應碼ECR-API產生之Error code

[Error code]	[Massage]
--------------------------------------

C005		COM Port Error(含開Port失敗，收送時接POS機(電腦)那端掉線
R003		接收電文時, Time out
S008		傳送電文時失敗, 超過重試次數
R008		接收電文時失敗, 超過重試次數
R011		電文長度錯誤

[更新記錄]:
Ver1.1
20160603 - 修改Create Comport的Baud Rate 可設定到115200，原本只收到五碼。

Ver1.3
20160712 - 修正ECR接收EDC回傳資料時，Check LRC錯誤且已達重試次數，沒中止接收及產生錯誤碼R008。

Ver1.4
20160718 - 調整SetCommTimeouts(ReadTotalTimeoutMultiplier、ReadTotalTimeoutConstant、WriteTotalTimeoutConstant)，
	   調整後拉長重送及重試接收的時間間隔，增加開Port關Port及WriteFile前清空buffer，
	   開檔InData.dat先檢核長度，大於2044儲存error OutData資訊。

Ver1.5
20160801 - 優化，Config.dat開一次檔讀完，修改RetryTimes判斷，帶0的話會Error，接收失敗回傳Nak前再清一次Buffer。

Ver2.0
20160803 - 新增功能，將DelayTime做成功能開關，設成Y會在接收時delay 5ms(每個byte)，不需延遲設成N。

Ver2.1
20161118 - 新增COM Port Error代碼，開Port失敗及送收時掉線不繼續執行程式，寫入錯誤代碼到OutData.dat。
	   另外修改144長度Error Code位置在79~82，其他則維持原本77~80。

Ver2.2
20161208 - 修改ComPort接收Data判斷ETX的邏輯，提升穩定度。
20170828 - 加Config DelayTimeEnable說明。
20190509 - 自動產生每日Log記錄。
20190711 - 把system pause移除。

Ver2.3
20210107 - 調整成財經ECR規格，修改API自行產生的通訊回應碼位置。