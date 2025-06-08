import { useState } from "react";
import { Box } from "@mui/material";
import Sidebar from "./Sidebarr.tsx";
import Header from "./Header.tsx";
import MainContent from "./MainContent.tsx";
import ChatPanel from "./ChatPanel.tsx";
import ProjectModal from "./modals/ProjectModal.tsx";
import LectureModal from "./modals/LectureModal.tsx";

export default function Dashboard() {
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    null
  );
  const [selectedLectureId, setSelectedLectureId] = useState<number | null>(
    null
  );
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showLectureModal, setShowLectureModal] = useState(false);

  return (
    <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <Sidebar
        onSelectProject={setSelectedProjectId}
        onSelectLecture={setSelectedLectureId}
        onCreateProject={() => setShowProjectModal(true)}
        onAddLecture={() => setShowLectureModal(true)}
      />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          overflow: "hidden",
        }}
      >
        <Header projectId={selectedProjectId} lectureId={selectedLectureId} />
        <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>
          <MainContent
            selectedProjectId={selectedProjectId}
            selectedLectureId={selectedLectureId}
            onCreateProject={() => setShowProjectModal(true)}
            onSelectLecture={setSelectedLectureId}
            onShowAddLecture={() => setShowLectureModal(true)}
            onHideLectureModal={() => setShowLectureModal(false)}
            showLectureModal={showLectureModal}
          />
          <ChatPanel projectId={selectedProjectId} />
        </Box>
      </Box>

      <ProjectModal
        open={showProjectModal}
        onClose={() => setShowProjectModal(false)}
      />
      <LectureModal
        open={showLectureModal}
        onClose={() => setShowLectureModal(false)}
        projectId={selectedProjectId}
      />
    </Box>
  );
}
