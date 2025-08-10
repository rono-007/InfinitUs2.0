"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useChat } from "@/hooks/use-chat"
import { useToast } from "@/hooks/use-toast"

interface SettingsModalProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

export function SettingsModal({ isOpen, onOpenChange }: SettingsModalProps) {
  const { isPrivacyMode, setIsPrivacyMode, clearAllChats } = useChat()
  const { toast } = useToast()

  const handleClearHistory = () => {
    clearAllChats()
    onOpenChange(false)
    toast({
      title: "Chat history cleared",
      description: "All your conversations have been deleted.",
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Manage your application settings and preferences.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="privacy-mode" className="font-medium">
                Privacy Mode
              </Label>
              <p className="text-sm text-muted-foreground">
                Your chat history will not be saved.
              </p>
            </div>
            <Switch
              id="privacy-mode"
              checked={isPrivacyMode}
              onCheckedChange={setIsPrivacyMode}
            />
          </div>

          <div className="flex items-center justify-between">
             <div>
                <Label className="font-medium">
                    Clear Chat History
                </Label>
                <p className="text-sm text-muted-foreground">
                    This will permanently delete all your conversations.
                </p>
             </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Clear History</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your
                    entire chat history.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearHistory}>
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
