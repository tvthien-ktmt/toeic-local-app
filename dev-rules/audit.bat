@echo off
setlocal
cd /d "%~dp0.."
set GIT_BASH="C:\Program Files\Git\bin\bash.exe"

if exist %GIT_BASH% (
    %GIT_BASH% dev-rules/audit-rules.sh frontend/src --config AGENTS.md
) else (
    bash dev-rules/audit-rules.sh frontend/src --config AGENTS.md
)
