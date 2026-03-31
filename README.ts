\<system.webServer>
  <aspNetCore processPath="dotnet" arguments=".\YourApp.dll">
    <environmentVariables>
      <environmentVariable name="HTTPS_PROXY" value="http://proxyname:port" />
      <environmentVariable name="HTTP_PROXY" value="http://proxyname:port" />
    </environmentVariables>
  </aspNetCore>
</system.webServer>
