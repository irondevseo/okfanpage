# Video Download Integration Guide — Powered by yt-dlp

> **Context data cho AI IDE**: Tài liệu này mô tả kiến trúc, công nghệ lõi và cách tích hợp tính năng tải video từ các nền tảng mạng xã hội vào phần mềm của bạn. Công nghệ nền tảng là **yt-dlp** — thư viện Python mã nguồn mở hỗ trợ hơn 1.700 website.

---

## 1. Kiến trúc lõi (Core Architecture)

### 1.1 ytDownloader Stack

Repo `aandrew-me/ytDownloader` là desktop GUI app dựa trên:

| Layer | Technology | Vai trò |
|---|---|---|
| **Download Engine** | `yt-dlp` (Python) | Toàn bộ logic tải video, trích xuất URL stream |
| **Media Processing** | `FFmpeg` + `FFprobe` | Merge video+audio streams, convert format, compress |
| **Desktop Shell** | `Electron` (Node.js) | GUI cross-platform (Windows/macOS/Linux) |
| **Frontend** | HTML/CSS/JavaScript | Giao diện người dùng trong Electron |

### 1.2 Luồng hoạt động tổng quát

```
User nhập URL
    ↓
yt-dlp extract_info(url) → lấy metadata, danh sách formats
    ↓
Chọn format (bestvideo + bestaudio)
    ↓
yt-dlp download streams → file tạm (.part)
    ↓
FFmpeg merge video + audio → file output (.mp4 / .mkv)
    ↓
Xong → xuất file ra thư mục đích
```

### 1.3 Tại sao yt-dlp là lựa chọn tốt nhất

- Hỗ trợ **1.700+ websites** (xem danh sách tại `yt-dlp/supportedsites.md`)
- Actively maintained, cập nhật liên tục khi platform thay đổi
- Có Python API để nhúng trực tiếp vào code (không cần spawn subprocess)
- Hỗ trợ format selection, subtitle, thumbnail, metadata embed
- Tích hợp SponsorBlock, aria2c để tải nhanh hơn

---

## 2. Cài đặt & Dependencies

### 2.1 Cài đặt yt-dlp

```bash
# Cài bản stable
pip install yt-dlp

# Cài bản nightly (mới nhất, fix bug nhanh nhất)
pip install -U --pre "yt-dlp[default]"

# Cài với curl_cffi (khuyến nghị — giúp bypass bot detection tốt hơn)
pip install "yt-dlp[default,curl-cffi]"

# Cập nhật
pip install -U yt-dlp
# hoặc
yt-dlp -U
```

### 2.2 FFmpeg (bắt buộc)

FFmpeg là bắt buộc để merge video+audio stream và convert format. Hầu hết video chất lượng cao (1080p, 4K) trên YouTube/TikTok được serve dưới dạng stream riêng biệt.

```bash
# Ubuntu/Debian
sudo apt install ffmpeg

# macOS
brew install ffmpeg

# Windows — dùng build từ yt-dlp team (có patch đặc biệt)
# https://github.com/yt-dlp/FFmpeg-Builds/releases
```

### 2.3 Dependencies tùy chọn nhưng khuyến nghị

```
curl_cffi    → Giả lập Chrome/Edge/Safari, bypass bot detection
brotli       → Hỗ trợ Brotli content encoding
websockets   → Tải qua WebSocket (một số live stream)
pycryptodomex → Giải mã AES-128 HLS streams
```

---

## 3. Python API — Tích hợp vào phần mềm

### 3.1 Template cơ bản

```python
import yt_dlp

def download_video(url: str, output_dir: str = "./downloads") -> dict:
    """
    Tải video từ bất kỳ URL nào được yt-dlp hỗ trợ.
    Trả về metadata của video sau khi tải xong.
    """
    ydl_opts = {
        # Format: tải video + audio tốt nhất, merge thành mp4
        'format': 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/bestvideo+bestaudio/best',
        'merge_output_format': 'mp4',
        
        # Output path template
        'outtmpl': f'{output_dir}/%(uploader)s/%(title)s.%(ext)s',
        
        # Không download playlist nếu URL là playlist
        'noplaylist': True,
        
        # Progress hook
        'progress_hooks': [progress_hook],
        
        # User-Agent để tránh bị block
        'http_headers': {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
    }
    
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=True)
        return info


def progress_hook(d: dict):
    if d['status'] == 'downloading':
        percent = d.get('_percent_str', 'N/A')
        speed = d.get('_speed_str', 'N/A')
        print(f"\r⬇ {percent} | {speed}", end='')
    elif d['status'] == 'finished':
        print(f"\n✅ Download complete: {d['filename']}")
    elif d['status'] == 'error':
        print(f"\n❌ Error: {d}")
```

