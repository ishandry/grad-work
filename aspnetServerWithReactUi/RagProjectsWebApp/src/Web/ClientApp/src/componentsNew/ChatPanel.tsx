import type React from "react"
import { useState } from "react"
import { Box, Typography, TextField, IconButton, Paper, List, ListItem, CircularProgress, Alert } from "@mui/material"
import { Send } from "@mui/icons-material"
import { useProject } from "../hooks/api-hooks.ts"
import { chatApiClient, type ChatResponse } from "../lib/chat-api.ts";
import ContextTextPopup from "./ContextTextPopup.tsx"
import ContextImages from "./ContextImages.tsx"

type ChatPanelProps = {
  projectId: number | null
}

type Message = {
  id: string
  content: string
  isUser: boolean
  contextTexts?: string[]
  contextImages?: string[]
  isLoading?: boolean
  error?: string
}

export default function ChatPanel({ projectId }: ChatPanelProps) {
  const { data: currentProject } = useProject(projectId)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim() || !projectId) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      isUser: true,
    }

    // Add user message
    setMessages((prev) => [...prev, userMessage])

    // Add loading message
    const loadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: "",
      isUser: false,
      isLoading: true,
    }
    setMessages((prev) => [...prev, loadingMessage])

    const currentInput = input
    setInput("")
    setIsLoading(true)

    try {
      const response: ChatResponse = await chatApiClient.sendMessage({
        question: currentInput,
        project_id: projectId.toString(),
      })

      // Remove loading message and add actual response
      setMessages((prev) => {
        const newMessages = prev.filter((msg) => !msg.isLoading)
        const aiMessage: Message = {
          id: (Date.now() + 2).toString(),
          content: response.response,
          isUser: false,
          contextTexts: response.context_texts,
          contextImages: response.context_images,
        }
        return [...newMessages, aiMessage]
      })
    } catch (error) {
      console.error("Chat API error:", error)

      // Remove loading message and add error message
      setMessages((prev) => {
        const newMessages = prev.filter((msg) => !msg.isLoading)
        const errorMessage: Message = {
          id: (Date.now() + 2).toString(),
          content: "Виникла помилка при отриманні відповіді. Будь ласка, спробуйте ще раз.",
          isUser: false,
          error: error instanceof Error ? error.message : "Unknown error",
        }
        return [...newMessages, errorMessage]
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box
      sx={{
        width: 600,
        borderLeft: 1,
        borderColor: "divider",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider", bgcolor: "grey.50" }}>
        <Typography variant="h6">Чат: {currentProject?.name || "Проект не обрано"}</Typography>
      </Box>

      <Box sx={{ flex: 1, overflow: "auto", p: 2 }}>
        {messages.length === 0 ? (
          <Box sx={{ textAlign: "center", mt: 4 }}>
            <Typography variant="body2" color="text.secondary">
              Задайте своє питання про проект "{currentProject?.name || "Проект не обрано"}" або виберіть проект, щоб почати.
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {messages.map((message) => (
              <ListItem key={message.id} sx={{ px: 0, alignItems: "flex-start" }}>
                <Box sx={{ width: "100%" }}>
                  <Paper
                    sx={{
                      p: 2,
                      bgcolor: message.isUser ? "primary.light" : "grey.100",
                      color: message.isUser ? "primary.contrastText" : "text.primary",
                      ml: message.isUser ? 2 : 0,
                      mr: message.isUser ? 0 : 2,
                      width: "fit-content",
                      maxWidth: "85%",
                      marginLeft: message.isUser ? "auto" : 0,
                    }}
                  >
                    {message.isLoading ? (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <CircularProgress size={16} />
                        <Typography variant="body2">Обробка...</Typography>
                      </Box>
                    ) : (
                      <>
                        <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                          {message.content}
                        </Typography>

                        {message.error && (
                          <Alert severity="error" sx={{ mt: 1, fontSize: "0.75rem" }}>
                            {message.error}
                          </Alert>
                        )}

                        {/* Context text popup - only for AI messages */}
                        {!message.isUser && message.contextTexts && (
                          <ContextTextPopup contextTexts={message.contextTexts} />
                        )}
                      </>
                    )}
                  </Paper>

                  {/* Context images - only for AI messages, displayed outside the message bubble */}
                  {!message.isUser && !message.isLoading && message.contextImages && (
                    <Box sx={{ mr: 2, mt: 1 }}>
                      <ContextImages contextImages={message.contextImages} />
                    </Box>
                  )}
                </Box>
              </ListItem>
            ))}
          </List>
        )}
      </Box>

      <Box component="form" onSubmit={handleSendMessage} sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
        <Box sx={{ display: "flex", gap: 1 }}>
          <TextField
            fullWidth
            size="small"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Напишіть своє питання..."
            disabled={!currentProject || isLoading}
            multiline
            maxRows={3}
          />
          <IconButton
            type="submit"
            disabled={!currentProject || !input.trim() || isLoading}
            color="primary"
            sx={{ alignSelf: "flex-end" }}
          >
            <Send />
          </IconButton>
        </Box>
      </Box>
    </Box>
  )
}