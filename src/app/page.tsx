'use client';

import { useMemo, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowLeftRight,
  ArrowUpRight,
  BarChart3,
  BellRing,
  Bolt,
  ChevronDown,
  Cpu,
  Filter,
  Flame,
  Globe2,
  Inbox,
  Moon,
  Signal,
  Sparkles,
} from 'lucide-react';

const teams = ['Quant', 'Macro', 'IA Predictiva'];

const stats = [
  { label: 'PNL diario', value: '+$18,420', delta: '+6.4%' },
  { label: 'Drawdown', value: '1.2%', delta: '-0.3%' },
  { label: 'Órdenes activas', value: '36', delta: '+12' },
  { label: 'Latencia media', value: '84ms', delta: '-5ms' },
];

const alerts = [
  {
    title: 'Volatilidad BTC/USDT',
    description: 'Se detectó un spike de 2.1σ en los últimos 5 minutos.',
    icon: Flame,
    tone: 'bg-rose-500/20 text-rose-300',
  },
  {
    title: 'Arbitraje disponible',
    description: 'Diferencial del 0.8% entre Binance y Coinbase.',
    icon: ArrowLeftRight,
    tone: 'bg-emerald-500/20 text-emerald-300',
  },
  {
    title: 'Riesgo macro',
    description: 'El PMI europeo cayó por debajo de 48 puntos.',
    icon: Globe2,
    tone: 'bg-amber-500/20 text-amber-200',
  },
];

const executions = [
  {
    id: 'ORD-9821',
    asset: 'ETH/USDT',
    side: 'Long',
    size: '120.4k',
    fill: '100%',
    latency: '76ms',
    strategy: 'AI-Scalper',
  },
  {
    id: 'ORD-9820',
    asset: 'SOL/USDT',
    side: 'Short',
    size: '45.8k',
    fill: '98%',
    latency: '92ms',
    strategy: 'Fractal Hunter',
  },
  {
    id: 'ORD-9819',
    asset: 'BTC/USDT',
    side: 'Long',
    size: '300k',
    fill: '100%',
    latency: '68ms',
    strategy: 'Quantum Bridge',
  },
];

const streams = [
  'Flujo institucional',
  'Retail global',
  'On-chain DeFi',
  'Derivados',
];

const aiInsights = [
  {
    title: 'Sesgo alcista a 24h',
    content:
      'El modelo Omega-12 proyecta un alza del 4.2% en BTC con confianza del 68%. Mantén el tamaño de posición actual y ajusta el trailing stop a 1.4%.',
  },
  {
    title: 'Rotación sectorial',
    content:
      'Los flujos se están desplazando hacia L2 y activos con narrativa AI. Considera diversificar 12% del portafolio hacia OP y FET.',
  },
  {
    title: 'Alertas de riesgo',
    content:
      'Los spreads de bonos emergentes se ampliaron 35bps. Reduce exposición en estrategias macro correlacionadas.',
  },
];

const timeline = [
  {
    time: '09:24',
    title: 'Rebalanceo completado',
    description: 'Se reasignaron $2.4M hacia estrategias delta-neutral.',
  },
  {
    time: '09:11',
    title: 'Backtest nocturno',
    description: 'El modelo Phoenix v3 superó el benchmark por 3.1%.',
  },
  {
    time: '08:32',
    title: 'Integración DeFi',
    description: 'Aprobado el bridge hacia nuevos pools con KYC dinámico.',
  },
];

const classNames = (...classes: string[]) => classes.filter(Boolean).join(' ');

const chartGradients = [
  'bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.35),_transparent_60%)]',
  'bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.45),_transparent_62%)]',
  'bg-[radial-gradient(circle_at_top,_rgba(236,72,153,0.35),_transparent_60%)]',
];

