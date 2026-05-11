@echo off
:: Create a shortcut in the user's home directory
echo @echo off > %USERPROFILE%\groove.bat
echo cd /d "C:\Users\puneet\OneDrive\Desktop\songs" >> %USERPROFILE%\groove.bat
echo start_groove.bat >> %USERPROFILE%\groove.bat

echo [SUCCESS] Global command 'groove' created!
echo.
echo Now you can just type 'groove' from ANY folder in CMD.
echo Try it now: Close this CMD, open a new one, and type 'groove'
pause
