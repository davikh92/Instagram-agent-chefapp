$root = Split-Path -Parent $MyInvocation.MyCommand.Path | Split-Path -Parent
Set-Location $root
Start-Process -FilePath "C:\Program Files\nodejs\node.exe" `
  -ArgumentList "scripts\dashboard.js" `
  -WorkingDirectory $root `
  -WindowStyle Hidden