function GradientCard({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur-xl transition hover:border-indigo-400/40 hover:shadow-[0_0_35px_rgba(99,102,241,0.25)]">
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-2xl bg-indigo-500/20 p-3 text-indigo-300">
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-indigo-200/80">
            {title}
          </h3>
          <p className="text-xs text-slate-400">{description}</p>
        </div>
      </div>
      <div className="space-y-3">
        {streams.map((stream) => (
          <div key={stream} className="flex items-center justify-between rounded-2xl bg-slate-900/60 px-4 py-3">
            <div className="flex items-center gap-3 text-sm font-medium text-slate-200">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              {stream}
            </div>
            <span className="text-xs text-emerald-300/80">Activo</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function InsightTabs() {
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3">
        {aiInsights.map((insight, index) => {
          const selected = selectedIndex === index;
          return (
            <button
              key={insight.title}
              type="button"
              onClick={() => setSelectedIndex(index)}
              className={classNames(
                'rounded-2xl px-4 py-4 text-left text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60',
                selected
                  ? 'bg-gradient-to-r from-indigo-500/40 via-purple-500/40 to-blue-500/40 text-white shadow-inner'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200',
              )}
            >
              <span className="block text-[10px] uppercase tracking-[0.25em] text-indigo-200/70">Insight IA</span>
              <p className="mt-2 text-sm font-semibold leading-5 text-current">{insight.title}</p>
              {!selected && (
                <span className="mt-3 inline-flex items-center gap-1 text-[10px] font-medium text-indigo-200/70">
                  Ver detalle
                  <ArrowUpRight className="h-3 w-3" />
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div className="mt-4 rounded-3xl border border-white/5 bg-slate-900/60 p-6 shadow-inner">
        <p className="text-sm leading-relaxed text-slate-200/90">{aiInsights[selectedIndex].content}</p>
      </div>
    </div>
  );
}

function ChartPlaceholder({ index }: { index: number }) {
  return (
    <div
      className={classNames(
        'relative flex h-64 flex-col justify-between overflow-hidden rounded-3xl border border-white/5 bg-slate-900/60 p-6',
        chartGradients[index % chartGradients.length],
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs uppercase tracking-[0.3em] text-indigo-300/70">Curva Omega</span>
          <p className="mt-2 text-xl font-semibold text-white">BTC / USDT</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-medium text-slate-100 transition hover:border-indigo-300/60 hover:bg-indigo-500/30">
          <Signal className="h-4 w-4" />
          Optimizar
        </button>
      </div>
      <div className="relative mt-6 h-full w-full overflow-hidden">
        <div className="absolute inset-x-0 bottom-0 flex h-24 items-end gap-2 opacity-80">
          {[...Array(30)].map((_, barIndex) => (
            <div
              key={barIndex}
              className="flex-1 rounded-t-full bg-gradient-to-t from-indigo-500/50 via-indigo-400/40 to-transparent"
              style={{ height: `${Math.sin((barIndex / 4) + index) * 15 + 45}%` }}
            />
          ))}
        </div>
        <div className="absolute inset-x-0 bottom-0 h-px bg-white/10" />
      </div>
      <div className="mt-6 flex items-center justify-between text-xs text-slate-400">
        <span>1H</span>
        <span>4H</span>
        <span>12H</span>
        <span>1D</span>
      </div>
    </div>
  );
}

export default function Page() {
  const [selectedTeam, setSelectedTeam] = useState(teams[0]);

  const totalStreams = useMemo(() => streams.length, []);

  return (
    <main className="relative mx-auto flex min-h-screen max-w-7xl flex-col gap-10 px-6 pb-20 pt-12 sm:px-10 lg:px-16">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-indigo-600/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-purple-600/20 blur-3xl" />
      </div>

      <header className="flex flex-wrap items-center justify-between gap-6">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-indigo-200/70">Omega Systems</p>
          <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">Centro de Control Global</h1>
          <p className="mt-4 max-w-2xl text-sm text-slate-300/80">
            Orquesta la ejecución algorítmica, monitorea riesgos macro y activa herramientas de IA desde un panel unificado diseñado para decisiones en segundos.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-slate-200 hover:border-indigo-300/60 hover:bg-indigo-500/30">
            <Moon className="h-4 w-4" />
            Noche perpetua
          </button>
          <button className="flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white shadow-lg shadow-indigo-500/30">
            <Sparkles className="h-4 w-4" />
            Iniciar secuencia
          </button>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-3xl border border-white/5 bg-slate-900/60 p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="uppercase tracking-[0.3em]">{stat.label}</span>
              <span className="inline-flex items-center gap-1 text-emerald-300/80">
                <ArrowUpRight className="h-3 w-3" />
                {stat.delta}
              </span>
            </div>
            <p className="mt-4 text-3xl font-semibold text-white">{stat.value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs uppercase tracking-[0.4em] text-indigo-200/70">Módulo Operativo</h2>
              <p className="mt-2 text-lg font-semibold text-white">Flujos de ejecución y liquidez</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <button className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                <Filter className="h-3 w-3" />
                Filtros
              </button>
              <button className="flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-500/20 px-3 py-1 text-emerald-200">
                <Bolt className="h-3 w-3" />
                Auto-sync
              </button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <GradientCard
              title="Flujos activos"
              description={`Monitoreando ${totalStreams} streams en vivo`}
              icon={Signal}
            />
            <div className="md:col-span-2 space-y-4">
              {[0, 1].map((index) => (
                <ChartPlaceholder key={index} index={index} />
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/5 bg-slate-900/60 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Últimas ejecuciones</h3>
              <button className="flex items-center gap-1 text-xs text-indigo-200/80">
                Ver historial
                <ArrowUpRight className="h-3 w-3" />
              </button>
            </div>
            <div className="mt-4 divide-y divide-white/5">
              {executions.map((execution) => (
                <div key={execution.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                  <div className="flex items-center gap-3">
                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.25em]">
                      {execution.id}
                    </span>
                    <div>
                      <p className="font-semibold text-white">{execution.asset}</p>
                      <p className="text-xs text-slate-400">{execution.strategy}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-xs text-slate-300">
                    <span className="rounded-full bg-indigo-500/20 px-3 py-1 font-semibold text-indigo-200">
                      {execution.side}
                    </span>
                    <span>Tamaño: {execution.size}</span>
                    <span>Fill: {execution.fill}</span>
                    <span>Latencia: {execution.latency}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/5 bg-slate-900/60 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-white">Insights predictivos</h3>
                <p className="text-xs uppercase tracking-[0.3em] text-indigo-200/70">Omega Core</p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full border border-indigo-400/40 bg-indigo-500/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-indigo-100">
                <Sparkles className="h-3 w-3" />
                Live AI
              </span>
            </div>
            <div className="mt-5">
              <InsightTabs />
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-white/5 bg-gradient-to-br from-slate-900/80 via-indigo-900/60 to-slate-900/60 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xs uppercase tracking-[0.4em] text-indigo-200/70">Salas de control</h2>
                <p className="mt-2 text-lg font-semibold text-white">Sincroniza equipos</p>
              </div>
              <button className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-200 hover:border-indigo-300/60 hover:bg-indigo-500/30">
                <BellRing className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs text-slate-300">
              <Cpu className="h-4 w-4" />
              <span>IA asignó nuevo runbook</span>
            </div>

            <div className="mt-4 flex items-center gap-3">
              {teams.map((team) => (
                <button
                  key={team}
                  onClick={() => setSelectedTeam(team)}
                  className={classNames(
                    'rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] transition',
                    selectedTeam === team
                      ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 text-white shadow-lg'
                      : 'border border-white/10 bg-white/5 text-slate-300 hover:border-indigo-300/40 hover:bg-indigo-500/20'
                  )}
                >
                  {team}
                </button>
              ))}
            </div>

            <div className="mt-6 space-y-3">
              {timeline.map((item) => (
                <div key={item.title} className="rounded-2xl border border-white/5 bg-white/5 p-4">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>{item.time}</span>
                    <span className="inline-flex items-center gap-1 text-indigo-200/70">
                      <Inbox className="h-4 w-4" />
                      Log automático
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-white">{item.title}</p>
                  <p className="text-xs text-slate-300/80">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/5 bg-slate-900/60 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Alertas inteligentes</h3>
              <button className="flex items-center gap-1 text-xs text-indigo-200/80">
                Ajustar
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 space-y-3">
              {alerts.map((alert) => (
                <div key={alert.title} className={classNames('rounded-2xl p-4', alert.tone)}>
                  <div className="flex items-center gap-3 text-sm font-semibold">
                    <alert.icon className="h-5 w-5" />
                    {alert.title}
                  </div>
                  <p className="mt-2 text-xs text-white/80">{alert.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-indigo-500/30 bg-indigo-500/10 p-6 shadow-[0_0_40px_rgba(99,102,241,0.25)]">
            <h3 className="text-sm font-semibold text-white">Panel IA Omega</h3>
            <p className="mt-2 text-xs text-indigo-100/80">
              Coordina bots, simulaciones y reportes generados por Omega Core. Accede a libros blancos, pipelines y evaluaciones de riesgo en segundos.
            </p>
            <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/60 p-4">
              <div className="flex items-center gap-3 text-xs text-indigo-200">
                <BarChart3 className="h-4 w-4" />
                <span>Proyección volatilidad 6h</span>
              </div>
              <p className="mt-3 text-3xl font-semibold text-white">17.4%</p>
              <p className="text-[11px] uppercase tracking-[0.3em] text-indigo-200/70">Actualizado hace 2m</p>
            </div>
            <button className="mt-6 w-full rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white hover:bg-white/20">
              Lanzar asistente
            </button>
          </div>
        </aside>
      </section>

      <section className="rounded-3xl border border-white/5 bg-slate-900/60 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xs uppercase tracking-[0.4em] text-indigo-200/70">Panel IA conversacional</h2>
            <p className="mt-2 text-lg font-semibold text-white">Órdenes autónomas con Omega Assistant</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <button className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1">
              <Sparkles className="h-4 w-4" />
              Comandos
            </button>
            <button className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1">
              <Bolt className="h-4 w-4" />
              Automatizar
            </button>
          </div>
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/5 bg-white/5 p-6">
            <div className="flex items-center gap-2 text-xs text-indigo-200/80">
              <Sparkles className="h-4 w-4" />
              Prompt recomendados
            </div>
            <ul className="mt-4 space-y-3 text-sm text-slate-200">
              <li className="rounded-2xl bg-slate-950/60 px-4 py-3">
                Genera una simulación de stress para ETH en escenario de caída del 12%
              </li>
              <li className="rounded-2xl bg-slate-950/60 px-4 py-3">
                Coordina arbitraje entre Binance y OKX con tope del 1.2%
              </li>
              <li className="rounded-2xl bg-slate-950/60 px-4 py-3">
                Resume riesgos macro de la sesión asiática en 5 bullet points
              </li>
            </ul>
          </div>
          <div className="rounded-2xl border border-indigo-500/40 bg-indigo-500/10 p-6">
            <div className="flex items-center gap-2 text-xs text-indigo-200/80">
              <Cpu className="h-4 w-4" />
              Pipeline automatizado
            </div>
            <div className="mt-4 space-y-4 text-sm text-slate-200">
              <p>1. Ingresa parámetros de riesgo y liquidez.</p>
              <p>2. Omega genera escenarios y recomendaciones.</p>
              <p>3. Confirma ejecución y monitorea resultados en vivo.</p>
            </div>
            <button className="mt-6 w-full rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white hover:bg-white/20">
              Configurar playbook
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
