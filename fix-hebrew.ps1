$filePath = "public\index.html"
$content = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)

# מילון תיקונים
$fixes = @{
    '׳׳©׳×׳׳©׳™׳ ׳'׳׳¢׳¨׳›׳×' = 'משתמשים במערכת'
    '׳"׳₪׳™׳ ׳₪׳¢׳™׳׳™׳' = 'דפים פעילים'
    '׳"׳₪׳™׳ ׳׳ ׳₪׳¢׳™׳׳™׳' = 'דפים לא פעילים'
    '׳₪׳¢׳™׳׳•׳× ׳׳—׳¨׳•׳ ׳"' = 'פעילות אחרונה'
    'סטטיסטיקות ׳׳"׳™׳¨׳•׳×' = 'סטטיסטיקות אחרונות'
    '׳׳©׳×׳׳©׳™׳ ׳—׳"׳©׳™׳ ׳"׳©׳'׳•׳¢' = 'משתמשים חדשים השבוע'
    '׳"׳₪׳™׳ ׳©׳ ׳•׳¦׳¨׳• ׳"׳©׳'׳•׳¢' = 'דפים שנוצרו השבוע'
    '׳˜׳•׳¢׳ ׳"׳₪׳™׳' = 'טוען דפים'
    '׳"׳£ ׳ ׳—׳™׳×׳"' = 'דף נחמד'
    'ג‚×' = '₪'
}

$fixCount = 0
foreach ($key in $fixes.Keys) {
    $matches = [regex]::Matches($content, [regex]::Escape($key))
    if ($matches.Count -gt 0) {
        Write-Host "$($matches.Count)x: $key → $($fixes[$key])" -ForegroundColor Green
        $content = $content.Replace($key, $fixes[$key])
        $fixCount += $matches.Count
    }
}

if ($fixCount -gt 0) {
    [System.IO.File]::WriteAllText($filePath, $content, [System.Text.Encoding]::UTF8)
    Write-Host "`n✅ תוקנו $fixCount מופעים!" -ForegroundColor Green
} else {
    Write-Host "`n⚠️ לא נמצאו דברים לתקן" -ForegroundColor Yellow
}

$remaining = ([regex]::Matches($content, '׳')).Count
Write-Host "📊 תווי ׳ שנותרו: $remaining" -ForegroundColor Cyan







