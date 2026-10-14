@echo off
chcp 65001 >nul
cd /d "%~dp0"
where node >nul 2>&1
if %errorlevel% equ 0 (
  node scripts\serve.mjs
) else (
  if exist "%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" (
    "%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" scripts\serve.mjs
  ) else (
    echo 请先安装 Node.js 20.19 或更高版本，再运行本文件。
  )
)
pause
