# TikTok Info Helper

[![version](https://img.shields.io/badge/version-1.0-blue.svg)](https://github.com/0iy/tiktok-info-helper)
[![license](https://img.shields.io/badge/license-MIT-green.svg)](https://github.com/0iy/tiktok-info-helper/blob/main/LICENSE)

A Tampermonkey userscript for extracting TikTok session data, including HttpOnly cookies.

---

### Purpose

This script is designed for developers, researchers, and others who require programmatic access to TikTok session information for authenticated API interactions.

It retrieves:
- **`sec_uid`**: Unique public user identifier.
- **`username`**: User handle.
- **`ms_token`**: Token used for tracking and requests.
- **HttpOnly Cookies**:
  - `sessionid` (Primary authentication cookie)
  - `ttwid`
  - `tt_csrf_token`
  - `sid_tt`

### Installation

#### 1. Install Tampermonkey Beta

> **Note:** Access to HttpOnly cookies requires `GM_cookie`, available only in Tampermonkey Beta. The stable version does not support this feature.
>
> Download Tampermonkey Beta from [official site](https://www.tampermonkey.net/index.php) for your browser.

#### 2. Install the Script

- Click the installation link: [Install `tiktok-info-helper.user.js`](https://github.com/0iy/tiktok-info-helper/raw/main/tiktok-info-helper.user.js).
- Tampermonkey will detect and prompt for installation.

### Usage

1. Navigate to `https://www.tiktok.com/` and log in.
2. Open Developer Tools (F12 or Ctrl+Shift+I).
3. Switch to the Console tab.
4. Execute:
   ```js
   ttGetInfos()
   ```
5. The script will output session data as JSON. If `sessionid` is null, ensure Tampermonkey Beta is installed.

### Security Considerations

This script only reads data present in the browser and does not modify or transmit information. However, the `sessionid` is sensitive and should be handled with care, as it can be used to access your account.

### License

Licensed under MIT. See [LICENSE](LICENSE) for details.

---
Developed by [0iy](https://github.com/0iy). Contributions welcome.