### 3.2 Lấy metadata (không download)

```python
def get_video_info(url: str, cookies_file: str = None) -> dict:
    """
    Lấy thông tin video mà không tải xuống.
    Hữu ích để preview thông tin trước khi tải.
    """
    ydl_opts = {
        'quiet': True,
        'no_warnings': True,
    }
    if cookies_file:
        ydl_opts['cookiefile'] = cookies_file
    
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=False)
    
    return {
        'title': info.get('title'),
        'duration': info.get('duration'),          # seconds
        'uploader': info.get('uploader'),
        'view_count': info.get('view_count'),
        'like_count': info.get('like_count'),
        'description': info.get('description'),
        'thumbnail': info.get('thumbnail'),
        'formats': info.get('formats', []),        # danh sách format khả dụng
        'webpage_url': info.get('webpage_url'),
        'extractor': info.get('extractor'),        # tên platform (youtube, tiktok, ...)
    }
```

### 3.3 Liệt kê formats có sẵn

```python
def list_formats(url: str) -> list:
    """Liệt kê tất cả format/chất lượng khả dụng của video."""
    with yt_dlp.YoutubeDL({'quiet': True}) as ydl:
        info = ydl.extract_info(url, download=False)
    
    formats = []
    for f in info.get('formats', []):
        formats.append({
            'format_id': f.get('format_id'),
            'ext': f.get('ext'),
            'resolution': f.get('resolution', 'audio only'),
            'fps': f.get('fps'),
            'vcodec': f.get('vcodec'),
            'acodec': f.get('acodec'),
            'filesize': f.get('filesize'),
            'tbr': f.get('tbr'),  # total bitrate (kbps)
        })
    return formats
```

### 3.4 Tải audio (extract mp3)

```python
def download_audio(url: str, output_dir: str = "./downloads", quality: str = "192") -> str:
    """Tải và convert audio thành MP3."""
    ydl_opts = {
        'format': 'bestaudio/best',
        'outtmpl': f'{output_dir}/%(title)s.%(ext)s',
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': quality,  # '128', '192', '320'
        }],
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=True)
    return info.get('title')
```

### 3.5 Error handling

```python
from yt_dlp.utils import DownloadError, ExtractorError

def safe_download(url: str, **kwargs) -> dict | None:
    try:
        return download_video(url, **kwargs)
    except DownloadError as e:
        # Video không tồn tại, bị xóa, private, DRM...
        print(f"Download error: {e}")
        return None
    except ExtractorError as e:
        # yt-dlp không nhận dạng được URL hoặc extractor bị lỗi
        print(f"Extractor error: {e}")
        return None
    except Exception as e:
        print(f"Unexpected error: {e}")
        return None
```

---

## 4. Cách tải từng nền tảng cụ thể

### 4.1 YouTube

**URL patterns được hỗ trợ:**
- Video: `https://www.youtube.com/watch?v=VIDEO_ID`
- Short URL: `https://youtu.be/VIDEO_ID`
- Shorts: `https://www.youtube.com/shorts/VIDEO_ID`
- Playlist: `https://www.youtube.com/playlist?list=PLAYLIST_ID`
- Live stream: `https://www.youtube.com/live/VIDEO_ID`
- Channel: `https://www.youtube.com/@channel_name`

**Đặc điểm kỹ thuật:**
- Video chất lượng cao (1080p+) được serve dưới dạng stream riêng (video-only + audio-only), phải dùng FFmpeg để merge
- Một số video yêu cầu login (age-restricted, members-only)
- YouTube thường trigger bot-detection → cần cookies

**Code mẫu:**

