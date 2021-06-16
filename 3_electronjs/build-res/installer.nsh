!macro customInstall
Var /GLOBAL USERNAME
System::Call "advapi32::GetUserName(t .r0, *i ${NSIS_MAX_STRLEN} r1) i.r2"
StrCpy $USERNAME $0

;MessageBox MB_ICONINFORMATION|MB_OK "User's SID:$\r$\n$$0 is holding $0" IDOK
Var /GLOBAL USERSID
${GETUSERSID} $USERSID $USERNAME

WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Run" "PocketCloud" "$INSTDIR\${APP_EXECUTABLE_FILENAME}"

WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Explorer\SyncRootManager\PocketCloud!$USERSID!Personal!\UserSyncRoots" $USERSID "$PROFILE\PocketCloud"

WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Explorer\SyncRootManager\PocketCloud!$USERSID!Personal!" "DisplayNameResource" "PocketCloud"
WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Explorer\SyncRootManager\PocketCloud!$USERSID!Personal!" "Flags" 0x00000000
WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Explorer\SyncRootManager\PocketCloud!$USERSID!Personal!" "IconResource" "$INSTDIR\${APP_EXECUTABLE_FILENAME}, 0"

DetailPrint "Register evehq-ng URI Handler"
DeleteRegKey HKCR "cloud"
SetRegView 64
WriteRegStr HKCR "cloud" "" "URL:yunpan"
WriteRegStr HKCR "cloud" "URL Protocol" ""
WriteRegStr HKCR "evehq-ng\DefaultIcon" "" "$INSTDIR\${APP_EXECUTABLE_FILENAME}"
WriteRegStr HKCR "cloud\shell" "" ""
WriteRegStr HKCR "cloud\shell\open" "" ""
WriteRegStr HKCR "cloud\shell\open\command" "" '"$INSTDIR\cloud_app.exe" "%1"'
SetRegView 32
WriteRegStr HKCR "cloud" "" "URL:yunpan"
WriteRegStr HKCR "cloud" "URL Protocol" ""
WriteRegStr HKCR "evehq-ng\DefaultIcon" "" "$INSTDIR\${APP_EXECUTABLE_FILENAME}"
WriteRegStr HKCR "cloud\shell" "" ""
WriteRegStr HKCR "cloud\shell\open" "" ""
WriteRegStr HKCR "cloud\shell\open\command" "" '"$INSTDIR\cloud_app.exe" "%1"'

CreateDirectory $PROFILE\PocketCloud

!macroend
!macro customUnInstall
Var /GLOBAL USERNAME
System::Call "advapi32::GetUserName(t .r0, *i ${NSIS_MAX_STRLEN} r1) i.r2"
StrCpy $USERNAME $0

;MessageBox MB_ICONINFORMATION|MB_OK "User's SID:$\r$\n$$0 is holding $0" IDOK
Var /GLOBAL USERSID
${GETUSERSID} $USERSID $USERNAME

DeleteRegKey HKCR "cloud"
DeleteRegValue HKLM "Software\Microsoft\Windows\CurrentVersion\Run" "PocketCloud"

${GETUSERSID} $USERSID $0
DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Explorer\SyncRootManager\PocketCloud!$USERSID!Personal!"

!define /date MyTIMESTAMP "%Y-%m-%d-%H-%M-%S"
;RMDir /R /REBOOTOK $PROFILE\PocketCloud
Rename "$PROFILE\PocketCloud" "$PROFILE\PocketCloud_${MyTIMESTAMP}_backup"
!macroend

;System::Call "advapi32::GetUserName(t .r0, *i ${NSIS_MAX_STRLEN} r1) i.r2"
;   MessageBox MB_OK "User name: $0 | Number of characters: $1 | Return value (OK if non-zero): $2" 

;=#
;= ${GETUSERSID} $0 "Username"
;       $0          = The returning SID value
;       "Username"  = The username of the account you wish the SID
;                   If the username is an empty value, then the SID of the
;                   current user will be given to $0.
!define GETUSERSID "!insertmacro _GETUSERSID"
!macro _GETUSERSID _RESULT _USER
      System::Store S
      StrCpy $0 ${_USER}
      StrCmp $0 "" 0 +2
      ExpandEnvStrings $0 "%USERNAME%"
      System::Call "*(&t1024)i.r1"
      System::Call "advapi32::LookupAccountName(tn,tr0,ir1,*i1024,tn,*i1024,*in)i.r0"
      IntCmp $0 1 0 +2 +2
      System::Call "advapi32::ConvertSidToStringSid(ir1,*t.s)"
      IntCmp $0 1 +2 0 0
      Push error
      System::Free $1
      System::Store L
      Pop "${_RESULT}"
!macroend