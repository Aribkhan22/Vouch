$base='http://localhost:5000/api/v1'
$stamp=Get-Date -Format 'HHmmss'
$pw='Test1234'

$sReg=Invoke-RestMethod "$base/auth/register" -Method POST -ContentType 'application/json' -Body (@{name="S $stamp";email="s.$stamp@test.com";password=$pw;role='STARTUP'} | ConvertTo-Json)
$pReg=Invoke-RestMethod "$base/auth/register" -Method POST -ContentType 'application/json' -Body (@{name="P $stamp";email="p.$stamp@test.com";password=$pw;role='LAWYER'} | ConvertTo-Json)
$sLogin=Invoke-RestMethod "$base/auth/login" -Method POST -ContentType 'application/json' -Body (@{email="s.$stamp@test.com";password=$pw} | ConvertTo-Json)
$pLogin=Invoke-RestMethod "$base/auth/login" -Method POST -ContentType 'application/json' -Body (@{email="p.$stamp@test.com";password=$pw} | ConvertTo-Json)
$admin=Invoke-RestMethod "$base/auth/login" -Method POST -ContentType 'application/json' -Body (@{email='admin@vouch.app';password='Admin@1234'} | ConvertTo-Json)

$sTok=$sLogin.data.accessToken
$pTok=$pLogin.data.accessToken
$aTok=$admin.data.accessToken
$sId=if($sLogin.data.user.id){$sLogin.data.user.id}else{$sLogin.data.user._id}
$profUserId=if($pLogin.data.user.id){$pLogin.data.user.id}else{$pLogin.data.user._id}

$sp=Invoke-RestMethod "$base/startup/profile" -Method PUT -Headers @{Authorization="Bearer $sTok"} -ContentType 'application/json' -Body (@{companyName='TCo';industry='SaaS';city='Mumbai';description='Need legal support for contracts and trademark.'} | ConvertTo-Json)
$pp=Invoke-RestMethod "$base/professional/profile" -Method PUT -Headers @{Authorization="Bearer $pTok"} -ContentType 'application/json' -Body (@{fullName='Lawyer X';professionType='LAWYER';city='Mumbai';experienceYears=4;specializations=@('TRADEMARK');licenseNumber="LIC-$stamp"} | ConvertTo-Json)
$sg=Invoke-RestMethod "$base/startup/profile/$sId" -Method GET -Headers @{Authorization="Bearer $sTok"}
$pg=Invoke-RestMethod "$base/professional/profile/$profUserId" -Method GET -Headers @{Authorization="Bearer $sTok"}

$doc='D:\Project\CodeBase\Saqib130.pdf'
$uploadRaw = curl.exe -s -X POST "$base/professional/verification/submit" -H "Authorization: Bearer $pTok" -F "docs=@$doc;type=application/pdf"
$upload = $uploadRaw | ConvertFrom-Json
$vid = $upload.data._id

$approve = Invoke-RestMethod "$base/admin/verifications/$vid/approve" -Method POST -Headers @{Authorization="Bearer $aTok"}
$req = Invoke-RestMethod "$base/requests" -Method POST -Headers @{Authorization="Bearer $sTok"} -ContentType 'application/json' -Body (@{category='TRADEMARK';description='Need urgent trademark filing support for our SaaS brand in India.';city='Mumbai';budgetRange='10k-30k'} | ConvertTo-Json)
$rid=$req.data._id
$open = Invoke-RestMethod "$base/requests/open?city=Mumbai&category=TRADEMARK" -Method GET -Headers @{Authorization="Bearer $pTok"}
$acc = Invoke-RestMethod "$base/requests/$rid/accept" -Method POST -Headers @{Authorization="Bearer $pTok"}
$chat = Invoke-RestMethod "$base/chats/by-request/$rid" -Method GET -Headers @{Authorization="Bearer $sTok"}
$cid=$chat.data._id
$msgGet = Invoke-RestMethod "$base/messages/${cid}?page=1&limit=30" -Method GET -Headers @{Authorization="Bearer $sTok"}
$msgPost = Invoke-RestMethod "$base/messages/$cid" -Method POST -Headers @{Authorization="Bearer $sTok"} -ContentType 'application/json' -Body (@{text='hello'} | ConvertTo-Json)

# reject endpoint with a fresh verification
$p2Reg=Invoke-RestMethod "$base/auth/register" -Method POST -ContentType 'application/json' -Body (@{name="P2 $stamp";email="p2.$stamp@test.com";password=$pw;role='LAWYER'} | ConvertTo-Json)
$p2Login=Invoke-RestMethod "$base/auth/login" -Method POST -ContentType 'application/json' -Body (@{email="p2.$stamp@test.com";password=$pw} | ConvertTo-Json)
$p2Tok=$p2Login.data.accessToken
$p2Profile=Invoke-RestMethod "$base/professional/profile" -Method PUT -Headers @{Authorization="Bearer $p2Tok"} -ContentType 'application/json' -Body (@{fullName='Lawyer Y';professionType='LAWYER';city='Delhi';experienceYears=2;specializations=@('CONTRACT_REVIEW');licenseNumber="LIC2-$stamp"} | ConvertTo-Json)
$upload2Raw = curl.exe -s -X POST "$base/professional/verification/submit" -H "Authorization: Bearer $p2Tok" -F "docs=@$doc;type=application/pdf"
$upload2 = $upload2Raw | ConvertFrom-Json
$vid2 = $upload2.data._id
$reject = Invoke-RestMethod "$base/admin/verifications/$vid2/reject" -Method POST -Headers @{Authorization="Bearer $aTok"} -ContentType 'application/json' -Body (@{adminNote='late test'} | ConvertTo-Json)

Write-Host "startupProfileGet:" $sg.success
Write-Host "professionalProfileGet:" $pg.success
Write-Host "verificationSubmit:" $upload.success
Write-Host "approve:" $approve.success
Write-Host "openRequests:" $open.success
Write-Host "accept:" $acc.success
Write-Host "chatByRequest:" $chat.success
Write-Host "messagesGet:" $msgGet.success
Write-Host "messagesPost:" $msgPost.success
Write-Host "reject:" $reject.success
