Set oShell = CreateObject("WScript.Shell")
oShell.CurrentDirectory = "C:\Users\davi_\OneDrive\Área de Trabalho\Posts app Luiza"
oShell.Run """C:\Program Files\nodejs\node.exe"" scripts\dashboard.js", 0, False
