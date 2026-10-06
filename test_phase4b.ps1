$baseUrl = "http://localhost:8080"

# 1. Owner Login
$ownerLogin = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -ContentType "application/json" -Body '{"email":"alex.owner@example.com","password":"password123"}'
$ownerToken = $ownerLogin.data.token

# 2. Get Owner Vehicles
$vehRes = Invoke-RestMethod -Uri "$baseUrl/vehicles" -Method Get -Headers @{Authorization="Bearer $ownerToken"}
$vehId = $vehRes.data[0].id
$vehType = $vehRes.data[0].vehicleType

Write-Host "=== TEST COMBINATION 1: Long Distance (Chennai to Bengaluru ~347km) ==="
$estBody1 = @{
    pickupLatitude = 13.0827
    pickupLongitude = 80.2707
    destinationLatitude = 12.9716
    destinationLongitude = 77.5946
    vehicleType = $vehType
} | ConvertTo-Json

$est1 = Invoke-RestMethod -Uri "$baseUrl/requests/estimate-cost" -Method Post -Headers @{Authorization="Bearer $ownerToken"} -ContentType "application/json" -Body $estBody1
Write-Host "Combo 1 Distance (km):" $est1.data.distanceKm
Write-Host "Combo 1 Duration (mins):" $est1.data.durationMinutes
Write-Host "Combo 1 Base Fee (Rs):" $est1.data.baseFee
Write-Host "Combo 1 Distance Charge (Rs):" $est1.data.distanceCharge
Write-Host "Combo 1 Total Estimated Cost (Rs):" $est1.data.totalEstimatedCost

Write-Host "`n=== TEST COMBINATION 2: Short Local Route (Chennai Central to Koyambedu ~7.8km) ==="
$estBody2 = @{
    pickupLatitude = 13.0827
    pickupLongitude = 80.2707
    destinationLatitude = 13.0475
    destinationLongitude = 80.2090
    vehicleType = $vehType
} | ConvertTo-Json

$est2 = Invoke-RestMethod -Uri "$baseUrl/requests/estimate-cost" -Method Post -Headers @{Authorization="Bearer $ownerToken"} -ContentType "application/json" -Body $estBody2
Write-Host "Combo 2 Distance (km):" $est2.data.distanceKm
Write-Host "Combo 2 Duration (mins):" $est2.data.durationMinutes
Write-Host "Combo 2 Base Fee (Rs):" $est2.data.baseFee
Write-Host "Combo 2 Distance Charge (Rs):" $est2.data.distanceCharge
Write-Host "Combo 2 Total Estimated Cost (Rs):" $est2.data.totalEstimatedCost

if ($est1.data.distanceKm -ne $est2.data.distanceKm -and $est1.data.totalEstimatedCost -gt $est2.data.totalEstimatedCost) {
    Write-Host "`n[SUCCESS] Dynamic route distance & transparent cost estimation scaling verified!"
} else {
    Write-Host "`n[FAIL] Distance or cost did not change appropriately."
}

# 3. Create Request with Route Data
$reqBody = @{
    vehicleId = $vehId
    pickupAddress = "Chennai Central Station"
    pickupLatitude = 13.0827
    pickupLongitude = 80.2707
    destinationAddress = "Koyambedu Bus Terminal"
    destinationLatitude = 13.0475
    destinationLongitude = 80.2090
    scheduledPickupTime = "2026-10-10T10:00:00"
    specialInstructions = "Handle with care"
} | ConvertTo-Json

$createRes = Invoke-RestMethod -Uri "$baseUrl/requests" -Method Post -Headers @{Authorization="Bearer $ownerToken"} -ContentType "application/json" -Body $reqBody
$reqId = $createRes.data.id

Write-Host "`n=== CREATED REQUEST VERIFICATION ==="
Write-Host "Request ID:" $reqId
Write-Host "Saved Distance (km):" $createRes.data.estimatedDistanceKm
Write-Host "Saved Duration (mins):" $createRes.data.estimatedDurationMinutes
Write-Host "Saved Estimated Cost (Rs):" $createRes.data.estimatedCost

# 4. Verify OTP and Inspection workflow intact
$driverLogin = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -ContentType "application/json" -Body '{"email":"david.driver@example.com","password":"password123"}'
$driverToken = $driverLogin.data.token

$acceptRes = Invoke-RestMethod -Uri "$baseUrl/requests/$reqId/accept" -Method Post -Headers @{Authorization="Bearer $driverToken"}
$otpGenRes = Invoke-RestMethod -Uri "$baseUrl/requests/$reqId/otp/generate?type=PICKUP" -Method Post -Headers @{Authorization="Bearer $ownerToken"}
$pickupOtpRes = Invoke-RestMethod -Uri "$baseUrl/requests/$reqId/otp/owner?type=PICKUP" -Method Get -Headers @{Authorization="Bearer $ownerToken"}
$pickupCode = $pickupOtpRes.data.otpCode

$verifyBody = @{
    otpCode = $pickupCode
    otpType = "PICKUP"
} | ConvertTo-Json

$verifyPickupRes = Invoke-RestMethod -Uri "$baseUrl/requests/$reqId/otp/verify" -Method Post -Headers @{Authorization="Bearer $driverToken"} -ContentType "application/json" -Body $verifyBody
Write-Host "`n=== OTP AND WORKFLOW REGRESSION VERIFICATION ==="
Write-Host "Pickup OTP Verified:" $verifyPickupRes.data.isVerified