```python
# Video thường
ydl_opts = {
    'format': 'bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
    'merge_output_format': 'mp4',
    'outtmpl': '%(title)s.%(ext)s',
    # Nhúng subtitle tiếng Anh nếu có
    'writesubtitles': True,
    'subtitleslangs': ['en', 'vi'],
    'embedsubtitles': True,
    # Nhúng thumbnail
    'embedthumbnail': True,
    # Nhúng metadata
    'addmetadata': True,
    # Cookie từ browser (quan trọng cho 2025+)
    'cookiesfrombrowser': ('chrome',),  # hoặc 'firefox'
}

# Playlist (tải toàn bộ)
ydl_opts_playlist = {
    'format': 'bestvideo+bestaudio/best',
    'outtmpl': '%(playlist)s/%(playlist_index)s - %(title)s.%(ext)s',
    'yes_playlist': True,
    'ignoreerrors': True,  # bỏ qua video lỗi, tiếp tục tải
}
```

**Lưu ý quan trọng (2025-2026):**
- YouTube yêu cầu JavaScript execution → yt-dlp cần `yt-dlp-ejs` + JavaScript runtime (Deno/Node.js)
- Bot detection ngày càng gắt → luôn dùng `--cookies-from-browser chrome` hoặc `cookiefile`
- DRM-protected content (một số TV client) **không thể tải**

---

### 4.2 TikTok

**URL patterns:**
- Video: `https://www.tiktok.com/@username/video/VIDEO_ID`
- Short URL: `https://vm.tiktok.com/SHORT_ID`
- User profile: `https://www.tiktok.com/@username`
- Trend/hashtag: `https://www.tiktok.com/tag/HASHTAG`

**Đặc điểm kỹ thuật:**
- Video public thường tải được không cần auth
- Video có watermark TikTok (logo ở góc) — yt-dlp tự động chọn URL không watermark nếu có
- Một số video "sensitive content" cần cookies
- **Không hỗ trợ login bằng username/password** — bắt buộc dùng cookies

**Code mẫu:**

```python
ydl_opts = {
    'format': 'best',           # TikTok thường chỉ có 1 format
    'outtmpl': '%(uploader)s_%(id)s.%(ext)s',
    # Tải video không watermark (nếu server trả về)
    'extractor_args': {
        'tiktok': {
            'webpage_download': ['1'],  # fallback nếu API block
        }
    },
    # Cookie bắt buộc cho nội dung restricted
    'cookiefile': 'tiktok_cookies.txt',
    # Hoặc lấy từ browser
    'cookiesfrombrowser': ('chrome',),
}

# Tải toàn bộ video của một user
def download_tiktok_user(username: str):
    url = f"https://www.tiktok.com/@{username}"
    ydl_opts = {
        'format': 'best',
        'outtmpl': f'tiktok/{username}/%(title)s_%(id)s.%(ext)s',
        'ignoreerrors': True,
        'cookiesfrombrowser': ('chrome',),
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([url])
```

**Lưu ý:**
- Private account → cần cookies của account có follow
- Rate limit khá gắt → thêm `sleep_interval` nếu tải nhiều

---

### 4.3 Instagram

**URL patterns:**
- Reel: `https://www.instagram.com/reel/SHORTCODE/`
- Post (ảnh/video): `https://www.instagram.com/p/SHORTCODE/`
- Story: `https://www.instagram.com/stories/USERNAME/STORY_ID/`
- IGTV: `https://www.instagram.com/tv/SHORTCODE/`

**Đặc điểm kỹ thuật:**
- Instagram **bắt buộc phải có cookies** (2024+) — ngay cả nội dung public cũng bị rate-limit nếu không có auth
- Story chỉ xem được trong 24h
- Carousel post (nhiều ảnh/video trong 1 post): yt-dlp tải từng item

**Code mẫu:**

```python
ydl_opts = {
    'format': 'best',
    'outtmpl': 'instagram/%(uploader)s/%(id)s.%(ext)s',
    # BẮT BUỘC — Instagram block nếu không có cookie
    'cookiesfrombrowser': ('chrome',),
    # Hoặc dùng file cookie export từ browser
    # 'cookiefile': 'instagram_cookies.txt',
    
    # Thêm sleep giữa các request để tránh rate-limit
    'sleep_interval': 2,
    'max_sleep_interval': 5,
    
    # Bỏ qua lỗi với carousel
    'ignoreerrors': True,
}
```

