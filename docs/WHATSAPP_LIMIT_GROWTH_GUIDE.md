# WhatsApp Limit Growth Guide

**A practical configuration + operations guide for growing WhatsApp messaging limits safely using the Automation system.**

This guide is written for non-technical operators. Follow it step by step. The Automation system decides **who** to message and **when** — you only control **volume**, **template**, and **pause/resume**. Everything here is about building **healthy, high-quality messaging** that Meta rewards with higher limits over time.

> This is not a trick and not a guarantee. Meta raises limits when your messaging is genuinely high quality. This guide helps you produce that quality consistently and safely.

---

## 1. Overview

### How Meta messaging limits work

Meta increases your messaging limit based on the **quality of conversations**, not the raw number of messages you blast out. Sending 10,000 low-quality messages in a day hurts you. Sending a smaller number that get **delivered, read, and replied to** — with very few opt-outs — grows your limit.

A **quality conversation** generally means:

- ✅ Message **delivered**
- ✅ Preferably **read**
- ✅ Preferably **replied to**
- ✅ Very **low** opt-out / block / failure rate

The Automation system is built around this: it picks your best contacts first, paces sends across safe hours, watches your delivery/failure/opt-out rates in real time, and automatically slows down or pauses if quality drops.

### Typical quality conversations needed

These are practical planning targets, not official Meta numbers:

| Limit jump | Quality conversations to aim for | Suggested plan length |
|---|---|---|
| 2,000 → 10,000 | ~800 – 1,200 | 7 – 10 days |
| 10,000 → 100,000 | ~3,000 – 6,000 | 3 – 6 weeks |

**Rule of thumb:** grow gradually, keep quality excellent, and let the numbers accumulate. Never rush.

---

## 2. Full Configuration Settings

When you create an Automated Campaign (**Automation → New automated campaign**), configure these thoughtfully.

### Contact pool selection strategy

The **pool** is the group of contacts a campaign is *allowed* to message (e.g. 10,000). The system messages only a small number from it each day.

- **Choose quality, not size.** A focused pool of engaged contacts beats a huge cold list.
- Sources: **segment**, **group**, **all contacts**, or a **single number**.
- Best pool size for a growth campaign: **5,000 – 15,000** high-quality contacts.
- **Do not** dump 100,000 mixed contacts into one campaign (see Section 5).

### Daily volume target

This is the **maximum** messages the system will send per day. It will send **at most** this number, choosing the highest-quality eligible contacts first.

- **Start low:** 80 – 120 on Day 1.
- Increase only when the previous day's **success rate is high** and **opt-outs are low**.
- Increase in **small steps** (e.g. +30–50/day), never double overnight.

### Progressive / multi-day plan (warm-up)

Turning **Progressive plan ON** makes the system **ramp volume up gradually** over several days toward your target, instead of hitting full volume on Day 1.

- Recommended for **new numbers** and **large pools**.
- Set the ramp length to **7 – 10 days** for a 2k → 10k campaign.
- With progressive ON, Day 1 automatically starts smaller and grows each day.
- With progressive OFF, the system sends your fixed daily target every day (still capped, still safe).

### Template selection rules

