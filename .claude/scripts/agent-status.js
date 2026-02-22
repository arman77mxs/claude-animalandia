#!/usr/bin/env node
/**
 * agent-status.js
 * Script de status verbose para Claude Code Multi-Agente
 * Se ejecuta en background durante el build
 */

const agents = [
    { name: "ATLAS",    emoji: "🤖", task: "Supabase schemas + RLS",   progress: 0 },
    { name: "NOVA",     emoji: "🤖", task: "Auth + Login + Registro",   progress: 0 },
    { name: "PIXEL",    emoji: "🤖", task: "Frontend + UI + Pages",     progress: 0 },
    { name: "GUARDIAN", emoji: "🤖", task: "Playwright tests",          progress: 0 },
    { name: "HERMES",   emoji: "🤖", task: "GitHub + Vercel deploy",    progress: 0 },
  ];
  
  const STATE_FILE = ".claude/agent-state.json";
  const fs = require("fs");
  
  function readState() {
    try {
      if (fs.existsSync(STATE_FILE)) {
        return JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
      }
    } catch {}
    return { agents: agents.map(a => ({ ...a, progress: 0 })), phase: 1, totalPhases: 8, completedTasks: 0, totalTasks: 34 };
  }
  
  function bar(pct, width = 10) {
    const filled = Math.round((pct / 100) * width);
    return "█".repeat(filled) + "░".repeat(width - filled);
  }
  
  function pad(str, len) {
    return str.toString().padEnd(len);
  }
  
  function formatTime(ms) {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    const min = m % 60;
    const hr = Math.floor(m / 60);
    return `${String(hr).padStart(2,"0")}:${String(min).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
  }
  
  const startTime = Date.now();
  
  function render() {
    const state = readState();
    const elapsed = Date.now() - startTime;
    const activeAgents = state.agents.filter(a => a.progress > 0 && a.progress < 100).length;
  
    // Clear terminal
    process.stdout.write("\x1B[2J\x1B[0f");
  
    const line = "━".repeat(52);
    console.log(line);
    console.log(" CLAUDE CODE — MULTI-AGENT STATUS");
    console.log(` ⏱  Tiempo: ${formatTime(elapsed)}  |  Fase: ${state.phase}/${state.totalPhases}  |  Agentes activos: ${activeAgents}/5`);
    console.log(line);
  
    state.agents.forEach(agent => {
      const pct = agent.progress || 0;
      console.log(` ${agent.emoji} ${pad(agent.name, 10)} → ${pad(agent.task, 26)} [${bar(pct)}] ${String(pct).padStart(3)}%`);
    });
  
    console.log(line);
    console.log(` Tareas completadas: ${state.completedTasks}/${state.totalTasks}`);
    console.log(line);
  }
  
  // Actualizar cada segundo
  setInterval(render, 1000);
  render();