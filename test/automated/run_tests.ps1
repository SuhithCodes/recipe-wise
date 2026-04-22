param(
  [string]$Python = "python"
)

Write-Host "Installing test requirements..." -ForegroundColor Cyan
& $Python -m pip install -r "$PSScriptRoot\requirements.txt" | Write-Output
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Running tests and generating HTML report..." -ForegroundColor Cyan
Push-Location $PSScriptRoot
& $Python -m pytest -q --html ".\reports\report.html" --self-contained-html
$code = $LASTEXITCODE
Pop-Location

if ($code -eq 0) {
  Write-Host "Report generated at test\automated\reports\report.html" -ForegroundColor Green
} else {
  Write-Host "Tests failed. See report at test\automated\reports\report.html" -ForegroundColor Red
}

exit $code