**Lưu ý quan trọng:**
- Instagram cực kỳ nhạy cảm với bot detection
- Không dùng cùng cookies cho nhiều instance song song
- Nếu bị rate-limit, chờ 15-30 phút

---

### 4.4 Facebook

**URL patterns:**
- Video thường: `https://www.facebook.com/video/VIDEO_ID`
- Watch tab: `https://www.facebook.com/watch/?v=VIDEO_ID`
- Reel: `https://www.facebook.com/reel/REEL_ID`
- Group video: `https://www.facebook.com/groups/GROUP_ID/permalink/POST_ID`

**Đặc điểm kỹ thuật:**
- Video public thường tải được
- Video trong group hoặc từ account private → cần cookies
- Facebook serve nhiều chất lượng (SD, HD) → yt-dlp tự chọn tốt nhất

**Code mẫu:**

```python
ydl_opts = {
    'format': 'best',
    'outtmpl': 'facebook/%(uploader)s/%(title)s.%(ext)s',
    # Cookie quan trọng cho FB
    'cookiesfrombrowser': ('chrome',),
    # FB cần referer header
    'http_headers': {
        'Referer': 'https://www.facebook.com/',
    },
}
```

---

### 4.5 Twitter / X

**URL patterns:**
- Tweet có video: `https://twitter.com/user/status/TWEET_ID`
  hoặc: `https://x.com/user/status/TWEET_ID`
- Twitter Spaces: `https://twitter.com/i/spaces/SPACE_ID`

**Đặc điểm kỹ thuật:**
- Tweet public thường tải được không cần auth
- Protected tweet (tài khoản private) → **bắt buộc** có cookies của account follow
- Twitter Spaces (audio livestream) cũng hỗ trợ

**Code mẫu:**

```python
ydl_opts = {
    'format': 'best',
    'outtmpl': 'twitter/%(uploader)s/%(id)s.%(ext)s',
    # Cần cookie cho protected tweets
    'cookiesfrombrowser': ('chrome',),
    # Twitter dùng GraphQL API → yt-dlp handle tự động
}

# Tải Twitter Spaces (audio)
def download_twitter_space(space_url: str):
    ydl_opts = {
        'format': 'bestaudio/best',
        'outtmpl': 'spaces/%(id)s.%(ext)s',
        'cookiesfrombrowser': ('chrome',),
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
        }],
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([space_url])
```

---

### 4.6 YouTube Shorts

**URL pattern:**
- `https://www.youtube.com/shorts/VIDEO_ID`

Xử lý y hệt YouTube video thông thường. yt-dlp nhận diện và tải bình thường.

```python
ydl_opts = {
    'format': 'best',
    'outtmpl': 'shorts/%(title)s.%(ext)s',
    'cookiesfrombrowser': ('chrome',),
}
```

---

### 4.7 Reddit

**URL patterns:**
- Post có video: `https://www.reddit.com/r/SUBREDDIT/comments/POST_ID/`
- Video trực tiếp: `https://v.redd.it/VIDEO_ID`

**Đặc điểm kỹ thuật:**
- Reddit host video riêng trên `v.redd.it` với video và audio là stream riêng biệt
- FFmpeg bắt buộc để merge

```python
ydl_opts = {
    'format': 'bestvideo+bestaudio/best',
    'merge_output_format': 'mp4',
    'outtmpl': 'reddit/%(subreddit)s/%(id)s.%(ext)s',
}
```

---

### 4.8 Twitch

**URL patterns:**
- Livestream: `https://www.twitch.tv/CHANNEL_NAME`
- VOD: `https://www.twitch.tv/videos/VIDEO_ID`
- Clip: `https://www.twitch.tv/CHANNEL/clip/CLIP_ID`
  hoặc: `https://clips.twitch.tv/CLIP_ID`

```python
# VOD / Clip
ydl_opts = {
    'format': 'best',
    'outtmpl': 'twitch/%(uploader)s/%(id)s.%(ext)s',
}

# Livestream (tải đang phát)
ydl_opts_live = {
    'format': 'best',
    'outtmpl': 'twitch/live/%(uploader)s_%(timestamp)s.%(ext)s',
    'live_from_start': True,  # tải từ đầu stream nếu có replay
}
```

---

### 4.9 Vimeo

