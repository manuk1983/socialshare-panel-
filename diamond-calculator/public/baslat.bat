@echo off
REM Diamonds Carat — yerel sunucu (SI Jewels / socialshare-panel degil)
cd /d "%~dp0"
echo Diamonds Carat -^> http://localhost:5180
echo Durdurmak icin Ctrl+C
python -m http.server 5180
pause
