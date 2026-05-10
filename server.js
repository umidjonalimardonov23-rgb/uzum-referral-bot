'use strict';
// v5.0 - FULL PRO BOT: karta, yechish, referral, admin panel, leaderboard

process.stdout.write('=== UZUM BOT v5.0 PRO STARTING ===\n');

var express = require('express');
var cors = require('cors');
var fs = require('fs');
var path = require('path');
var grammy = require('grammy');
var Bot = grammy.Bot;
var InlineKeyboard = grammy.InlineKeyboard;

var app = express();
var PORT = parseInt(process.env.PORT || '8080', 10);
var BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8609314242:AAGUIEmXzuIfvFxXEUIu_Y_bx7ijLh2MjK8';
var WEBHOOK_DOMAIN = process.env.WEBHOOK_DOMAIN || 'uzum-bot-v2-production.up.railway.app';
var DATA_DIR = process.env.DATA_DIR || '/data';
var ADMIN_ID = parseInt(process.env.ADMIN_ID || '8787603995', 10);
var CHANNEL_ID = process.env.CHANNEL_ID || '@uuzum_bonus_30k';
var CHANNEL_LINK = 'https://t.me/uuzum_bonus_30k';
var APP_LINK = process.env.APP_LINK || 'https://b.2u.uz/ref?c=50&a=L6DaizF7cl';
var MINI_APP_URL = process.env.MINI_APP_URL || 'https://uzum-bot-v2-production.up.railway.app/';
var BONUS_PER_REF = 30000;
var MIN_WITHDRAW = 30000;
var MAX_24H = 500000;

  // === MINI APP HTML (embedded) ===
