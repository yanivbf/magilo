$headers = @{
    "Authorization" = "Bearer b6a4ef5e9c3d0a8f7b2e1d4c6a9f8e7d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8"
}

Write-Host "🔍 Fetching latest page..." -ForegroundColor Cyan
Write-Host ""

$uri = 'http://localhost:1337/api/pages?sort=createdAt:desc&pagination[limit]=1'
$response = Invoke-RestMethod -Uri $uri -Headers $headers

if ($response.data.Count -eq 0) {
    Write-Host "❌ No pages found" -ForegroundColor Red
    exit
}

$page = $response.data[0]
$attrs = $page.attributes

Write-Host "📄 LATEST PAGE:" -ForegroundColor Yellow
Write-Host "   - ID: $($page.id)"
Write-Host "   - Document ID: $($page.documentId)"
Write-Host "   - Title: $($attrs.title)"
Write-Host "   - Slug: $($attrs.slug)"
Write-Host ""

Write-Host "🔑 OWNERSHIP FIELDS:" -ForegroundColor Yellow
Write-Host "   - userId field: $($attrs.userId)"
Write-Host "   - metadata.createdByUserId: $($attrs.metadata.createdByUserId)"
Write-Host ""

$myUserId = "google_111351120503275674259"
Write-Host "✅ MY USER ID: $myUserId" -ForegroundColor Green
Write-Host ""

Write-Host "🎯 OWNERSHIP CHECK:" -ForegroundColor Yellow
if ($attrs.userId -eq $myUserId) {
    Write-Host "   ✅ userId MATCHES - You are the owner!" -ForegroundColor Green
} else {
    Write-Host "   ❌ userId DOES NOT MATCH" -ForegroundColor Red
    Write-Host "      Expected: $myUserId"
    Write-Host "      Got: $($attrs.userId)"
}
