import React, { useState } from "react";
import {
  Box,
  Button,
  Popover,
  Typography,
  Paper,
  ClickAwayListener,
} from "@mui/material";
import { Info } from "@mui/icons-material";

type ContextTextPopupProps = {
  contextTexts: string[];
};

export default function ContextTextPopup({
  contextTexts,
}: ContextTextPopupProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    // кліком відкриваємо або закриваємо
    setAnchorEl((prev) => (prev ? null : event.currentTarget));
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  if (!contextTexts?.length) return null;

  return (
    <ClickAwayListener onClickAway={handleClose}>
      <div>
        <Button
          size="small"
          startIcon={<Info />}
          onClick={handleClick}
          aria-describedby={open ? "context-sources-popover" : undefined}
          sx={{
            mt: 1,
            fontSize: "0.75rem",
            textTransform: "none",
            color: "text.secondary",
          }}
        >
          Показати джерела
        </Button>

        <Popover
          id="context-sources-popover"
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{ vertical: "top", horizontal: "left" }}
          transformOrigin={{ vertical: "bottom", horizontal: "left" }}
          PaperProps={{
            sx: {
              p: 2,
              maxWidth: 400,
              maxHeight: 300,
              overflow: "auto",
            },
          }}
        >
          <Typography variant="subtitle2" gutterBottom>
            Контекстні джерела:
          </Typography>

          {contextTexts.map((text, index) => (
            <Box key={index} sx={{ mb: 2 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontWeight: "bold" }}
              >
                Джерело {index + 1}:
              </Typography>
              <Typography
                variant="body2"
                sx={{ mt: 0.5, whiteSpace: "pre-wrap" }}
              >
                {text.length > 200 ? `${text.substring(0, 200)}…` : text}
              </Typography>
            </Box>
          ))}
        </Popover>
      </div>
    </ClickAwayListener>
  );
}
