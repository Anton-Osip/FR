# Скрипт для перемещения assets в shared/assets

Write-Host "Перемещение assets в shared/assets..." -ForegroundColor Green

# Создаём папку animations если не существует
$animationsPath = "src\shared\assets\animations"
if (-not (Test-Path $animationsPath)) {
    New-Item -ItemType Directory -Path $animationsPath -Force | Out-Null
    Write-Host "Создана папка: $animationsPath" -ForegroundColor Yellow
}

# Создаём папку images если не существует
$imagesPath = "src\shared\assets\images"
if (-not (Test-Path $imagesPath)) {
    New-Item -ItemType Directory -Path $imagesPath -Force | Out-Null
    Write-Host "Создана папка: $imagesPath" -ForegroundColor Yellow
}

# Перемещаем animations (anomation -> animations)
Write-Host "Перемещаем animations..." -ForegroundColor Cyan
Get-ChildItem -Path "src\assets\anomation\*" -File | ForEach-Object {
    Move-Item -Path $_.FullName -Destination $animationsPath -Force
    Write-Host "  Перемещён: $($_.Name)" -ForegroundColor Gray
}

# Перемещаем icons
Write-Host "Перемещаем icons..." -ForegroundColor Cyan
Get-ChildItem -Path "src\assets\icons\*" -File | ForEach-Object {
    Move-Item -Path $_.FullName -Destination "src\shared\assets\icons\" -Force
    Write-Host "  Перемещён: $($_.Name)" -ForegroundColor Gray
}

# Перемещаем images
Write-Host "Перемещаем images..." -ForegroundColor Cyan
Get-ChildItem -Path "src\assets\images\*" -Recurse -File | ForEach-Object {
    $relativePath = $_.FullName.Replace((Get-Location).Path + "\src\assets\images\", "")
    $destPath = Join-Path $imagesPath $relativePath
    $destDir = Split-Path $destPath -Parent
    
    if (-not (Test-Path $destDir)) {
        New-Item -ItemType Directory -Path $destDir -Force | Out-Null
    }
    
    Move-Item -Path $_.FullName -Destination $destPath -Force
    Write-Host "  Перемещён: $relativePath" -ForegroundColor Gray
}

# Удаляем старые пустые папки
Write-Host "Удаляем старые папки..." -ForegroundColor Cyan
Remove-Item -Path "src\assets\anomation" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "src\assets\icons" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "src\assets\images" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "src\assets" -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "`nГотово! Все assets перемещены в src\shared\assets\" -ForegroundColor Green
Write-Host "Теперь можно запустить: npm run dev" -ForegroundColor Yellow

