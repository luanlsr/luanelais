$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$photoProject = Join-Path $root 'photo-reminder'

$landpage = Start-Process -FilePath 'npm.cmd' -ArgumentList 'run','dev:landpage' -WorkingDirectory $root -PassThru
$photo = Start-Process -FilePath 'npm.cmd' -ArgumentList 'run','dev','--','--port','3001' -WorkingDirectory $photoProject -PassThru

try {
  Write-Host 'Landpage: http://localhost:5173'
  Write-Host 'PhotoReminder: http://localhost:3001'
  Wait-Process -Id $landpage.Id, $photo.Id
}
finally {
  foreach ($process in @($landpage, $photo)) {
    if ($process -and -not $process.HasExited) {
      Stop-Process -Id $process.Id -Force
    }
  }
}
