import type React from "react";
import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Tooltip,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { useSetVocabDescription } from "../hooks/api-hooks.ts";
import type { LectureDto, VocabDto } from "../web-api-client.ts";
import { chatApiClient } from "../lib/chat-api.ts";

type LectureContentProps = {
  lecture: LectureDto;
  projectId?: number | null;
};

export default function LectureContent({ lecture, projectId }: LectureContentProps) {
  const [processedContent, setProcessedContent] = useState<React.ReactNode[]>(
    []
  );
  const [loadingWord, setLoadingWord] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const setVocabDescriptionMutation = useSetVocabDescription();

  const handleWordClick = async (word: string, vocabItem: VocabDto) => {
    if (!vocabItem.id || loadingWord || !projectId) return

    setLoadingWord(word);

    try {
      // Get definition from chat API based on project context
      const chatResponse = await chatApiClient.sendMessage({
        question: `Define the term "${word}" in the context of this project. Provide a clear, concise definition.`,
        project_id: projectId.toString(),
      })

      // Use the response from chat API as the description
      const description = chatResponse.response

      // Save the description to the backend
      await setVocabDescriptionMutation.mutateAsync({
        word,
        vocabId: vocabItem.id,
        description: description,
      })
      setSuccessMessage(`Визначення для слова "${word}" успішно оновлено!`);
    } catch (error) {
      console.error("Failed to set vocab description:", error);
    } finally {
      setLoadingWord(null);
    }
  };

  useEffect(() => {
    if (!lecture.textContent) {
      return;
    }

    if (!lecture.vocab || lecture.vocab.length === 0) {
      setProcessedContent(
        lecture.textContent.split("\n").map((paragraph, index) => (
          <Typography key={index} paragraph>
            {paragraph}
          </Typography>
        ))
      );
      return;
    }

    const paragraphs = lecture.textContent.split("\n");
    const processed = paragraphs.map((paragraph, pIndex) => {
      let lastIndex = 0;
      const segments: React.ReactNode[] = [];

      const wordsToHighlight = lecture.vocab!.map((vocab) => vocab.word!);
      const escapeRegExp = (str: string) =>
        str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      const pattern = lecture
        .vocab!.map((v) => escapeRegExp(v.word!))
        .join("|");

      // 2) Unicode look-arounds around any letter (\p{L}), with /u
      const regex = new RegExp(`(?<!\\p{L})(${pattern})(?!\\p{L})`, "giu");

      console.log(regex); // check your final regex
      console.log(wordsToHighlight);

      let match;
      while ((match = regex.exec(paragraph)) !== null) {
        const word = match[0];
        console.log(`Found word: ${word} at index ${match.index}`);
        const vocabItem = lecture.vocab!.find(
          (vocab) => vocab.word!.toLowerCase() === word.toLowerCase()
        );

        if (match.index > lastIndex) {
          segments.push(paragraph.substring(lastIndex, match.index));
        }

        const isLoading = loadingWord === word;
        const hasDescription = vocabItem?.description;

        segments.push(
          <Tooltip
            key={`${pIndex}-${match.index}`}
            title={
              isLoading
                ? "Завантажуємо визначення..."
                : hasDescription
                ? vocabItem.description
                : "Натисніть, щоб отримати визначення"
            }
            arrow
          >
            <Box
              component="span"
              onClick={() => vocabItem && handleWordClick(word, vocabItem)}
              sx={{
                bgcolor: hasDescription ? "success.light" : "warning.light",
                px: 0.5,
                borderRadius: 0.5,
                cursor: isLoading ? "wait" : "pointer",
                position: "relative",
                "&:hover": {
                  bgcolor: hasDescription ? "success.main" : "warning.main",
                },
              }}
            >
              {word}
              {isLoading && (
                <CircularProgress
                  size={12}
                  sx={{
                    position: "absolute",
                    top: -2,
                    right: -2,
                    color: "primary.main",
                  }}
                />
              )}
            </Box>
          </Tooltip>
        );

        lastIndex = match.index + word.length;
      }

      if (lastIndex < paragraph.length) {
        segments.push(paragraph.substring(lastIndex));
      }

      return (
        <Typography key={pIndex} paragraph>
          {segments}
        </Typography>
      );
    });

    setProcessedContent(processed);
  }, [lecture, loadingWord]);

  return (
    <>
      <Box sx={{ flex: 1, p: 3, overflow: "auto" }}>
        <Typography variant="h4" gutterBottom>
          {lecture.title}
        </Typography>
        <Box sx={{ maxWidth: "none" }}>{processedContent}</Box>
      </Box>

      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      </Snackbar>
    </>
  );
}
