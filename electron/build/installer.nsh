!macro customInstall
${If} ${RunningX64}
  ExecWait '"msiexec" /i "${BUILD_RESOURCES_DIR}\Bonjour64.msi" /passive'   
${Else}
  ExecWait '"msiexec" /i "${BUILD_RESOURCES_DIR}\Bonjour.msi" /passive'   
${EndIf}  
!macroend