import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

export async function isBadIP(ip) {
  try {
    const res = await axios.get(`https://api.cloudflare.com/client/v4/ip/${ip}`, {
      headers: {
        Authorization: `Bearer ${process.env.CLOUDFLARE_API_KEY}`,
        Accept: 'application/json'
      }
    });

    const data = res.data;

    // Tuỳ theo cấu trúc thật của API Cloudflare (ví dụ giả lập bên dưới):
    const threatScore = data.result?.threatScore || 0;
    const botScore = data.result?.botScore || 0;

    // Đánh giá như AbuseIPDB: nếu threatScore hoặc botScore > 50 thì coi là nguy hiểm
    if (threatScore > 50 || botScore > 50) {
      return true;
    }

    return false;
  } catch (err) {
    return false;
  }
}
