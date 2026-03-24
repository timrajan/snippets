# Get ALL settings of other app pool
& "$env:windir\system32\inetsrv\appcmd" list apppool "OtherAppPoolName" /config:*

# Get ALL settings of your app pool
& "$env:windir\system32\inetsrv\appcmd" list apppool "YourAppPoolName" /config:*
