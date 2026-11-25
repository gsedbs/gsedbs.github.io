@echo off
chcp 65001 >nul
title 作品集 · 处理新视频（压缩 + 加水印 + 出封面）
setlocal enabledelayedexpansion

set SITE=D:\FISHcunchu\妈妈作品集网站
set FF=D:\FISHcunchu\_tools\ffmpeg.exe
set WM=%SITE%\assets\img\watermark.png

echo.
echo ==========================================
echo   把新视频拖到这个窗口上，回车即可
echo   会自动：压到 720p + 右下角加「南歌子」水印 + 出封面
echo ==========================================
echo.

if "%~1"=="" (
  set /p FILE=请把 mp4 拖进来后按回车：
) else (
  set FILE=%~1
)

if not exist "!FILE!" (
  echo [错误] 文件不存在：!FILE!
  pause & exit /b 1
)

if not exist "%FF%" (
  echo [提示] 没找到自带的 ffmpeg，改用系统 PATH 里的 ffmpeg
  set FF=ffmpeg
)

set /p SLUG=给它起个英文名（如 shenyang-beat）：

echo.
echo [1/2] 正在压缩并加水印...
"%FF%" -y -i "!FILE!" -i "%WM%" -filter_complex "[0:v]scale=-2:720[bg];[1:v]scale=200:-1[wm];[bg][wm]overlay=W-w-40:H-h-14" -c:v libx264 -preset veryfast -crf 26 -c:a aac -b:a 96k -movflags +faststart "%SITE%\assets\videos\!SLUG!.mp4"

if not exist "%SITE%\assets\videos\!SLUG!.mp4" (
  echo [错误] 压缩失败，检查一下视频文件。
  pause & exit /b 1
)

echo [2/2] 正在生成封面...
"%FF%" -y -ss 3 -i "%SITE%\assets\videos\!SLUG!.mp4" -frames:v 1 -q:v 4 "%SITE%\assets\img\works\!SLUG!.jpg"

echo.
echo ==========================================
echo   做好了，现在打开 assets\data\content.js
echo   在 works 里加一条（复制下面这段，改标题和分类）：
echo.
echo     {
echo       id: "!SLUG!",
echo       title: "在这里写作品名",
echo       category: "卡点剪辑",
echo       year: "2026",
echo       image: "assets/img/works/!SLUG!.jpg",
echo       video: "assets/videos/!SLUG!.mp4",
echo       summary: "一句话说明",
echo       detail: ["剪辑 / 调色"]
echo     },
echo.
echo   保存后刷新网页就能看到，线上链接也同步更新。
echo ==========================================
pause
