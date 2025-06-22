## GitHub Copilot Chat

- Extension Version: 0.28.1 (prod)
- VS Code: vscode/1.101.0
- OS: Windows

## Network

User Settings:
```json
  "github.copilot.advanced.debug.useElectronFetcher": true,
  "github.copilot.advanced.debug.useNodeFetcher": false,
  "github.copilot.advanced.debug.useNodeFetchFetcher": true
```

Connecting to https://api.github.com:
- DNS ipv4 Lookup: 20.201.28.148 (139 ms)
- DNS ipv6 Lookup: Error (110 ms): getaddrinfo ENOTFOUND api.github.com
- Proxy URL: None (3 ms)
- Electron fetch (configured): HTTP 200 (39 ms)
- Node.js https: HTTP 200 (247 ms)
- Node.js fetch: HTTP 200 (144 ms)
- Helix fetch: HTTP 200 (192 ms)

Connecting to https://api.individual.githubcopilot.com/_ping:
- DNS ipv4 Lookup: 140.82.114.22 (116 ms)
- DNS ipv6 Lookup: Error (111 ms): getaddrinfo ENOTFOUND api.individual.githubcopilot.com
- Proxy URL: None (4 ms)
- Electron fetch (configured): HTTP 200 (1278 ms)
- Node.js https: 