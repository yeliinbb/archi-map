"use client";

import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCollectionStore, type Collection } from "@/lib/stores/collection-store";

export function CollectionPanel() {
  const t = useTranslations("collection");
  const collections = useCollectionStore((s) => s.collections);
  const deleteCollection = useCollectionStore((s) => s.deleteCollection);

  if (collections.length === 0) {
    return (
      <div className="py-4 text-center">
        <p className="font-mono text-xs text-muted-foreground">
          {t("empty")}
        </p>
        <p className="mt-1 font-mono text-micro text-muted-foreground/60">
          {t("emptyDescription")}
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-3 font-mono text-micro tracking-sublabel text-muted-foreground uppercase">
        {t("title")}
      </p>
      <div className="space-y-px border border-border">
        {collections.map((collection) => (
          <CollectionRow
            key={collection.id}
            collection={collection}
            onDelete={() => {
              if (confirm(t("deleteConfirm"))) {
                deleteCollection(collection.id);
              }
            }}
            loadLabel={t("load")}
          />
        ))}
      </div>
    </div>
  );
}

interface CollectionRowProps {
  collection: Collection;
  onDelete: () => void;
  loadLabel: string;
}

function CollectionRow({ collection, onDelete, loadLabel }: CollectionRowProps) {
  const diagramUrl = `/diagram?ids=${collection.buildingIds.join(",")}`;

  return (
    <div className="flex items-center gap-3 border-b border-border bg-background px-3 py-2 last:border-b-0">
      <div className="min-w-0 flex-1">
        <p className="truncate font-mono text-xs">{collection.name}</p>
        <p className="font-mono text-micro text-muted-foreground">
          {collection.buildingIds.length} buildings
        </p>
      </div>
      <Link
        href={diagramUrl}
        className="shrink-0 border border-border px-2 py-1 font-mono text-micro tracking-wider text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        {loadLabel}
      </Link>
      <button
        type="button"
        onClick={onDelete}
        className="shrink-0 text-muted-foreground/50 transition-colors hover:text-foreground"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}