var WEBAPP_HTML = `<!DOCTYPE html>
  <html lang="uz">
  <head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/>
  <title>UZUM BONUS BOT</title>
  <script src="https://telegram.org/js/telegram-web-app.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.2/dist/confetti.browser.min.js"></script>
  <style>
    * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f3ff; min-height: 100vh; overflow-x: hidden; }
    @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
    @keyframes slide-in { from{transform:translateX(-100%);opacity:0} to{transform:translateX(0);opacity:1} }
    @keyframes count-up { from{opacity:0;transform:scale(0.8)} to{opacity:1;transform:scale(1)} }
    @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
    .animate-float { animation: float 3s ease-in-out infinite; }
    .animate-slide-in { animation: slide-in 0.35s ease-out forwards; }
    .animate-bounce { animation: bounce 1s infinite; }
    @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
    .page { display: none; } .page.active { display: block; }
    .tab-bar { position: fixed; bottom: 0; left: 0; right: 0; max-width: 448px; margin: 0 auto; z-index: 40; }
    .tab-btn { flex:1; display:flex; flex-direction:column; align-items:center; gap:2px; padding:8px 4px; border:none; background:transparent; cursor:pointer; border-radius:12px; transition:all .2s; }
    .tab-btn.active { background:linear-gradient(to bottom,#7c3aed,#9333ea); box-shadow:0 4px 15px rgba(147,51,234,.35); transform:scale(1.05); }
    .tab-btn .tab-label { font-size:10px; font-weight:600; color:#6b7280; }
    .tab-btn.active .tab-label { color:#fff; }
    .tab-btn .tab-icon { font-size:20px; line-height:1; }
    details summary { list-style:none; cursor:pointer; } details summary::-webkit-details-marker { display:none; }
    details[open] .faq-arrow { transform: rotate(180deg); }
    .faq-arrow { transition: transform 0.2s; }
    input[type=range] { -webkit-appearance:none; width:100%; height:6px; border-radius:9999px; background: linear-gradient(to right, #7c3aed, #a855f7); outline:none; }
    input[type=range]::-webkit-slider-thumb { -webkit-appearance:none; width:22px; height:22px; border-radius:50%; background:#7c3aed; cursor:pointer; box-shadow:0 2px 6px rgba(124,58,237,.5); }
    .progress-bar { transition: width 0.5s ease; }
    #splash { position:fixed;inset:0;background:linear-gradient(135deg,#7c3aed,#9333ea,#4f46e5);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:9999; }
    #social-proof-container { position:fixed; bottom:80px; left:12px; z-index:50; display:flex; flex-direction:column; gap:8px; pointer-events:none; }
  </style>
  </head>
  <body>

  <!-- SPLASH SCREEN -->
  <div id="splash">
    <div class="animate-float relative">
      <div style="width:112px;height:112px;border-radius:24px;background:rgba(255,255,255,0.2);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;box-shadow:0 20px 40px rgba(0,0,0,.2);border:1px solid rgba(255,255,255,.3)">
        <span style="font-size:52px">⚡</span>
      </div>
      <div style="position:absolute;top:-8px;right:-8px;width:32px;height:32px;background:#facc15;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px" class="animate-bounce">💰</div>
    </div>
    <div style="margin-top:32px;text-align:center">
      <h1 style="font-size:30px;font-weight:900;color:#fff;letter-spacing:-0.5px;margin:0">Uzum<span style="color:#fde047">Ref</span></h1>
      <p style="color:rgba(255,255,255,.7);font-size:14px;margin-top:4px;font-weight:500">Tez va Oson Daromad ⚡️</p>
    </div>
    <div style="margin-top:40px;width:192px">
      <div style="height:6px;background:rgba(255,255,255,.2);border-radius:9999px;overflow:hidden">
        <div id="splash-progress" style="height:100%;background:linear-gradient(to right,#fde047,#facc15);border-radius:9999px;width:0%;transition:width .1s"></div>
      </div>
      <p style="color:rgba(255,255,255,.5);font-size:12px;text-align:center;margin-top:8px">Yuklanmoqda...</p>
    </div>
  </div>

  <!-- SOCIAL PROOF TOASTS -->
  <div id="social-proof-container"></div>

  <!-- MAIN APP -->
  <div id="app" style="display:none; padding-bottom:80px; max-width:448px; margin:0 auto;">

    <!-- HOME PAGE -->
    <div class="page active" id="page-home">
      <!-- Hero -->
      <div style="position:relative;overflow:hidden;background:linear-gradient(135deg,#7c3aed,#9333ea,#4f46e5);padding:40px 20px 64px">
        <div style="position:absolute;top:16px;right:16px;font-size:36px;opacity:.4" class="animate-float">💸</div>
        <div style="position:absolute;bottom:24px;left:24px;font-size:28px;opacity:.3;animation:float 3s ease-in-out 1s infinite">✨</div>
        <div style="position:absolute;top:48px;left:8px;font-size:22px;opacity:.2;animation:float 3s ease-in-out 0.5s infinite">⭐</div>
        <div style="position:relative;z-index:10">
          <div style="display:inline-flex;align-items:center;gap:6px;background:#facc15;color:#713f12;font-size:11px;font-weight:900;padding:4px 12px;border-radius:9999px;margin-bottom:16px" class="animate-bounce">⚡️ TEZ VA OSON</div>
          <h1 style="font-size:28px;font-weight:900;color:#fff;line-height:1.2;margin:0 0 8px">Har bir do'st<br><span id="hero-count" style="color:#fde047">0</span> <span style="color:#fde047">so'm!</span></h1>
          <p style="color:rgba(255,255,255,.8);font-size:14px;margin:0 0 24px">Do'stingizni Uzum Bank ga taklif qiling va darhol bonus oling!</p>
          <div style="display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,.15);padding:6px 12px;border-radius:9999px">
            <span style="width:8px;height:8px;background:#4ade80;border-radius:50%;display:inline-block;box-shadow:0 0 0 2px rgba(74,222,128,.3)"></span>
            <span id="hero-users" style="color:#fff;font-size:12px;font-weight:600">0 ta foydalanuvchi</span>
          </div>
        </div>
      </div>

      <!-- Link Cards -->
      <div style="margin:-32px 16px 0;position:relative;z-index:10;display:flex;flex-direction:column;gap:12px">
        <!-- App Link -->
        <div style="background:#fff;border-radius:20px;padding:16px;box-shadow:0 10px 30px rgba(0,0,0,.1);border:1px solid #f3e8ff">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
            <div style="display:flex;align-items:center;gap:8px">
              <div style="width:36px;height:36px;background:linear-gradient(135deg,#7c3aed,#a855f7);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px">📱</div>
              <div><p style="font-size:13px;font-weight:700;color:#1f2937;margin:0">Ilova havolasi</p><p style="font-size:11px;color:#6b7280;margin:0">Uzum Bank ilovasi orqali</p></div>
            </div>
            <button onclick="copyText('https://b.2u.uz/ref?c=50&a=L6DaizF7cl','copy-app')" id="copy-app" style="background:rgba(124,58,237,.1);color:#7c3aed;border:none;padding:6px 12px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;transition:all .2s">📋 Nusxalash</button>
          </div>
          <div style="background:#f9fafb;border-radius:10px;padding:8px 12px;font-size:12px;color:#6b7280;word-break:break-all">https://b.2u.uz/ref?c=50&a=L6DaizF7cl</div>
        </div>
        <!-- Bot Link -->
        <div style="background:#fff;border-radius:20px;padding:16px;box-shadow:0 10px 30px rgba(0,0,0,.1);border:1px solid #e0f2fe">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
            <div style="display:flex;align-items:center;gap:8px">
              <div style="width:36px;height:36px;background:linear-gradient(135deg,#2563eb,#3b82f6);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px">🤖</div>
              <div><p style="font-size:13px;font-weight:700;color:#1f2937;margin:0">Bot havolasi</p><p style="font-size:11px;color:#6b7280;margin:0">Telegram bot orqali</p></div>
            </div>
            <button onclick="copyText('https://t.me/UzumBankRbot?start=L6DaizF7cl','copy-bot')" id="copy-bot" style="background:rgba(37,99,235,.1);color:#2563eb;border:none;padding:6px 12px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;transition:all .2s">📋 Nusxalash</button>
          </div>
          <div style="background:#f9fafb;border-radius:10px;padding:8px 12px;font-size:12px;color:#6b7280;word-break:break-all">https://t.me/UzumBankRbot?start=L6DaizF7cl</div>
        </div>
      </div>

      <!-- Stats -->
      <div style="margin:20px 16px 0;display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px">
        <div style="background:#fff;border-radius:16px;padding:14px 8px;text-align:center;box-shadow:0 4px 12px rgba(0,0,0,.06)">
          <p style="font-size:20px;margin:0">💰</p>
          <p style="font-size:16px;font-weight:900;color:#7c3aed;margin:4px 0 2px">30 000</p>
          <p style="font-size:10px;color:#9ca3af;margin:0">1 referral</p>
        </div>
        <div style="background:#fff;border-radius:16px;padding:14px 8px;text-align:center;box-shadow:0 4px 12px rgba(0,0,0,.06)">
          <p style="font-size:20px;margin:0">⚡️</p>
          <p style="font-size:16px;font-weight:900;color:#7c3aed;margin:4px 0 2px">24 soat</p>
          <p style="font-size:10px;color:#9ca3af;margin:0">To'lov muddati</p>
        </div>
        <div style="background:#fff;border-radius:16px;padding:14px 8px;text-align:center;box-shadow:0 4px 12px rgba(0,0,0,.06)">
          <p style="font-size:20px;margin:0">🏆</p>
          <p style="font-size:16px;font-weight:900;color:#7c3aed;margin:4px 0 2px">Limitsiz</p>
          <p style="font-size:10px;color:#9ca3af;margin:0">Referrallar</p>
        </div>
      </div>

      <!-- CTA -->
      <div style="margin:16px">
        <a href="https://b.2u.uz/ref?c=50&a=L6DaizF7cl" target="_blank" style="display:block;background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;text-align:center;padding:16px;border-radius:16px;font-size:16px;font-weight:800;text-decoration:none;box-shadow:0 8px 20px rgba(124,58,237,.4)">
          🚀 Uzum Bank Ilovasini Yuklab oling
        </a>
      </div>

      <!-- How it works mini -->
      <div style="margin:0 16px 16px;background:#fff;border-radius:20px;padding:20px;box-shadow:0 4px 12px rgba(0,0,0,.06)">
        <h3 style="font-size:15px;font-weight:800;color:#1f2937;margin:0 0 14px">⚡️ Qanday ishlaydi?</h3>
        <div style="display:flex;flex-direction:column;gap:12px">
          <div style="display:flex;align-items:center;gap:12px">
            <div style="width:32px;height:32px;background:linear-gradient(135deg,#7c3aed,#a855f7);border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;font-weight:900;flex-shrink:0">01</div>
            <p style="font-size:13px;color:#374151;margin:0">Havolangizni do'stlaringizga ulashing</p>
          </div>
          <div style="display:flex;align-items:center;gap:12px">
            <div style="width:32px;height:32px;background:linear-gradient(135deg,#2563eb,#3b82f6);border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;font-weight:900;flex-shrink:0">02</div>
            <p style="font-size:13px;color:#374151;margin:0">Do'stingiz karta ochadi</p>
          </div>
          <div style="display:flex;align-items:center;gap:12px">
            <div style="width:32px;height:32px;background:linear-gradient(135deg,#059669,#10b981);border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;font-weight:900;flex-shrink:0">03</div>
            <p style="font-size:13px;color:#374151;margin:0"><strong>30 000 so'm</strong> hisobingizga tushadi!</p>
          </div>
        </div>
      </div>
    </div>

    <!-- FRIENDS PAGE -->
    <div class="page" id="page-friends">
      <!-- Header -->
      <div style="background:linear-gradient(135deg,#7c3aed,#a855f7,#6d28d9);padding:40px 20px 64px;position:relative;overflow:hidden">
        <div style="position:absolute;top:16px;right:16px;font-size:40px;opacity:.3" class="animate-float">🎉</div>
        <div style="position:absolute;bottom:20px;left:16px;font-size:28px;opacity:.2;animation:float 3s ease-in-out 0.7s infinite">💫</div>
        <div style="position:relative;z-index:10">
          <div style="display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,.2);color:#fff;font-size:11px;font-weight:700;padding:4px 12px;border-radius:9999px;margin-bottom:12px">👥 Referral dasturi</div>
          <h1 style="font-size:26px;font-weight:900;color:#fff;margin:0 0 8px">Do'stlarni taklif qiling<br><span style="color:#fde047">daromad oling! 💰</span></h1>
          <p style="color:rgba(255,255,255,.8);font-size:13px;margin:0">Har bir do'st = <span style="color:#fde047;font-weight:800">30 000 so'm</span></p>
        </div>
      </div>

      <!-- Calculator -->
      <div style="margin:-32px 16px 0;position:relative;z-index:10">
        <div style="background:#fff;border-radius:20px;padding:20px;box-shadow:0 10px 30px rgba(0,0,0,.1)">
          <h3 style="font-size:14px;font-weight:800;color:#1f2937;margin:0 0 16px">🧮 Daromad kalkulyatori</h3>
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
            <span style="font-size:13px;color:#6b7280">Do'stlar soni</span>
            <span id="friend-count-display" style="font-size:20px;font-weight:900;color:#7c3aed">10 ta</span>
          </div>
          <input type="range" min="1" max="100" value="10" id="friend-slider" oninput="updateCalc(this.value)" style="margin-bottom:16px">
          <div style="background:linear-gradient(135deg,#f5f3ff,#ede9fe);border-radius:14px;padding:16px;text-align:center">
            <p style="font-size:12px;color:#7c3aed;margin:0 0 4px;font-weight:600">Jami daromadingiz</p>
            <p id="calc-result" style="font-size:32px;font-weight:900;color:#7c3aed;margin:0">300 000 so'm</p>
          </div>
          <!-- Goals -->
          <div style="margin-top:14px">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
              <span style="font-size:12px;color:#6b7280">Maqsad: <span id="goal-label">10 ta do'st</span></span>
              <span id="goal-pct" style="font-size:12px;font-weight:700;color:#7c3aed">100%</span>
            </div>
            <div style="height:8px;background:#f3e8ff;border-radius:9999px;overflow:hidden">
              <div id="goal-bar" class="progress-bar" style="height:100%;background:linear-gradient(to right,#7c3aed,#a855f7);border-radius:9999px;width:100%"></div>
            </div>
            <div style="display:flex;gap:6px;margin-top:10px">
              <button onclick="setGoal(0)" class="goal-btn active" style="flex:1;padding:6px 2px;border:1.5px solid #7c3aed;background:#f5f3ff;color:#7c3aed;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer">5</button>
              <button onclick="setGoal(1)" class="goal-btn" style="flex:1;padding:6px 2px;border:1.5px solid #e5e7eb;background:#fff;color:#6b7280;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer">10</button>
              <button onclick="setGoal(2)" class="goal-btn" style="flex:1;padding:6px 2px;border:1.5px solid #e5e7eb;background:#fff;color:#6b7280;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer">25</button>
              <button onclick="setGoal(3)" class="goal-btn" style="flex:1;padding:6px 2px;border:1.5px solid #e5e7eb;background:#fff;color:#6b7280;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer">50</button>
              <button onclick="setGoal(4)" class="goal-btn" style="flex:1;padding:6px 2px;border:1.5px solid #e5e7eb;background:#fff;color:#6b7280;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer">100</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Share Buttons -->
      <div style="margin:16px">
        <button onclick="shareApp()" style="width:100%;background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;border:none;padding:16px;border-radius:16px;font-size:16px;font-weight:800;cursor:pointer;box-shadow:0 8px 20px rgba(124,58,237,.4);margin-bottom:10px;transition:all .2s;display:block">
          📤 Do'stlarga ulashish
        </button>
        <a href="https://t.me/share/url?url=https%3A%2F%2Fb.2u.uz%2Fref%3Fc%3D50%26a%3DL6DaizF7cl&text=%E2%9A%A1%EF%B8%8F%20Uzum%20Bank%20orqali%2030%20000%20so'm%20ishlang!%20Bepul%20virtual%20karta%20oching%20%F0%9F%92%B3" target="_blank" onclick="fireConfetti()" style="display:block;text-align:center;background:#fff;border:2px solid #7c3aed;color:#7c3aed;padding:14px;border-radius:16px;font-size:14px;font-weight:700;text-decoration:none">
          ✈️ Telegram orqali yuborish
        </a>
      </div>

      <!-- Earn potential -->
      <div style="margin:0 16px 16px;background:linear-gradient(135deg,#7c3aed,#6d28d9);border-radius:20px;padding:20px">
        <h3 style="font-size:15px;font-weight:800;color:#fff;margin:0 0 14px">🏆 Daromad imkoniyatlari</h3>
        <div style="display:flex;flex-direction:column;gap:8px">
          <div style="display:flex;justify-content:space-between;align-items:center;background:rgba(255,255,255,.1);border-radius:10px;padding:10px 14px">
            <span style="color:rgba(255,255,255,.8);font-size:13px">5 ta do'st</span>
            <span style="color:#fde047;font-weight:800;font-size:14px">150 000 so'm</span>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;background:rgba(255,255,255,.1);border-radius:10px;padding:10px 14px">
            <span style="color:rgba(255,255,255,.8);font-size:13px">10 ta do'st</span>
            <span style="color:#fde047;font-weight:800;font-size:14px">300 000 so'm</span>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;background:rgba(255,255,255,.1);border-radius:10px;padding:10px 14px">
            <span style="color:rgba(255,255,255,.8);font-size:13px">25 ta do'st</span>
            <span style="color:#fde047;font-weight:800;font-size:14px">750 000 so'm</span>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;background:rgba(255,255,255,.15);border-radius:10px;padding:10px 14px;border:1px solid rgba(255,255,255,.2)">
            <span style="color:#fff;font-size:13px;font-weight:700">50 ta do'st 🏅</span>
            <span style="color:#fde047;font-weight:900;font-size:15px">1 500 000 so'm</span>
          </div>
        </div>
      </div>
    </div>

    <!-- HOW PAGE -->
    <div class="page" id="page-how">
      <!-- Header -->
      <div style="background:linear-gradient(135deg,#2563eb,#4f46e5,#7c3aed);padding:40px 20px 64px;position:relative;overflow:hidden">
        <div style="position:absolute;top:16px;right:16px;font-size:40px;opacity:.3" class="animate-float">📖</div>
        <div style="position:relative;z-index:10">
          <div style="display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,.2);color:#fff;font-size:11px;font-weight:700;padding:4px 12px;border-radius:9999px;margin-bottom:12px">📖 Ko'rsatma</div>
          <h1 style="font-size:26px;font-weight:900;color:#fff;margin:0 0 8px">Qanday<br><span style="color:#fde047">ishlaydi? 🤔</span></h1>
          <p style="color:rgba(255,255,255,.8);font-size:13px;margin:0">3 ta oddiy qadam orqali daromad oling</p>
        </div>
      </div>

      <!-- Steps -->
      <div style="margin:-32px 16px 0;position:relative;z-index:10;display:flex;flex-direction:column;gap:12px">
        <div style="background:#fff;border-radius:20px;padding:20px;box-shadow:0 10px 30px rgba(0,0,0,.1)">
          <div style="display:flex;align-items:flex-start;gap:16px">
            <div style="width:48px;height:48px;background:linear-gradient(135deg,#7c3aed,#a855f7);border-radius:14px;display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 4px 12px rgba(124,58,237,.4)">
              <span style="font-size:24px">📱</span>
            </div>
            <div>
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
                <span style="background:#f5f3ff;color:#7c3aed;font-size:11px;font-weight:900;padding:2px 8px;border-radius:9999px">01</span>
                <h3 style="font-size:15px;font-weight:800;color:#1f2937;margin:0">Havolani ulashing</h3>
              </div>
              <p style="font-size:13px;color:#6b7280;margin:0;line-height:1.5">Referral havolangizni do'stlaringizga yuboring — Telegram, WhatsApp yoki boshqa ilovalar orqali.</p>
            </div>
          </div>
        </div>
        <div style="background:#fff;border-radius:20px;padding:20px;box-shadow:0 10px 30px rgba(0,0,0,.1)">
          <div style="display:flex;align-items:flex-start;gap:16px">
            <div style="width:48px;height:48px;background:linear-gradient(135deg,#2563eb,#3b82f6);border-radius:14px;display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 4px 12px rgba(37,99,235,.4)">
              <span style="font-size:24px">💳</span>
            </div>
            <div>
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
                <span style="background:#eff6ff;color:#2563eb;font-size:11px;font-weight:900;padding:2px 8px;border-radius:9999px">02</span>
                <h3 style="font-size:15px;font-weight:800;color:#1f2937;margin:0">Do'st karta ochadi</h3>
              </div>
              <p style="font-size:13px;color:#6b7280;margin:0;line-height:1.5">Do'stingiz havolangiz orqali Uzum Bank ilovasini yuklab, bepul virtual karta ochadi.</p>
            </div>
          </div>
        </div>
        <div style="background:#fff;border-radius:20px;padding:20px;box-shadow:0 10px 30px rgba(0,0,0,.1)">
          <div style="display:flex;align-items:flex-start;gap:16px">
            <div style="width:48px;height:48px;background:linear-gradient(135deg,#059669,#10b981);border-radius:14px;display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 4px 12px rgba(5,150,105,.4)">
              <span style="font-size:24px">⚡️</span>
            </div>
            <div>
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
                <span style="background:#ecfdf5;color:#059669;font-size:11px;font-weight:900;padding:2px 8px;border-radius:9999px">03</span>
                <h3 style="font-size:15px;font-weight:800;color:#1f2937;margin:0">30 000 so'm oling!</h3>
              </div>
              <p style="font-size:13px;color:#6b7280;margin:0;line-height:1.5">Karta muvaffaqiyatli ochilgandan keyin hisobingizga 30 000 so'm tushadi. Shunday oddiy!</p>
            </div>
          </div>
        </div>
      </div>

      <!-- FAQ -->
      <div style="margin:20px 16px 16px">
        <h3 style="font-size:15px;font-weight:800;color:#1f2937;margin:0 0 12px">❓ Ko'p so'raladigan savollar</h3>
        <div style="display:flex;flex-direction:column;gap:8px" id="faq-list">
          
          <details style="background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.06)">
            <summary style="padding:14px 16px;font-size:13px;font-weight:700;color:#1f2937;display:flex;align-items:center;justify-content:space-between">
              💳 Karta ochish to'lovmi?
              <span class="faq-arrow" style="color:#7c3aed;font-size:16px;margin-left:8px;flex-shrink:0">▾</span>
            </summary>
            <div style="padding:0 16px 14px;font-size:13px;color:#6b7280;line-height:1.6">Yo'q! Uzum Bank virtual kartasi to'liq bepul. 0 so'mga ochiladi. Hech qanday yashirin to'lov yo'q.</div>
          </details>
          <details style="background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.06)">
            <summary style="padding:14px 16px;font-size:13px;font-weight:700;color:#1f2937;display:flex;align-items:center;justify-content:space-between">
              💰 Qachon pul tushadi?
              <span class="faq-arrow" style="color:#7c3aed;font-size:16px;margin-left:8px;flex-shrink:0">▾</span>
            </summary>
            <div style="padding:0 16px 14px;font-size:13px;color:#6b7280;line-height:1.6">Do'stingiz karta ochgandan so'ng bir necha soat ichida pul hisobingizga tushadi. Odatda 1-24 soat ichida.</div>
          </details>
          <details style="background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.06)">
            <summary style="padding:14px 16px;font-size:13px;font-weight:700;color:#1f2937;display:flex;align-items:center;justify-content:space-between">
              👥 Nechta do'st taklif qilsa bo'ladi?
              <span class="faq-arrow" style="color:#7c3aed;font-size:16px;margin-left:8px;flex-shrink:0">▾</span>
            </summary>
            <div style="padding:0 16px 14px;font-size:13px;color:#6b7280;line-height:1.6">Cheklov yo'q! Qancha ko'p do'st taklif qilsangiz, shuncha ko'p daromad olasiz. Limitsiz!</div>
          </details>
          <details style="background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.06)">
            <summary style="padding:14px 16px;font-size:13px;font-weight:700;color:#1f2937;display:flex;align-items:center;justify-content:space-between">
              🛒 Uzum Market bonuslari nima?
              <span class="faq-arrow" style="color:#7c3aed;font-size:16px;margin-left:8px;flex-shrink:0">▾</span>
            </summary>
            <div style="padding:0 16px 14px;font-size:13px;color:#6b7280;line-height:1.6">Uzum Bank kartasi egasi sifatida Uzum Marketdagi maxsus chegirmalar va bonuslardan foydalanasiz.</div>
          </details>
          <details style="background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.06)">
            <summary style="padding:14px 16px;font-size:13px;font-weight:700;color:#1f2937;display:flex;align-items:center;justify-content:space-between">
              📱 Ilova qayerdan yuklanadi?
              <span class="faq-arrow" style="color:#7c3aed;font-size:16px;margin-left:8px;flex-shrink:0">▾</span>
            </summary>
            <div style="padding:0 16px 14px;font-size:13px;color:#6b7280;line-height:1.6">Uzum Bank ilovasi App Store va Google Play'da mavjud. Referral havola orqali to'g'ridan-to'g'ri yuklab olishingiz mumkin.</div>
          </details>
          <details style="background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.06)">
            <summary style="padding:14px 16px;font-size:13px;font-weight:700;color:#1f2937;display:flex;align-items:center;justify-content:space-between">
              🔒 Pulim xavfsizmi?
              <span class="faq-arrow" style="color:#7c3aed;font-size:16px;margin-left:8px;flex-shrink:0">▾</span>
            </summary>
            <div style="padding:0 16px 14px;font-size:13px;color:#6b7280;line-height:1.6">Ha! Uzum Bank O'zbekiston Markaziy Banki tomonidan litsenziyalangan. Barcha mablag'lar kafolatlangan.</div>
          </details>
        </div>
      </div>
    </div>

    <!-- INFO PAGE -->
    <div class="page" id="page-info">
      <!-- Header -->
      <div style="background:linear-gradient(135deg,#f97316,#f59e0b,#eab308);padding:40px 20px 56px;position:relative;overflow:hidden">
        <div style="position:absolute;top:24px;right:16px;font-size:60px;opacity:.2" class="animate-float">🏦</div>
        <div style="position:relative;z-index:10">
          <div style="display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,.2);color:#fff;font-size:11px;font-weight:700;padding:4px 12px;border-radius:9999px;margin-bottom:12px">ℹ️ Uzum Bank haqida</div>
          <h1 style="font-size:26px;font-weight:900;color:#fff;margin:0 0 8px">Nima uchun<br><span style="color:rgba(255,255,255,.9)">Uzum Bank? 🌟</span></h1>
          <p style="color:rgba(255,255,255,.8);font-size:13px;margin:0">O'zbekistonning eng qulay raqamli bank</p>
        </div>
      </div>

      <!-- Referral Promo -->
      <div style="margin:-24px 16px 0;position:relative;z-index:10">
        <div style="background:#fff;border-radius:20px;padding:20px;box-shadow:0 10px 30px rgba(0,0,0,.1);border:1px solid #fed7aa">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
            <div style="width:44px;height:44px;background:linear-gradient(135deg,#f97316,#f59e0b);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:22px">🎁</div>
            <div>
              <p style="font-size:15px;font-weight:800;color:#1f2937;margin:0">30 000 so'm oling!</p>
              <p style="font-size:12px;color:#6b7280;margin:0">Har bir yangi do'stingiz uchun</p>
            </div>
          </div>
          <a href="https://b.2u.uz/ref?c=50&a=L6DaizF7cl" target="_blank" style="display:block;background:linear-gradient(135deg,#f97316,#f59e0b);color:#fff;text-align:center;padding:12px;border-radius:12px;font-size:14px;font-weight:700;text-decoration:none">
            💳 Bepul karta ochish →
          </a>
        </div>
      </div>

      <!-- Features -->
      <div style="margin:16px;display:grid;grid-template-columns:1fr 1fr;gap:10px">
        
        <div style="background:#fff;border-radius:16px;padding:16px;box-shadow:0 4px 12px rgba(0,0,0,.06)">
          <div style="font-size:28px;margin-bottom:8px">💳</div>
          <p style="font-size:13px;font-weight:700;color:#1f2937;margin:0 0 4px">Bepul Virtual Karta</p>
          <p style="font-size:11px;color:#9ca3af;margin:0;line-height:1.4">Uzum Bank virtual kartasi 0 so'mga ochiladi. Hech qanday yashirin to'lov yo'q!</p>
        </div>
        <div style="background:#fff;border-radius:16px;padding:16px;box-shadow:0 4px 12px rgba(0,0,0,.06)">
          <div style="font-size:28px;margin-bottom:8px">🤑</div>
          <p style="font-size:13px;font-weight:700;color:#1f2937;margin:0 0 4px">30 000 so'm Bonus</p>
          <p style="font-size:11px;color:#9ca3af;margin:0;line-height:1.4">Har bir taklif qilgan do'stingiz uchun hisobingizga 30 000 so'm tushadi.</p>
        </div>
        <div style="background:#fff;border-radius:16px;padding:16px;box-shadow:0 4px 12px rgba(0,0,0,.06)">
          <div style="font-size:28px;margin-bottom:8px">🛒</div>
          <p style="font-size:13px;font-weight:700;color:#1f2937;margin:0 0 4px">Uzum Market</p>
          <p style="font-size:11px;color:#9ca3af;margin:0;line-height:1.4">Karta egasi sifatida Uzum Marketdagi maxsus narxlar va chegirmalardan foydalaning.</p>
        </div>
        <div style="background:#fff;border-radius:16px;padding:16px;box-shadow:0 4px 12px rgba(0,0,0,.06)">
          <div style="font-size:28px;margin-bottom:8px">🔒</div>
          <p style="font-size:13px;font-weight:700;color:#1f2937;margin:0 0 4px">Xavfsiz & Ishonchli</p>
          <p style="font-size:11px;color:#9ca3af;margin:0;line-height:1.4">Uzum Bank O'zbekistonning eng yirik fintech kompaniyalaridan biri.</p>
        </div>
        <div style="background:#fff;border-radius:16px;padding:16px;box-shadow:0 4px 12px rgba(0,0,0,.06)">
          <div style="font-size:28px;margin-bottom:8px">⚡️</div>
          <p style="font-size:13px;font-weight:700;color:#1f2937;margin:0 0 4px">Tezkor To'lovlar</p>
          <p style="font-size:11px;color:#9ca3af;margin:0;line-height:1.4">24/7 istalgan vaqtda to'lovlar, pul o'tkazmalar va moliyaviy operatsiyalar.</p>
        </div>
        <div style="background:#fff;border-radius:16px;padding:16px;box-shadow:0 4px 12px rgba(0,0,0,.06)">
          <div style="font-size:28px;margin-bottom:8px">📊</div>
          <p style="font-size:13px;font-weight:700;color:#1f2937;margin:0 0 4px">Cashback & Bonuslar</p>
          <p style="font-size:11px;color:#9ca3af;margin:0;line-height:1.4">Har bir xariddan cashback oling va bonuslarni to'plovchilar dasturida qatnashing.</p>
        </div>
      </div>

      <!-- Trust badges -->
      <div style="margin:0 16px 16px;background:linear-gradient(135deg,#f97316,#f59e0b);border-radius:20px;padding:20px">
        <h3 style="font-size:14px;font-weight:800;color:#fff;margin:0 0 12px">🏅 Ishonch belgilari</h3>
        <div style="display:flex;flex-direction:column;gap:8px">
          <div style="display:flex;align-items:center;gap:10px;background:rgba(255,255,255,.2);border-radius:10px;padding:10px 14px">
            <span style="font-size:20px">🏦</span>
            <span style="color:#fff;font-size:12px;font-weight:600">Markaziy bank litsenziyasi</span>
          </div>
          <div style="display:flex;align-items:center;gap:10px;background:rgba(255,255,255,.2);border-radius:10px;padding:10px 14px">
            <span style="font-size:20px">👥</span>
            <span style="color:#fff;font-size:12px;font-weight:600">5 milliondan ortiq foydalanuvchi</span>
          </div>
          <div style="display:flex;align-items:center;gap:10px;background:rgba(255,255,255,.2);border-radius:10px;padding:10px 14px">
            <span style="font-size:20px">⭐️</span>
            <span style="color:#fff;font-size:12px;font-weight:600">App Store & Google Play — 4.8 yulduz</span>
          </div>
        </div>
      </div>
    </div>

  </div>

  <!-- BOTTOM NAV -->
  <div class="tab-bar" id="bottom-nav">
    <div style="margin:0 12px 12px;background:rgba(255,255,255,.9);backdrop-filter:blur(16px);border:1px solid #f3e8ff;border-radius:20px;box-shadow:0 8px 30px rgba(0,0,0,.12)">
      <div style="display:flex;align-items:center;justify-content:around;padding:8px;">
        <button class="tab-btn active" onclick="showPage('home',this)" style="flex:1">
          <span class="tab-icon">🏠</span>
          <span class="tab-label">Bosh sahifa</span>
        </button>
        <button class="tab-btn" onclick="showPage('friends',this)" style="flex:1">
          <span class="tab-icon">👥</span>
          <span class="tab-label">Do'stlar</span>
        </button>
        <button class="tab-btn" onclick="showPage('how',this)" style="flex:1">
          <span class="tab-icon">📖</span>
          <span class="tab-label">Qanday?</span>
        </button>
        <button class="tab-btn" onclick="showPage('info',this)" style="flex:1">
          <span class="tab-icon">ℹ️</span>
          <span class="tab-label">Ma'lumot</span>
        </button>
      </div>
    </div>
  </div>

  <script>
  const tg = window.Telegram?.WebApp;
  if(tg){ tg.ready(); tg.expand(); }

  // Splash screen
  let splashProgress = 0;
  const splashInterval = setInterval(() => {
    splashProgress += 5;
    document.getElementById('splash-progress').style.width = splashProgress + '%';
    if(splashProgress >= 100){
      clearInterval(splashInterval);
      setTimeout(() => {
        document.getElementById('splash').style.opacity = '0';
        document.getElementById('splash').style.transition = 'opacity 0.4s';
        setTimeout(() => { document.getElementById('splash').style.display='none'; document.getElementById('app').style.display='block'; }, 400);
        startSocialProof();
      }, 200);
    }
  }, 90);

  // Count-up animation
  function countUp(el, target, duration){
    const start = performance.now();
    function animate(now){
      const elapsed = now - start;
      const progress = Math.min(elapsed/duration, 1);
      const eased = 1 - Math.pow(1-progress, 3);
      el.textContent = Math.round(target * eased).toLocaleString('uz');
      if(progress < 1) requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }
  setTimeout(() => {
    countUp(document.getElementById('hero-count'), 30000, 1400);
    countUp(document.getElementById('hero-users'), 12847, 1800);
  }, 100);
  document.getElementById('hero-users').addEventListener('DOMContentLoaded', () => {
    document.getElementById('hero-users').textContent = '12,847 ta foydalanuvchi';
  });
  // Fix users display
  setTimeout(() => {
    const el = document.getElementById('hero-users');
    if(el) { const v = parseInt(el.textContent)||12847; el.textContent = v.toLocaleString('uz') + ' ta foydalanuvchi'; }
  }, 1500);

  // Page navigation
  function showPage(id, btn){
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('page-'+id).classList.add('active');
    btn.classList.add('active');
    window.scrollTo(0,0);
    if(tg) tg.HapticFeedback?.impactOccurred('light');
  }

  // Copy text
  function copyText(text, btnId){
    navigator.clipboard.writeText(text).then(() => {
      const btn = document.getElementById(btnId);
      const orig = btn.textContent;
      btn.textContent = '✅ Nusxalandi!';
      btn.style.background = 'rgba(16,185,129,.1)';
      btn.style.color = '#059669';
      if(tg) tg.HapticFeedback?.notificationOccurred('success');
      setTimeout(() => { btn.textContent = orig; btn.style.background=''; btn.style.color=''; }, 2000);
    });
  }

  // Calculator
  const GOALS = [5, 10, 25, 50, 100];
  let currentGoalIdx = 1;
  function updateCalc(val){
    const n = parseInt(val);
    document.getElementById('friend-count-display').textContent = n + ' ta';
    document.getElementById('calc-result').textContent = (n * 30000).toLocaleString('uz') + " so'm";
    const goal = GOALS[currentGoalIdx];
    const pct = Math.min(Math.round((n/goal)*100), 100);
    document.getElementById('goal-bar').style.width = pct + '%';
    document.getElementById('goal-pct').textContent = pct + '%';
  }
  function setGoal(idx){
    currentGoalIdx = idx;
    document.querySelectorAll('.goal-btn').forEach((b,i) => {
      if(i===idx){ b.style.borderColor='#7c3aed'; b.style.background='#f5f3ff'; b.style.color='#7c3aed'; }
      else { b.style.borderColor='#e5e7eb'; b.style.background='#fff'; b.style.color='#6b7280'; }
    });
    document.getElementById('goal-label').textContent = GOALS[idx] + " ta do'st";
    updateCalc(document.getElementById('friend-slider').value);
  }

  // Share
  function shareApp(){
    if(tg) tg.HapticFeedback?.impactOccurred('heavy');
    fireConfetti();
    const text = "⚡️ Do'stim, bugun Uzum Bank ilovasini yuklab, bepul virtual karta oching!\\n\\n💰 Sizga 30 000 so'm sovg'a qilaman!\\n\\n📱 https://b.2u.uz/ref?c=50&a=L6DaizF7cl";
    if(navigator.share){ navigator.share({title:"Uzum Bank Taklif", text}); }
    else { navigator.clipboard.writeText(text); }
  }
  function fireConfetti(){
    if(typeof confetti !== 'undefined'){
      confetti({ particleCount:120, spread:80, origin:{y:0.6}, colors:["#7c3aed","#a855f7","#fbbf24","#10b981","#3b82f6"], disableForReducedMotion:true });
    }
  }

  // Social Proof
  const names = ["Jasur","Malika","Bobur","Zulfiya","Sherzod","Nodira","Ulugbek","Feruza","Akbar","Dilnoza","Sardor","Maftuna","Firdavs","Barno","Hamid","Kamola","Rustam","Shahlo","Behruz","Sabohat"];
  function startSocialProof(){
    const container = document.getElementById('social-proof-container');
    const delays = [1800, 5500, 9500, 14000, 19000];
    delays.forEach(d => {
      setTimeout(() => {
        const name = names[Math.floor(Math.random()*names.length)];
        const toast = document.createElement('div');
        toast.className = 'animate-slide-in';
        toast.style.cssText = 'display:flex;align-items:center;gap:8px;background:rgba(255,255,255,.95);backdrop-filter:blur(8px);border:1px solid #f3f4f6;border-radius:16px;padding:8px 12px;box-shadow:0 4px 16px rgba(0,0,0,.1)';
        toast.innerHTML = \`<div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#7c3aed,#a855f7);display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;font-weight:700;flex-shrink:0">\${name[0]}</div><div><p style="font-size:12px;font-weight:700;color:#1f2937;margin:0">\${name}</p><p style="font-size:10px;color:#059669;font-weight:600;margin:0">+30 000 so'm oldi! 🤑</p></div>\`;
        container.appendChild(toast);
        setTimeout(() => { toast.style.opacity='0'; toast.style.transition='opacity 0.3s'; setTimeout(()=>toast.remove(),300); }, 3500);
      }, d);
    });
  }
  </script>
  </body>
  </html>`;
