appcmd unlock config -section:system.webServer/httpErrors
appcmd unlock config -section:system.webServer/security/authentication/anonymousAuthentication
appcmd unlock config -section:system.webServer/security/authentication/windowsAuthentication

<remove name="WebDAVModule" />

<modules>
    <remove name="WebDAVModule" />
</modules>

  unlock with appcmd unlock config -section:system.webServer/modules (and /handlers)
