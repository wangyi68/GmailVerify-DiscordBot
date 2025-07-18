# GmailVerify Discord Bot

## 📝 Introduction
GmailVerify is a Discord bot for Gmail verification, helping your Discord server prevent spam, fake users, and only allow real members to access important channels/roles. The bot integrates multi-layer authentication: hCaptcha, email OTP verification, IP checking, and secure storage with MongoDB.

## 🚀 Key Features
- Verify Gmail via OTP code sent to email, only verified after entering the correct code.
- Modern, responsive web verification UI with hCaptcha anti-bot/spam.
- Auto-assign role to users who have successfully verified.
- Discord management commands: `/verify`, `/auth`, `/status`, `/reset`, `/cleardata`, `/unlink`, `/resend`, ...
- Maintenance mode, detailed logging, multi-language support.
- Anti-abuse IP, VPN/proxy detection, high security.
- Separated bot and web code for easy maintenance and extension.

## 🏗️ Project Structure
```
GmailVerify-BotV2/
├── bot/            # Discord bot code (commands, events, ...)
├── commands/       # Slash commands (verify, auth, status, ...)
├── config/         # Config files, dependencies
├── json/           # Temporary json files (e.g. ngrok)
├── locales/        # Multi-language support
├── models/         # Mongoose models (User, VerifyCode)
├── utils/          # Utilities, logger, IP checker
├── views/          # EJS views for web verification
├── index.js        # Start server + bot (or main.js)
├── main.js         # (if bot/server separated)
├── .env            # Environment variables
├── package.json    # Project info & dependencies
```

## ⚙️ Installation & Usage
1. **Clone repo & install dependencies:**
   ```bash
   git clone <repo-url>
   cd GmailVerify-BotV2
   npm install
   ```
2. **Configure `.env` file:**
   - Fill in bot token, client ID, secret, Gmail app password, MongoDB URI, hCaptcha key, ...
   - See sample in `.env.example`.
3. **Run the bot:**
   ```bash
   npm run dev   # (hot reload, auto reload on code change)
   # or
   npm start     # (normal run)
   ```
4. **Access the verification web:**
   - If using ngrok, the link will be logged in the console.
   - Default runs at `http://localhost:5000`.

## 🛡️ Verification Flow
1. User uses `/verify` command or visits the web, logs in with Discord.
2. Passes hCaptcha, enters email, receives verification code via Gmail.
3. Enters the code using `/auth <code>` command (or web if available).
4. If correct, bot assigns verified role and updates status.
5. If wrong or expired, user must request a new code.

## 🛠️ Commands (User & Admin)
- `/verify`      : Send verification code to your linked Gmail.
- `/auth <code>` : Enter verification code to complete authentication.
- `/status`      : View your verification status (email, verified or not, code expiry).
- `/reset`       : Delete your verification data (only if verified).
- `/cleardata`   : (Owner) Wipe all user & code data in the database.
- `/unlink`      : Unlink email from your Discord account.
- `/resend`      : Resend verification code if not expired.

## 🧩 Technologies Used
- Node.js, Express, Discord.js, EJS, TailwindCSS
- MongoDB (Mongoose)
- hCaptcha, Ngrok, Nodemailer

## 🔒 Security & Notes
- Never store real Gmail password, only app password.
- Verification code is deleted after successful verification.
- Only verified users are assigned special roles.
- Auto-detect and block spam, abuse, fake IP, VPN/proxy.

## 📄 License

MIT License

Copyright (c) 2025 WangYi

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---
> Dev: WangYi | 2025
