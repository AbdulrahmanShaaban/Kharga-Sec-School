@echo off
REM Run script for Kharga Secondary School Portal (Windows)
REM Starts the Next.js development server

cd /d "%~dp0"

if "%WORKTREE_PATH%" neq "" (
    cd /d "%WORKTREE_PATH%"
)

npm run dev