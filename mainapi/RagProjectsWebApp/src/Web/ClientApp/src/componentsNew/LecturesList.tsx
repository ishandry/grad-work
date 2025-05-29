import { useState } from "react"
import {
  Typography,
  Button,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Box,
} from "@mui/material"
import { DragIndicator, Description, Add } from "@mui/icons-material"
import type { LectureBriefDto } from "../web-api-client.ts"

type LecturesListProps = {
  lectures: LectureBriefDto[]
  onAddLecture: () => void
  onSelectLecture?: (lectureId: number) => void // Add this prop
  projectId: number
}

export default function LecturesList({ lectures, onAddLecture, onSelectLecture, projectId }: LecturesListProps) {
  const [items, setItems] = useState(lectures)

  // Simple reordering function without react-beautiful-dnd
  const handleMoveUp = (index: number) => {
    if (index === 0) return

    const newItems = [...items]
    const temp = newItems[index]
    newItems[index] = newItems[index - 1]
    newItems[index - 1] = temp

    setItems(newItems)
    // Note: You would call an API to update the order here
  }

  const handleMoveDown = (index: number) => {
    if (index === items.length - 1) return

    const newItems = [...items]
    const temp = newItems[index]
    newItems[index] = newItems[index + 1]
    newItems[index + 1] = temp

    setItems(newItems)
    // Note: You would call an API to update the order here
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Лекції
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Керуйте своїми лекціями та їх порядком. Натисніть на лекцію, щоб переглянути її.
        </Typography>

        <List
          sx={{
            border: 1,
            borderColor: "divider",
            borderRadius: 1,
            mb: 2,
            maxHeight: 300,
            overflow: "auto",
          }}
        >
          {items.length > 0 ? (
            items.map((lecture, index) => (
              <ListItem
                key={lecture.id}
                sx={{
                  borderBottom: index < items.length - 1 ? 1 : 0,
                  borderColor: "divider",
                  bgcolor: "background.paper",
                  "&:hover": { bgcolor: "grey.50" },
                  cursor: "pointer", // Add cursor pointer
                }}
                onClick={() => onSelectLecture && onSelectLecture(lecture.id!)} // Make clickable
              >
                <ListItemIcon>
                  <Description color="primary" />
                </ListItemIcon>
                <ListItemText primary={lecture.title} />
                <Box onClick={(e) => e.stopPropagation()}>
                  {" "}
                  {/* Prevent event bubbling for buttons */}
                  <IconButton
                    size="small"
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    sx={{ color: index === 0 ? "grey.300" : "grey.600" }}
                  >
                    <DragIndicator sx={{ transform: "rotate(-90deg)" }} />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleMoveDown(index)}
                    disabled={index === items.length - 1}
                    sx={{ color: index === items.length - 1 ? "grey.300" : "grey.600" }}
                  >
                    <DragIndicator sx={{ transform: "rotate(90deg)" }} />
                  </IconButton>
                </Box>
              </ListItem>
            ))
          ) : (
            <ListItem>
              <ListItemText
                primary="No lectures yet. Add your first lecture."
                sx={{ textAlign: "center", color: "text.secondary" }}
              />
            </ListItem>
          )}
        </List>

        <Button variant="contained" startIcon={<Add />} onClick={onAddLecture}>
          Додати нову лекцію
        </Button>
      </CardContent>
    </Card>
  )
}