// ──────────────── Core Modules ────────────────
import express             from 'express';
import session             from 'express-session';
import passport            from 'passport';
import dotenv              from 'dotenv';
import path                from 'path';
import { fileURLToPath }   from 'url';
import chalk               from 'chalk';
import mongoose            from 'mongoose';
import fs, {
  readdirSync,
  writeFileSync
}                          from 'fs';
import ngrok               from 'ngrok';
import axios               from 'axios';
import geoip               from 'geoip-lite';

// ──────────────── Passport Strategy ────────────────
import { Strategy as DiscordStrategy } from 'passport-discord';

// ──────────────── Discord.js ────────────────
import {
  Client,
  GatewayIntentBits,
  Collection,
  REST,
  Routes,
  ActivityType,
  MessageFlags
}                          from 'discord.js';

// ──────────────── Models & Utils ────────────────
import User                from '../models/User.js';
import { isBadIP }         from '../utils/checkIpReputation.js';

// ──────────────── Bot Startup ────────────────
import { startBot }        from '../bot/index.js';

// ──────────────── Export All ────────────────
export {
  // Core
  express,            session,          passport,
  dotenv,             path,             fileURLToPath,
  chalk,              mongoose,         fs,
  readdirSync,        writeFileSync,    ngrok,
  axios,              geoip,

  // Passport
  DiscordStrategy,

  // Discord.js
  Client,             GatewayIntentBits, Collection,
  REST,
  MessageFlags,               Routes,            ActivityType,

  // App
  User,               isBadIP,           startBot
};