**URL patterns:**
- Video public: `https://vimeo.com/VIDEO_ID`
- Video private (password): `https://vimeo.com/VIDEO_ID` + cần `videopassword`
- Embedded: `https://player.vimeo.com/video/VIDEO_ID`

```python
ydl_opts = {
    'format': 'bestvideo+bestaudio/best',
    'merge_output_format': 'mp4',
    'outtmpl': 'vimeo/%(uploader)s/%(title)s.%(ext)s',
    # Nếu video có password
    # 'videopassword': 'your_password_here',
    # Vimeo yêu cầu account cho một số video
    # 'cookiesfrombrowser': ('chrome',),
}
```

---

### 4.10 Dailymotion

```python
ydl_opts = {
    'format': 'best',
    'outtmpl': 'dailymotion/%(uploader)s/%(title)s.%(ext)s',
}
```

---

### 4.11 Bilibili (中国)

**URL pattern:**
- `https://www.bilibili.com/video/BVXXXXXXXX`

**Đặc điểm:**
- Chất lượng cao (1080p+) yêu cầu đăng nhập tài khoản Bilibili
- Phần lớn nội dung cần cookie để tải chất lượng cao

```python
ydl_opts = {
    'format': 'bestvideo+bestaudio/best',
    'merge_output_format': 'mp4',
    'outtmpl': 'bilibili/%(uploader)s/%(title)s.%(ext)s',
    'cookiefile': 'bilibili_cookies.txt',
}
```

---

### 4.12 Pinterest

- Hỗ trợ tải video từ pin
- `https://www.pinterest.com/pin/PIN_ID`

```python
ydl_opts = {
    'format': 'best',
    'outtmpl': 'pinterest/%(id)s.%(ext)s',
}
```

---

### 4.13 Snapchat

- Chỉ hỗ trợ **Snapchat Spotlight** (nội dung public)
- `https://www.snapchat.com/spotlight/SNAP_ID`

---

### 4.14 LinkedIn

- Hỗ trợ video trên bài post và LinkedIn Learning
- Bắt buộc phải có cookies (LinkedIn yêu cầu đăng nhập)

```python
ydl_opts = {
    'format': 'best',
    'outtmpl': 'linkedin/%(title)s.%(ext)s',
    'cookiesfrombrowser': ('chrome',),
}
```

---

### 4.15 Weibo / WeChat

- Weibo: `https://weibo.com/VIDEO_URL`
- Hỗ trợ tải video từ Weibo posts

---

## 5. Quản lý Cookies

Cookies là yếu tố quan trọng nhất để tải được nội dung từ các nền tảng cần đăng nhập (Instagram, TikTok private, YouTube age-restricted...).

### 5.1 Lấy cookie từ browser

```python
# Tự động lấy từ Chrome profile
ydl_opts = {'cookiesfrombrowser': ('chrome',)}

# Firefox
ydl_opts = {'cookiesfrombrowser': ('firefox',)}

# Chrome với profile cụ thể
ydl_opts = {'cookiesfrombrowser': ('chrome', '/path/to/profile', None, 'Default')}
```

### 5.2 Dùng file cookies.txt (Netscape format)

Dùng extension browser "Get cookies.txt LOCALLY" để export:

```python
ydl_opts = {
    'cookiefile': '/path/to/cookies.txt'
}
```

Format cookies.txt (Netscape HTTP Cookie File):
```
# Netscape HTTP Cookie File
.youtube.com	TRUE	/	TRUE	1234567890	CONSENT	YES+
.tiktok.com	TRUE	/	FALSE	1234567890	sessionid	abc123...
```

### 5.3 Cookie theo từng platform

| Platform | Cần cookie? | Ghi chú |
|---|---|---|
| YouTube | Nên có | Bot detection, age-restricted, members-only |
| TikTok | Khi cần | Private/sensitive content |
| Instagram | **Bắt buộc** | Public content cũng bị rate-limit |
| Facebook | Khi cần | Private group, friends-only |
| Twitter/X | Khi cần | Protected accounts |
| Twitch | Không | Hầu hết public |
| Vimeo | Khi cần | Private/password-protected |
| Bilibili | Khi cần | 1080p+ cần account |
| LinkedIn | **Bắt buộc** | Yêu cầu login |

---

## 6. Format Selection (Chọn chất lượng video)

