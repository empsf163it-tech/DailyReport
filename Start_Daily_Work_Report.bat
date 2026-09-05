@echo off
:: ============================================================================
:: Daily Work Report & WhatsApp Generator - Desktop Launcher
:: ============================================================================
echo Starting Daily Work Report Desktop App...

IF EXIST "DailyWorkReport.exe" (
    start "" "DailyWorkReport.exe"
) ELSE IF EXIST "dist\DailyWorkReport.exe" (
    start "" "dist\DailyWorkReport.exe"
) ELSE (
    start "" "index.html"
)
exit
