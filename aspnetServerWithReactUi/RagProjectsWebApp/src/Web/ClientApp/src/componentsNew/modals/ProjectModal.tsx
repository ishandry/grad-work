import type React from "react"
import { useState } from "react"
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Box } from "@mui/material"
import { useCreateProject } from "../../hooks/api-hooks.ts"
import { CreateProjectCommand, type ICreateProjectCommand } from "../../web-api-client.ts"

type ProjectModalProps = {
  open: boolean
  onClose: () => void
}

export default function ProjectModal({ open, onClose }: ProjectModalProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")

  const createProjectMutation = useCreateProject()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) return

    const command: ICreateProjectCommand = {
      name,
      description: description || undefined,
    }

    try {
      await createProjectMutation.mutateAsync(CreateProjectCommand.fromJS(command))
      setName("")
      setDescription("")
      onClose()
    } catch (error) {
      console.error("Failed to create project:", error)
    }
  }

  const handleClose = () => {
    setName("")
    setDescription("")
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Створити проект</DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Назва проекту"
            fullWidth
            variant="outlined"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Опис проекту"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Скасувати</Button>
          <Button type="submit" variant="contained" disabled={!name.trim() || createProjectMutation.isLoading}>
            {createProjectMutation.isLoading ? "Створення..." : "Створити проект"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}
