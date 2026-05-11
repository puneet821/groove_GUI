@echo off
title GROOVECMD Loader
echo  [SYSTEM] Starting GROOVECMD Proxy Server...
start /b python server.py
timeout /t 2 >nul

echo  [SYSTEM] Opening GROOVECMD in Terminal Mode...
:: This opens Chrome in a clean "App" window (no tabs/address bar)
start chrome --app=http://localhost:3030 --window-size=900,700 --user-data-dir="%temp%\groovecmd_session"

echo  [SUCCESS] GROOVECMD is now running.
echo  [INFO] Close this window to keep the server running, or press Ctrl+C to stop.
pause
