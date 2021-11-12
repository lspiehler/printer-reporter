Option Explicit
On Error Resume Next

Dim jsonreq, restReq, url, allprinters

Function getADSite(json)
	Dim objADSysInfo
	
	Set objADSysInfo = CreateObject("ADSystemInfo")

	'WScript.Echo "Current site name: " & objADSysInfo.SiteName
	If json = True Then
		getADSite = vbTab & """site"":""" + objADSysInfo.SiteName + """"
	Else
		getADSite = objADSysInfo.SiteName
	End If
End Function

Function getADUserDN(json)
	Dim objSysInfo, objUser, rawDN
	
	Set objSysInfo = CreateObject("ADSystemInfo")

	Set objUser = GetObject("LDAP://" & objSysInfo.UserName)
	
	rawDN = Join(Split(objUser.distinguishedName, "\"), "\\")
	
	If json = True Then
		getADUserDN = vbTab & """userdn"":""" + rawDN + """"
	Else
		getADUserDN = rawDN
	End If
End Function

Function getADComputerDN(json)
	Dim objSysInfo, objComp, rawDN
	
	Set objSysInfo = CreateObject("ADSystemInfo")

	Set objComp = GetObject("LDAP://" & objSysInfo.ComputerName)
	
	rawDN = Join(Split(objComp.distinguishedName, "\"), "\\")
	
	If json = True Then
		getADComputerDN = vbTab & """computerdn"":""" + rawDN + """"
	Else
		getADComputerDN = rawDN
	End If
End Function

Function getEnvVariable(envvar, json, wait)
	Dim objShell, wshSystemEnv, value, loopcount
	
	value=""
	loopcount=0

	Do while value = "" AND loopcount < 45
		Set objShell = WScript.CreateObject("WScript.Shell")
		Set wshSystemEnv = objShell.Environment( "PROCESS" ) 'PROCESS,SYSTEM,USER, OR VOLATILE
		value = wshSystemEnv( envvar )
		loopcount = loopcount+1
		If value = "" Then
			WScript.Sleep(1000)
		End If
		If Not wait Then
			exit do
		End If
	Loop

	If json = True Then
		getEnvVariable = vbTab & """" + envvar + """:""" + value + """"
	Else
		getEnvVariable = value
	End If
End Function

Function getNetworkPrinters(json)

	Dim WshNetwork, existprinters, i, list, printers
	
	printers = Array()
	
	Set WshNetwork = WScript.CreateObject("WScript.Network")

	Set existprinters = WshNetwork.EnumPrinterConnections

	For i = 0 to existprinters.Count - 1 Step 1
		'WScript.Echo existprinters.Item(i)
		If Left(ucase(existprinters.Item(i)),2) = "\\" Then
			If Right(ucase(existprinters.Item(i)),1) <> ":" Then
				'WScript.Echo UBound(printers)
				ReDim Preserve printers(UBound(printers) + 1)
				printers(UBound(printers)) = Replace(existprinters.Item(i),"\","\\")
				''WScript.Echo existprinters.Item(i)
				'WSHNetwork.RemovePrinterConnection existprinters.Item(i+1)
				'If Not printerArray(current,printers) Then
					'WScript.Echo("Deleting " + current)
				'	WSHNetwork.RemovePrinterConnection current
				'End If
			End If
		End If
	Next
	
	If UBound(printers) >= 0 Then
	
		'WScript.Echo UBound(printers)
		If json = True Then
			If UBound(printers) >= 0 Then
				getNetworkPrinters = vbTab & """printers"": [" & vbCrlf & vbTab & vbTab & """" & Join(printers, """," & vbCrlf & vbTab & vbTab & """") & """" & vbCrlf & vbTab & "]"
			Else
				getNetworkPrinters = vbTab & """printers"": []"
			End If
		Else
			getNetworkPrinters = Join(printers, ",")
		End If
		
	Else
		getNetworkPrinters = False
	End If
End Function

WScript.Sleep 60000

allprinters = getNetworkPrinters(True)

If allprinters Then
	jsonreq = "{" & vbCrlf & _
		getEnvVariable("COMPUTERNAME", True, True) & "," & vbCrlf & _
		getEnvVariable("USERNAME", True, True) & "," & vbCrlf & _
		getEnvVariable("USERDOMAIN", True, True) & "," & vbCrlf & _
		getADSite(True) & "," & vbCrlf & _
		getADComputerDN(True) & "," & vbCrlf & _
		getADUserDN(True) & "," & vbCrlf & _
		getNetworkPrinters(True) & _
		vbCrlf & "}"
		
	'WScript.Echo jsonreq
	'WScript.Quit
		
		
	Set restReq = CreateObject("Microsoft.XMLHTTP")

	' Replace <node> with the address of your INSTEON device
	' Additionally, any REST command will work here
	url = "https://httpreport.lcmchealth.org/printers"

	' If auth is required, replace the userName and password values
	' with the ones you use on your ISY
	'userName = "admin"
	'password = "<yourpassword>"

	'restReq.open "GET", url, false, userName, password
	restReq.open "POST", url, false
	restReq.setRequestHeader "Content-Type", "application/json"
	restReq.send jsonreq
End If

'WScript.Echo restReq.responseText
WScript.Quit