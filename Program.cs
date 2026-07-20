Press Win+R → taskschd.msc → Enter
Right panel → Create Task (not "Basic Task" — the full one gives you more options)
General tab: name it CopySuccessRows; select Run whether user is logged on or not; tick Run with highest privileges isn't needed for this, leave it off
Triggers tab: New → Begin the task: On a schedule → Daily, start time = now. Then tick Repeat task every: 5 minutes and set for a duration of: Indefinitely → OK
Actions tab: New → Action: Start a program

Program/script: powershell.exe
Add arguments: -ExecutionPolicy Bypass -File C:\jobs\MoveSuccessRows.ps1


Settings tab: tick Run task as soon as possible after a scheduled start is missed (covers reboots); set If the task is already running: Do not start a new instance — this one matters, it prevents overlapping runs if one execution ever runs long
OK → enter credentials if prompted
