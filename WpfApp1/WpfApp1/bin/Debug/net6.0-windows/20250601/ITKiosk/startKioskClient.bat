@echo off

tasklist|find /i "KioskClient.exe" && exit
ping -n 3 127.0.0.1>nul

tasklist|find /i "KioskClient.exe" && exit
tasklist|find /i "KioskClient.exe" && start /wait "C:\ITKiosk\Tool\KillMainApModule.exe" "C:\ITKiosk\Tool\KillMainApModule.exe"

set FILEPATH=C:\ITKiosk\DeviceExternal\config\Thermal\setting.json
set BACKUPFILEPATH=C:\ITKiosk\DeviceExternal\config\Thermal\setting-BackUp.json

REM 檢查setting.json是否存在
if exist "%FILEPATH%" (
    REM 檢查setting.json的內容是否為空
    for /f %%i in ('type "%FILEPATH%" ^| findstr /r .') do (
        REM 如果存在且不為空，則複製該文件為setting-BackUp.json
        copy "%FILEPATH%" "%BACKUPFILEPATH%"
        goto end
    )
)

REM 如果setting.json不存在或內容為空，檢查setting-BackUp.json是否存在
if exist "%BACKUPFILEPATH%" (
    REM 覆蓋setting.json的內容
    copy /y "%BACKUPFILEPATH%" "%FILEPATH%"
)

:end

start "C:\ITKiosk\KioskClient.exe" "C:\ITKiosk\KioskClient.exe"

exit