@echo off
@echo [SetKioskIdAndIP]
@echo please wait...




REM ----- Get date & time of current moment -----
for /f %%a in ('C:\Windows\System32\WindowsPowershell\v1.0\powershell -Command "Get-Date -format yyyy-MM-dd_HH:mm:ss.fff"') do set datetime=%%a
for /f "tokens=1,2 delims=_" %%a in ("%datetime%") do (
	set todayDate=%%a
	set todayTime=%%b
)
for /f "tokens=1-3 delims=-" %%a in ("%todayDate%") do (
	set logName=%%a%%b%%c
)
for /f "tokens=1-2 delims=_" %%a in ("%datetime%") do (
	set timeStamp=[%%a %%b]
)

REM ----- Write log -----
echo %timeStamp% SetKioskIdAndIP START >> .\log\%logName%.log



REM ----- Unicode(UTF-8) -----
chcp 65001



REM ----- SetITKioskConfig -----
setlocal enabledelayedexpansion
set count=0
for /f %%x in (.\updateConfig.dat) do (
	set /a count+=1
	set var[!count!]=%%x
)
set KioskId=%var[1]%
set apiBackEnd=%var[2]%




REM ----- Edit registry  -----

REM ----- Replace "kioskId" with new KioskId -----
reg add "HKEY_CURRENT_USER\SOFTWARE\KioskPlafotm" /v "kioskId" /d %KioskId% /t  REG_SZ /f


@echo please wait...


REM ----- Find replace string in XML -----

REM ----- App.config -----
for /f "delims=:" %%a in ('findstr /n /c:"<add key=\"MiddleWare_Host\" value=\"MiddleWareHost\"/>" .\setupFilePrototype\AppPrototype.config') do set MiddleWareHost_A=%%a


REM ----- KioskCommand.exe.config -----
for /f "delims=:" %%a in ('findstr /n /c:"<add key=\"MiddleWare_Host\" value=\"MiddleWareHost\"/>" .\setupFilePrototype\KioskCommandPrototype.exe.config') do set MiddleWareHost_B=%%a


REM ----- KioskLauncher.exe.config -----
for /f "delims=:" %%a in ('findstr /n /c:"<add key=\"MiddleWare_Host\" value=\"MiddleWareHost\"/>" .\setupFilePrototype\KioskLauncherPrototype.exe.config') do set MiddleWareHost_C=%%a


REM ----- KioskMonitor.exe.config -----
for /f "delims=:" %%a in ('findstr /n /c:"<add key=\"MiddleWare_Host\" value=\"MiddleWareHost\"/>" .\setupFilePrototype\KioskMonitorPrototype.exe.config') do set MiddleWareHost_D=%%a


REM ----- ServiceSetupPrototype.xml -----
for /f "delims=:" %%a in ('findstr /n /c:"<kiosk_register_id>KioskRegisterId</kiosk_register_id>" .\setupFilePrototype\ServiceSetupPrototype.xml') do set KioskRegisterId=%%a
for /f "delims=:" %%a in ('findstr /n /c:"<ftp_ip>FtpIp</ftp_ip>" .\setupFilePrototype\ServiceSetupPrototype.xml') do set FtpIp_A=%%a
for /f "delims=:" %%a in ('findstr /n /c:"<getjob>FtpIp/API/GetSyncFileList.ashx</getjob>" .\setupFilePrototype\ServiceSetupPrototype.xml') do set FtpIp_B=%%a
for /f "delims=:" %%a in ('findstr /n /c:"<updatejob>FtpIp/API/UpdateSyncFileList.ashx</updatejob>" .\setupFilePrototype\ServiceSetupPrototype.xml') do set FtpIp_C=%%a


REM ----- SignalRLib.dll.config -----
for /f "delims=:" %%a in ('findstr /n /c:"<add key=\"MiddleWare_Host\" value=\"MiddleWareHost\"/>" .\setupFilePrototype\SignalRLibPrototype.dll.config') do set MiddleWareHost_E=%%a




REM ----- Create file -----

