!macro customInstall
${If} ${RunningX64}
  File /oname=$PLUGINSDIR\Bonjour64.msi "${BUILD_RESOURCES_DIR}\Bonjour64.msi"
  ExecWait '"msiexec" /i "$PLUGINSDIR\Bonjour64.msi" /passive'
${Else}
  File /oname=$PLUGINSDIR\Bonjour.msi "${BUILD_RESOURCES_DIR}\Bonjour.msi"
  ExecWait '"msiexec" /i "$PLUGINSDIR\Bonjour.msi" /passive'
${EndIf}
!macroend

!macro customUnInstall
${ifNot} ${isUpdated}
  ; MessageBox MB_YESNO "We're sorry to see you leave. Would you mind take a 30 seconds survey, so that we can improve Barcode to PC?" IDOK true IDIGNORE false
  ; true:
    ; DetailPrint "Showing survey"
    ExecShell "open" "https://barcodetopc.com/were-sorry-to-see-you-leave/"
  ; false:
    ; DetailPrint "Skipping survey"
${endIf}
!macroend