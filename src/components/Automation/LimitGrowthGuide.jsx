import React from "react";
import {
  X, BookOpen, Target, Settings2, CalendarDays, Rocket, ListChecks,
  Layers, TrendingUp, ShieldCheck, AlertTriangle, CheckCircle2,
} from "lucide-react";

/**
 * "Limit Growth Guide" — a read-only, non-technical help drawer for growing
 * WhatsApp messaging limits safely with the Automation system. Opened from a
 * button on the Automation Dashboard. Pure UI; changes no backend logic.
 */
export default function LimitGrowthGuide({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-2xl h-full overflow-y-auto bg-white dark:bg-[#0b1120] border-l border-gray-200 dark:border-gray-800 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 bg-white/95 dark:bg-[#0b1120]/95 backdrop-blur border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <BookOpen className="text-green-500" size={20} />
            <div>
              <p className="text-[11px] uppercase tracking-wide text-gray-400">Limit Growth Guide</p>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                Grow WhatsApp limits safely
              </h2>
            </div>
          </div>
          <button onClick={onClose}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-8 text-gray-700 dark:text-gray-300">
          {/* Intro */}
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-snug">
              Practical Guide: How to grow WhatsApp messaging limits safely with your Automation system
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              A simple, non-technical walkthrough. Follow it to grow your limits in a healthy,
              controlled way — the system handles who and when; you control volume, template,
              and pause/resume.
            </p>
          </div>

          {/* Core Rule */}
          <Card icon={<Target size={16} />} title="Core Rule">
            <p>
              Meta increases limits based on <b>quality conversations</b>, not just the number of
              messages sent.
            </p>
            <p className="mt-3 font-medium text-gray-800 dark:text-gray-200">A quality conversation usually means:</p>
            <List items={[
              "Message delivered",
              "Preferably read",
              "Preferably replied",
              "Very low opt-out / block / failure rate",
            ]} />
            <p className="mt-3 font-medium text-gray-800 dark:text-gray-200">Typical targets:</p>
            <List items={[
              <><b>2,000 → 10,000</b> limit ≈ 800–1,200 quality conversations</>,
              <><b>10,000 → 100,000</b> limit ≈ 3,000–6,000 quality conversations</>,
            ]} />
          </Card>

          {/* Recommended settings */}
          <Card icon={<Settings2 size={16} />} title="Recommended Settings for 2k → 10k">
            <Table
              head={["Setting", "Recommended Value"]}
              rows={[
                ["Contact pool", "Best 5,000–15,000 contacts"],
                ["Daily volume (Day 1)", "80–120"],
                ["Daily volume (Day 2–3)", "150–200"],
                ["Daily volume (Day 4–7)", "200–300"],
                ["Progressive plan", "Yes (7–10 days)"],
                ["Template", "High-engagement / utility"],
                ["Sending hours", "09:00 – 20:00"],
              ]}
            />
            <Callout tone="warn">Never start with very high daily volume.</Callout>
          </Card>

          {/* Day-by-day playbook */}
          <Card icon={<CalendarDays size={16} />} title="Day-by-day playbook (2k → 10k)">
            <Table
              head={["Day", "Daily volume"]}
              rows={[
                ["Day 1", "80–100"],
                ["Day 2", "120–150 (only if previous day success rate is high)"],
                ["Day 3", "150–180"],
                ["Day 4", "180–220"],
                ["Day 5", "220–250"],
                ["Day 6", "250–280"],
                ["Day 7", "280–300"],
                ["After that", "Maintain or slightly increase only if quality stays excellent"],
              ]}
            />
            <div className="grid sm:grid-cols-2 gap-3 mt-3">
              <MiniNote tone="good" icon={<TrendingUp size={14} />}
                title="When to increase volume">
                Success rate high + low opt-outs
              </MiniNote>
              <MiniNote tone="bad" icon={<AlertTriangle size={14} />}
                title="When to decrease or pause">
                Success rate drops, opt-outs rise, or the system auto-pauses
              </MiniNote>
            </div>
          </Card>

          {/* Create campaign */}
          <Card icon={<Rocket size={16} />} title="How to create the campaign correctly">
            <OrderedList items={[
              "Go to Automation → Create Automated Campaign",
              <>Name it clearly (example: <i>Limit Growth 2k to 10k</i>)</>,
              "Select a high-quality contact pool (do not select all 100k contacts)",
              "Choose a good template (upload image if the template needs it)",
              <>Set <b>Daily volume target = 100</b> (start low)</>,
              "Turn Progressive plan ON (7–10 days)",
              "Start the campaign",
            ]} />
            <Callout tone="info">
              After starting, check the Control Panel. It will tell you when messages will actually
              start sending.
            </Callout>
          </Card>

          {/* Daily routine */}
          <Card icon={<ListChecks size={16} />} title="Daily routine">
            <p className="font-medium text-gray-800 dark:text-gray-200">Every day you should:</p>
            <OrderedList items={[
              "Open the Automation Dashboard",
              <>Check <b>Sent today</b>, <b>Success rate</b>, and the <b>Status line</b></>,
              "Open the Control Panel",
              "Decide whether to increase, keep, or reduce the Daily volume target",
              "Change template only if needed",
              "Pause / Resume when necessary",
            ]} />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
              The system decides <b>who</b> receives the message and <b>when</b>. You only control
              volume, template, and pause/resume.
            </p>
          </Card>

          {/* 100k contacts */}
          <Card icon={<Layers size={16} />} title="What to do with 100,000 contacts">
            <List items={[
              "Never put all 100k contacts into one campaign",
              "Create quality segments (High engagers, Recent customers, Medium quality, Cold)",
              "Always start with the best segment first",
              "Move to the next segment only when needed",
            ]} />
          </Card>

          {/* 10k -> 100k */}
          <Card icon={<TrendingUp size={16} />} title="Moving from 10k → 100k (later stage)">
            <List items={[
              "Increase daily volume more slowly and carefully",
              "Still prioritise quality over quantity",
              "Use best contact pools first",
            ]} />
          </Card>

          {/* Safety checklist */}
          <Card icon={<ShieldCheck size={16} />} title="Safety checklist">
            <div className="space-y-2">
              {[
                "Always start low (80–120)",
                "Never jump volume too aggressively",
                "Watch success rate and opt-outs every day",
                "Respect system auto-pause",
                "Prefer templates that get replies",
                "Never message opted-out contacts",
              ].map((t, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-green-500 mt-0.5 shrink-0" />
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </Card>

          <div className="pt-2 pb-6 text-center">
            <button onClick={onClose}
              className="px-5 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700">
              Got it — let's grow safely
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── presentational helpers ─────────────────────────────────────────────── */
function Card({ icon, title, children }) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-green-500">{icon}</span>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h3>
      </div>
      <div className="rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800 p-4 text-sm leading-relaxed">
        {children}
      </div>
    </section>
  );
}

function List({ items }) {
  return (
    <ul className="mt-1.5 space-y-1.5">
      {items.map((it, i) => (
        <li key={i} className="flex items-start gap-2">
          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-green-500 shrink-0" />
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}

function OrderedList({ items }) {
  return (
    <ol className="mt-1 space-y-2">
      {items.map((it, i) => (
        <li key={i} className="flex items-start gap-2.5">
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-green-500/15 text-green-600 dark:text-green-400 text-xs font-bold shrink-0 mt-0.5">
            {i + 1}
          </span>
          <span>{it}</span>
        </li>
      ))}
    </ol>
  );
}

function Table({ head, rows }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-800/60 text-left text-gray-600 dark:text-gray-300">
            {head.map((h, i) => (
              <th key={i} className="px-3 py-2 font-semibold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-gray-100 dark:border-gray-800">
              {r.map((c, j) => (
                <td key={j} className={`px-3 py-2 ${j === 0 ? "font-medium text-gray-800 dark:text-gray-200" : "text-gray-600 dark:text-gray-400"}`}>
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Callout({ tone = "info", children }) {
  const tones = {
    info: "border-blue-300/30 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300",
    warn: "border-amber-300/40 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300",
  };
  return (
    <div className={`mt-3 rounded-lg border px-3 py-2 text-sm font-medium ${tones[tone]}`}>
      {children}
    </div>
  );
}

function MiniNote({ tone, icon, title, children }) {
  const tones = {
    good: "border-green-300/30 bg-green-50 dark:bg-green-500/10",
    bad: "border-red-300/30 bg-red-50 dark:bg-red-500/10",
  };
  const titleTone = tone === "good" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400";
  return (
    <div className={`rounded-lg border p-3 ${tones[tone]}`}>
      <div className={`flex items-center gap-1.5 text-xs font-semibold ${titleTone}`}>
        {icon} {title}
      </div>
      <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{children}</p>
    </div>
  );
}
