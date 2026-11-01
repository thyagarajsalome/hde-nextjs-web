param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$ArgsList
)
node "$PSScriptRoot\scripts\hde-admin.mjs" @ArgsList