### 6.1 Format selector syntax

```python
# Tốt nhất có thể (video + audio merged)
'format': 'bestvideo+bestaudio/best'

# Tốt nhất nhưng giới hạn 1080p
'format': 'bestvideo[height<=1080]+bestaudio/best[height<=1080]'

# Chỉ mp4, 720p
'format': 'bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/best[height<=720][ext=mp4]'

# Audio only
'format': 'bestaudio/best'

# Format cụ thể (lấy format_id từ -F)
'format': '137+140'

# Worst quality (test nhanh)
'format': 'worst'
```

### 6.2 Output template

```python
# Cơ bản
'outtmpl': '%(title)s.%(ext)s'

# Có uploader và năm upload
'outtmpl': '%(uploader)s/%(upload_date>%Y)s/%(title)s.%(ext)s'

# Playlist
'outtmpl': '%(playlist)s/%(playlist_index)s - %(title)s.%(ext)s'

# Các biến hữu ích:
# %(title)s, %(id)s, %(uploader)s, %(upload_date)s
# %(duration)s, %(view_count)s, %(ext)s
# %(playlist)s, %(playlist_index)s
# %(timestamp)s (Unix timestamp)
```

---

## 7. Advanced Options

### 7.1 Tải nhanh hơn với aria2c

```python
ydl_opts = {
    'external_downloader': 'aria2c',
    'external_downloader_args': [
        '-x', '16',    # 16 connections
        '-s', '16',    # 16 split
        '-k', '1M',    # 1MB chunks
    ],
}
```

### 7.2 Proxy (bypass geo-restriction hoặc rate-limit)

```python
ydl_opts = {
    'proxy': 'http://user:pass@proxy_ip:port',
    # SOCKS5
    # 'proxy': 'socks5://user:pass@proxy_ip:port',
}
```

### 7.3 Rate limiting (tránh bị block)

```python
ydl_opts = {
    'sleep_interval': 3,          # chờ ít nhất 3s giữa các download
    'max_sleep_interval': 8,      # tối đa 8s
    'sleep_interval_requests': 1, # chờ giữa các API request
    'ratelimit': 5_000_000,       # giới hạn tốc độ: 5MB/s
}
```

### 7.4 Download archive (tránh tải lại)

```python
ydl_opts = {
    'download_archive': 'downloaded.txt',
    # yt-dlp ghi ID đã tải vào file, lần sau skip nếu đã tải rồi
}
```

### 7.5 Subtitle

```python
ydl_opts = {
    'writesubtitles': True,          # tải subtitle gốc
    'writeautomaticsub': True,       # tải auto-generated subtitle
    'subtitleslangs': ['en', 'vi'],  # ngôn ngữ
    'subtitlesformat': 'srt',        # srt, vtt, ass
    'embedsubtitles': True,          # nhúng vào file mp4
}
```

### 7.6 Thumbnail & Metadata

```python
ydl_opts = {
    'writethumbnail': True,     # lưu thumbnail ra file
    'embedthumbnail': True,     # nhúng thumbnail vào video file
    'addmetadata': True,        # nhúng title, description, uploader...
    'writeinfojson': True,      # lưu toàn bộ metadata ra file .json
}
```

### 7.7 Chỉ tải một phần video (time range)

```python
ydl_opts = {
    'download_ranges': lambda info, ydl: [{'start_time': 60, 'end_time': 120}],
    # Tải từ giây 60 đến giây 120
    # Cần FFmpeg
}
# Hoặc dùng postprocessor
ydl_opts = {
    'postprocessors': [{
        'key': 'FFmpegVideoRemuxer',
        'when': 'post_process',
    }],
    'postprocessor_args': {
        'ffmpeg': ['-ss', '00:01:00', '-to', '00:02:00'],
    },
}
```

---

## 8. Tích hợp vào Node.js / Electron (ytDownloader pattern)

Nếu dự án của bạn là Electron app (như ytDownloader), gọi yt-dlp qua subprocess:

### 8.1 Spawn subprocess

