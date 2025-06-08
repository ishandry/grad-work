import { useState } from "react"
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Avatar,
  CircularProgress,
} from "@mui/material"
import { Add, Book, Description, Slideshow, Image, CloudUpload } from "@mui/icons-material"
import { useProject, useLecture } from "../hooks/api-hooks.ts"
import LectureModal from "./modals/LectureModal.tsx"
import LectureContent from "./LectureContent.tsx"
import LecturesList from "./LecturesList.tsx"

type MainContentProps = {
  selectedProjectId: number | null
  selectedLectureId: number | null
  onCreateProject: () => void
  onSelectLecture: (lectureId: number | null) => void // Add this prop
  onShowAddLecture: () => void,
  showLectureModal: boolean
  onHideLectureModal: () => void
}

export default function MainContent({
  selectedProjectId,
  selectedLectureId,
  onCreateProject,
  onSelectLecture, // Add this parameter
  onShowAddLecture,
  onHideLectureModal,
  showLectureModal,
}: MainContentProps) {
  const { data: currentProject, isLoading: projectLoading } = useProject(selectedProjectId)
  const { data: currentLecture, isLoading: lectureLoading } = useLecture(selectedLectureId)

  const getSourceIcon = (mimeType?: string) => {
    if (!mimeType) return <Description color="primary" />

    if (mimeType.includes("pdf")) return <Description color="error" />
    if (mimeType.includes("presentation") || mimeType.includes("powerpoint")) return <Slideshow color="warning" />
    if (mimeType.includes("image")) return <Image color="success" />
    return <Book color="primary" />
  }

  // If a lecture is selected, show its content
  if (selectedLectureId) {
    if (lectureLoading) {
      return (
        <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <CircularProgress />
        </Box>
      )
    }

    if (currentLecture) {
      return <LectureContent lecture={currentLecture} projectId={selectedProjectId} />
    }
  }

  // If a project is selected but no lecture, show the project dashboard
  if (selectedProjectId) {
    if (projectLoading) {
      return (
        <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <CircularProgress />
        </Box>
      )
    }

    if (currentProject) {
      return (
        <>
          <Box sx={{ flex: 1, p: 3, overflow: "auto" }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <Card>
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    Проєкт: {currentProject.name}
                  </Typography>
                  {currentProject.description && (
                    <Typography variant="body1" color="text.secondary">
                      {currentProject.description}
                    </Typography>
                  )}
                </CardContent>
              </Card>

              {/* Sources Card with direct functionality */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Джерела
                  </Typography>
                  <Box sx={{ display: "flex", mt: 2, height: 200 }}>
                    {/* Sources List */}
                    <Box sx={{ width: "50%", pr: 2, overflow: "auto" }}>
                      {currentProject.sources && currentProject.sources.length > 0 ? (
                        <List dense>
                          {currentProject.sources.map((source) => (
                            <ListItem key={source.id}>
                              <ListItemIcon sx={{ minWidth: 36 }}>{getSourceIcon(source.mimeType)}</ListItemIcon>
                              <ListItemText
                                primary={source.title}
                                secondary={`${(source.fileSize! / 1024).toFixed(1)} KB`}
                              />
                              {source.isProcessing && <CircularProgress size={20} />}
                            </ListItem>
                          ))}
                        </List>
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", mt: 4 }}>
                          У цьому проекті ще немає джерел.
                        </Typography>
                      )}
                    </Box>

                    {/* Upload Area */}
                    <Box sx={{ width: "50%", pl: 2 }}>
                      <Paper
                        sx={{
                          border: 2,
                          borderStyle: "dashed",
                          borderColor: "grey.300",
                          p: 3,
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                        }}
                      >
                        <CloudUpload sx={{ fontSize: 40, color: "grey.400", mb: 2 }} />
                        <Typography variant="body2" color="text.secondary" align="center" gutterBottom>
                          Перетягніть файли сюди або натисніть кнопку, щоб завантажити
                        </Typography>
                        <Button variant="contained" size="small" sx={{ mt: 1 }}>
                          Огляд файлів
                        </Button>
                      </Paper>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              <LecturesList
                lectures={currentProject.lectures || []}
                onAddLecture={onShowAddLecture}
                onSelectLecture={onSelectLecture} // Pass the handler
                projectId={selectedProjectId}
              />

              {/* Members Card with direct functionality */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Користувачі
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    {currentProject.members && currentProject.members.length > 0 ? (
                      <List dense>
                        {currentProject.members.map((member) => (
                          <ListItem key={member.id}>
                            <ListItemIcon>
                              <Avatar sx={{ bgcolor: "primary.light", width: 32, height: 32 }}>
                                {member.email?.[0]?.toUpperCase() || "U"}
                              </Avatar>
                            </ListItemIcon>
                            <ListItemText primary={member.email} secondary={member.role} />
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 2 }}>
                        У цьому проекті ще немає користувачів.
                      </Typography>
                    )}
                    <Button variant="contained" startIcon={<Add />} sx={{ mt: 2 }}>
                      Додати користувача
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Box>

          {/* <LectureModal
            open={showLectureModal}
            onClose={onHideLectureModal}
            projectId={selectedProjectId}
          /> */}
        </>
      )
    }
  }

  // If no project is selected, show welcome screen
  return (
    <Box sx={{ flex: 1, p: 3, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Box sx={{ textAlign: "center", maxWidth: 400 }}>
        <Typography variant="h4" gutterBottom>
          Lecturer AG - Генерація з доповненням через пошук
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Виберіть проект зі списку або створіть новий, щоб почати.
        </Typography>
        <Button variant="contained" size="large" onClick={onCreateProject}>
          Створити новий проект
        </Button>
      </Box>
    </Box>
  )
}