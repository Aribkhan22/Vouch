$base = "http://localhost:5000/api/v1"

# Ensure server is running on 5000
$listener = Get-NetTCPConnection -LocalPort 5000 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
if (-not $listener) {
  Write-Host "Server not running. Starting backend..."
  Start-Process -FilePath "pwsh" -ArgumentList "-NoProfile","-Command","Set-Location 'D:\Project\CodeBase'; npm run backend" -WindowStyle Hidden
  Start-Sleep -Seconds 6
}

function Call-Api {
  param(
    [string]$Name,
    [string]$Method,
    [string]$Url,
    [object]$Body = $null,
    [string]$Token = $null,
    [hashtable]$Form = $null,
    [int]$Expected = 200
  )

  $headers = @{}
  if ($Token) { $headers['Authorization'] = "Bearer $Token" }

  try {
    if ($Form) {
      $resp = Invoke-WebRequest -Uri $Url -Method $Method -Headers $headers -Form $Form -SkipHttpErrorCheck
    } elseif ($null -ne $Body) {
      $jsonBody = if ($Body -is [string]) { $Body } else { $Body | ConvertTo-Json -Depth 8 }
      $resp = Invoke-WebRequest -Uri $Url -Method $Method -Headers $headers -ContentType "application/json" -Body $jsonBody -SkipHttpErrorCheck
    } else {
      $resp = Invoke-WebRequest -Uri $Url -Method $Method -Headers $headers -SkipHttpErrorCheck
    }

    $data = $null
    if ($resp.Content) {
      try { $data = $resp.Content | ConvertFrom-Json } catch { $data = $null }
    }

    [PSCustomObject]@{
      Name = $Name
      Status = [int]$resp.StatusCode
      Expected = $Expected
      Pass = ([int]$resp.StatusCode -eq $Expected)
      Data = $data
    }
  } catch {
    [PSCustomObject]@{
      Name = $Name
      Status = -1
      Expected = $Expected
      Pass = $false
      Data = $null
      Error = $_.Exception.Message
    }
  }
}

$results = @()
$stamp = Get-Date -Format "HHmmss"
$startupEmail = "startup.$stamp@test.com"
$proEmail = "lawyer.$stamp@test.com"
$pro2Email = "lawyer2.$stamp@test.com"
$password = "Test1234"

# 1-2 register
$r = Call-Api -Name "1 POST /auth/register STARTUP" -Method POST -Url "$base/auth/register" -Body @{ name="Startup $stamp"; email=$startupEmail; password=$password; role="STARTUP" } -Expected 201; $results += $r
$r = Call-Api -Name "2 POST /auth/register LAWYER" -Method POST -Url "$base/auth/register" -Body @{ name="Lawyer $stamp"; email=$proEmail; password=$password; role="LAWYER" } -Expected 201; $results += $r

# 3-4 login
$r3 = Call-Api -Name "3 POST /auth/login STARTUP" -Method POST -Url "$base/auth/login" -Body @{ email=$startupEmail; password=$password } -Expected 200; $results += $r3
$r4 = Call-Api -Name "4 POST /auth/login LAWYER" -Method POST -Url "$base/auth/login" -Body @{ email=$proEmail; password=$password } -Expected 200; $results += $r4

$sToken = $r3.Data.data.accessToken
$sRefresh = $r3.Data.data.refreshToken
$sUserId = $r3.Data.data.user._id
$pToken = $r4.Data.data.accessToken
$pUserId = $r4.Data.data.user._id

# 5-6 auth me + refresh
$r = Call-Api -Name "5 GET /auth/me" -Method GET -Url "$base/auth/me" -Token $sToken -Expected 200; $results += $r
$r = Call-Api -Name "6 POST /auth/refresh" -Method POST -Url "$base/auth/refresh" -Body @{ refreshToken=$sRefresh } -Expected 200; $results += $r

# 7-8 startup profile
$r = Call-Api -Name "7 PUT /startup/profile" -Method PUT -Url "$base/startup/profile" -Token $sToken -Body @{ companyName="Tech $stamp"; industry="SaaS"; city="Mumbai"; description="We need legal help for contracts and trademark filing." } -Expected 200; $results += $r
$r = Call-Api -Name "8 GET /startup/profile/:userId" -Method GET -Url "$base/startup/profile/$sUserId" -Token $sToken -Expected 200; $results += $r

# 9-11 professional profile + directory
$r = Call-Api -Name "9 PUT /professional/profile" -Method PUT -Url "$base/professional/profile" -Token $pToken -Body @{ fullName="Lawyer $stamp"; professionType="LAWYER"; city="Mumbai"; experienceYears=5; specializations=@("TRADEMARK"); licenseNumber="LIC-$stamp"; feeRange="10k-30k" } -Expected 200; $results += $r
$r = Call-Api -Name "10 GET /professional/profile/:userId" -Method GET -Url "$base/professional/profile/$pUserId" -Token $sToken -Expected 200; $results += $r
$r = Call-Api -Name "11 GET /professionals" -Method GET -Url "$base/professionals?city=Mumbai&type=LAWYER&verified=false&page=1&limit=10" -Token $sToken -Expected 200; $results += $r

