# Test n8n workflow integration
Write-Host "🧪 Testing n8n Workflow Integration..." -ForegroundColor Green
Write-Host ""

# Test data
$testData = @{
    userId = "test-user-123"
    contacts = @(
        @{
            email = "test1@example.com"
            name = "John Doe"
            company = "Test Company 1"
        }
    )
    message_template = "Hi {{name}}, testing workflow integration..."
} | ConvertTo-Json -Depth 3

Write-Host "1. Testing n8n webhook..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5678/webhook/warm-outreach" -Method POST -ContentType "application/json" -Body $testData
    Write-Host "   ✅ n8n webhook successful!" -ForegroundColor Green
    Write-Host "   Response: $response" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ n8n webhook failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "2. Check n8n executions at: http://localhost:5678/executions" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ If the test above worked, Phase 1 is COMPLETE!" -ForegroundColor Green 