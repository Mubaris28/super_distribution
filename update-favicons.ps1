# Update favicon links site-wide to assets/images/favicon
# Run from project root: powershell -ExecutionPolicy Bypass -File update-favicons.ps1
#
# Favicon files in assets/images/favicon:
#   SD LOGO 16px-01.png, SD LOGO 32px-01.png, SD LOGO 48px-01.png, SD LOGO 180px-01.png

$faviconBlockRoot = @'
  <link rel="icon" type="image/png" sizes="16x16" href="assets/images/favicon/SD%20LOGO%2016px-01.png">
  <link rel="icon" type="image/png" sizes="32x32" href="assets/images/favicon/SD%20LOGO%2032px-01.png">
  <link rel="icon" type="image/png" sizes="48x48" href="assets/images/favicon/SD%20LOGO%2048px-01.png">
  <link rel="apple-touch-icon" sizes="180x180" href="assets/images/favicon/SD%20LOGO%20180px-01.png">
'@

$faviconBlockInner = @'
  <link rel="icon" type="image/png" sizes="16x16" href="../assets/images/favicon/SD%20LOGO%2016px-01.png">
  <link rel="icon" type="image/png" sizes="32x32" href="../assets/images/favicon/SD%20LOGO%2032px-01.png">
  <link rel="icon" type="image/png" sizes="48x48" href="../assets/images/favicon/SD%20LOGO%2048px-01.png">
  <link rel="apple-touch-icon" sizes="180x180" href="../assets/images/favicon/SD%20LOGO%20180px-01.png">
'@

# Root and 404: 3-link block (no 16px yet in many files)
$oldRoot3 = '  <link rel="icon" type="image/png" sizes="32x32" href="assets/images/favicon/SD%20LOGO%2032px-01.png">\r?\n  <link rel="icon" type="image/png" sizes="48x48" href="assets/images/favicon/SD%20LOGO%2048px-01.png">\r?\n  <link rel="apple-touch-icon" sizes="180x180" href="assets/images/favicon/SD%20LOGO%20180px-01.png">'
$rootFiles = @("index.html", "about.html", "contact.html", "products.html", "compostable.html", "household.html", "religious.html", "cosmetic.html", "stationary.html", "reseller-application.html", "privacy-policy.html", "404.html")

foreach ($f in $rootFiles) {
    $path = Join-Path $PSScriptRoot $f
    if (Test-Path $path) {
        $content = Get-Content $path -Raw
        if ($content -match $oldRoot3) {
            $content = $content -replace $oldRoot3, $faviconBlockRoot.TrimEnd()
            Set-Content -Path $path -Value $content -NoNewline
            Write-Host "Updated (root): $f"
        }
    }
}

# products-innerpage: 3-link or 4-link block
$oldInner3 = '  <link rel="icon" type="image/png" sizes="32x32" href="../assets/images/favicon/SD%20LOGO%2032px-01.png">\r?\n  <link rel="icon" type="image/png" sizes="48x48" href="../assets/images/favicon/SD%20LOGO%2048px-01.png">\r?\n  <link rel="apple-touch-icon" sizes="180x180" href="../assets/images/favicon/SD%20LOGO%20180px-01.png">'
$innerDir = Join-Path $PSScriptRoot "products-innerpage"
if (Test-Path $innerDir) {
    Get-ChildItem -Path $innerDir -Filter "*.html" | ForEach-Object {
        $content = Get-Content $_.FullName -Raw
        if ($content -match $oldInner3) {
            $content = $content -replace $oldInner3, $faviconBlockInner.TrimEnd()
            Set-Content -Path $_.FullName -Value $content -NoNewline
            Write-Host "Updated (inner): $($_.Name)"
        }
    }
}

Write-Host "Done. Favicons point to assets/images/favicon."
