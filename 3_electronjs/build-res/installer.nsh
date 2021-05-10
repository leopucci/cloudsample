!macro customInstall
WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Run" "PocketCloud" "$INSTDIR\${APP_EXECUTABLE_FILENAME}"
SetRegView 64
WriteRegStr HKCR "cloud" "" "URL:yunpan"
WriteRegStr HKCR "cloud" "URL Protocol" ""
WriteRegStr HKCR "cloud\shell" "" ""
WriteRegStr HKCR "cloud\shell\open" "" ""
WriteRegStr HKCR "cloud\shell\open\command" "" '"$INSTDIR\cloud_app.exe" "%1"'
SetRegView 32
WriteRegStr HKCR "cloud" "" "URL:yunpan"
WriteRegStr HKCR "cloud" "URL Protocol" ""
WriteRegStr HKCR "cloud\shell" "" ""
WriteRegStr HKCR "cloud\shell\open" "" ""
WriteRegStr HKCR "cloud\shell\open\command" "" '"$INSTDIR\cloud_app.exe" "%1"'
!macroend
!macro customUnInstall
DeleteRegKey HKCR "cloud"
DeleteRegValue HKLM "Software\Microsoft\Windows\CurrentVersion\Run" "PocketCloud"
!macroend