# 12 submit verification
$docPath = "D:\Project\CodeBase\Saqib130.pdf"
if (-not (Test-Path $docPath)) { $docPath = "D:\Project\CodeBase\VouchBackend\API_REFERENCE.md" }
$r12 = Call-Api -Name "12 POST /professional/verification/submit" -Method POST -Url "$base/professional/verification/submit" -Token $pToken -Form @{ docs = Get-Item $docPath } -Expected 201; $results += $r12
$verificationId = $r12.Data.data._id

# admin login (+ seed if needed)
$adminLogin = Call-Api -Name "tmp admin login" -Method POST -Url "$base/auth/login" -Body @{ email="admin@vouch.app"; password="Admin@1234" } -Expected 200
if (-not $adminLogin.Pass) {
  npm --prefix "D:\Project\CodeBase\VouchBackend" run seed:admin | Out-Null
  $adminLogin = Call-Api -Name "tmp admin login retry" -Method POST -Url "$base/auth/login" -Body @{ email="admin@vouch.app"; password="Admin@1234" } -Expected 200
}
$results += [PSCustomObject]@{Name="13 POST /auth/login ADMIN";Status=$adminLogin.Status;Expected=200;Pass=$adminLogin.Pass;Data=$adminLogin.Data}
$adminToken = $adminLogin.Data.data.accessToken

# 14 admin list
$r14 = Call-Api -Name "14 GET /admin/verifications" -Method GET -Url "$base/admin/verifications?status=PENDING" -Token $adminToken -Expected 200; $results += $r14
if (-not $verificationId -and $r14.Data.data.Count -gt 0) { $verificationId = $r14.Data.data[0]._id }

# 15 admin approve
$r = Call-Api -Name "15 POST /admin/verifications/:id/approve" -Method POST -Url "$base/admin/verifications/$verificationId/approve" -Token $adminToken -Expected 200; $results += $r

# 16 create request
$r16 = Call-Api -Name "16 POST /requests" -Method POST -Url "$base/requests" -Token $sToken -Body @{ category="TRADEMARK"; description="Need urgent trademark filing support for our SaaS brand in India."; city="Mumbai"; budgetRange="10k-30k" } -Expected 201; $results += $r16
$requestId = $r16.Data.data._id

# 17 mine
$r = Call-Api -Name "17 GET /requests/mine" -Method GET -Url "$base/requests/mine" -Token $sToken -Expected 200; $results += $r

# 18 open
$r = Call-Api -Name "18 GET /requests/open" -Method GET -Url "$base/requests/open?city=Mumbai&category=TRADEMARK" -Token $pToken -Expected 200; $results += $r

# 19 accept
$r19 = Call-Api -Name "19 POST /requests/:id/accept" -Method POST -Url "$base/requests/$requestId/accept" -Token $pToken -Expected 200; $results += $r19
$chatId = $r19.Data.data.chat._id

# 20 close
$r = Call-Api -Name "20 POST /requests/:id/close" -Method POST -Url "$base/requests/$requestId/close" -Token $sToken -Expected 200; $results += $r

# 21 chat by request
$r = Call-Api -Name "21 GET /chats/by-request/:requestId" -Method GET -Url "$base/chats/by-request/$requestId" -Token $sToken -Expected 200; $results += $r

# 22 messages list
$r = Call-Api -Name "22 GET /messages/:chatId" -Method GET -Url "$base/messages/$chatId?page=1&limit=30" -Token $sToken -Expected 200; $results += $r

# 23 messages send
$r = Call-Api -Name "23 POST /messages/:chatId" -Method POST -Url "$base/messages/$chatId" -Token $sToken -Body @{ text="Hello from automated endpoint verifier." } -Expected 201; $results += $r

# 24 admin reject (create second lawyer verification)
$r = Call-Api -Name "tmp register LAWYER2" -Method POST -Url "$base/auth/register" -Body @{ name="Lawyer2 $stamp"; email=$pro2Email; password=$password; role="LAWYER" } -Expected 201
$r = Call-Api -Name "tmp login LAWYER2" -Method POST -Url "$base/auth/login" -Body @{ email=$pro2Email; password=$password } -Expected 200
$p2Token = $r.Data.data.accessToken
$r = Call-Api -Name "tmp put profile LAWYER2" -Method PUT -Url "$base/professional/profile" -Token $p2Token -Body @{ fullName="Lawyer2 $stamp"; professionType="LAWYER"; city="Delhi"; experienceYears=3; specializations=@("CONTRACT_REVIEW"); licenseNumber="LIC2-$stamp" } -Expected 200
$r = Call-Api -Name "tmp submit verification LAWYER2" -Method POST -Url "$base/professional/verification/submit" -Token $p2Token -Form @{ docs = Get-Item $docPath } -Expected 201
$verificationId2 = $r.Data.data._id
$r = Call-Api -Name "24 POST /admin/verifications/:id/reject" -Method POST -Url "$base/admin/verifications/$verificationId2/reject" -Token $adminToken -Body @{ adminNote="Test reject flow" } -Expected 200; $results += $r

$results | Select-Object Name,Status,Expected,Pass | Format-Table -AutoSize
$passCount = ($results | Where-Object { $_.Pass }).Count
$total = $results.Count
Write-Host "SUMMARY: $passCount / $total passed"
$failed = $results | Where-Object { -not $_.Pass }
if ($failed.Count -gt 0) {
  Write-Host "FAILED ENDPOINTS:"
  $failed | Select-Object Name,Status,Expected | Format-Table -AutoSize
}
