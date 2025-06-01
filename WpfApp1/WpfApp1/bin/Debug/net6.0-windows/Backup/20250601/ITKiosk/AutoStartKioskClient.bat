@echo off

ping -n 16 127.0.0.1>nul
start "C:\ITKiosk\startKioskClient.bat" "C:\ITKiosk\startKioskClient.bat"

exit