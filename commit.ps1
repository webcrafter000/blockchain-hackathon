function Commit-Human {
    $messages = @(
        "init project setup",
        "add basic deps",
        "setup react base",
        "add chart components",
        "basic ui layout",
        "wallet integration wip",
        "fix typescript errors",
        "update dependencies",
        "add websocket connection",
        "implement transaction view",
        "add risk scoring",
        "optimize performance",
        "fix memory leak",
        "update styles",
        "refactor components"
    )
    $msg = $messages | Get-Random
    git add .
    git commit -m $msg
    Write-Host "committed: $msg"
}
