import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  IconButton,
} from "@mui/material"
import { Close, Person } from "@mui/icons-material"
import type { ProjectMemberDto } from "../../web-api-client.ts"

type MembersModalProps = {
  open: boolean
  onClose: () => void
  members: ProjectMemberDto[]
}

export default function MembersModal({ open, onClose, members }: MembersModalProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          Запрошені користувачі
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        {members.length > 0 ? (
          <List>
            {members.map((member) => (
              <ListItem key={member.userId}>
                <ListItemAvatar>
                  <Avatar>{member.email?.[0]?.toUpperCase() || <Person />}</Avatar>
                </ListItemAvatar>
                <ListItemText primary={member.email} secondary={member.role} />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
            У цьому проекті ще немає запрошених користувачів
          </Typography>
        )}
      </DialogContent>
    </Dialog>
  )
}
