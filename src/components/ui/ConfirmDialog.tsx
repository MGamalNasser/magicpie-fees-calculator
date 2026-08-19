"use client"

import { useState } from "react"
import { Button } from "./Button"
import { Dialog } from "./Dialog"

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Delete",
  danger = true,
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => Promise<void> | void
  title: string
  description?: string
  confirmLabel?: string
  danger?: boolean
}) {
  const [busy, setBusy] = useState(false)

  return (
    <Dialog open={open} onClose={onClose} title={title} description={description}>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose} disabled={busy}>
          Cancel
        </Button>
        <Button
          variant={danger ? "danger" : "primary"}
          disabled={busy}
          onClick={async () => {
            setBusy(true)
            try {
              await onConfirm()
              onClose()
            } finally {
              setBusy(false)
            }
          }}
        >
          {busy ? "Working…" : confirmLabel}
        </Button>
      </div>
    </Dialog>
  )
}
