// ──────────────── Dependencies ────────────────
import {
  express, session, passport,
  DiscordStrategy, dotenv, path,
  fileURLToPath, mongoose,
  fs, writeFileSync, ngrok,
  axios, geoip,
  User, isBadIP
} from '../config/dependencies.js';

import { log } from '../utils/logger.js';

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
let baseURL = `http://localhost:${PORT}`;

// ────── Express Setup ──────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.urlencoded({ extended: true }));

// ────── Passport Setup ──────
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// ────── Start Server ──────
const startServer = async () => {
  try {
    if (process.env.USE_NGROK === 'true') {
      const url = await ngrok.connect({
        addr: PORT,
        authtoken: process.env.NGROK_AUTH_TOKEN
      });
      baseURL = url;
      writeFileSync(
        path.join(process.cwd(), 'json/ngrok.json'),
        JSON.stringify({ ngrokUrl: url }, null, 2)
      );
      log.success(`🚀 Ngrok tunnel started: ${url}`);
    } else {
      log.info('ℹ️ Ngrok is disabled. Using localhost.');
    }
  } catch (error) {
    log.error(`❌ Failed to start Ngrok: ${error.message}`);
    log.warn('👉 Falling back to localhost.');
  }

  const callbackURL = `${baseURL}/auth/discord/callback`;
  log.info(`🌐 Discord Redirect URI: ${callbackURL}`);

  passport.use(new DiscordStrategy({
    clientID: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    callbackURL,
    scope: ['identify', 'email']
  }, (accessToken, refreshToken, profile, done) => done(null, profile)));

  app.use(session({
    secret: process.env.SESSION_SECRET || 'keyboard cat',
    resave: false,
    saveUninitialized: false
  }));
  app.use(passport.initialize());
  app.use(passport.session());

  try {
    await mongoose.connect(process.env.MONGO_URI);
    log.success('✅ Connected to MongoDB');
  } catch (err) {
    log.error(`❌ MongoDB connection failed: ${err.message}`);
    return;
  }

  const maintenanceMode = process.env.MAINTENANCE_MODE === 'true';
  if (maintenanceMode) {
    app.get('*', (req, res) => res.render('maintenance'));
  } else {
    app.get('/', (req, res) => res.render('index', { user: req.user }));

    app.get('/url', (req, res) => {
      try {
        const ngrokData = JSON.parse(
          fs.readFileSync(path.join(process.cwd(), 'json/ngrok.json'), 'utf8')
        );
        const url = ngrokData.ngrokUrl || 'URL not found';
        res.render('url', { user: req.user, url });
      } catch (e) {
        res.render('url', { user: req.user, url: 'Ngrok is not running or file read error.' });
      }
    });

    app.get('/docs', (req, res) => res.render('docs'));

    app.get('/captcha', (req, res) => {
      if (!req.user) return res.redirect('/auth/discord');
      res.render('captcha', {
        user: req.user,
        siteKey: process.env.HCAPTCHA_SITE_KEY,
        error: null,
        success: null
      });
    });

    app.post('/captcha', async (req, res) => {
      const token = req.body['h-captcha-response'];
      const user = req.user;
      const siteKey = process.env.HCAPTCHA_SITE_KEY;

      if (!user) return res.redirect('/auth/discord');
      if (!token) {
        return res.render('captcha', {
          user, siteKey,
          error: '❌ Please complete the hCaptcha.',
          success: null
        });
      }

      const ua = req.headers['user-agent'] || '';
      if (!ua.includes('Mozilla')) return res.status(403).send('❌ Browser required.');

      const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      const geo = geoip.lookup(ip);
      if (!geo || geo.country === 'A1' || geo.country === 'A2') {
        return res.render('captcha', {
          user, siteKey,
          error: '❌ VPN or Proxy detected.',
          success: null
        });
      }

      const isBlocked = await isBadIP(ip);
      if (isBlocked) return res.status(403).send('❌ Your IP has been blocked.');

      try {
        const { data } = await axios.post(
          'https://hcaptcha.com/siteverify',
          new URLSearchParams({
            secret: process.env.HCAPTCHA_SECRET_KEY,
            response: token,
            remoteip: ip
          }),
          { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        if (!data.success) {
          return res.render('captcha', {
            user, siteKey,
            error: '❌ hCaptcha verification failed.',
            success: null
          });
        }
      } catch (err) {
        log.error('❌ hCaptcha verification failed: ' + err.message);
        return res.status(500).send('❌ hCaptcha error.');
      }

      let dbUser = await User.findOne({ discordId: user.id });
      if (!dbUser) {
        dbUser = await User.create({ discordId: user.id, email: user.email, verified: false });
        log.success(`👤 New user created: ${user.email}`);
      } else if (!dbUser.verified) {
        dbUser.email = user.email;
        await dbUser.save();
        log.success(`👤 User email updated: ${user.email}`);
      } else {
        log.info(`👤 User already verified: ${user.email}`);
      }

      res.redirect('/');
    });

    app.get('/auth/discord', passport.authenticate('discord'));

    app.get('/auth/discord/callback',
      passport.authenticate('discord', { failureRedirect: '/' }),
      (req, res) => res.redirect('/captcha')
    );
  }

  app.listen(PORT, () => {
    log.success(`✅ Server running on ${baseURL}`);
  });
};

export { startServer };
