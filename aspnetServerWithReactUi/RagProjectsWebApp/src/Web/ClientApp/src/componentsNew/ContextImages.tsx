import { useState } from "react"
import { Box, Typography, Dialog, IconButton, ImageList, ImageListItem } from "@mui/material"
import { Close, ZoomIn } from "@mui/icons-material"

type ContextImagesProps = {
  contextImages: string[]
}

export default function ContextImages({ contextImages }: ContextImagesProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  if (!contextImages || contextImages.length === 0) {
    return null
  }

  const handleImageClick = (image: string) => {
    setSelectedImage(image)
  }

  const handleCloseModal = () => {
    setSelectedImage(null)
  }

  return (
    <>
      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Ось зображення, які були використані для відповіді:
        </Typography>
        <ImageList
          sx={{ width: "100%", maxHeight: 200 }}
          cols={contextImages.length === 1 ? 1 : 2}
          rowHeight={100}
          gap={8}
        >
          {contextImages.map((image, index) => (
            <ImageListItem
              key={index}
              sx={{
                cursor: "pointer",
                position: "relative",
                "&:hover .zoom-icon": {
                  opacity: 1,
                },
              }}
              onClick={() => handleImageClick(image)}
            >
              <img
                src={`data:image/jpeg;base64,${image}`}
                alt={`Context image ${index + 1}`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: 4,
                }}
              />
              <Box
                className="zoom-icon"
                sx={{
                  position: "absolute",
                  top: 4,
                  right: 4,
                  bgcolor: "rgba(0,0,0,0.6)",
                  borderRadius: "50%",
                  p: 0.5,
                  opacity: 0,
                  transition: "opacity 0.2s",
                }}
              >
                <ZoomIn sx={{ color: "white", fontSize: 16 }} />
              </Box>
            </ImageListItem>
          ))}
        </ImageList>
      </Box>

      {/* Full-screen image modal */}
      <Dialog
        open={!!selectedImage}
        onClose={handleCloseModal}
        maxWidth={false}
        sx={{
          "& .MuiDialog-paper": {
            width: "95vw",
            height: "95vh",
            maxWidth: "none",
            maxHeight: "none",
            bgcolor: "black",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          },
        }}
      >
        <IconButton
          onClick={handleCloseModal}
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            color: "white",
            bgcolor: "rgba(0,0,0,0.5)",
            "&:hover": {
              bgcolor: "rgba(0,0,0,0.7)",
            },
          }}
        >
          <Close />
        </IconButton>
        {selectedImage && (
          <img
            src={`data:image/jpeg;base64,${selectedImage}`}
            alt="Full size context image"
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
            }}
          />
        )}
      </Dialog>
    </>
  )
}
