# TorrServer IP Blocklist

TorrServer plugin that manages the global IP blocklist applied to all torrents.

## Features

- Block individual IPs or IP ranges from peer connections
- Live apply, no torrent engine restart needed
- Comment support with `#` for documenting entries
- Template insertion for first-time setup
- Settings persist across restarts and are applied on startup

## Installation

### From the plugin store

Open the admin panel, go to Plugins, then Store, then Install.

### Manual install

1. Download the latest release ZIP from [Releases](https://github.com/TorrServer-Project/plugin-blacklist-ip/releases).
2. In the admin panel go to Plugins, then Manual install, upload the ZIP.
3. Enable the plugin if it is disabled.

## Usage

Open the plugin page from the sidebar menu or at `/plugins/blacklist-ip/`.

The page shows a text area with the current blocklist. Each line contains one entry. Lines starting with `#` are treated as comments and ignored.

### Supported formats

```
# Single IP
1.2.3.4

# IP range
1.2.3.4 - 1.2.3.255

# Range with extra fields (third and fourth ignored)
1.2.3.4 - 1.2.3.255 , 000 , comment
```

Empty lines and comments are ignored. The whole list is parsed and applied to the torrent engine on save.

### Buttons

- **Save & Apply** - parses the text, applies it to the engine, and stores it in the plugin data.
- **Clear** - removes the blocklist and stops blocking any peers. Asks for confirmation.
- **Insert template** - fills the text area with a short reference template. If the field is not empty, asks for confirmation before replacing.

## Notes

- The blocklist is global. It affects every torrent served by the engine, for every user.
- The engine applies changes immediately. Active connections to newly blocked IPs are dropped on the next handshake.
- Removing the blocklist (via **Clear**) disables blocking entirely, it does not restore any previous list.
- Only users with rank 100 (Owner) can modify the blocklist.

## Compatibility

- TorrServer (Silo version) or later

## License

See [LICENSE](LICENSE).