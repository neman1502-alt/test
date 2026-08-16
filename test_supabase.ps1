$headers = @{
    "apikey" = "sb_publishable_qqBehuCiUHRH2Oy1odyiDQ_XOiCgqMj"
    "Authorization" = "Bearer sb_publishable_qqBehuCiUHRH2Oy1odyiDQ_XOiCgqMj"
    "Content-Type" = "application/json"
}

try {
    $res = Invoke-RestMethod -Uri "https://jqlftxrdudvbbvhtneng.supabase.co/rest/v1/newcomers?select=*" -Headers $headers -Method Get
    Write-Host "Supabase Connection Test: SUCCESS"
    Write-Host "Record count: $($res.Count)"
    $res | ConvertTo-Json
} catch {
    Write-Host "Supabase Connection Error: $($_.Exception.Message)"
}
