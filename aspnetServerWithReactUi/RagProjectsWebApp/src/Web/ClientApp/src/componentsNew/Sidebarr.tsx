import { useState } from "react"
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Collapse,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material"
import { ExpandLess, ExpandMore, Book, Description, Add, MenuBook } from "@mui/icons-material"
import { useAllProjects } from "../hooks/api-hooks.ts"

type SidebarProps = {
  onSelectProject: (projectId: number | null) => void
  onSelectLecture: (lectureId: number | null) => void
  onCreateProject: () => void
  onAddLecture: () => void
}

export default function Sidebar({ onSelectProject, onSelectLecture, onCreateProject, onAddLecture }: SidebarProps) {
  const { data: projects, isLoading, error } = useAllProjects()
  const [expandedProjects, setExpandedProjects] = useState<Record<number, boolean>>({})

  const toggleProject = (projectId: number) => {
    setExpandedProjects((prev) => ({
      ...prev,
      [projectId]: !prev[projectId],
    }))
  }

  const handleProjectClick = (projectId: number) => {
    onSelectProject(projectId)
    onSelectLecture(null)
    toggleProject(projectId)
  }

  const handleLectureClick = (projectId: number, lectureId: number) => {
    onSelectProject(projectId)
    onSelectLecture(lectureId)
  }

  return (
    <Box
      sx={{
        width: 280,
        bgcolor: "grey.100",
        height: "100%",
        overflow: "auto",
        borderRight: 1,
        borderColor: "divider",
      }}
    >
      <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider", display: "flex", alignItems: "center" }}>
        <MenuBook sx={{ mr: 1, color: "primary.main" }} />
        <Typography variant="h6" fontWeight="bold">
          Lecturer AG
        </Typography>
      </Box>

      <Box sx={{ p: 1 }}>
        <Typography variant="caption" sx={{ px: 2, py: 1, color: "text.secondary", fontWeight: 600 }}>
          Проєкти
        </Typography>

        {isLoading && (
          <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}

        {/* {error && (
          <Alert severity="error" sx={{ m: 1 }}>
            Failed to load projects
          </Alert>
        )} */}

        {projects && (
          <List dense>
            {projects.map((project) => (
              <Box key={project.id}>
                <ListItem disablePadding>
                  <ListItemButton onClick={() => handleProjectClick(project.id!)} sx={{ borderRadius: 1 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      {expandedProjects[project.id!] ? <ExpandLess /> : <ExpandMore />}
                    </ListItemIcon>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <Book />
                    </ListItemIcon>
                    <ListItemText primary={project.name} />
                  </ListItemButton>
                </ListItem>

                <Collapse in={expandedProjects[project.id!]} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding sx={{ ml: 4 }}>
                    {project.lectures?.map((lecture) => (
                      <ListItem key={lecture.id}>
                        <ListItemButton
                          onClick={() => handleLectureClick(project.id!, lecture.id!)}
                          sx={{ borderRadius: 1, py: 0.5 }}
                        >
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <Description fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary={lecture.title} primaryTypographyProps={{ variant: "body2" }} />
                        </ListItemButton>
                      </ListItem>
                    ))}
                    <ListItem disablePadding>
                      <ListItemButton sx={{ borderRadius: 1, py: 0.5, color: "primary.main" }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <Add fontSize="small" color="primary" />
                        </ListItemIcon>
                        <ListItemText primary="Додати нову лекцію" primaryTypographyProps={{ variant: "body2" }} onClick={onAddLecture}/>
                      </ListItemButton>
                    </ListItem>
                  </List>
                </Collapse>
              </Box>
            ))}
          </List>
        )}

        <Box sx={{ mt: 2, px: 1 }}>
          <Button
            fullWidth
            variant="text"
            startIcon={<Add />}
            onClick={onCreateProject}
            sx={{ justifyContent: "flex-start", color: "primary.main" }}
          >
            Створити новий проект
          </Button>
        </Box>
      </Box>
    </Box>
  )
}
