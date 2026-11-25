@echo off
chcp 65001 >nul
title 作品集 · 一键上线
set PY=C:\Users\ROG\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\python\python.exe
set CF=D:\FISHcunchu\_tools\cloudflared.exe
set SITE=D:\FISHcunchu\妈妈作品集网站

echo.
echo ==========================================
echo   郭慧冉 · 作品集  一键上线
echo ==========================================
echo.

if not exist "%PY%" (
  echo [错误] 找不到 Python：%PY%
  pause & exit /b 1
)
if not exist "%CF%" (
  echo [错误] 找不到 cloudflared：%CF%
  pause & exit /b 1
)

echo [1/3] 启动本地服务（端口 8080）...
start "作品集-本地服务" /min "%PY%" -m http.server 8080 --directory "%SITE%" --bind 127.0.0.1
timeout /t 3 >nul

echo [2/3] 建立公网链接...
echo     下面这一行 https://xxxx.trycloudflare.com 就是分享链接
echo     关掉这个窗口 = 链接失效
echo.
"%CF%" tunnel --url http://127.0.0.1:8080 --no-autoupdate

echo.
echo [3/3] 隧道已关闭。
echo     如果要彻底停止，请把标题为「作品集-本地服务」的窗口也关掉。
pause