REM ----- App.config -----
(for /f "tokens=1* delims=:" %%a in ('findstr /n "^" .\setupFilePrototype\AppPrototype.config') do (
   set "line=%%b"
   setlocal EnableDelayedExpansion
   if "%%a" equ "%MiddleWareHost_A%" (
      set "line=!line:MiddleWareHost=%apiBackEnd%!"
   )
   echo(!line!
   endlocal
)) > .\App.config

REM ----- KioskCommand.exe.config -----
(for /f "tokens=1* delims=:" %%a in ('findstr /n "^" .\setupFilePrototype\KioskCommandPrototype.exe.config') do (
   set "line=%%b"
   setlocal EnableDelayedExpansion
   if "%%a" equ "%MiddleWareHost_B%" (
      set "line=!line:MiddleWareHost=%apiBackEnd%!"
   )
   echo(!line!
   endlocal
)) > .\KioskCommand.exe.config


REM ----- KioskLauncher.exe.config -----
(for /f "tokens=1* delims=:" %%a in ('findstr /n "^" .\setupFilePrototype\KioskLauncherPrototype.exe.config') do (
   set "line=%%b"
   setlocal EnableDelayedExpansion
   if "%%a" equ "%MiddleWareHost_C%" (
      set "line=!line:MiddleWareHost=%apiBackEnd%!"
   )
   echo(!line!
   endlocal
)) > .\KioskLauncher.exe.config


REM ----- KioskMonitor.exe.config -----
(for /f "tokens=1* delims=:" %%a in ('findstr /n "^" .\setupFilePrototype\KioskMonitorPrototype.exe.config') do (
   set "line=%%b"
   setlocal EnableDelayedExpansion
   if "%%a" equ "%MiddleWareHost_D%" (
      set "line=!line:MiddleWareHost=%apiBackEnd%!"
   )
   echo(!line!
   endlocal
)) > .\KioskMonitor.exe.config


REM ----- ServiceSetup.xml -----
(for /f "tokens=1* delims=:" %%a in ('findstr /n "^" .\setupFilePrototype\ServiceSetupPrototype.xml') do (
   set "line=%%b"
   setlocal EnableDelayedExpansion
   if "%%a" equ "%KioskRegisterId%" (
      set "line=!line:KioskRegisterId=%KioskId%!"
   )
   if "%%a" equ "%FtpIp_A%" (
      set "line=!line:FtpIp=%apiBackEnd%!"
   )
   if "%%a" equ "%FtpIp_B%" (
      set "line=!line:FtpIp/=%apiBackEnd%!"
   )
   if "%%a" equ "%FtpIp_C%" (
      set "line=!line:FtpIp/=%apiBackEnd%!"
   )
   echo(!line!
   endlocal
)) > .\ServiceSetup.xml


REM ----- SignalRLib.dll.config -----
(for /f "tokens=1* delims=:" %%a in ('findstr /n "^" .\setupFilePrototype\SignalRLibPrototype.dll.config') do (
   set "line=%%b"
   setlocal EnableDelayedExpansion
   if "%%a" equ "%MiddleWareHost_E%" (
      set "line=!line:MiddleWareHost=%apiBackEnd%!"
   )
   echo(!line!
   endlocal
)) > .\SignalRLib.dll.config




REM ----- Create XML -----
move /y .\App.config C:\ITKiosk\App.config
move /y .\KioskCommand.exe.config C:\ITKiosk\KioskCommand.exe.config
move /y .\KioskLauncher.exe.config C:\ITKiosk\KioskLauncher.exe.config
move /y .\KioskMonitor.exe.config C:\ITKiosk\KioskMonitor.exe.config
move /y .\ServiceSetup.xml C:\ITKiosk\ServiceSetup.xml
move /y .\SignalRLib.dll.config C:\ITKiosk\SignalRLib.dll.config




REM ----- ANSI/OEM - Traditional Chinese Big5 -----
chcp 950


REM ----- Write log -----
echo %timeStamp% SetKioskIdAndIP END -- [KioskId: %KioskId%, apiBackEnd: %apiBackEnd%] >> .\log\%logName%.log


@echo please wait...
@echo ---
@echo KioskId: %KioskId%
@echo apiBackEnd: %apiBackEnd%
@echo ---
@echo KioskId與IP已更新完成，稍後將自動結束此更新程序...
timeout /t 5