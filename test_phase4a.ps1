$baseUrl = "http://localhost:8080"

# Step 1: Owner Login
$ownerLogin = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -ContentType "application/json" -Body '{"email":"alex.owner@example.com","password":"password123"}'
$ownerToken = $ownerLogin.data.token

# Step 2: Add Vehicle
$regNum = "TN-99-ZZ-" + (Get-Random -Min 1000 -Max 9999)
$vehBody = "{`"make`":`"Honda`",`"model`":`"Accord`",`"registrationNumber`":`"$regNum`",`"vehicleYear`":2023,`"color`":`"White`",`"vehicleType`":`"SEDAN`"}"
$vehRes = Invoke-RestMethod -Uri "$baseUrl/vehicles" -Method Post -Headers @{Authorization="Bearer $ownerToken"} -ContentType "application/json" -Body $vehBody
$vehId = $vehRes.data.id

# Step 3: Create Request
$reqBody = @"
{
  "vehicleId": $vehId,
  "pickupAddress": "Terminal 1, Metro Airport",
  "destinationAddress": "Downtown Auto Plaza",
  "scheduledPickupTime": "2026-10-05T14:00:00",
  "specialInstructions": "Handle carefully"
}
"@
$reqRes = Invoke-RestMethod -Uri "$baseUrl/requests" -Method Post -Headers @{Authorization="Bearer $ownerToken"} -ContentType "application/json" -Body $reqBody
$reqId = $reqRes.data.id

# Step 4: Driver Login
$driverLogin = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -ContentType "application/json" -Body '{"email":"david.driver@example.com","password":"password123"}'
$driverToken = $driverLogin.data.token

# Step 5: Driver Accept Request
$acceptRes = Invoke-RestMethod -Uri "$baseUrl/requests/$reqId/accept" -Method Post -Headers @{Authorization="Bearer $driverToken"}
Write-Host "1. Accepted Status:" $acceptRes.data.status

# Step 6: Owner Fetch Pickup OTP
$otpGenRes = Invoke-RestMethod -Uri "$baseUrl/requests/$reqId/otp/generate?type=PICKUP" -Method Post -Headers @{Authorization="Bearer $ownerToken"}
$pickupOtpRes = Invoke-RestMethod -Uri "$baseUrl/requests/$reqId/otp/owner?type=PICKUP" -Method Get -Headers @{Authorization="Bearer $ownerToken"}
$pickupCode = $pickupOtpRes.data.otpCode
Write-Host "2. Generated Pickup OTP:" $pickupCode

# Step 7: Test Driver Incorrect OTP
try {
    $errRes = Invoke-RestMethod -Uri "$baseUrl/requests/$reqId/otp/verify" -Method Post -Headers @{Authorization="Bearer $driverToken"} -ContentType "application/json" -Body '{"otpCode":"999999","otpType":"PICKUP"}'
} catch {
    Write-Host "3. Incorrect OTP Rejected Correctly:" $_.Exception.Message
}

# Step 8: Driver Verify Correct Pickup OTP
$verifyPickupRes = Invoke-RestMethod -Uri "$baseUrl/requests/$reqId/otp/verify" -Method Post -Headers @{Authorization="Bearer $driverToken"} -ContentType "application/json" -Body "{`"otpCode`":`"$pickupCode`",`"otpType`":`"PICKUP`"}"
Write-Host "4. Pickup OTP Verified Result:" $verifyPickupRes.data.isVerified

# Step 9: Driver Submit Pre-Trip Inspection
$preInspBody = '{"inspectionType":"PRE_TRIP","odometerReading":12500,"fuelLevel":"75% Tank","conditionNotes":"Scrape on front bumper","photoUrls":"pre_photo.jpg"}'
$preInspRes = Invoke-RestMethod -Uri "$baseUrl/requests/$reqId/inspection" -Method Post -Headers @{Authorization="Bearer $driverToken"} -ContentType "application/json" -Body $preInspBody
Write-Host "5. Pre-Trip Inspection Submitted:" $preInspRes.data.inspectionType

# Step 10: Driver Start Trip (IN_PROGRESS)
$startRes = Invoke-RestMethod -Uri "$baseUrl/requests/$reqId/status" -Method Put -Headers @{Authorization="Bearer $driverToken"} -ContentType "application/json" -Body '{"status":"IN_PROGRESS"}'
Write-Host "6. Trip Status:" $startRes.data.status

# Step 11: Driver Mark Destination Reached
$reachedRes = Invoke-RestMethod -Uri "$baseUrl/requests/$reqId/status" -Method Put -Headers @{Authorization="Bearer $driverToken"} -ContentType "application/json" -Body '{"status":"DESTINATION_REACHED"}'
Write-Host "7. Destination Reached Status:" $reachedRes.data.status

# Step 12: Owner Fetch Delivery OTP
$delOtpGen = Invoke-RestMethod -Uri "$baseUrl/requests/$reqId/otp/generate?type=DELIVERY" -Method Post -Headers @{Authorization="Bearer $ownerToken"}
$delOtpRes = Invoke-RestMethod -Uri "$baseUrl/requests/$reqId/otp/owner?type=DELIVERY" -Method Get -Headers @{Authorization="Bearer $ownerToken"}
$delCode = $delOtpRes.data.otpCode
Write-Host "8. Generated Delivery OTP:" $delCode

# Step 13: Driver Verify Delivery OTP
$verifyDelRes = Invoke-RestMethod -Uri "$baseUrl/requests/$reqId/otp/verify" -Method Post -Headers @{Authorization="Bearer $driverToken"} -ContentType "application/json" -Body "{`"otpCode`":`"$delCode`",`"otpType`":`"DELIVERY`"}"
Write-Host "9. Delivery OTP Verified Result:" $verifyDelRes.data.isVerified

# Step 14: Driver Submit Post-Trip Inspection
$postInspBody = '{"inspectionType":"POST_TRIP","odometerReading":12540,"fuelLevel":"70% Tank","conditionNotes":"Clean delivery, no new damage","photoUrls":"post_photo.jpg"}'
$postInspRes = Invoke-RestMethod -Uri "$baseUrl/requests/$reqId/inspection" -Method Post -Headers @{Authorization="Bearer $driverToken"} -ContentType "application/json" -Body $postInspBody
Write-Host "10. Post-Trip Inspection Submitted:" $postInspRes.data.inspectionType

# Step 15: Owner Confirm Delivery
$confirmRes = Invoke-RestMethod -Uri "$baseUrl/requests/$reqId/status" -Method Put -Headers @{Authorization="Bearer $ownerToken"} -ContentType "application/json" -Body '{"status":"DELIVERED"}'
Write-Host "11. Final Confirmed Status:" $confirmRes.data.status
