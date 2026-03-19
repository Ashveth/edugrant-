import { useState, useRef, useCallback } from "react";
import { Camera, Loader2, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AvatarUploadProps {
  userId: string;
  currentUrl: string | null;
  onUploaded: (url: string | null) => void;
}

export default function AvatarUpload({ userId, currentUrl, onUploaded }: AvatarUploadProps) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl);
  const fileRef = useRef<HTMLInputElement>(null);

  const uploadAvatar = useCallback(async (file: File) => {
    if (!userId) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 5MB allowed", variant: "destructive" });
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please upload an image file", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const filePath = `${userId}/avatar.${ext}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true, contentType: file.type });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      // Add cache buster
      const finalUrl = `${publicUrl}?t=${Date.now()}`;

      // Update profiles table
      await supabase
        .from("profiles")
        .update({ avatar_url: finalUrl })
        .eq("user_id", userId);

      setPreviewUrl(finalUrl);
      onUploaded(finalUrl);
      toast({ title: "Photo updated!" });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  }, [userId, onUploaded, toast]);

  const removeAvatar = useCallback(async () => {
    if (!userId) return;
    setUploading(true);
    try {
      // List and remove all files in user's avatar folder
      const { data: files } = await supabase.storage
        .from("avatars")
        .list(userId);

      if (files && files.length > 0) {
        await supabase.storage
          .from("avatars")
          .remove(files.map(f => `${userId}/${f.name}`));
      }

      await supabase
        .from("profiles")
        .update({ avatar_url: null })
        .eq("user_id", userId);

      setPreviewUrl(null);
      onUploaded(null);
      toast({ title: "Photo removed" });
    } catch (err: any) {
      toast({ title: "Failed to remove photo", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  }, [userId, onUploaded, toast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadAvatar(file);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="flex items-center gap-4">
      {/* Avatar circle */}
      <div className="relative group">
        <div className="h-20 w-20 rounded-2xl overflow-hidden border-2 border-border/60 shadow-card bg-muted flex items-center justify-center">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Profile photo"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full gradient-primary flex items-center justify-center">
              <User className="h-8 w-8 text-primary-foreground" />
            </div>
          )}
          {uploading && (
            <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center rounded-2xl">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          )}
        </div>
        {/* Hover overlay */}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="absolute inset-0 rounded-2xl bg-foreground/0 group-hover:bg-foreground/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer"
        >
          <Camera className="h-5 w-5 text-primary-foreground drop-shadow-md" />
        </button>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-1.5">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="rounded-xl h-8 text-xs font-medium"
        >
          <Camera className="mr-1.5 h-3 w-3" />
          {previewUrl ? "Change Photo" : "Upload Photo"}
        </Button>
        {previewUrl && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={removeAvatar}
            disabled={uploading}
            className="rounded-xl h-7 text-[11px] text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="mr-1 h-3 w-3" /> Remove
          </Button>
        )}
        <p className="text-[10px] text-muted-foreground/60">JPG, PNG · Max 5MB</p>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