// ================================
var DB_FILE = path.join(DATA_DIR, 'uzumbot.json');

app.use(express.json({ limit: '10mb' }));
app.use(cors());
app.get('/api/healthz', function(req, res) { res.json({ status: 'ok', version: '5.0', mode: 'webhook' }); });
  app.get('/', function(req, res) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(WEBAPP_HTML);
  });
  app.get('/api/user/:userId', function(req, res) {
    var user = getUser(parseInt(req.params.userId));
    if (!user) return res.json({ balance: 0, referrals: 0, totalEarned: 0, cards: [] });
    res.json({ balance: user.balance||0, referrals: user.referrals||0, totalEarned: user.totalEarned||0, cards: (user.cards||[]).length });
  });

// ─── DATABASE ──────────────────────────────────────────────────────────────────
function ensureDir() { try { if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true }); } catch(e) {} }
function loadDB() {
  try { ensureDir(); if (!fs.existsSync(DB_FILE)) return { users: {} }; return JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); }
  catch(e) { return { users: {} }; }
}
function saveDB(db) { try { ensureDir(); fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2)); } catch(e) {} }

function getUser(userId) { var db = loadDB(); return db.users[String(userId)] || null; }
function saveUser(user) { var db = loadDB(); db.users[String(user.id)] = user; saveDB(db); }

