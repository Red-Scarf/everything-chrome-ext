#!/usr/bin/env pwsh
<#
.SYNOPSIS
  Everything Chrome Extension - PowerShell 快速测试脚本
.DESCRIPTION
  此脚本用于快速启动开发环境和验证扩展
.EXAMPLE
  .\start-dev.ps1
#>

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Everything Chrome Extension" -ForegroundColor Cyan
Write-Host "  快速测试启动脚本" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查 npm 是否已安装
try {
    $npmVersion = npm --version
    Write-Host "[✓] npm 版本: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "[✗] npm 未找到！" -ForegroundColor Red
    Write-Host "    请先安装 Node.js: https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "    按 Enter 退出"
    exit 1
}

# 检查项目根目录
if (-not (Test-Path "package.json")) {
    Write-Host "[✗] 找不到 package.json！" -ForegroundColor Red
    Write-Host "    请确保在项目根目录运行此脚本" -ForegroundColor Yellow
    Read-Host "    按 Enter 退出"
    exit 1
}

Write-Host ""

# 检查 node_modules
if (-not (Test-Path "node_modules")) {
    Write-Host "[*] 正在安装依赖..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[✗] 依赖安装失败！" -ForegroundColor Red
        Read-Host "    按 Enter 退出"
        exit 1
    }
    Write-Host "[✓] 依赖安装成功" -ForegroundColor Green
} else {
    Write-Host "[✓] 依赖已存在" -ForegroundColor Green
}

Write-Host ""
Write-Host "[*] 即将启动开发服务器..." -ForegroundColor Yellow
Write-Host ""

Write-Host "接下来的操作：" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. 等待下方看到 " -NoNewline
Write-Host '"Listening on"' -ForegroundColor Yellow -NoNewline
Write-Host " 消息"
Write-Host "2. 打开 Chrome 扩展管理页面"
Write-Host "   地址栏输入：" -NoNewline
Write-Host "chrome://extensions" -ForegroundColor Yellow
Write-Host "3. 启用 " -NoNewline
Write-Host '"开发者模式"' -ForegroundColor Yellow -NoNewline
Write-Host "（右上角开关）"
Write-Host "4. 点击 " -NoNewline
Write-Host '"加载未打包的扩展程序"' -ForegroundColor Yellow
Write-Host "5. 选择项目中的 " -NoNewline
Write-Host '".plasmo"' -ForegroundColor Yellow -NoNewline
Write-Host " 文件夹"
Write-Host "6. 打开网页，右键选中文本，应该看到菜单"
Write-Host "   菜单项："
Write-Host "   " -NoNewline
Write-Host '"Search with Everything"' -ForegroundColor Yellow
Write-Host ""

Write-Host "按任意键继续启动开发服务器..." -ForegroundColor Cyan
$null = Read-Host ""

Write-Host ""
Write-Host "[*] 启动开发服务器..." -ForegroundColor Yellow
Write-Host ""

npm run dev

Read-Host "按 Enter 退出"
