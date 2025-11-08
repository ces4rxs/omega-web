"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  MessageSquare,
  Send,
  Bot,
  User,
  Sparkles,
  Zap,
  TrendingUp,
  Shield,
  Crown,
  Lock,
  Trash2,
  Copy,
  Check
} from "lucide-react"
import { useTier } from "@/hooks/use-tier"
import { useRouter } from "next/navigation"

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface QuickAction {
  label: string
  prompt: string
  icon: any
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    label: 'Analizar mi última estrategia',
    prompt: 'Analiza mi última estrategia de backtest y dame recomendaciones de mejora',
    icon: TrendingUp,
  },
  {
    label: 'Reducir riesgo',
    prompt: '¿Cómo puedo reducir el riesgo en mi estrategia manteniendo el retorno?',
    icon: Shield,
  },
  {
    label: 'Optimizar parámetros',
    prompt: '¿Qué parámetros debería ajustar para mejorar el Sharpe Ratio?',
    icon: Zap,
  },
  {
    label: 'Explicar métricas',
    prompt: 'Explícame qué significan el Sharpe Ratio, Max Drawdown y Profit Factor',
    icon: MessageSquare,
  },
]

export default function AICopilotPage() {
  const { canUseCopilot, isEnterprise } = useTier()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (messageContent: string = input) => {
    if (!messageContent.trim() || loading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageContent,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('/api/ai/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageContent,
          history: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })

      if (!response.ok) {
        throw new Error('Error al enviar mensaje')
      }

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (err) {
      console.error('Error sending message:', err)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Lo siento, hubo un error al procesar tu mensaje. Por favor intenta de nuevo.',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleQuickAction = (prompt: string) => {
    sendMessage(prompt)
  }

  const clearChat = () => {
    if (confirm('¿Estás seguro de que quieres limpiar el chat?')) {
      setMessages([])
    }
  }

  const copyMessage = (id: string, content: string) => {
    navigator.clipboard.writeText(content)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // If not enterprise tier, show upgrade prompt
  if (!canUseCopilot) {
    return (
      <div className="p-8">
        <Card className="border-purple-500/30 bg-gradient-to-br from-purple-900/20 to-pink-900/20">
          <CardContent className="pt-12 pb-12">
            <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
              <div className="w-20 h-20 rounded-full bg-purple-600/20 flex items-center justify-center mb-6 relative">
                <Lock className="w-10 h-10 text-purple-400" />
                <Crown className="w-8 h-8 text-yellow-400 absolute -top-2 -right-2" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-4">
                AI Copilot Bloqueado
              </h1>
              <p className="text-xl text-gray-400 mb-8">
                Chat inteligente powered by Reflex v15+ que te ayuda a optimizar tus estrategias,
                analizar riesgos y tomar mejores decisiones de trading.
              </p>

              <div className="grid md:grid-cols-2 gap-6 mb-8 w-full">
                <div className="bg-gray-800/30 rounded-lg p-6 text-left">
                  <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Asistente Inteligente 24/7
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Obtén respuestas instantáneas sobre backtesting, optimización y análisis de riesgo.
                  </p>
                </div>

                <div className="bg-gray-800/30 rounded-lg p-6 text-left">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Recomendaciones Personalizadas
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Recibe sugerencias basadas en TUS estrategias y resultados históricos.
                  </p>
                </div>

                <div className="bg-gray-800/30 rounded-lg p-6 text-left">
                  <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Optimización Guiada
                  </h3>
                  <p className="text-gray-400 text-sm">
                    El Copilot te guía paso a paso para mejorar tus métricas clave.
                  </p>
                </div>

                <div className="bg-gray-800/30 rounded-lg p-6 text-left">
                  <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-4">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Análisis de Riesgo
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Identifica riesgos ocultos antes de que se conviertan en pérdidas reales.
                  </p>
                </div>
              </div>

              <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-6 mb-8 w-full">
                <p className="text-purple-300 mb-2">
                  ✨ Exclusivo de <span className="font-bold">ENTERPRISE</span>
                </p>
                <p className="text-sm text-gray-400">
                  Únete a traders profesionales que usan AI para maximizar sus resultados
                </p>
              </div>

              <Button
                onClick={() => router.push('/pricing')}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Crown className="w-5 h-5 mr-2" />
                Upgrade a Enterprise $159.99/mes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
              <Bot className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                AI Copilot
                <span className="text-xs bg-purple-600/20 text-purple-400 px-2 py-1 rounded-full flex items-center gap-1">
                  <Crown className="w-3 h-3" />
                  ENTERPRISE
                </span>
              </h1>
              <p className="text-sm text-gray-400">
                Asistente inteligente powered by Reflex v15+
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={clearChat}
            disabled={messages.length === 0}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Limpiar Chat
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-black via-gray-900 to-black">
        <div className="max-w-5xl mx-auto space-y-4">
          {/* Welcome Message */}
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center mx-auto mb-4">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                ¡Hola! Soy tu AI Copilot
              </h2>
              <p className="text-gray-400 mb-8">
                Estoy aquí para ayudarte a optimizar tus estrategias de trading. ¿En qué puedo ayudarte hoy?
              </p>

              {/* Quick Actions */}
              <div className="grid md:grid-cols-2 gap-3 max-w-3xl mx-auto">
                {QUICK_ACTIONS.map((action) => {
                  const Icon = action.icon
                  return (
                    <button
                      key={action.label}
                      onClick={() => handleQuickAction(action.prompt)}
                      className="flex items-center gap-3 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 hover:border-purple-500/50 rounded-lg p-4 text-left transition-all group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-purple-600/20 group-hover:bg-purple-600 flex items-center justify-center transition-all">
                        <Icon className="w-5 h-5 text-purple-400 group-hover:text-white transition-all" />
                      </div>
                      <span className="text-sm text-gray-300 group-hover:text-white transition-all">
                        {action.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* Messages */}
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: index * 0.05 }}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                )}

                <div
                  className={`max-w-2xl rounded-lg p-4 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-100'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10">
                    <span className="text-xs opacity-60">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                    {message.role === 'assistant' && (
                      <button
                        onClick={() => copyMessage(message.id, message.content)}
                        className="text-xs opacity-60 hover:opacity-100 transition-opacity flex items-center gap-1"
                      >
                        {copiedId === message.id ? (
                          <>
                            <Check className="w-3 h-3" />
                            Copiado
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            Copiar
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-lg bg-gray-700 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-gray-300" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-6 border-t border-gray-800 bg-black">
        <div className="max-w-5xl mx-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              sendMessage()
            }}
            className="flex gap-3"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu pregunta aquí..."
              className="flex-1 bg-gray-800 border-gray-700 focus:border-purple-500"
              disabled={loading}
            />
            <Button
              type="submit"
              disabled={!input.trim() || loading}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Send className="w-5 h-5" />
            </Button>
          </form>
          <p className="text-xs text-gray-500 mt-2 text-center">
            AI Copilot puede cometer errores. Verifica información importante.
          </p>
        </div>
      </div>
    </div>
  )
}