function getOrCreateUser(from, refFrom) {
  var db = loadDB();
  var key = String(from.id);
  var isNew = !db.users[key];
  if (isNew) {
    var newUser = {
      id: from.id, name: from.first_name || 'Foydalanuvchi', username: from.username || '',
      joinedAt: new Date().toISOString(), refFrom: refFrom || null, referrals: 0,
      balance: 0, totalEarned: 0, cards: [], withdrawals: [], blocked: false, lastActivity: new Date().toISOString()
    };
    db.users[key] = newUser;
    if (refFrom && db.users[String(refFrom)]) {
      db.users[String(refFrom)].referrals += 1;
      db.users[String(refFrom)].balance += BONUS_PER_REF;
      db.users[String(refFrom)].totalEarned += BONUS_PER_REF;
    }
  } else {
    db.users[key].name = from.first_name || db.users[key].name;
    db.users[key].username = from.username || db.users[key].username;
    db.users[key].blocked = false;
    db.users[key].lastActivity = new Date().toISOString();
  }
  saveDB(db);
  return { user: db.users[key], isNew: isNew };
}

function addCard(userId, number, holder, bank) {
  var db = loadDB();
  var user = db.users[String(userId)];
  if (!user) return null;
  var card = { id: 'card_' + Date.now(), number: number, holder: holder, bank: bank, addedAt: new Date().toISOString() };
  user.cards.push(card);
  saveDB(db);
  return card;
}

