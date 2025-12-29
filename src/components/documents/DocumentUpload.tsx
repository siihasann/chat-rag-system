import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, X, AlertCircle, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface DocumentUploadProps {
  workspaceId: string;
  onUploadComplete: () => void;
}

const ACCEPTED_TYPES = {
  "application/pdf": [".pdf"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    ".docx",
  ],
  "text/plain": [".txt"],
};

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

interface UploadingFile {
  file: File;
  progress: number;
  error?: string;
}

const DocumentUpload = ({
  workspaceId,
  onUploadComplete,
}: DocumentUploadProps) => {
  const { user } = useAuth();
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = async (file: File) => {
    if (!user) return;

    const filePath = `${workspaceId}/${user.id}/${Date.now()}-${file.name}`;

    try {
      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Create document record
      const { data: docData, error: dbError } = await supabase
        .from("documents")
        .insert({
          workspace_id: workspaceId,
          name: file.name,
          file_path: filePath,
          file_size: file.size,
          mime_type: file.type,
          uploaded_by: user.id,
        })
        .select("id")
        .single();

      if (dbError) {
        // Cleanup storage if db insert fails
        await supabase.storage.from("documents").remove([filePath]);
        throw dbError;
      }

      // Trigger document processing
      if (docData?.id) {
        supabase.functions
          .invoke("process-document", {
            body: { documentId: docData.id },
          })
          .catch((err) => console.error("Processing trigger failed:", err));
      }

      return true;
    } catch (error: any) {
      throw new Error(error.message || "Upload failed");
    }
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!user || acceptedFiles.length === 0) return;

      setIsUploading(true);
      const initialFiles = acceptedFiles.map((file) => ({ file, progress: 0 }));
      setUploadingFiles(initialFiles);

      let successCount = 0;

      for (let i = 0; i < acceptedFiles.length; i++) {
        const file = acceptedFiles[i];

        setUploadingFiles((prev) =>
          prev.map((f, idx) => (idx === i ? { ...f, progress: 50 } : f))
        );

        try {
          await uploadFile(file);
          setUploadingFiles((prev) =>
            prev.map((f, idx) => (idx === i ? { ...f, progress: 100 } : f))
          );
          successCount++;
        } catch (error: any) {
          setUploadingFiles((prev) =>
            prev.map((f, idx) =>
              idx === i ? { ...f, error: error.message } : f
            )
          );
        }
      }

      if (successCount > 0) {
        toast.success(
          `${successCount} document${successCount > 1 ? "s" : ""} uploaded`
        );
        onUploadComplete();
      }

      setTimeout(() => {
        setUploadingFiles([]);
        setIsUploading(false);
      }, 2000);
    },
    [user, workspaceId, onUploadComplete]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      accept: ACCEPTED_TYPES,
      maxSize: MAX_FILE_SIZE,
      disabled: isUploading,
    });

  const removeFile = (index: number) => {
    setUploadingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={cn(
          "relative rounded-lg border-2 border-dashed transition-all duration-200 cursor-pointer",
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-muted/30",
          isUploading && "opacity-50 pointer-events-none"
        )}
      >
        <input {...getInputProps()} />

        <div className="p-6 text-center">
          <div
            className={cn(
              "w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3 transition-colors",
              isDragActive ? "bg-primary/10" : "bg-muted/10"
            )}
          >
            <Upload
              className={cn(
                "w-6 h-6 transition-colors",
                isDragActive ? "text-primary" : "text-muted/80"
              )}
            />
          </div>

          {isDragActive ? (
            <p className="text-sm font-medium text-primary">Drop files here</p>
          ) : (
            <>
              <p className="text-sm text-foreground mb-1">
                <span className="font-medium text-primary">
                  Click to upload
                </span>{" "}
                or drag and drop
              </p>
              <p className="text-xs text-muted-foreground">
                PDF, DOCX, TXT • Max 50MB
              </p>
            </>
          )}
        </div>
      </div>

      {/* File Rejections */}
      {fileRejections.length > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-destructive/5 border border-destructive/20">
          <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
          <div className="flex-1 min-w-0">
            <span className="text-sm font-medium text-destructive">
              Rejected:{" "}
            </span>
            <span className="text-sm text-destructive/80 truncate">
              {fileRejections.map(({ file }) => file.name).join(", ")}
            </span>
          </div>
        </div>
      )}

      {/* Uploading Files */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          {uploadingFiles.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border"
            >
              {item.progress === 100 ? (
                <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4 text-green-600" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-primary" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate mb-1">
                  {item.file.name}
                </p>
                {item.error ? (
                  <p className="text-xs text-destructive">{item.error}</p>
                ) : (
                  <Progress value={item.progress} className="h-1.5" />
                )}
              </div>

              {!isUploading && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;
