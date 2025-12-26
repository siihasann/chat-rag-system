import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, X, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface DocumentUploadProps {
  workspaceId: string;
  onUploadComplete: () => void;
}

const ACCEPTED_TYPES = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'text/plain': ['.txt'],
};

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

interface UploadingFile {
  file: File;
  progress: number;
  error?: string;
}

const DocumentUpload = ({ workspaceId, onUploadComplete }: DocumentUploadProps) => {
  const { user } = useAuth();
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = async (file: File) => {
    if (!user) return;

    const filePath = `${workspaceId}/${user.id}/${Date.now()}-${file.name}`;

    try {
      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Create document record
      const { data: docData, error: dbError } = await supabase.from('documents').insert({
        workspace_id: workspaceId,
        name: file.name,
        file_path: filePath,
        file_size: file.size,
        mime_type: file.type,
        uploaded_by: user.id,
      }).select('id').single();

      if (dbError) {
        // Cleanup storage if db insert fails
        await supabase.storage.from('documents').remove([filePath]);
        throw dbError;
      }

      // Trigger document processing
      if (docData?.id) {
        supabase.functions.invoke('process-document', {
          body: { documentId: docData.id }
        }).catch(err => console.error('Processing trigger failed:', err));
      }

      return true;
    } catch (error: any) {
      throw new Error(error.message || 'Upload failed');
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!user || acceptedFiles.length === 0) return;

    setIsUploading(true);
    const initialFiles = acceptedFiles.map(file => ({ file, progress: 0 }));
    setUploadingFiles(initialFiles);

    let successCount = 0;

    for (let i = 0; i < acceptedFiles.length; i++) {
      const file = acceptedFiles[i];
      
      setUploadingFiles(prev => 
        prev.map((f, idx) => idx === i ? { ...f, progress: 50 } : f)
      );

      try {
        await uploadFile(file);
        setUploadingFiles(prev => 
          prev.map((f, idx) => idx === i ? { ...f, progress: 100 } : f)
        );
        successCount++;
      } catch (error: any) {
        setUploadingFiles(prev => 
          prev.map((f, idx) => idx === i ? { ...f, error: error.message } : f)
        );
      }
    }

    if (successCount > 0) {
      toast.success(`${successCount} document${successCount > 1 ? 's' : ''} uploaded`);
      onUploadComplete();
    }

    setTimeout(() => {
      setUploadingFiles([]);
      setIsUploading(false);
    }, 2000);
  }, [user, workspaceId, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_FILE_SIZE,
    disabled: isUploading,
  });

  const removeFile = (index: number) => {
    setUploadingFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      <div
        {...getRootProps()}
        className={cn(
          "p-6 text-center cursor-pointer transition-all duration-200",
          isDragActive 
            ? "bg-primary/5 border-primary" 
            : "hover:bg-muted/30",
          isUploading && "opacity-50 cursor-not-allowed"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3">
          <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
            isDragActive ? "bg-primary/10" : "bg-muted"
          )}>
            <Upload className={cn(
              "h-5 w-5 transition-colors",
              isDragActive ? "text-primary" : "text-muted-foreground"
            )} />
          </div>
          {isDragActive ? (
            <p className="text-primary font-medium">Drop files here...</p>
          ) : (
            <div className="space-y-1">
              <p className="font-medium text-foreground">
                Drop files or <span className="text-primary">browse</span>
              </p>
              <p className="text-xs text-muted-foreground">
                PDF, DOCX, TXT • Max 50MB
              </p>
            </div>
          )}
        </div>
      </div>

      {fileRejections.length > 0 && (
        <div className="p-3 bg-destructive/5 border-t border-destructive/20">
          <div className="flex items-center gap-2 text-destructive text-sm">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span className="font-medium">Rejected:</span>
            <span className="truncate">
              {fileRejections.map(({ file }) => file.name).join(', ')}
            </span>
          </div>
        </div>
      )}

      {uploadingFiles.length > 0 && (
        <div className="border-t divide-y">
          {uploadingFiles.map((item, index) => (
            <div key={index} className="flex items-center gap-3 p-3">
              <FileText className="h-4 w-4 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.file.name}</p>
                {item.error ? (
                  <p className="text-xs text-destructive">{item.error}</p>
                ) : (
                  <Progress value={item.progress} className="h-1 mt-1.5" />
                )}
              </div>
              {!isUploading && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-foreground"
                  onClick={() => removeFile(index)}
                >
                  <X className="h-3.5 w-3.5" />
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
