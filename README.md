# 🎧 GROOVECMD — Terminal Music Player

A high-performance, retro-terminal style music streaming platform for personal use. Emulates a classic CRT terminal environment with green-on-black aesthetics, scanlines, and a powerful command-line interface.

**Made with ♥ by Puneet**

## 🚀 How to Run
1. Open your terminal and navigate to the project directory.
2. Start the proxy server:
   ```bash
   python server.py
   ```
3. Open your browser and go to:
   `http://localhost:3030`

---

## ⌨️ Command Reference

### 🎵 Playback Controls
| Command | Description |
| :--- | :--- |
| `play <song>` | Search and play a song instantly (Primary: YouTube) |
| `play <#>` | Play a song from the last search results (e.g., `play 1`) |
| `pause` | Toggle between Pause and Resume |
| `next` / `n` | Skip to the next song in the queue |
| `prev` / `p` | Go back to the previous song in history |
| `vol <0-100>` | Set the system volume (e.g., `vol 50`) |
| `shuffle` | Toggle shuffle mode for the queue |
| `repeat` | Cycle through repeat modes: `OFF` -> `1` (Repeat one) -> `ALL` |

### 🔍 Search & Discovery
| Command | Description |
| :--- | :--- |
| `search <query>` | Search JioSaavn for songs and metadata |
| `s <query>` | Shortcut for the search command |
| `yt <query>` | Force a direct search on YouTube |

### 📚 Library & Queue
| Command | Description |
| :--- | :--- |
| `add <#>` | Add a song from search results to the queue (e.g., `add 2`) |
| `queue` / `q` | Display the current song queue |
| `np` | Show "Now Playing" details in the terminal output |
| `like` | Add the current song to your "Liked" collection |
| `liked` | Show your list of liked songs |
| `play liked <#>` | Play a specific liked song (e.g., `play liked 1`) |

### ⚙️ System Commands
| Command | Description |
| :--- | :--- |
| `help` / `h` | Display the command reference guide |
| `clear` / `cls` | Clear the terminal screen |
| `exit` | Close the session |

---

## 🌟 Key Features
- **Dual-Source Engine**: Automatically switches between JioSaavn and YouTube for maximum reliability.
- **Ghost Protocol Proxy**: A built-in Python proxy server that bypasses CORS and network blocks.
- **CRT Aesthetics**: High-quality CSS styling including scanlines, CRT flicker, and glassmorphism.
- **Smart Fallback**: If a song link fails, the player automatically searches and plays a YouTube version without skipping a beat.
- **Zero Ads**: A completely clean, ad-free listening experience.

---

*Built with ♥ by Puneet — Keeping the Terminal vibe alive.*
