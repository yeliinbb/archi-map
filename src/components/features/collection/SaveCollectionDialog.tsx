"use client";

import { useState } from "react";
import { Bookmark } from "lucide-react";
import { useTranslations } from "next-intl";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogClose } from "@/components/ui";
import { useCollectionStore } from "@/lib/stores/collection-store";

interface SaveCollectionDialogProps {
  buildingIds: string[];
  variant?: "icon" | "text";
}

export function SaveCollectionDialog({
  buildingIds,
  variant = "icon",
}: SaveCollectionDialogProps) {
  const t = useTranslations("collection");
  const [name, setName] = useState("");
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const saveCollection = useCollectionStore((s) => s.saveCollection);

  const handleSave = () => {
    if (!name.trim()) return;
    saveCollection(name.trim(), buildingIds);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setName("");
      setOpen(false);
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          variant === "icon" ? (
            <button
              type="button"
              className="border border-border p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:px-3"
              title={t("save")}
            />
          ) : (
            <button
              type="button"
              className="font-mono text-micro text-muted-foreground transition-colors hover:text-foreground"
            />
          )
        }
      >
        {variant === "icon" ? (
          <>
            <Bookmark className="h-3.5 w-3.5 sm:hidden" />
            <span className="hidden font-mono text-micro tracking-wider sm:inline">
              {t("save")}
            </span>
          </>
        ) : (
          t("save")
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogTitle className="font-mono text-sm tracking-wide">
          {t("saveCollection")}
        </DialogTitle>
        <div className="mt-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
            }}
            placeholder={t("namePlaceholder")}
            className="w-full border border-border bg-background px-3 py-2 font-mono text-sm outline-none focus:border-foreground"
            autoFocus
          />
          <div className="mt-4 flex justify-end gap-2">
            <DialogClose
              render={
                <button
                  type="button"
                  className="border border-border px-4 py-1.5 font-mono text-micro tracking-wider text-muted-foreground transition-colors hover:bg-accent"
                />
              }
            >
              Cancel
            </DialogClose>
            <button
              type="button"
              onClick={handleSave}
              disabled={!name.trim()}
              className="border border-foreground bg-foreground px-4 py-1.5 font-mono text-micro tracking-wider text-background transition-colors hover:bg-foreground/90 disabled:opacity-40"
            >
              {saved ? t("saved") : t("save")}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
