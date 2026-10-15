param([string]$DeliveryName = '津门清咽H5-清雅国风版-20261015')
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$outputRoot = Join-Path (Split-Path -Parent $projectRoot) 'output'
if ($DeliveryName -match '[\\/:]' -or $DeliveryName -in @('.', '..')) { throw '交付名称不能包含路径' }
$stage = Join-Path $outputRoot $DeliveryName
$archive = "$stage.zip"
if ((Test-Path -LiteralPath $stage) -or (Test-Path -LiteralPath $archive)) { throw '交付路径已存在，请使用新的名称，避免覆盖原文件。' }
New-Item -ItemType Directory -Path $stage -Force | Out-Null
$entries = @('src','public','scripts','tests','worker','.openai','.github','dist','package.json','pnpm-lock.yaml','pnpm-workspace.yaml','.npmrc','.gitignore','index.html','vite.config.mjs','README.md','AGENTS.md','design-qa.md','启动演示.cmd')
foreach ($entry in $entries) { Copy-Item -LiteralPath (Join-Path $projectRoot $entry) -Destination $stage -Recurse -Force }
$qaStage = Join-Path $stage 'qa'
New-Item -ItemType Directory -Path $qaStage -Force | Out-Null
foreach ($entry in @('before','after','poster','blend','inner','browser-check.json','built-check.json','validation-summary.json')) { Copy-Item -LiteralPath (Join-Path (Join-Path $projectRoot 'qa') $entry) -Destination $qaStage -Recurse -Force }
$inventory = @(Get-ChildItem -LiteralPath $stage -Recurse -File | ForEach-Object { [ordered]@{path=$_.FullName.Substring($stage.Length+1).Replace('\','/');bytes=$_.Length;sha256=(Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash} })
$inventory | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $stage '文件校验清单.json') -Encoding utf8
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($stage,$archive,[System.IO.Compression.CompressionLevel]::Optimal,$true,[System.Text.Encoding]::UTF8)
[ordered]@{directory=$stage;archive=$archive;bytes=(Get-Item -LiteralPath $archive).Length;sha256=(Get-FileHash -LiteralPath $archive -Algorithm SHA256).Hash;files=$inventory.Count} | ConvertTo-Json