- Use **approved** templates only (WhatsApp won't deliver unapproved ones).
- Prefer **high-engagement / utility** templates that invite a reply (a question, a confirmation, a helpful update).
- Avoid pushy, spammy, or irrelevant content — it drives opt-outs, which slows the system down.
- You can **change the template later** without stopping the campaign.

### Media (image / video / document) handling

- If the template has an **image / video / document header**, the create wizard and the Control Panel will show an **upload box**.
- Upload the media there — it is **required** for those templates and is sent with every message.
- The uploaded media is saved with the campaign and used automatically on every send.

### Sending time windows

- The system only sends within your **allowed hours** (default **09:00 – 20:00**, your timezone).
- Messages are **spread across the window** (not all at once), which protects quality and looks natural.
- If you start a campaign **after** the window closes, sending resumes the **next morning**.

### Warm-up behaviour (what happens automatically)

- The **daily cap** each day = the smaller of: your daily target, the warm-up cap for that day, any health-based reduction, and your remaining safe throughput.
- The **sender runs every minute** inside your window and never exceeds the day's cap.
- If health drops toward unsafe levels, the system **reduces tomorrow's volume**; if it crosses a critical line, it **auto-pauses** and alerts you.

---

## 3. Recommended Configurations by Stage

### Stage 1 — 2,000 → 10,000 limit

| Setting | Recommended value |
|---|---|
| Contact pool | Best **5,000 – 15,000** contacts |
| Starting daily volume (Day 1) | **80 – 120** |
| Daily volume (Day 2–3) | 150 – 200 |
| Daily volume (Day 4–7) | 200 – 300 |
| Progressive plan | **Yes** (7 – 10 days) |
| Quality conversations to aim for | **800 – 1,200** |
| Plan length | **7 – 10 days** |
| Template | High-engagement / utility |
| Sending hours | 09:00 – 20:00 |

**Day-by-day volume progression (Stage 1):**

| Day | Daily volume | Condition |
|---|---|---|
| Day 1 | 80 – 100 | Start here, always |
| Day 2 | 120 – 150 | Only if Day 1 success rate is high |
| Day 3 | 150 – 180 | Quality still good |
| Day 4 | 180 – 220 | Quality still good |
| Day 5 | 220 – 250 | Quality still good |
| Day 6 | 250 – 280 | Quality still good |
| Day 7 | 280 – 300 | Quality still good |
| Day 8+ | Maintain ~300 | Increase **only** if quality stays excellent |

### Stage 2 — 10,000 → 100,000 limit

Go **slower and more carefully** than Stage 1 — the volumes are bigger, so mistakes cost more.

| Setting | Recommended value |
|---|---|
| Contact pool | Use **quality segments**, best first (see Section 5) |
| Starting daily volume | **300 – 500** (do not jump straight to thousands) |
| Daily volume growth | +10–20% per day **only** while quality is excellent |
| Progressive plan | **Yes** (spread over the full stage) |
| Quality conversations to aim for | **3,000 – 6,000** |
| Plan length | **3 – 6 weeks** |
| Best pool size per campaign | **10,000 – 20,000** per segment (not all at once) |
| Template | High-engagement / utility, reply-friendly |
| Sending hours | 09:00 – 20:00 |

**Day-by-day volume progression (Stage 2, example ramp):**

| Phase | Daily volume | Notes |
|---|---|---|
| Days 1–3 | 300 – 500 | Establish clean quality baseline |
| Days 4–7 | 500 – 900 | Increase ~10–20%/day if quality holds |
| Week 2 | 900 – 2,000 | Keep watching opt-outs closely |
| Week 3 | 2,000 – 4,000 | Only if success stays high |
| Week 4+ | 4,000 → higher | Slow, steady increases; quality first |

> If quality dips at any point, **hold or reduce** volume until it recovers. There is no prize for going fast.

---

## 4. Day-by-day Operating Playbook

Do this **every day** while a growth campaign is running. It takes 2–3 minutes.

### 1. Open the Automation Dashboard and check:

- **Sent today vs target** — how many have gone out.
- **Success rate** — share of today's messages delivered. Higher is better.
- **Failure rate** — should stay low.
- **Status line** (under each campaign) — plain-English "what's happening right now".
- **Recent automatic pauses** — did the system pause anything, and why.
- **Alerts** — read and clear any that need attention.

### 2. Open the Control Panel for the campaign and check:

- The **"when will it send?"** banner (batch ready / sending now / next send time / outside hours).
- **Next scheduled** — upcoming messages with exact times.

### 3. Decide the day's action:

| Situation | Action |
|---|---|
| Success rate **high** + opt-outs **low** | **Increase** daily volume by a small step (+30–50 Stage 1; +10–20% Stage 2) |
| Quality **steady but not great** | **Keep** the same daily volume another day |
| Success rate **dropping** or opt-outs **rising** | **Decrease** daily volume |
| Failure/opt-out **spiking** or system **auto-paused** | **Pause**, review template/audience, resume when healthy |
| Template underperforming (low reads/replies) | **Change template** (no need to stop the campaign) |

### Golden pacing rule

**Increase slowly. Decrease quickly.** When in doubt, hold volume for another day.

---

## 5. Contact Strategy (especially with 100,000 contacts)

A big list is only useful if you message the **right people in the right order**.

### Split 100k into quality tiers

Create **segments** based on engagement and recency, for example:

| Tier | Who's in it | Use it… |
|---|---|---|
| **High engagers** | Replied / read recently, frequent buyers | **First** |
| **Recent customers** | Purchased or interacted in last 30–60 days | Second |
| **Medium quality** | Some past engagement, older | Third |
| **Cold** | No engagement, very old, unknown | **Last / rarely** |

### Order of use

1. **Always start with your best segment** (High engagers). Clean, engaged contacts produce delivered + read + replied conversations, which is exactly what grows your limit.
2. **Move to the next tier only when needed** — e.g. you've worked through the best segment, quality is excellent, and you want more daily volume.
3. Keep each campaign's pool to a **manageable size** (10,000 – 20,000), not the whole list.

### What never to do

- ❌ **Never put all 100,000 contacts in one campaign.** Mixed quality drags down your rates and can trigger auto-pause.
- ❌ Never lead with cold, unengaged contacts.
- ❌ Never message contacts who opted out (the system blocks this automatically — don't try to override it).

---

## 6. Advanced Tips & Best Practices

### Keep success rate high

- Start low and ramp slowly — the single biggest lever.
- Message **engaged** contacts first.
- Keep numbers clean (valid, opted-in). The system quarantines repeat failures automatically.
- Send within normal daytime hours.

### Reduce opt-outs

- Send **relevant, valuable** content — not repetitive promos.
- Don't over-message the same people (the system enforces a minimum gap, but good content matters most).
- Honor intent: if engagement is low, slow down rather than push harder.

### Template performance

- Prefer templates that **invite a reply** (questions, confirmations, useful updates) — replies are the strongest quality signal.
- Test a couple of templates and keep the one with better read/reply rates.
- Change templates freely from the Control Panel; the campaign keeps running.

### When the system auto-pauses

An auto-pause is the system **protecting your account**. When it happens:

1. Read the alert and the **pause reason** (high failure, high opt-out, or low delivery).
2. Review your **template** (is it relevant and engaging?) and **audience** (too cold?).
3. Consider **lowering** the daily volume.
4. **Resume** only when you've addressed the cause.

### How to read the status line & scheduled messages

The **status line** and Control Panel banner tell you exactly what's happening:

| You see… | It means… |
|---|---|
| "Daily batch is being prepared…" | The system is building today's list; refresh shortly. |
| "Today's batch is ready — X messages scheduled between HH:MM and HH:MM" | Ready; sending starts when the window opens. |
| "Sending now — X sent, Y queued. Next ~HH:MM" | Actively sending; next message time shown. |
| "Outside today's sending hours" | Window closed; resumes tomorrow morning. |
| "Warm-up volume is 0 today" | Early ramp day; volume grows over the next days. |
| "Today's batch is fully sent (X messages)" | Done for today; next batch tomorrow. |

**Next scheduled** lists the upcoming messages with exact times, so you always know when the next ones go out.

---

## 7. Safety Rules (must follow)

- ✅ **Always start low** (80 – 120/day).
- ✅ **Never jump volume aggressively** — small steps only.
- ✅ **Watch success rate and opt-outs every day.**
- ✅ **Respect the system's auto-pause** — fix the cause before resuming.
- ✅ **Prefer templates that get replies.**
- ✅ **Use your best contacts first**, cold contacts last (or never).
- ✅ **Never message opted-out contacts** (the system blocks this — never try to bypass it).
- ✅ **Keep sends within daytime hours** (09:00 – 20:00).
- ✅ **Quality over quantity, always.**

---

## 8. Quick Start Checklist — First 2k → 10k Campaign

Copy this and tick it off:

```
[ ] Pick your BEST 5,000–15,000 contacts (a segment or group, not "all")
[ ] Go to Automation → New automated campaign
[ ] Name it clearly (e.g. "Limit Growth 2k to 10k")
[ ] Select the high-quality pool
[ ] Choose an approved, reply-friendly template
[ ] If the template has an image/video header, upload the media
[ ] Set Daily volume target = 100  (start low!)
[ ] Turn Progressive plan ON (7–10 days)
[ ] Review and Start
[ ] Open the Control Panel — confirm "when will it send?" status
[ ] Each day: check Sent today, Success rate, Status line
[ ] Increase volume only if success is high and opt-outs are low
[ ] Pause / lower volume immediately if quality drops
[ ] Aim for ~800–1,200 quality conversations over 7–10 days
```

---

### Remember

The system does the hard part — picking the best contacts, pacing sends, watching health, and pausing on risk. Your job is simple and important: **start low, grow slowly, watch quality, and keep your content worth replying to.** That is how limits grow safely.