```javascript
const { spawn } = require('child_process');

function downloadVideo(url, outputPath, options = {}) {
    return new Promise((resolve, reject) => {
        const args = [
            url,
            '-f', options.format || 'bestvideo+bestaudio/best',
            '-o', outputPath,
            '--merge-output-format', 'mp4',
            '--no-playlist',
        ];
        
        if (options.cookiesFile) {
            args.push('--cookies', options.cookiesFile);
        }
        
        const proc = spawn('yt-dlp', args);
        
        proc.stdout.on('data', (data) => {
            // Parse progress
            const str = data.toString();
            const match = str.match(/(\d+\.?\d*)%/);
            if (match) {
                const percent = parseFloat(match[1]);
                options.onProgress?.(percent);
            }
        });
        
        proc.stderr.on('data', (data) => {
            console.error('yt-dlp stderr:', data.toString());
        });
        
        proc.on('close', (code) => {
            if (code === 0) resolve(outputPath);
            else reject(new Error(`yt-dlp exited with code ${code}`));
        });
    });
}
```

### 8.2 Lấy video info (JSON)

```javascript
function getVideoInfo(url) {
    return new Promise((resolve, reject) => {
        const args = [url, '--dump-json', '--no-download', '--no-playlist'];
        let output = '';
        
        const proc = spawn('yt-dlp', args);
        proc.stdout.on('data', d => output += d.toString());
        proc.on('close', (code) => {
            if (code === 0) {
                try {
                    resolve(JSON.parse(output));
                } catch (e) {
                    reject(e);
                }
            } else {
                reject(new Error(`Failed with code ${code}`));
            }
        });
    });
}
```

---

## 9. Troubleshooting — Lỗi thường gặp

| Lỗi | Nguyên nhân | Giải pháp |
|---|---|---|
| `Sign in to confirm you're not a bot` | YouTube bot detection | Dùng `--cookies-from-browser chrome` |
| `Login required` | Nội dung cần đăng nhập | Export và truyền cookies |
| `DRM protected` | Video có DRM (Widevine...) | Không thể tải — DRM không thể bypass |
| `This video is private` | Video/account private | Cần cookies của account có quyền xem |
| `Rate limit` | Gửi request quá nhiều | Thêm `sleep_interval`, dùng proxy |
| `HTTP Error 403` | Bị block IP/UA | Đổi User-Agent, dùng proxy |
| `Merge failed` | FFmpeg không tìm thấy | Cài FFmpeg và add vào PATH |
| `Format not available` | Format ID sai | Chạy `yt-dlp -F URL` để xem format |
| `Geo-restricted` | Nội dung bị chặn theo vùng | Dùng proxy từ vùng được phép |

---

## 10. Legal & Ethical Considerations

> **Quan trọng:** Tài liệu này chỉ phục vụ mục đích kỹ thuật và nghiên cứu.

- Chỉ tải video cho mục đích **cá nhân, offline, không vi phạm bản quyền**
- Kiểm tra Terms of Service của từng nền tảng trước khi tích hợp
- Không phân phối lại nội dung có bản quyền
- Một số nền tảng (Netflix, Disney+, Amazon Prime) dùng DRM → yt-dlp **không hỗ trợ** và không nên cố bypass
- Tôn trọng rate limit của platform để không gây hại cho service

---

## 11. Tóm tắt Quick Reference

```python
import yt_dlp

# === TEMPLATE NHANH NHẤT ===
def download(url, out_dir="downloads", cookies_browser="chrome"):
    with yt_dlp.YoutubeDL({
        'format': 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/bestvideo+bestaudio/best',
        'merge_output_format': 'mp4',
        'outtmpl': f'{out_dir}/%(uploader)s/%(title)s.%(ext)s',
        'cookiesfrombrowser': (cookies_browser,),
        'ignoreerrors': True,
        'sleep_interval': 2,
    }) as ydl:
        return ydl.extract_info(url, download=True)

# Dùng:
download("https://www.youtube.com/watch?v=...")
download("https://www.tiktok.com/@user/video/...")
download("https://www.instagram.com/reel/...")
download("https://twitter.com/user/status/...")
download("https://www.facebook.com/watch/?v=...")
# và 1700+ URLs khác yt-dlp hỗ trợ
```

---

*Tài liệu được tạo dựa trên phân tích repo `aandrew-me/ytDownloader` và `yt-dlp/yt-dlp`. Cập nhật lần cuối: 2026-03. Luôn cập nhật yt-dlp lên version mới nhất để đảm bảo compatibility với các platform.*