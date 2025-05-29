import type React from "react"
import { useState } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Paper,
  IconButton,
  LinearProgress,
  CircularProgress,
} from "@mui/material"
import { Close, CloudUpload, Description, Book, Slideshow, Image } from "@mui/icons-material"
import { useProject, useAddProjectSource, useUploadProjectSource } from "../../hooks/api-hooks.ts"
import { AddProjectSourceCommand, IAddProjectSourceCommand } from "../../web-api-client.ts"

type SourcesModalProps = {
  open: boolean
  onClose: () => void
  projectId: number
}

export default function SourcesModal({ open, onClose, projectId }: SourcesModalProps) {
  const { data: currentProject } = useProject(projectId)
  const addSourceMutation = useAddProjectSource()
  const [dragActive, setDragActive] = useState(false)
  // track upload progress
  const [uploadProgress, setUploadProgress] = useState<number>(0)

    const [uploadFile, isUploading] = useUploadProjectSource({
      onUpload: async (file) => {
        const command: IAddProjectSourceCommand = {
        projectId: projectId,
        title: file.file.name,
        filePath: file.url,
        fileSize: file.file.size,
        mimeType: file.file.type,
      }

      try {
        await addSourceMutation.mutateAsync(AddProjectSourceCommand.fromJS(command))
      } catch (error) {
        console.error("Failed to add source:", error)
      }
      },
    onError: (error) => {
      console.error("File upload failed:", error)
      alert("Failed to upload file. Please try again.")
    },
    onProgress: (event: ProgressEvent<EventTarget>) => {
      if (event.lengthComputable && event.total > 0) {
        const pct = Math.round((event.loaded / event.total) * 100)
        setUploadProgress(pct)
      }
    },
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0] && projectId) {
      const file = e.dataTransfer.files[0]

      uploadFile(file, projectId, file.name, file.type);
    }
  }

  const getSourceIcon = (mimeType?: string) => {
    if (!mimeType) return <Description color="primary" />

    if (mimeType.includes("pdf")) return <Description color="error" />
    if (mimeType.includes("presentation") || mimeType.includes("powerpoint")) return <Slideshow color="warning" />
    if (mimeType.includes("image")) return <Image color="success" />
    return <Book color="primary" />
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          Редагувати Джерела
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", height: 400 }}>
          <Box sx={{ width: "50%", pr: 2, overflow: "auto" }}>
            <Typography variant="h6" gutterBottom>
              Джерела
            </Typography>
            {currentProject?.sources && currentProject.sources.length > 0 ? (
              <List>
                {currentProject.sources.map((source) => (
                  <ListItem key={source.id}>
                    <ListItemIcon>{getSourceIcon(source.mimeType)}</ListItemIcon>
                    <ListItemText primary={source.title} secondary={`${(source.fileSize! / 1024).toFixed(1)} KB`} />
                    {source.isProcessing && <CircularProgress size={20} />}
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", mt: 4 }}>
                У цьому проекті ще немає джерел. Ви можете додати їх, перетягнувши файли сюди або натиснувши кнопку "Огляд файлів".
              </Typography>
            )}
          </Box>

          <Box sx={{ width: "50%", pl: 2 }}>
            <Paper
              sx={{
                border: 2,
                borderStyle: "dashed",
                borderColor: dragActive ? "primary.main" : "grey.300",
                bgcolor: dragActive ? "primary.light" : "transparent",
                p: 4,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <CloudUpload sx={{ fontSize: 48, color: "grey.400", mb: 2 }} />
              <Typography variant="body1" color="text.secondary" align="center" gutterBottom>
                Перетягніть файли сюди
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
                Підтримуються файли, презентації, зображення та інші документи формату PDF
              </Typography>
              <Button variant="contained" disabled={addSourceMutation.isLoading}>
                {addSourceMutation.isLoading ? "Завантаження..." : "Огляд файлів"}
              </Button>
              {isUploading && (
                <Box sx={{ width: '100%', mt: 2 }}>
                  <LinearProgress variant="determinate" value={uploadProgress} />
                  <Typography variant="body2" align="center" sx={{ mt: 0.5 }}>
                    {`Завантаження… ${uploadProgress}%`}
                  </Typography>
                </Box>
              )}
            </Paper>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  )
}
