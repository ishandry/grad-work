import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Chip,
  Avatar,
  Snackbar,
  Alert,
  IconButton,
} from "@mui/material";
import { Book, Edit, ContentCopy, People } from "@mui/icons-material";
import { useProject, useAccountInfo, useLecture } from "../hooks/api-hooks.ts";
import SourcesModal from "./modals/SourcesModal.tsx";
import MembersModal from "./modals/MembersModal.tsx";

type HeaderProps = {
  projectId: number | null;
  lectureId: number | null;
};

export default function Header({ projectId, lectureId }: HeaderProps) {
  const { data: accountInfo } = useAccountInfo();
  const { data: currentProject } = useProject(projectId);
  const { data: currentLecture } = useLecture(lectureId);

  const [copied, setCopied] = useState(false);
  const [showSourcesModal, setShowSourcesModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);

  const sourceCount = currentProject?.sources?.length || 0;
  const memberCount = currentProject?.members?.length || 0;

  const handleCopyInviteLink = () => {
    if (currentProject?.inviteCode) {
      navigator.clipboard.writeText(
        `https://lecturer-ag.com/invite/${currentProject.inviteCode}`
      );
      setCopied(true);
    }
  };

  return (
    <>
      <Box
        sx={{
          height: 64,
          borderBottom: 1,
          borderColor: "divider",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
          bgcolor: "background.paper",
        }}
      >
        {/* Left section */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {currentProject && (
            <>
              <Book sx={{ mr: 1, color: "primary.main" }} />
              <Typography
                variant="subtitle1"
                sx={{ mr: 2, fontWeight: "medium" }}
              >
                {currentProject.name}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Chip
                  label={`${sourceCount} джерел`}
                  size="small"
                  variant="outlined"
                  sx={{ height: 24 }}
                />
                <IconButton
                  size="small"
                  onClick={() => setShowSourcesModal(true)}
                  sx={{ color: "primary.main" }}
                >
                  <Edit fontSize="small" />
                </IconButton>
              </Box>
            </>
          )}
        </Box>

        {/* Center section */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
          }}
        >
          {currentLecture && (
            <Typography
              variant="subtitle1"
              color="text.primary"
              noWrap
              sx={{ maxWidth: 400 }}
            >
              {currentLecture.title}
            </Typography>
          )}
        </Box>

        {/* Right section */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {currentProject && (
            <>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Chip
                  icon={<People sx={{ fontSize: 16 }} />}
                  label={`${memberCount + 1} користувачів`}
                  size="small"
                  variant="outlined"
                  sx={{ height: 24 }}
                />
                <IconButton
                  size="small"
                  onClick={() => setShowMembersModal(true)}
                  sx={{ color: "primary.main" }}
                >
                  <Edit fontSize="small" />
                </IconButton>
              </Box>

              <Button
                variant="outlined"
                size="small"
                startIcon={<ContentCopy />}
                onClick={handleCopyInviteLink}
                sx={{ height: 30 }}
              >
                Запросити
              </Button>
            </>
          )}

          {accountInfo && (
            <Typography variant="body2" color="text.secondary">
              {accountInfo.currentProjectsCount}/
              {(accountInfo.projectsLimit || 1) +
                (accountInfo.currentProjectsCount || 0)}{" "}
              проектів
            </Typography>
          )}

          <Box
            component="a"
            href="/Identity/Account/Manage"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              textDecoration: "none",
              color: "inherit",
              cursor: "pointer",
            }}
          >
            <Typography variant="body2">{accountInfo?.email}</Typography>
            <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.light" }}>
              {accountInfo?.email?.[0]?.toUpperCase() || "U"}
            </Avatar>
          </Box>
        </Box>
      </Box>

      {projectId && (
        <SourcesModal
          open={showSourcesModal}
          onClose={() => setShowSourcesModal(false)}
          projectId={projectId}
        />
      )}
      <MembersModal
        open={showMembersModal}
        onClose={() => setShowMembersModal(false)}
        members={currentProject?.members || []}
      />

      <Snackbar
        open={copied}
        autoHideDuration={2000}
        onClose={() => setCopied(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="success" onClose={() => setCopied(false)}>
          Запрошувальний лінк скопійовано в буфер обміну!
        </Alert>
      </Snackbar>
    </>
  );
}
