import React, { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  accountsClient,
  lecturesClient,
  projectsClient,
  simulateVocabDefinition,
} from "../lib/api-services.ts";
import {
  UserAccountDto,
  ProjectBriefDto,
  ProjectDto,
  LectureDto,
  CreateProjectCommand,
  AddLectureCommand,
  UpdateLectureCommand,
  AddProjectSourceCommand,
  SetVocabDescriptionCommand,
  ISetVocabDescriptionCommand,
  CreateSourceSignedUrlCommand,
  CreateLectureSourceSignedUrlCommand,
} from "../web-api-client.ts";

// Account hooks
export const useAccountInfo = () => {
  return useQuery<UserAccountDto>({
    queryKey: ["account"],
    queryFn: () => accountsClient.getAccountInfo(),
  });
};

// Project hooks
export const useAllProjects = () => {
  return useQuery<ProjectBriefDto[]>({
    queryKey: ["projects"],
    queryFn: () => projectsClient.getAllProjects(),
  });
};

export const useProject = (id: number | null) => {
  const queryObj = useQuery<ProjectDto>({
    queryKey: ["project", id],
    queryFn: () => projectsClient.getProject(id!),
    enabled: !!id,
  });

  useEffect(() => {
    let timer: any = null;
    if (queryObj?.data?.sources && queryObj?.data?.sources.length > 0) {
      if (queryObj.data.sources.some((source) => source.isProcessing)) {
        // If any source is still processing
        timer = setTimeout(() => {
          queryObj.refetch();
        }, 15000);
      }
    }
    return () => clearTimeout(timer);
  }, [queryObj.data]);

  return queryObj;
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (command: CreateProjectCommand) =>
      projectsClient.createProject(command),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["account"] });
    },
  });
};

export const useAddProjectSource = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (command: AddProjectSourceCommand) =>
      projectsClient.addProjectSource(command),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["project", variables.projectId],
      });
    },
  });
};

// Lecture hooks
export const useLecture = (id: number | null) => {
  return useQuery<LectureDto>({
    queryKey: ["lecture", id],
    queryFn: () => lecturesClient.getLecture(id!),
    enabled: !!id,
  });
};

export const useAddLecture = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (command: AddLectureCommand) =>
      lecturesClient.addLecture(command),
    onSuccess: (_, variables) => {
      // Invalidate the specific project to refresh its lectures list
      queryClient.invalidateQueries({
        queryKey: ["project", variables.projectId],
      });
      // Also invalidate all projects to refresh the sidebar
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
};

export const useUpdateLecture = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (command: UpdateLectureCommand) =>
      lecturesClient.updateLecture(command),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["lecture", variables.id] });
      // Also invalidate the project that contains this lecture
      queryClient.invalidateQueries({ queryKey: ["project"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
};

// Special vocab description hook with external API simulation
export const useSetVocabDescription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      word,
      vocabId,
      description,
    }: {
      word: string;
      vocabId: number;
      description: string;
    }) => {
      const command: ISetVocabDescriptionCommand = {
        vocabId,
        description,
      };

      await lecturesClient.setVocabDescription(
        SetVocabDescriptionCommand.fromJS(command)
      );
      return { description, vocabId };
    },
    onSuccess: (data) => {
      // Invalidate lecture queries to refresh vocab data
      queryClient.invalidateQueries({ queryKey: ["lecture"] });
    },
  });
};

export function uploadFile(
  uploadUrl: string,
  file: any,
  projectId: number,
  onProgress?: (event: ProgressEvent<EventTarget>) => void
) {
  return new Promise((resolve, reject) => {
    const req = new XMLHttpRequest();
    req.open("PUT", uploadUrl, true);
    req.setRequestHeader("Content-Type", `${file.type}`);
    req.setRequestHeader("x-amz-meta-project-id", projectId.toString());

    req.onload = (event) => {
      resolve(file);
    };
    req.onerror = (err) => {
      reject(err);
    };

    if (onProgress) {
      req.upload.onprogress = onProgress;
    }

    req.send(file);
  });
}

export interface UploadSoruceParams {
  onProgress?: (event: ProgressEvent<EventTarget>) => void;
  onUpload?: (params: UploadedFile) => void;
  onError?: (error?: any) => void;
}

export interface UploadedFile {
  file: File;
  url: string;
}

type UploadLectureFileFn = (
  file: File,
  lectureId: number,
  fileName: string,
  fileType: string
) => Promise<UploadedFile>;
type UploadProjectFileFn = (
  file: File,
  projectId: number,
  fileName: string,
  fileType: string
) => Promise<UploadedFile>;

export function useUploadProjectSource({
  onProgress,
  onUpload,
  onError,
}: UploadSoruceParams) {
  const { mutate: createUploadUrl, isLoading: inFlight } = useMutation({
    mutationKey: ["create-signed-url"],
    mutationFn: async (command: CreateSourceSignedUrlCommand) =>
      await projectsClient.createSignedUrl(command),
  });
  const [isUploading, setIsUploading] = React.useState(false);

  const upload: UploadProjectFileFn = (data, projectId, fileName, fileType) => {
    const file = Array.isArray(data) ? data[0] : data;

    if (!file) {
      return Promise.reject(new Error("No file provided"));
    }

    setIsUploading(true);

    return new Promise((resolve, reject) =>
      createUploadUrl(
        {
          fileName: fileName,
          projectId: projectId,
          contentType: fileType,
        } as CreateSourceSignedUrlCommand,
        {
          onError: (error, variables, context) => {
            console.error(error);
            setIsUploading(false);
            onError?.(error);
          },
          onSuccess: ({ url, path, projectId }) => {
            uploadFile(url!, file, projectId!, onProgress)
              .then(() => {
                const uploadedFile: UploadedFile = {
                  url: path!,
                  file,
                };

                resolve(uploadedFile);
                onUpload?.(uploadedFile);
              })
              .catch((err) => {
                reject(err);
                console.error(err);
                onError?.(err);
              })
              .finally(() => {
                setIsUploading(false);
              });
          },
        }
      )
    );
  };

  return [upload, isUploading] as const;
}

export function useUploadLectureSource({
  onProgress,
  onUpload,
  onError,
}: UploadSoruceParams) {
  const { mutate: createUploadUrl, isLoading: inFlight } = useMutation({
    mutationKey: ["create-lecture-source-signed-url"],
    mutationFn: async (command: CreateLectureSourceSignedUrlCommand) =>
      await lecturesClient.createLectureSourceSignedUrl(command),
  });
  const [isUploading, setIsUploading] = React.useState(false);

  const upload: UploadLectureFileFn = (data, lectureId, fileName, fileType) => {
    const file = Array.isArray(data) ? data[0] : data;

    if (!file) {
      return Promise.reject(new Error("No file provided"));
    }

    setIsUploading(true);

    return new Promise((resolve, reject) =>
      createUploadUrl(
        {
          fileName: fileName,
          lectureId: lectureId,
          contentType: fileType,
        } as CreateLectureSourceSignedUrlCommand,
        {
          onError: (error, variables, context) => {
            console.error(error);
            setIsUploading(false);
            onError?.(error);
          },
          onSuccess: ({ url, path, projectId }) => {
            uploadFile(url!, file, projectId!, onProgress)
              .then(() => {
                const uploadedFile: UploadedFile = {
                  url: path!,
                  file,
                };

                resolve(uploadedFile);
                onUpload?.(uploadedFile);
              })
              .catch((err) => {
                reject(err);
                console.error(err);
                onError?.(err);
              })
              .finally(() => {
                setIsUploading(false);
              });
          },
        }
      )
    );
  };

  return [upload, isUploading] as const;
}
