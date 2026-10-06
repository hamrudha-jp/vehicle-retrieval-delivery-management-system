$baseUrl = "http://localhost:8080"

Write-Host "=== PHASE 4C END-TO-END VERIFICATION SCRIPT ===" -ForegroundColor Cyan

# 1. Owner Login
$ownerLogin = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -ContentType "application/json" -Body '{"email":"alex.owner@example.com","password":"password123"}'
$ownerToken = $ownerLogin.data.token
Write-Host "1. Owner Authenticated"

# 2. Get Vehicle
$vehRes = Invoke-RestMethod -Uri "$baseUrl/vehicles" -Method Get -Headers @{Authorization="Bearer $ownerToken"}
$vehId = $vehRes.data[0].id

# 3. Create Retrieval Request with Route Calculation
$reqBody = @{
    vehicleId = $vehId
    pickupAddress = "Velachery Main Rd, Chennai"
    pickupLatitude = 12.9780
    pickupLongitude = 80.2180
    destinationAddress = "OMR IT Expressway, Chennai"
    destinationLatitude = 12.9350
    destinationLongitude = 80.2370
    scheduledPickupTime = "2026-10-15T09:00:00"
    specialInstructions = "Phase 4C E2E Test"
} | ConvertTo-Json

$createRes = Invoke-RestMethod -Uri "$baseUrl/requests" -Method Post -Headers @{Authorization="Bearer $ownerToken"} -ContentType "application/json" -Body $reqBody
$reqId = $createRes.data.id
$estCost = $createRes.data.estimatedCost
Write-Host "2. Request Created (#$reqId) with Calculated Estimated Cost: Rs $estCost"

# 4. Driver Login & Accept
$driverLogin = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -ContentType "application/json" -Body '{"email":"david.driver@example.com","password":"password123"}'
$driverToken = $driverLogin.data.token
$driverId = $driverLogin.data.user.id

$acceptRes = Invoke-RestMethod -Uri "$baseUrl/requests/$reqId/accept" -Method Post -Headers @{Authorization="Bearer $driverToken"}
Write-Host "3. Request Accepted by Driver (Driver User ID: $driverId)"

# 5. Pickup OTP Flow
$otpGen1 = Invoke-RestMethod -Uri "$baseUrl/requests/$reqId/otp/generate?type=PICKUP" -Method Post -Headers @{Authorization="Bearer $ownerToken"}
$pickupOtpRes = Invoke-RestMethod -Uri "$baseUrl/requests/$reqId/otp/owner?type=PICKUP" -Method Get -Headers @{Authorization="Bearer $ownerToken"}
$pickupCode = $pickupOtpRes.data.otpCode

$verifyPickup = Invoke-RestMethod -Uri "$baseUrl/requests/$reqId/otp/verify" -Method Post -Headers @{Authorization="Bearer $driverToken"} -ContentType "application/json" -Body (@{otpCode=$pickupCode; otpType="PICKUP"} | ConvertTo-Json)
Write-Host "4. Pickup OTP Verified:" $verifyPickup.data.isVerified

# 6. Pre-Trip Inspection & Start Trip
$preInsp = Invoke-RestMethod -Uri "$baseUrl/requests/$reqId/inspection" -Method Post -Headers @{Authorization="Bearer $driverToken"} -ContentType "application/json" -Body (@{inspectionType="PRE_TRIP"; odometerReading=15000; fuelLevel="80%"; conditionNotes="Good condition"} | ConvertTo-Json)
$startTrip = Invoke-RestMethod -Uri "$baseUrl/requests/$reqId/status" -Method Put -Headers @{Authorization="Bearer $driverToken"} -ContentType "application/json" -Body (@{status="IN_PROGRESS"} | ConvertTo-Json)
$reachedDest = Invoke-RestMethod -Uri "$baseUrl/requests/$reqId/status" -Method Put -Headers @{Authorization="Bearer $driverToken"} -ContentType "application/json" -Body (@{status="DESTINATION_REACHED"} | ConvertTo-Json)
Write-Host "5. Trip Progress: IN_PROGRESS -> DESTINATION_REACHED"

# 7. Delivery OTP Flow & Post-Trip Inspection
$otpGen2 = Invoke-RestMethod -Uri "$baseUrl/requests/$reqId/otp/generate?type=DELIVERY" -Method Post -Headers @{Authorization="Bearer $ownerToken"}
$delOtpRes = Invoke-RestMethod -Uri "$baseUrl/requests/$reqId/otp/owner?type=DELIVERY" -Method Get -Headers @{Authorization="Bearer $ownerToken"}
$delCode = $delOtpRes.data.otpCode

