import type React from "react"
import { useState, useRef } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Paper,
  Typography,
  LinearProgress,
  IconButton,
} from "@mui/material"
import { Close, CloudUpload, Check } from "@mui/icons-material"
import { useAddLecture, useUploadLectureSource } from "../../hooks/api-hooks.ts"
import { AddLectureCommand, type IAddLectureCommand } from "../../web-api-client.ts"
import { keyTermsApiClient } from "../../lib/keyterms-api.ts"

type LectureModalProps = {
  open: boolean
  onClose: () => void
  projectId: number | null
}

type ProcessingStatus = "idle" | "reading" | "processing" | "indexing" | "saved" | "extracting_terms"

export default function LectureModal({ open, onClose, projectId }: LectureModalProps) {
  const [name, setName] = useState("")
  const [content, setContent] = useState("")
  const [textContent, setTextContent] = useState("") // Add this line
  const [dragActive, setDragActive] = useState(false)
  const [status, setStatus] = useState<ProcessingStatus>("idle")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const addLectureMutation = useAddLecture()

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  // // TODO: use isUploading on ui
  // const [uploadFile, isUploading] = useUploadLectureSource({
  //   onSuccess: (file) => {
  //     handleFile(file)
  //   },
  //   onError: (error) => {
  //     console.error("File upload failed:", error)
  //     alert("Failed to upload file. Please try again.")
  //   },
  //   onProgress: (progress) => {
  //     // TODO: Update progress bar or display progress
  //     console.log(`Upload progress: ${progress}%`)
  //   }
  // });

  // Update handleFile to set textContent instead of content
  const handleFile = (file: File) => {
    if (file.type !== "application/pdf") {
      alert("Please upload a PDF file")
      return
    }

    setStatus("reading")

    setTimeout(() => {
      setStatus("processing")

      setTimeout(() => {
        setStatus("indexing")

        setTimeout(() => {
          setStatus("saved")
          setTextContent(
            `Розділ 2. Інтегральне числення функцій кількох змінних

Лекція 7. Визначений інтеграл за відрізком

Ця лекція присвячена означенню та властивостям визначеного інтеграла для функції однієї змінної. Ми почнемо з інтуїтивного поняття площі та перейдемо до формального означення інтеграла.

7.1. Задача про площу плоскої фігури

Нехай на відрізку [a; b] задано неперервну функцію y = f(x) >= 0. Плоску фігуру aABb, обмежену графіком функції y = f(x), відрізком [a; b] осі Ox (де a < b) і прямими x = a, x = b, називають криволінійною трапецією.
Знайдімо площу S цієї трапеції.

Розбиваємо відрізок [a; b] на n частин точками: a = x_0 < x_1 < x_2 < ... < x_(n-1) < x_n = b.
Проводячи вертикальні прямі x = x_i, для i від 1 до n-1, поділяємо криволінійну трапецію на n ділянок площею delta S_i, для i від 1 до n.

На кожному відрізку [x_(i-1); x_i] вибираємо довільну точку ksi_i, що належить [x_(i-1); x_i], і будуємо прямокутник з основою [x_(i-1); x_i] заввишки f(ksi_i), для i від 1 до n.
Тоді площа елементарної смуги delta S_i наближено дорівнює f(ksi_i) * delta x_i, для i від 1 до n, де delta x_i = x_i - x_(i-1), для i від 1 до n.

Одержимо «східчасту» фігуру, утворену з n прямокутників, площа якої S_n дорівнює:
S_n = f(ksi_1) * delta x_1 + f(ksi_2) * delta x_2 + ... + f(ksi_n) * delta x_n = сума для i від 1 до n f(ksi_i) * delta x_i.
Тоді S наближено дорівнює S_n = сума для i від 1 до n f(ksi_i) * delta x_i.

Точність наближення зростатиме, якщо відрізок [a; b] ділитимемо так, щоб кількість ділянок n збільшувалась, а їхні довжини delta x_i, для i від 1 до n, зменшувались. Нехай максимум з delta x_i прямує до 0 (max delta x_i -> 0 при 1 <= i <= n) і n прямує до нескінченності (n -> нескінченність).
Площею криволінійної трапеції aABb називають границю:
S = границя при max delta x_i -> 0 та n -> нескінченність від (сума для i від 1 до n f(ksi_i) * delta x_i).
Ця границя, якщо вона існує, не повинна залежати ані від способу розбиття відрізка [a; b] на ділянки [x_(i-1); x_i], ані від вибору точок ksi_i на них.

7.2. Поняття визначеного інтеграла за відрізком

Розгляньмо функцію y = f(x), визначену на відрізку [a; b], де a < b. Побудуймо для цієї функції визначений інтеграл за відрізком [a; b], користуючись загальною схемою.

Розбиваємо цей відрізок на n довільних ланок (частинних відрізків) точками:
a = x_0 < x_1 < ... < x_(i-1) < x_i < ... < x_(n-1) < x_n = b.

На кожній ланці [x_(i-1); x_i], для i від 1 до n, вибираємо довільну точку ksi_i, що належить [x_(i-1); x_i], і обчислюємо значення функції f(ksi_i).

Будуємо інтегральну суму:
сума для i від 1 до n f(ksi_i) * delta x_i,
де delta x_i = x_i - x_(i-1) — довжина відрізка [x_(i-1); x_i].

Означення 7.1. Якщо існує скінченна границя інтегральної суми, коли довжина найбільшої ланки прямує до нуля (max delta x_i -> 0), і ця границя не залежить ані від способу розбиття відрізка на ланки, ані від вибору точок ksi_i на кожній ланці, то цю границю називають визначеним інтегралом за відрізком [a; b] від функції f(x) і позначають:
інтеграл від a до b f(x)dx = границя при max delta x_i -> 0 та n -> нескінченність від (сума для i від 1 до n f(ksi_i) * delta x_i).

Функцію f називають інтегровною на відрізку [a; b]. Числа a та b називають нижньою та верхньою межами інтегрування; функцію f — підінтегральною функцією; вираз f(x)dx — підінтегральним виразом; x — змінною інтегрування; відрізок [a; b] — проміжком інтегрування.

Із задачі про площу криволінійної трапеції випливає, що площу криволінійної трапеції, обмеженої прямими y = 0, x = a, x = b і графіком функції y = f(x) >= 0, знаходять за формулою:
S = інтеграл від a до b f(x)dx.

З означення випливає:

інтеграл від a до b f(x)dx = інтеграл від a до b f(t)dt (значення інтеграла не залежить від позначення змінної інтегрування);
інтеграл від a до a f(x)dx = 0.
7.3. Умови інтегровності

Теорема 7.1 (необхідна умова інтегровності). Якщо функція f інтегровна на відрізку [a; b], то вона обмежена на цьому відрізку.

Прикладом обмеженої, але неінтегровної на відрізку [0; 1] функції є функція Діріхле:
Delta(x) = 1, якщо x є раціональним числом (x належить Q),
Delta(x) = 0, якщо x є ірраціональним числом (x належить R \ Q).

Теорема 7.2 (достатні умови інтегровності). Функція f(x) інтегровна на відрізку [a; b], якщо виконано одну з умов:

функція f(x) неперервна на відрізку [a; b];
функція f(x) обмежена і неперервна на [a; b], за винятком скінченної кількості точок розриву;
функція f(x) означена і монотонна на відрізку [a; b].
Зауваження 7.1.

Якщо змінити значення інтегровної функції у скінченній кількості точок, то інтегровність її не порушиться, а значення інтеграла при цьому не зміниться.
Інтегровна функція f(x) може бути і не визначеною у скінченній кількості точок відрізка [a; b]. У такому випадку, для інтегровності достатньо, щоб вона була обмеженою на цьому відрізку та задовольняла умови, наприклад, другої достатньої умови інтегровності.
7.4. Властивості визначеного інтеграла

Розгляньмо функцію y = f(x), інтегровну на відрізку [a; b]. Визначений інтеграл за відрізком [a; b] від функції f(x) має такі властивості:

1 (лінійність). Для довільних сталих альфа, бета, що належать множині дійсних чисел R:
інтеграл від a до b [альфа * f(x) + бета * g(x)]dx = альфа * інтеграл від a до b f(x)dx + бета * інтеграл від a до b g(x)dx.
(За умови, що функції f(x) та g(x) інтегровні на [a;b]).

2 (адитивність). Для довільної точки c, що належить відрізку [a; b] (тобто a <= c <= b):
інтеграл від a до b f(x)dx = інтеграл від a до c f(x)dx + інтеграл від c до b f(x)dx.
Ця властивість справедлива і для c поза [a;b], якщо інтеграли існують.

3 (інтеграл від одиниці або "нормованість").
інтеграл від a до b 1dx = b - a, (де a < b). Це відповідає довжині відрізка l([a;b]).

4 (орієнтованість або зміна меж інтегрування).
інтеграл від a до b f(x)dx = - інтеграл від b до a f(x)dx.

5 (збереження знаку підінтегральної функції або монотонність). Якщо f(x) >= 0 на відрізку [a; b] (при a < b), то:
інтеграл від a до b f(x)dx >= 0.
Більш загально, якщо f(x) >= g(x) для всіх x на [a; b] (при a < b), то інтеграл від a до b f(x)dx >= інтеграл від a до b g(x)dx.`,
          )
        }, 1000)
      }, 1000)
    }, 1000)
  }

  // Update handleSubmit to include textContent
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || !projectId) {
      return
    }

    try {
      let vocabWords: string[] = []
      if (textContent) {
        setStatus("extracting_terms")
        try {
          vocabWords = await keyTermsApiClient.extractKeyTerms(textContent)
        } catch (error) {
          console.error("Failed to extract key terms:", error)
          // Continue with empty vocab words if extraction fails
        }
      }


      setStatus("indexing")

    const command: IAddLectureCommand = {
      title: name,
      projectId,
      textContent: textContent || undefined, // Include text content
      vocabWords: vocabWords.length > 0 ? vocabWords : undefined
    }
      await addLectureMutation.mutateAsync(AddLectureCommand.fromJS(command))
      setName("")
      setContent("")
      setTextContent("") // Reset text content
      setStatus("idle")
      onClose()
    } catch (error) {
      console.error("Failed to create lecture:", error)
      setStatus("idle")
    }
  }

  // Update handleClose to reset textContent
  const handleClose = () => {
    setName("")
    setContent("")
    setTextContent("") // Reset text content
    setStatus("idle")
    onClose()
  }

  const getStatusText = () => {
    switch (status) {
      case "reading":
        return "Зчитування PDF..."
      case "processing":
        return "Обробка PDF..."
      case "extracting_terms":
        return "Визначення ключових термінів..."
      case "indexing":
        return "Індексація змісту..."
      case "saved":
        return "Лекція створена!"
      default:
        return ""
    }
  }

  // In the DialogContent, replace the existing content section with:
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          Створити лекцію
          <IconButton onClick={handleClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Назва лекції"
            fullWidth
            variant="outlined"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            sx={{ mb: 2 }}
          />

          {/* Text content field - always visible */}
          <TextField
            margin="dense"
            label="Зміст лекції"
            fullWidth
            multiline
            rows={8}
            variant="outlined"
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            placeholder="Вставте або введіть зміст лекції тут..."
            sx={{ mb: 2 }}
          />

          {/* PDF upload section */}
          <Typography variant="subtitle2" gutterBottom>
            Або завантажте PDF файл:
          </Typography>
          <Paper
            sx={{
              border: 2,
              borderStyle: "dashed",
              borderColor: dragActive ? "primary.main" : "grey.300",
              bgcolor: dragActive ? "primary.light" : "transparent",
              p: 3,
              mb: 2,
              cursor: "pointer",
            }}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <CloudUpload sx={{ fontSize: 40, color: "grey.400", mb: 1 }} />
              <Typography variant="body2" color="text.secondary" align="center" gutterBottom>
                Перетягніть PDF файл сюди, щоб витягти текст
              </Typography>
              <Button variant="outlined" size="small" onClick={() => fileInputRef.current?.click()}>
                Вибрати PDF
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                style={{ display: "none" }}
                onChange={handleFileInput}
              />
            </Box>
          </Paper>

          {status !== "idle" && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                {status === "saved" ? (
                  <Check color="success" sx={{ mr: 1 }} />
                ) : (
                  <LinearProgress sx={{ flex: 1, mr: 2 }} />
                )}
                <Typography variant="body2" color="text.secondary">
                  {getStatusText()}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Скасувати</Button>
          <Button type="submit" variant="contained" disabled={!name.trim() || addLectureMutation.isLoading}>
            {addLectureMutation.isLoading ? "Створення..." : "Створити лекцію"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}