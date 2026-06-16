import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { tournaments, dailyChallenges } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

const TELEGRAM_API = 'https://api.telegram.org/bot'
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || ''

async function sendTelegramMessage(chatId: string, text: string) {
  if (!BOT_TOKEN) return

  try {
    await fetch(`${TELEGRAM_API}${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
      }),
    })
  } catch (error) {
    console.error('[v0] Telegram send message error:', error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const update = await req.json()
    const message = update.message
    const chatId = message?.chat?.id
    const text = message?.text || ''

    if (!chatId) {
      return NextResponse.json({ ok: true })
    }

    // Handle commands
    if (text.startsWith('/start')) {
      await sendTelegramMessage(
        chatId,
        '🎮 Welcome to Neon RPS!\n\nAvailable commands:\n/duel - Challenge a player\n/tournaments - View active tournaments\n/leaderboard - Top players\n/stats - Your stats\n/daily - Today\'s challenge'
      )
    } else if (text.startsWith('/tournaments')) {
      const active = await db
        .select()
        .from(tournaments)
        .where(eq(tournaments.status, 'open'))
        .limit(5)

      const message = active.length
        ? `🏆 <b>Active Tournaments:</b>\n${active.map((t) => `• ${t.name} (${t.maxPlayers} players)`).join('\n')}`
        : 'No active tournaments right now'

      await sendTelegramMessage(chatId, message)
    } else if (text.startsWith('/daily')) {
      const today = new Date().toISOString().split('T')[0]
      const challenge = await db
        .select()
        .from(dailyChallenges)
        .where(eq(dailyChallenges.day, today))
        .limit(1)

      const message = challenge.length
        ? `📅 <b>Today's Challenge:</b>\n${challenge[0].title}\n${challenge[0].description}\n\n🎁 Reward: ${challenge[0].rewardAmount} ETH`
        : 'No challenge for today'

      await sendTelegramMessage(chatId, message)
    } else if (text.startsWith('/stats')) {
      await sendTelegramMessage(
        chatId,
        '📊 <b>Your Stats:</b>\nWins: 0\nLosses: 0\nWinrate: 0%\n\nPlay a game to get started!'
      )
    } else {
      await sendTelegramMessage(
        chatId,
        'Use /start to see available commands'
      )
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[v0] Telegram webhook error:', error)
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    )
  }
}
