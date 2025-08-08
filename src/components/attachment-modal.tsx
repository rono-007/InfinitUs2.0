"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { UploadCloud, File, X, Image as ImageIcon } from "lucide-react"
import Image from "next/image"
import type { Attachment } from "@/lib/types"

interface AttachmentModalProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

export function AttachmentModal({ isOpen, onOpenChange }: AttachmentModalProps) {
  const [photos, setPhotos] = React.useState<File[]>([])
  const [files, setFiles] = React.useState<File[]>([])
  const [activeTab, setActiveTab] = React.useState("photos")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "photos" | "files") => {
    const selectedFiles = Array.from(e.target.files || [])
    if (type === "photos") {
      setPhotos((prev) => [...prev, ...selectedFiles])
    } else {
      setFiles((prev) => [...prev, ...selectedFiles])
    }
  }
  
  const removeFile = (index: number, type: "photos" | "files") => {
    if (type === "photos") {
      setPhotos((prev) => prev.filter((_, i) => i !== index))
    } else {
      setFiles((prev) => prev.filter((_, i) => i !== index))
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Attachments</DialogTitle>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="photos">Photos</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
          </TabsList>
          <TabsContent value="photos">
            <div className="p-4 border-2 border-dashed rounded-lg text-center cursor-pointer hover:bg-muted/50">
              <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">Drag & drop images here, or click to select</p>
              <Input
                type="file"
                className="hidden"
                accept="image/*"
                multiple
                onChange={(e) => handleFileChange(e, "photos")}
                id="photo-upload"
              />
              <label htmlFor="photo-upload" className="font-medium text-primary underline-offset-4 hover:underline cursor-pointer">
                select files
              </label>
            </div>
            {photos.length > 0 && (
              <ScrollArea className="h-64 mt-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {photos.map((file, index) => (
                    <div key={index} className="relative group">
                      <Image
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        width={150}
                        height={150}
                        className="rounded-md object-cover w-full h-32"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100"
                        onClick={() => removeFile(index, "photos")}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <div className="text-xs truncate mt-1">{file.name}</div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
          <TabsContent value="files">
            <div className="p-4 border-2 border-dashed rounded-lg text-center cursor-pointer hover:bg-muted/50">
              <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">Drag & drop files here, or click to select</p>
              <Input
                type="file"
                className="hidden"
                accept=".pdf,.docx,.txt"
                multiple
                onChange={(e) => handleFileChange(e, "files")}
                id="file-upload"
              />
              <label htmlFor="file-upload" className="font-medium text-primary underline-offset-4 hover:underline cursor-pointer">
                select files
              </label>
            </div>
            {files.length > 0 && (
              <ScrollArea className="h-64 mt-4">
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                      <div className="flex items-center gap-3">
                        <File className="h-6 w-6" />
                        <div>
                          <p className="text-sm font-medium truncate max-w-xs">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => removeFile(index, "files")}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button>Add Attachments</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