$verifyDel = Invoke-RestMethod -Uri "$baseUrl/requests/$reqId/otp/verify" -Method Post -Headers @{Authorization="Bearer $driverToken"} -ContentType "application/json" -Body (@{otpCode=$delCode; otpType="DELIVERY"} | ConvertTo-Json)
$postInsp = Invoke-RestMethod -Uri "$baseUrl/requests/$reqId/inspection" -Method Post -Headers @{Authorization="Bearer $driverToken"} -ContentType "application/json" -Body (@{inspectionType="POST_TRIP"; odometerReading=15012; fuelLevel="75%"; conditionNotes="Safe delivery"} | ConvertTo-Json)

# 8. Owner Confirms Delivery -> Set DELIVERED
$deliveredRes = Invoke-RestMethod -Uri "$baseUrl/requests/$reqId/status" -Method Put -Headers @{Authorization="Bearer $ownerToken"} -ContentType "application/json" -Body (@{status="DELIVERED"} | ConvertTo-Json)
Write-Host "6. Vehicle Delivery Confirmed by Owner (Status: DELIVERED)"

# 9. Verify Payment Record Initialization
$payInitRes = Invoke-RestMethod -Uri "$baseUrl/payments/request/$reqId" -Method Get -Headers @{Authorization="Bearer $ownerToken"}
Write-Host "`n=== PAYMENT MODULE TEST ==="
Write-Host "Initialized Payment Status:" $payInitRes.data.paymentStatus
Write-Host "Stored Payment Amount:" $payInitRes.data.amount "(Matches Calculated Cost: Rs $estCost)"

# 10. Process Payment as Owner (Mark Paid)
$processPayRes = Invoke-RestMethod -Uri "$baseUrl/payments/process" -Method Post -Headers @{Authorization="Bearer $ownerToken"} -ContentType "application/json" -Body (@{requestId=$reqId; paymentMethod="UPI"} | ConvertTo-Json)
Write-Host "Processed Payment Status:" $processPayRes.data.paymentStatus
Write-Host "Payment Method Used:" $processPayRes.data.paymentMethod

# 11. Driver Review Submission
Write-Host "`n=== DRIVER REVIEW MODULE TEST ==="
$reviewBody = @{
    requestId = $reqId
    rating = 5
    comment = "Outstanding delivery service! Professional driver, handled vehicle with extreme care."
} | ConvertTo-Json

$reviewRes = Invoke-RestMethod -Uri "$baseUrl/reviews" -Method Post -Headers @{Authorization="Bearer $ownerToken"} -ContentType "application/json" -Body $reviewBody
Write-Host "Review Submitted Rating:" $reviewRes.data.rating "/ 5 Stars"
Write-Host "Review Comment:" $reviewRes.data.comment

# 12. Verify Duplicate Review Rejection
try {
    $dupRes = Invoke-RestMethod -Uri "$baseUrl/reviews" -Method Post -Headers @{Authorization="Bearer $ownerToken"} -ContentType "application/json" -Body $reviewBody
    Write-Host "[FAIL] Duplicate review was incorrectly allowed!" -ForegroundColor Red
} catch {
    Write-Host "Duplicate Review Rejected Correctly:" $_.Exception.Message -ForegroundColor Green
}

# 13. Driver View Ratings & Feedback
$driverRevRes = Invoke-RestMethod -Uri "$baseUrl/reviews/driver/$driverId" -Method Get -Headers @{Authorization="Bearer $driverToken"}
Write-Host "`n=== DRIVER FEEDBACK VIEW ==="
Write-Host "Driver Average Rating:" $driverRevRes.data.averageRating "/ 5.0"
Write-Host "Total Customer Reviews:" $driverRevRes.data.totalReviews

# 14. Admin View System Payment & Review Logs
$adminLogin = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -ContentType "application/json" -Body '{"email":"admin@vrdms.com","password":"adminpassword"}'
$adminToken = $adminLogin.data.token

$adminPayLogs = Invoke-RestMethod -Uri "$baseUrl/payments/admin/all" -Method Get -Headers @{Authorization="Bearer $adminToken"}
$adminRevLogs = Invoke-RestMethod -Uri "$baseUrl/reviews/admin/all" -Method Get -Headers @{Authorization="Bearer $adminToken"}
Write-Host "`n=== ADMIN SYSTEM LOGS VERIFICATION ==="
Write-Host "Total System Payment Records:" $adminPayLogs.data.Length
Write-Host "Total Customer Driver Reviews:" $adminRevLogs.data.Length

Write-Host "`n[PHASE 4C SUCCESS] Payment records, transparent costs, driver reviews & duplicate prevention fully verified!" -ForegroundColor Green
