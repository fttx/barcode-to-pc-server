!macro customInstall
${If} ${RunningX64}
  File /oname=$PLUGINSDIR\Bonjour64.msi "${BUILD_RESOURCES_DIR}\Bonjour64.msi"
  ExecWait '"msiexec" /i "$PLUGINSDIR\Bonjour64.msi" /passive'   
${Else}
  File /oname=$PLUGINSDIR\Bonjour64.msi "${BUILD_RESOURCES_DIR}\Bonjour.msi"
  ExecWait '"msiexec" /i "$PLUGINSDIR\Bonjour.msi" /passive'
${EndIf}  
!macroend