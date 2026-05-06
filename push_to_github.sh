#!/bin/bash
set -e

GITHUB_USER="umidjonalimardonov23-rgb"
REPO_NAME="uzum-referral-bot"
TOKEN="${GITHUB_PERSONAL_ACCESS_TOKEN}"

if [ -z "$TOKEN" ]; then
  echo "❌ GITHUB_PERSONAL_ACCESS_TOKEN topilmadi!"
  exit 1
fi

echo "🔧 Git konfiguratsiya..."
git config user.email "bot@replit.com"
git config user.name "Replit Agent"

echo "🔗 GitHub remote qo'shilmoqda..."
git remote remove github 2>/dev/null || true
git remote add github "https://${GITHUB_USER}:${TOKEN}@github.com/${GITHUB_USER}/${REPO_NAME}.git"

echo "📦 Barcha o'zgarishlar qo'shilmoqda..."
git add -A

echo "💾 Commit qilinmoqda..."
git commit -m "🚀 Uzum Bank Referral Mini App va Bot — Railway uchun tayyor" || echo "Yangi o'zgarishlar yo'q, skip..."

echo "⬆️  GitHub'ga push qilinmoqda..."
git push github main --force

echo ""
echo "✅ Muvaffaqiyatli! Kod GitHub'ga yuklandi:"
echo "🔗 https://github.com/${GITHUB_USER}/${REPO_NAME}"
echo ""
echo "📋 Keyingi qadam — Railway:"
echo "   1. https://railway.app ga kiring"
echo "   2. New Project → Deploy from GitHub repo"
echo "   3. '${REPO_NAME}' reponi tanlang"
echo "   4. Variables bo'limiga TELEGRAM_BOT_TOKEN qo'shing"
echo "   5. Deploy! 🚀"