function createWithdrawal(userId, amount, cardId) {
  var db = loadDB();
  var user = db.users[String(userId)];
  if (!user) return null;
  var wd = { id: 'wd_' + Date.now(), userId: userId, amount: amount, cardId: cardId, status: 'pending', createdAt: new Date().toISOString() };
  user.balance -= amount;
  user.withdrawals.push(wd);
  saveDB(db);
  return wd;
}

function processWithdrawal(wdId, status, note) {
  var db = loadDB();
  for (var uid in db.users) {
    var user = db.users[uid];
    var wd = user.withdrawals.find(function(w) { return w.id === wdId; });
    if (wd) {
      wd.status = status; wd.processedAt = new Date().toISOString(); wd.adminNote = note || '';
      if (status === 'rejected') user.balance += wd.amount;
      saveDB(db);
      return { withdrawal: wd, user: user };
    }
  }
  return null;
}

function get24hAmount(userId) {
  var user = getUser(userId);
  if (!user) return 0;
  var cutoff = Date.now() - 24 * 3600 * 1000;
  return user.withdrawals.filter(function(w) { return w.status !== 'rejected' && new Date(w.createdAt).getTime() > cutoff; })
    .reduce(function(s, w) { return s + w.amount; }, 0);
}

function getAllUsers() { var db = loadDB(); return Object.values(db.users); }

function getStats() {
  var db = loadDB();
  var users = Object.values(db.users);
  var today = new Date().toDateString();
  var week = Date.now() - 7 * 24 * 3600 * 1000;
  var allWds = users.flatMap(function(u) { return u.withdrawals || []; });
  var pending = allWds.filter(function(w) { return w.status === 'pending'; });
  var approved = allWds.filter(function(w) { return w.status === 'approved'; });
  return {
    total: users.length,
    today: users.filter(function(u) { return new Date(u.joinedAt).toDateString() === today; }).length,
    week: users.filter(function(u) { return new Date(u.joinedAt).getTime() > week; }).length,
    withCards: users.filter(function(u) { return (u.cards || []).length > 0; }).length,
    pendingCount: pending.length,
    pendingAmount: pending.reduce(function(s, w) { return s + w.amount; }, 0),
    totalPaid: approved.reduce(function(s, w) { return s + w.amount; }, 0),
    topReferrers: users.sort(function(a, b) { return b.referrals - a.referrals; }).slice(0, 5)
      .map(function(u) { return { name: u.name, referrals: u.referrals, earned: u.totalEarned }; })
  };
}

function getLeaderboard() {
  return getAllUsers().filter(function(u) { return u.referrals > 0; })
    .sort(function(a, b) { return b.referrals - a.referrals; }).slice(0, 10);
}

