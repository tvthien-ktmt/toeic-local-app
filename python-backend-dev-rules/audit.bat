@echo off
setlocal
if exist "C:\Program Files\Git\bin\bash.exe" (
    "C:\Program Files\Git\bin\bash.exe" "%~dp0audit-rules.sh" "%~dp0..\backend\app"
) else (
    bash "%~dp0audit-rules.sh" "%~dp0..\backend\app"
)
endlocal