function getPendingWithdrawals() {
  return getAllUsers().flatMap(function(u) {
    return (u.withdrawals || []).filter(function(w) { return w.status === 'pending'; })
      .map(function(w) { return Object.assign({}, w, { user: u }); });
  });
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function fmt(n) { return n.toLocaleString('uz-UZ') + ' UZS'; }
function mask(num) { return '**** **** **** ' + num.slice(-4); }
function bar(val, max, len) {
  len = len || 10;
  var filled = Math.round((Math.min(val, max) / max) * len);
  return '█'.repeat(filled) + '░'.repeat(len - filled);
}

async function checkSub(userId) {
  if (userId === ADMIN_ID) return true;
  try {
    var res = await fetch('https://api.telegram.org/bot' + BOT_TOKEN + '/getChatMember?chat_id=' + CHANNEL_ID + '&user_id=' + userId);
    var d = await res.json();
    if (!d.ok) return true;
    var s = d.result && d.result.status;
    return s === 'member' || s === 'administrator' || s === 'creator';
  } catch(e) { return true; }
}

// ─── CONVERSATION STATE ────────────────────────────────────────────────────────
var convo = new Map();

// ─── KEYBOARDS ────────────────────────────────────────────────────────────────
function mainKb(username, userId) {
  var link = 'https://t.me/' + username + '?start=' + userId;
  return new InlineKeyboard()
    .text('💳 Karta Qo\'shish', 'add_card').text('💰 Pul Yechish', 'withdraw').row()
    .text('📊 Mening Hisobim', 'my_account').text('🏆 Top Referrerlar', 'leaderboard').row()
    .text('🔗 Referral Havola', 'my_ref').text('📋 Tarix', 'history').row()
    .url('✈️ Do\'stlarga Ulashish', 'https://t.me/share/url?url=' + encodeURIComponent(link) + '&text=' + encodeURIComponent('🍇 Uzum Bank — 45,000 UZS bonus!')).row()
    .webApp('🚀 Mini App — Karta & Bonus ⚡️', MINI_APP_URL).row()
    .url('📣 Rasmiy Kanal', CHANNEL_LINK).text('📞 Yordam', 'support');
}

function backKb() { return new InlineKeyboard().text('🔙 Bosh Menyu', 'main_menu'); }

function cardListKb(cards) {
  var kb = new InlineKeyboard();
  (cards || []).forEach(function(c) {
    kb.text('💳 ' + mask(c.number) + ' (' + c.bank + ')', 'sel_card_' + c.id).row();
  });
  return kb.text('➕ Yangi Karta', 'add_card').row().text('🔙 Bosh Menyu', 'main_menu');
}

function subKb() {
  return new InlineKeyboard().url('📣 Kanalga Obuna Bo\'lish', CHANNEL_LINK).row().text('✅ Tekshirish', 'check_sub');
}

function adminWdKb(wdId) {
  return new InlineKeyboard().text('✅ Tasdiqlash', 'approve_' + wdId).text('❌ Rad etish', 'reject_' + wdId);
}

// ─── ACCOUNT TEXT ─────────────────────────────────────────────────────────────
function accountText(userId, name) {
  var user = getUser(userId);
  var bal = user ? fmt(user.balance) : '0 UZS';
  var refs = user ? (user.referrals || 0) : 0;
  var b = bar(refs % 5, 5);
  var next = Math.ceil((refs + 1) / 5) * 5;
  return '🍇 <b>UZUM BONUS BOT</b>\n\n' +
    '👤 <b>' + name + '</b>\n' +
    '💰 Balans: <b>' + bal + '</b>\n' +
    '🔗 Referrallar: <b>' + refs + ' ta</b>\n' +
    '📈 Progress: ' + b + ' ' + (refs % 5) + '/5\n' +
    '🎯 Keyingi ' + next + ' gacha: <b>' + (5 - refs % 5) + ' ta qoldi</b>\n\n' +
    '━━━━━━━━━━━━━━━━━━\n' +
    '💡 Har bir do\'st = <b>' + fmt(BONUS_PER_REF) + '</b> bonus!\n' +
    '📣 Do\'stlaringizni taklif qiling va daromad oling!';
}

// ─── BOT SETUP ────────────────────────────────────────────────────────────────
var bot = new Bot(BOT_TOKEN);

async function notifyAdmin(text, kb) {
  try { await bot.api.sendMessage(ADMIN_ID, text, { parse_mode: 'HTML', reply_markup: kb }); } catch(e) {}
}

// /start
bot.command('start', async function(ctx) {
  try {
    var from = ctx.from; if (!from) return;
    convo.delete(from.id);
    var param = String(ctx.match || '').trim();
    var refFrom = (param && param !== String(from.id)) ? (parseInt(param) || null) : null;
    var result = getOrCreateUser(from, refFrom);
    var user = result.user; var isNew = result.isNew;
    var subscribed = await checkSub(from.id);
    var me = await bot.api.getMe();
    if (!subscribed) {
      await ctx.reply('👋 Salom, <b>' + user.name + '</b>!\n\n🔒 Botdan foydalanish uchun avval kanalimizga obuna bo\'ling!\n\n📣 @uuzum_bonus_30k',
        { parse_mode: 'HTML', reply_markup: subKb() }); return;
    }
    if (isNew && refFrom && refFrom !== from.id) {
      var refUser = getUser(refFrom);
      if (refUser) {
        await notifyAdmin('🆕 <b>Yangi foydalanuvchi!</b>\n\n👤 ' + user.name + '\n🔗 @' + (user.username || 'yoq') + '\n🆔 <code>' + user.id + '</code>\n📎 Ref: ' + refUser.name + ' (+' + fmt(BONUS_PER_REF) + ')');
        await bot.api.sendMessage(refFrom,
          '🎉 <b>Tabriklaymiz!</b>\n\n✅ <b>' + user.name + '</b> havolangiz orqali qo\'shildi!\n💰 <b>' + fmt(BONUS_PER_REF) + '</b> balansga qo\'shildi!\n💼 Yangi balans: <b>' + fmt(refUser.balance) + '</b>',
          { parse_mode: 'HTML' }).catch(function() {});
      }
    }
    var txt = accountText(from.id, user.name) + (isNew ? '\n\n🎁 <b>Birinchi do\'stni taklif qiling — ' + fmt(BONUS_PER_REF) + ' oling!</b>' : '\n\n👇 Menyudan foydalaning:');
    await ctx.reply(txt, { parse_mode: 'HTML', reply_markup: mainKb(me.username, from.id) });
  } catch(e) { process.stderr.write('/start: ' + e.message + '\n'); }
});

// /admin
bot.command('admin', async function(ctx) {
  if (!ctx.from || ctx.from.id !== ADMIN_ID) return;
  var s = getStats();
  await ctx.reply(
    '🔐 <b>ADMIN PANEL</b>\n\n👥 Jami: <b>' + s.total + '</b>\n🆕 Bugun: <b>' + s.today + '</b>\n📅 Hafta: <b>' + s.week + '</b>\n💳 Kartali: <b>' + s.withCards + '</b>\n\n⏳ Kutilayotgan: <b>' + s.pendingCount + '</b> ta\n💵 Summa: <b>' + fmt(s.pendingAmount) + '</b>\n✅ To\'langan: <b>' + fmt(s.totalPaid) + '</b>\n\n🏆 <b>Top Referrerlar:</b>\n' +
    s.topReferrers.map(function(u, i) { return (i+1) + '. ' + u.name + ' — ' + u.referrals + ' ta (' + fmt(u.earned) + ')'; }).join('\n') +
    '\n\n<i>/pending /broadcast /users</i>',
    { parse_mode: 'HTML', reply_markup: new InlineKeyboard().text('💸 Kutilayotgan', 'admin_pending').row().text('📊 Statistika', 'admin_stats').text('👥 Foydalanuvchilar', 'admin_users') }
  );
});

// /pending
bot.command('pending', async function(ctx) {
  if (!ctx.from || ctx.from.id !== ADMIN_ID) return;
  var pending = getPendingWithdrawals();
  if (pending.length === 0) { await ctx.reply('✅ Kutilayotgan so\'rovlar yo\'q.'); return; }
  for (var i = 0; i < Math.min(10, pending.length); i++) {
    var wd = pending[i];
    var card = (wd.user.cards || []).find(function(c) { return c.id === wd.cardId; });
    await ctx.reply(
      '💸 <b>Yechish So\'rovi</b>\n\n👤 ' + wd.user.name + ' (@' + (wd.user.username || 'yoq') + ')\n🆔 <code>' + wd.userId + '</code>\n💰 <b>' + fmt(wd.amount) + '</b>\n💳 ' + (card ? mask(card.number) : '—') + '\n🏦 ' + (card ? card.bank : '—') + '\n👤 ' + (card ? card.holder : '—') + '\n🕐 ' + new Date(wd.createdAt).toLocaleString('uz-UZ'),
      { parse_mode: 'HTML', reply_markup: adminWdKb(wd.id) }
    );
  }
});

// /broadcast
bot.command('broadcast', async function(ctx) {
  if (!ctx.from || ctx.from.id !== ADMIN_ID) return;
  var text = ctx.match; if (!text || !text.trim()) { await ctx.reply('❌ /broadcast [matn]'); return; }
  var users = getAllUsers().filter(function(u) { return !u.blocked; });
  await ctx.reply('📤 ' + users.length + ' ta foydalanuvchiga yuborilmoqda...');
  var sent = 0, failed = 0;
  for (var i = 0; i < users.length; i++) {
    try { await bot.api.sendMessage(users[i].id, '📢 <b>Xabar</b>\n\n' + text, { parse_mode: 'HTML' }); sent++; await new Promise(function(r) { setTimeout(r, 35); }); }
    catch(e) { failed++; users[i].blocked = true; saveUser(users[i]); }
  }
  await ctx.reply('✅ Yuborildi: ' + sent + '\n❌ Xato: ' + failed);
});

// /users
bot.command('users', async function(ctx) {
  if (!ctx.from || ctx.from.id !== ADMIN_ID) return;
  var users = getAllUsers().sort(function(a,b){ return b.referrals - a.referrals; }).slice(0, 20);
  await ctx.reply('👥 <b>TOP FOYDALANUVCHILAR</b>\n\n' + users.map(function(u, i) {
    return (i+1) + '. ' + u.name + ' | 👥' + u.referrals + ' | 💰' + fmt(u.balance) + ' | 💳' + (u.cards || []).length;
  }).join('\n'), { parse_mode: 'HTML' });
});

// check_sub
bot.callbackQuery('check_sub', async function(ctx) {
  await ctx.answerCallbackQuery();
  var from = ctx.from;
  var subscribed = await checkSub(from.id);
  if (!subscribed) {
    await ctx.editMessageText('❌ Hali kanalga obuna bo\'lmagansiz!\n\n📣 @uuzum_bonus_30k', { reply_markup: subKb() }); return;
  }
  var user = getUser(from.id);
  if (user) { user.subscribed = true; saveUser(user); }
  var me = await bot.api.getMe();
  var name = (user ? user.name : null) || from.first_name || 'Foydalanuvchi';
  await ctx.editMessageText(accountText(from.id, name), { parse_mode: 'HTML', reply_markup: mainKb(me.username, from.id) });
});

// main_menu
bot.callbackQuery('main_menu', async function(ctx) {
  await ctx.answerCallbackQuery();
  convo.delete(ctx.from.id);
  var me = await bot.api.getMe();
  var user = getUser(ctx.from.id);
  var name = (user ? user.name : null) || ctx.from.first_name || 'Foydalanuvchi';
  try { await ctx.editMessageText(accountText(ctx.from.id, name), { parse_mode: 'HTML', reply_markup: mainKb(me.username, ctx.from.id) }); }
  catch(e) { await ctx.reply(accountText(ctx.from.id, name), { parse_mode: 'HTML', reply_markup: mainKb(me.username, ctx.from.id) }); }
});

// my_account
bot.callbackQuery('my_account', async function(ctx) {
  await ctx.answerCallbackQuery();
  var user = getUser(ctx.from.id); if (!user) return;
  var approved = (user.withdrawals || []).filter(function(w) { return w.status === 'approved'; });
  var pending = (user.withdrawals || []).filter(function(w) { return w.status === 'pending'; });
  var withdrawn = approved.reduce(function(s, w) { return s + w.amount; }, 0);
  var w24 = get24hAmount(ctx.from.id);
  await ctx.editMessageText(
    '📊 <b>MENING HISOBIM</b>\n\n👤 <b>' + user.name + '</b>  @' + (user.username || '—') + '\n\n━━━━━━━━━━━━━━━━━━\n' +
    '💰 Balans: <b>' + fmt(user.balance) + '</b>\n📈 Jami Daromat: <b>' + fmt(user.totalEarned) + '</b>\n✅ Jami Yechilgan: <b>' + fmt(withdrawn) + '</b>\n\n━━━━━━━━━━━━━━━━━━\n' +
    '🔗 Referrallar: <b>' + (user.referrals || 0) + ' ta</b>\n💳 Kartalar: <b>' + (user.cards || []).length + ' ta</b>\n⏳ Kutilayotgan: <b>' + pending.length + ' ta</b>\n\n━━━━━━━━━━━━━━━━━━\n' +
    '📉 24h limit: ' + bar(w24, MAX_24H) + ' ' + fmt(w24) + '/' + fmt(MAX_24H) + '\n🔓 Qolgan: <b>' + fmt(Math.max(0, MAX_24H - w24)) + '</b>\n\n📅 Qo\'shilgan: ' + new Date(user.joinedAt).toLocaleDateString('uz-UZ'),
    { parse_mode: 'HTML', reply_markup: backKb() }
  );
});

// my_ref
bot.callbackQuery('my_ref', async function(ctx) {
  await ctx.answerCallbackQuery();
  var me = await bot.api.getMe();
  var user = getUser(ctx.from.id); if (!user) return;
  var refLink = 'https://t.me/' + me.username + '?start=' + ctx.from.id;
  await ctx.editMessageText(
    '🔗 <b>REFERRAL TIZIMI</b>\n\n📎 Havolangiz:\n<code>' + refLink + '</code>\n\n━━━━━━━━━━━━━━━━━━\n' +
    '👥 Taklif qilganlar: <b>' + (user.referrals || 0) + ' ta</b>\n💰 Jami bonus: <b>' + fmt(user.totalEarned || 0) + '</b>\n\n━━━━━━━━━━━━━━━━━━\n' +
    '💡 <b>Qanday ishlaydi:</b>\n1️⃣ Havolani do\'stingizga yuboring\n2️⃣ Do\'st ro\'yxatdan o\'tadi\n3️⃣ <b>' + fmt(BONUS_PER_REF) + '</b> hisobingizga tushadi!\n\n🏆 5 ta referral = ' + fmt(5 * BONUS_PER_REF) + ' bonus!',
    { parse_mode: 'HTML', reply_markup: new InlineKeyboard().url('✈️ Ulashish', 'https://t.me/share/url?url=' + encodeURIComponent(refLink) + '&text=' + encodeURIComponent('🍇 Uzum Bank — 45,000 UZS bonus!')).row().text('🔙 Bosh Menyu', 'main_menu') }
  );
});

// leaderboard
bot.callbackQuery('leaderboard', async function(ctx) {
  await ctx.answerCallbackQuery();
  var top = getLeaderboard();
  var user = getUser(ctx.from.id);
  var myRank = top.findIndex(function(u) { return u.id === ctx.from.id; }) + 1;
  var medals = ['🥇','🥈','🥉'];
  var lines = top.map(function(u, i) {
    var medal = medals[i] || (i+1) + '.';
    var me = u.id === ctx.from.id ? ' 👈 Siz' : '';
    return medal + ' <b>' + u.name + '</b> — ' + u.referrals + ' ta (' + fmt(u.totalEarned) + ')' + me;
  });
  await ctx.editMessageText(
    '🏆 <b>TOP REFERRERLAR</b>\n\n' + (lines.length ? lines.join('\n') : 'Hali yo\'q') +
    '\n\n━━━━━━━━━━━━━━━━━━\n🎯 Sizning o\'rningiz: <b>' + (myRank > 0 ? '#' + myRank : 'Top 10 da yo\'q') + '</b>\n🔗 Referrallaringiz: <b>' + (user ? user.referrals : 0) + ' ta</b>',
    { parse_mode: 'HTML', reply_markup: backKb() }
  );
});

// history
bot.callbackQuery('history', async function(ctx) {
  await ctx.answerCallbackQuery();
  var user = getUser(ctx.from.id); if (!user) return;
  var all = [...(user.withdrawals || [])].reverse().slice(0, 10);
  var statusE = { pending: '⏳', approved: '✅', rejected: '❌' };
  var lines = all.map(function(w) {
    var card = (user.cards || []).find(function(c) { return c.id === w.cardId; });
    var date = new Date(w.createdAt).toLocaleDateString('uz-UZ');
    return (statusE[w.status] || '❓') + ' <b>' + fmt(w.amount) + '</b>\n   💳 ' + (card ? mask(card.number) : 'karta') + ' | ' + date;
  });
  await ctx.editMessageText(
    '📋 <b>TRANZAKSIYA TARIXI</b>\n\n' + (lines.length ? lines.join('\n\n') : 'Tranzaksiyalar yo\'q') + '\n\n💰 Balans: <b>' + fmt(user.balance) + '</b>',
    { parse_mode: 'HTML', reply_markup: backKb() }
  );
});

// support
bot.callbackQuery('support', async function(ctx) {
  await ctx.answerCallbackQuery();
  await ctx.editMessageText(
    '📞 <b>YORDAM MARKAZI</b>\n\nSalom, ' + ctx.from.first_name + '!\n\n🔹 Admin: @uzum_bonus_admin\n🔹 Kanal: @uuzum_bonus_30k\n\n━━━━━━━━━━━━━━━━━━\n❓ <b>Savol-javob:</b>\n\n🔸 <b>Qachon pul olaman?</b>\n→ 24-48 soat\n\n🔸 <b>Minimum yechish?</b>\n→ ' + fmt(MIN_WITHDRAW) + '\n\n🔸 <b>24h limit?</b>\n→ ' + fmt(MAX_24H) + '\n\n🔸 <b>1 referral = ?</b>\n→ ' + fmt(BONUS_PER_REF),
    { parse_mode: 'HTML', reply_markup: new InlineKeyboard().url('💬 Admin', 'https://t.me/uzum_bonus_admin').row().text('🔙 Bosh Menyu', 'main_menu') }
  );
});

// add_card
bot.callbackQuery('add_card', async function(ctx) {
  await ctx.answerCallbackQuery();
  convo.set(ctx.from.id, { step: 'card_number', data: {} });
  await ctx.editMessageText(
    '💳 <b>KARTA QO\'SHISH</b>\n\n1️⃣ Karta raqamini yuboring (16 raqam)\nMasalan: <code>8600 0000 0000 0000</code>',
    { parse_mode: 'HTML', reply_markup: new InlineKeyboard().text('❌ Bekor', 'main_menu') }
  );
});

// bank_*
bot.callbackQuery(/^bank_(.+)$/, async function(ctx) {
  await ctx.answerCallbackQuery();
  var bank = ctx.match[1];
  var state = convo.get(ctx.from.id);
  if (!state || state.step !== 'card_bank') return;
  state.data.bank = bank;
  convo.delete(ctx.from.id);
  var card = addCard(ctx.from.id, state.data.number, state.data.holder, bank);
  if (!card) { await ctx.editMessageText('❌ Xatolik. Qayta urinib ko\'ring.', { reply_markup: backKb() }); return; }
  await ctx.editMessageText(
    '✅ <b>Karta qo\'shildi!</b>\n\n💳 ' + mask(card.number) + '\n👤 ' + card.holder + '\n🏦 ' + card.bank + '\n\nEndi pul yechishingiz mumkin!',
    { parse_mode: 'HTML', reply_markup: new InlineKeyboard().text('💰 Pul Yechish', 'withdraw').row().text('🔙 Bosh Menyu', 'main_menu') }
  );
  var user = getUser(ctx.from.id);
  if (user) await notifyAdmin('💳 <b>Yangi karta</b>\n👤 ' + user.name + '\n💳 ' + mask(card.number) + '\n🏦 ' + card.bank);
});

// withdraw
bot.callbackQuery('withdraw', async function(ctx) {
  await ctx.answerCallbackQuery();
  var user = getUser(ctx.from.id); if (!user) return;
  if (!user.cards || user.cards.length === 0) {
    await ctx.editMessageText('❗ <b>Karta topilmadi!</b>\nAvval karta qo\'shing.', { parse_mode: 'HTML', reply_markup: new InlineKeyboard().text('💳 Karta Qo\'shish', 'add_card').row().text('🔙 Bosh Menyu', 'main_menu') }); return;
  }
  if (user.balance < MIN_WITHDRAW) {
    var need = MIN_WITHDRAW - user.balance;
    await ctx.editMessageText('❗ <b>Balans yetarli emas!</b>\n\n💰 Balans: <b>' + fmt(user.balance) + '</b>\n📉 Minimum: <b>' + fmt(MIN_WITHDRAW) + '</b>\n🔻 Yetishmaydi: <b>' + fmt(need) + '</b>\n\n🔗 Yana <b>' + Math.ceil(need / BONUS_PER_REF) + ' ta</b> do\'st taklif qiling!',
      { parse_mode: 'HTML', reply_markup: new InlineKeyboard().text('🔗 Referral Havola', 'my_ref').row().text('🔙 Bosh Menyu', 'main_menu') }); return;
  }
  var w24 = get24hAmount(ctx.from.id);
  if (w24 >= MAX_24H) {
    await ctx.editMessageText('⏰ <b>24h limit to\'ldi!</b>\nErtaga qayta urinib ko\'ring.', { parse_mode: 'HTML', reply_markup: backKb() }); return;
  }
  convo.set(ctx.from.id, { step: 'withdraw_amount', data: {} });
  var maxAmt = Math.min(user.balance, MAX_24H - w24);
  await ctx.editMessageText(
    '💰 <b>PUL YECHISH</b>\n\n💼 Balans: <b>' + fmt(user.balance) + '</b>\n📊 24h qoldi: <b>' + fmt(maxAmt) + '</b>\n\nQancha yechmoqchisiz?',
    { parse_mode: 'HTML', reply_markup: new InlineKeyboard().text('💸 Hammasini yechish', 'wd_all').row().text('❌ Bekor', 'main_menu') }
  );
});

// wd_all
bot.callbackQuery('wd_all', async function(ctx) {
  await ctx.answerCallbackQuery();
  var user = getUser(ctx.from.id); if (!user) return;
  var state = convo.get(ctx.from.id) || { step: 'withdraw_card', data: {} };
  state.data.amount = String(user.balance); state.step = 'withdraw_card';
  convo.set(ctx.from.id, state);
  await ctx.editMessageText('💳 <b>Karta tanlang:</b>', { parse_mode: 'HTML', reply_markup: cardListKb(user.cards) });
});

// sel_card_*
bot.callbackQuery(/^sel_card_(.+)$/, async function(ctx) {
  await ctx.answerCallbackQuery();
  var cardId = ctx.match[1];
  var user = getUser(ctx.from.id); if (!user) return;
  var card = (user.cards || []).find(function(c) { return c.id === cardId; }); if (!card) return;
  var state = convo.get(ctx.from.id);
  if (state && state.step === 'withdraw_card' && state.data.amount) {
    var amount = Number(state.data.amount);
    convo.delete(ctx.from.id);
    await ctx.editMessageText(
      '✅ <b>Tasdiqlang:</b>\n\n💰 Summa: <b>' + fmt(amount) + '</b>\n💳 Karta: <b>' + mask(card.number) + '</b>\n🏦 Bank: ' + card.bank + '\n👤 Egasi: ' + card.holder + '\n\n⚠️ So\'rov 24-48 soat ichida ko\'rib chiqiladi.',
      { parse_mode: 'HTML', reply_markup: new InlineKeyboard().text('✅ Tasdiqlash — ' + fmt(amount), 'conf_wd_' + amount + '_' + cardId).row().text('❌ Bekor', 'main_menu') }
    );
  }
});

// conf_wd_*
bot.callbackQuery(/^conf_wd_(\d+)_(.+)$/, async function(ctx) {
  await ctx.answerCallbackQuery('⏳ Yuborilmoqda...');
  var amount = Number(ctx.match[1]); var cardId = ctx.match[2];
  var user = getUser(ctx.from.id);
  if (!user || user.balance < amount) { await ctx.editMessageText('❌ Balans yetarli emas!', { reply_markup: backKb() }); return; }
  var card = (user.cards || []).find(function(c) { return c.id === cardId; }); if (!card) return;
  var wd = createWithdrawal(ctx.from.id, amount, cardId);
  await ctx.editMessageText(
    '✅ <b>So\'rov qabul qilindi!</b>\n\n🆔 <code>' + wd.id + '</code>\n💰 <b>' + fmt(amount) + '</b>\n💳 ' + mask(card.number) + '\n⏰ 24-48 soat ichida ko\'rib chiqiladi.\n📱 Natija haqida xabar olasiz.',
    { parse_mode: 'HTML', reply_markup: backKb() }
  );
  await notifyAdmin(
    '💸 <b>YANGI YECHISH SO\'ROVI!</b>\n\n👤 ' + user.name + ' (@' + (user.username || 'yoq') + ')\n🆔 <code>' + user.id + '</code>\n💰 <b>' + fmt(amount) + '</b>\n💳 ' + mask(card.number) + '\n🏦 ' + card.bank + '\n👤 ' + card.holder + '\n📊 Refs: ' + (user.referrals || 0) + ' ta',
    adminWdKb(wd.id)
  );
});

// approve_*
bot.callbackQuery(/^approve_(.+)$/, async function(ctx) {
  if (ctx.from.id !== ADMIN_ID) { await ctx.answerCallbackQuery('⛔️'); return; }
  await ctx.answerCallbackQuery('✅ Tasdiqlandi!');
  var result = processWithdrawal(ctx.match[1], 'approved');
  if (!result) { await ctx.editMessageText('❌ Topilmadi.'); return; }
  await ctx.editMessageText('✅ <b>TASDIQLANDI</b>\n\n💰 ' + fmt(result.withdrawal.amount) + '\n👤 User: ' + result.user.id, { parse_mode: 'HTML' });
  await bot.api.sendMessage(result.user.id, '✅ <b>Pul yechish tasdiqlandi!</b>\n\n💰 <b>' + fmt(result.withdrawal.amount) + '</b> kartangizga o\'tkazilmoqda...\n💼 Yangi balans: <b>' + fmt(result.user.balance) + '</b>\n\nRahmat! 🎉', { parse_mode: 'HTML' }).catch(function() {});
});

// reject_*
bot.callbackQuery(/^reject_(.+)$/, async function(ctx) {
  if (ctx.from.id !== ADMIN_ID) { await ctx.answerCallbackQuery('⛔️'); return; }
  await ctx.answerCallbackQuery('❌ Rad etildi.');
  var result = processWithdrawal(ctx.match[1], 'rejected', 'Admin rad etdi');
  if (!result) { await ctx.editMessageText('❌ Topilmadi.'); return; }
  await ctx.editMessageText('❌ <b>RAD ETILDI</b>\n\n💰 ' + fmt(result.withdrawal.amount) + ' qaytarildi.', { parse_mode: 'HTML' });
  await bot.api.sendMessage(result.user.id, '❌ <b>Yechish so\'rovi rad etildi.</b>\n\n💰 <b>' + fmt(result.withdrawal.amount) + '</b> balansga qaytarildi.\n📞 Savol: @uzum_bonus_admin', { parse_mode: 'HTML' }).catch(function() {});
});

// admin callbacks
bot.callbackQuery('admin_pending', async function(ctx) {
  if (ctx.from.id !== ADMIN_ID) { await ctx.answerCallbackQuery('⛔️'); return; }
  await ctx.answerCallbackQuery();
  var n = getPendingWithdrawals().length;
  await ctx.editMessageText(n === 0 ? '✅ Kutilayotgan so\'rovlar yo\'q.' : '⏳ <b>' + n + ' ta so\'rov</b>\n\n/pending buyrug\'ini yuboring', { parse_mode: 'HTML', reply_markup: backKb() });
});

bot.callbackQuery('admin_stats', async function(ctx) {
  if (ctx.from.id !== ADMIN_ID) { await ctx.answerCallbackQuery('⛔️'); return; }
  await ctx.answerCallbackQuery();
  var s = getStats();
  await ctx.editMessageText('📊 <b>STATISTIKA</b>\n\n👥 ' + s.total + '\n🆕 Bugun: ' + s.today + '\n📅 Hafta: ' + s.week + '\n💳 Kartali: ' + s.withCards + '\n⏳ Kutilayotgan: ' + s.pendingCount + '\n💵 ' + fmt(s.pendingAmount) + '\n✅ ' + fmt(s.totalPaid), { parse_mode: 'HTML', reply_markup: backKb() });
});

bot.callbackQuery('admin_users', async function(ctx) {
  if (ctx.from.id !== ADMIN_ID) { await ctx.answerCallbackQuery('⛔️'); return; }
  await ctx.answerCallbackQuery();
  var users = getAllUsers().sort(function(a,b){ return b.referrals - a.referrals; }).slice(0, 15);
  await ctx.editMessageText('👥 <b>TOP FOYDALANUVCHILAR</b>\n\n' + users.map(function(u, i) { return (i+1) + '. ' + u.name + ' | 👥' + u.referrals + ' | 💰' + fmt(u.balance); }).join('\n'), { parse_mode: 'HTML', reply_markup: backKb() });
});

// Text handler (conversation flow)
bot.on('message:text', async function(ctx) {
  var from = ctx.from; if (!from) return;
  var state = convo.get(from.id);
  var text = ctx.message.text.trim();
  var me = await bot.api.getMe();

  if (!state) {
    var subscribed = await checkSub(from.id);
    if (!subscribed) { await ctx.reply('📣 Avval kanalga obuna bo\'ling!', { reply_markup: subKb() }); return; }
    getOrCreateUser(from, null);
    var user = getUser(from.id);
    var name = (user ? user.name : null) || from.first_name || 'Foydalanuvchi';
    await ctx.reply(accountText(from.id, name), { parse_mode: 'HTML', reply_markup: mainKb(me.username, from.id) });
    return;
  }

  if (state.step === 'card_number') {
    var digits = text.replace(/\s/g, '');
    if (!/^\d{16}$/.test(digits)) { await ctx.reply('❌ Noto\'g\'ri format! 16 ta raqam kiriting.\nMasalan: <code>8600000000000000</code>', { parse_mode: 'HTML' }); return; }
    state.data.number = digits; state.step = 'card_holder';
    await ctx.reply('✅ Karta: <b>' + mask(digits) + '</b>\n\n2️⃣ Karta egasining to\'liq ismini yuboring:\n(Pasportdagi kabi)\nMasalan: <code>ALIYEV VOHID</code>', { parse_mode: 'HTML' }); return;
  }

  if (state.step === 'card_holder') {
    if (text.length < 5 || text.length > 50) { await ctx.reply('❌ Ism juda qisqa yoki uzun.'); return; }
    state.data.holder = text.toUpperCase(); state.step = 'card_bank';
    await ctx.reply('✅ Egasi: <b>' + state.data.holder + '</b>\n\n3️⃣ Bank nomini tanlang:', { parse_mode: 'HTML',
      reply_markup: new InlineKeyboard().text('🏦 Uzum Bank', 'bank_Uzum Bank').text('🏦 Kapitalbank', 'bank_Kapitalbank').row()
        .text('🏦 Ipoteka Bank', 'bank_Ipoteka Bank').text('🏦 Hamkorbank', 'bank_Hamkorbank').row()
        .text('🏦 Xalq Banki', 'bank_Xalq Banki').text('🏦 Boshqa', 'bank_Boshqa') }); return;
  }

  if (state.step === 'withdraw_amount') {
    var user2 = getUser(from.id); if (!user2) return;
    var amount = Number(text.replace(/\s/g, '').replace(',', '.'));
    if (isNaN(amount) || amount <= 0) { await ctx.reply('❌ Noto\'g\'ri summa. Raqam kiriting (masalan: 30000)'); return; }
    if (amount < MIN_WITHDRAW) { await ctx.reply('❌ Minimum: ' + fmt(MIN_WITHDRAW)); return; }
    if (amount > user2.balance) { await ctx.reply('❌ Balans yetarli emas! Balans: ' + fmt(user2.balance)); return; }
    var w24b = get24hAmount(from.id);
    if (amount + w24b > MAX_24H) { await ctx.reply('❌ 24h limit oshib ketadi! Qolgan: ' + fmt(MAX_24H - w24b)); return; }
    state.data.amount = String(amount); state.step = 'withdraw_card';
    await ctx.reply('💰 Summa: <b>' + fmt(amount) + '</b>\n\n💳 Qaysi kartaga?', { parse_mode: 'HTML', reply_markup: cardListKb(user2.cards) }); return;
  }
});

bot.catch(function(err) { process.stderr.write('Bot error: ' + err.message + '\n'); });

// Start Express for health checks
  app.listen(PORT, '0.0.0.0', function() {
    process.stdout.write('HTTP server on port ' + PORT + '\n');
  });

  // Delete any existing webhook and start polling
  (async function() {
    try {
      var r = await fetch('https://api.telegram.org/bot' + BOT_TOKEN + '/deleteWebhook?drop_pending_updates=true');
      var d = await r.json();
      process.stdout.write('deleteWebhook: ' + JSON.stringify(d) + '\n');
    } catch(e) { process.stderr.write('deleteWebhook error: ' + e.message + '\n'); }

    // Daily report
    var now = new Date();
    var msUntil9 = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 9, 0, 0) - now;
    setTimeout(function() {
      var sendReport = function() {
        var s = getStats();
        bot.api.sendMessage(ADMIN_ID,
          '\uD83D\uDCCA <b>KUNLIK HISOBOT</b>\n\n\uD83D\uDCC5 ' + new Date().toLocaleDateString('uz-UZ') + '\n\n\uD83D\uDC65 Jami: ' + s.total + '\n\uD83C\uDD95 Bugun: ' + s.today + '\n\uD83D\uDCB3 Kartali: ' + s.withCards + '\n\u23F3 Kutilayotgan: ' + s.pendingCount + ' ta (' + fmt(s.pendingAmount) + ')\n\u2705 To\'langan: ' + fmt(s.totalPaid) + '\n\n\uD83C\uDFC6 Top: ' + (s.topReferrers[0] ? s.topReferrers[0].name + ' (' + s.topReferrers[0].referrals + ' ta)' : '\u2014'),
          { parse_mode: 'HTML' }).catch(function() {});
      };
      sendReport(); setInterval(sendReport, 86400000);
    }, msUntil9);

    process.stdout.write('Bot v5.0 PRO — polling mode starting...\n');
    bot.start({
      onStart: function() { process.stdout.write('Bot v5.0 PRO ready! (polling)\n'); }
    });
  })();
  