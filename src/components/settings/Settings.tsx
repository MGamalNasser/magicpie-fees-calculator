"use client"

import { useEffect, useState } from "react"
import { Pencil, Plus, Trash2, Wrench } from "lucide-react"
import { useData } from "@/components/DataProvider"
import * as actions from "@/lib/actions"
import { Button } from "@/components/ui/Button"
import { Card, SectionHeader } from "@/components/ui/Card"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { Dialog } from "@/components/ui/Dialog"
import { EmptyState } from "@/components/ui/EmptyState"
import { Field, Input } from "@/components/ui/Input"
import { MoneyInput } from "@/components/ui/MoneyInput"
import { Table, TBody, Td, Th, THead, Tr } from "@/components/ui/Table"
import { useLocale } from "@/components/LocaleProvider"
import { formatIDR } from "@/lib/money"
import type { AuditLogRow, ProductionRole } from "@/lib/types"

const AUDIT_LABEL: Record<string, string> = {
  "gig.create": "Created gig",
  "gig.update": "Updated gig",
  "gig.import": "Imported gig",
  "gig.delete": "Deleted gig",
  "gig.status": "Changed status",
  "member.payment": "Updated member payment",
  "crew.payment": "Updated crew payment",
  "member.create": "Added member",
  "member.update": "Updated member",
  "member.delete": "Deleted member",
  "crew.create": "Added crew",
  "crew.update": "Updated crew",
  "crew.delete": "Deleted crew",
  "settings.update": "Updated settings",
  "production_role.create": "Added production role",
  "production_role.update": "Updated production role",
  "production_role.delete": "Deleted production role",
  "itinerary.create": "Created itinerary",
  "itinerary.update": "Updated itinerary",
  "itinerary.delete": "Deleted itinerary",
  "export.pdf": "Exported PDF",
  "export.xlsx": "Exported Excel",
  "export.itinerary_pdf": "Exported itinerary PDF",
}

function formatDateTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function Settings() {
  const { data, loading, saveSettings, refresh } = useData()
  const { t, td } = useLocale()

  const [roleDraft, setRoleDraft] = useState<ProductionRole | null>(null)
  const [confirmRole, setConfirmRole] = useState<ProductionRole | null>(null)

  const [auditLog, setAuditLog] = useState<AuditLogRow[]>([])

  useEffect(() => {
    actions.getAuditLogAction(100).then(setAuditLog).catch(() => {})
  }, [])

  if (loading || !data) return null

  return (
    <div className="animate-in space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-fg">{t("Settings")}</h1>
        <p className="text-sm text-fg-muted">
          {t("Defaults applied to new gigs and crew.")}
        </p>
      </div>

      <Card className="p-5">
        <SectionHeader
          title={t("Crew defaults")}
          description={t("Defaults applied to new gigs and crew.")}
        />
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Field label={t("Crew min fee")}>
            <MoneyInput
              value={data.settings.crewMinFee}
              onChange={async (n) => {
                await saveSettings({ ...data.settings, crewMinFee: n })
              }}
            />
          </Field>
          <Field label={t("Crew max fee")}>
            <MoneyInput
              value={data.settings.crewMaxFee}
              onChange={async (n) => {
                await saveSettings({ ...data.settings, crewMaxFee: n })
              }}
            />
          </Field>
          <Field label={t("Meal allowance")}>
            <MoneyInput
              value={data.settings.mealRate}
              onChange={async (n) => {
                await saveSettings({ ...data.settings, mealRate: n })
              }}
            />
          </Field>
        </div>
      </Card>

      <Card className="p-5">
        <SectionHeader
          title={t("Production crew")}
          description={t("Default fee per production role, used when adding expenses to a gig.")}
          action={
            <Button
              size="sm"
              onClick={() =>
                setRoleDraft({
                  id: crypto.randomUUID(),
                  name: "",
                  defaultFee: 0,
                  active: true,
                })
              }
            >
              <Plus className="h-3.5 w-3.5" />
              {t("Add role")}
            </Button>
          }
        />
        {data.productionRoles.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              icon={<Wrench className="h-5 w-5" />}
              title={t("No production roles yet.")}
              description={t("Production roles feed the expense picker in the gig editor.")}
            />
          </div>
        ) : (
          <div className="mt-4">
            <Table>
              <THead>
                <Th>{t("Name")}</Th>
                <Th className="text-right">{t("Default pay")}</Th>
                <Th className="text-right" />
              </THead>
              <TBody>
                {data.productionRoles.map((r) => (
                  <Tr key={r.id}>
                    <Td className="font-medium text-fg">{r.name}</Td>
                    <Td className="tnum text-right font-medium text-fg">
                      {formatIDR(r.defaultFee)}
                    </Td>
                    <Td>
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => setRoleDraft({ ...r })}
                          className="focus-ring rounded-md p-1.5 text-fg-subtle hover:text-fg"
                          aria-label={t("Edit crew")}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setConfirmRole(r)}
                          className="focus-ring rounded-md p-1.5 text-fg-subtle hover:text-red"
                          aria-label={t("Delete crew")}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </Td>
                  </Tr>
                ))}
              </TBody>
            </Table>
          </div>
        )}
      </Card>

      <Card className="p-5">
        <SectionHeader
          title={t("Activity log")}
          description={t("Who changed or exported what, and when.")}
        />
        {auditLog.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              icon={<Wrench className="h-5 w-5" />}
              title={t("No activity yet.")}
              description={t("Changes and exports will be recorded here.")}
            />
          </div>
        ) : (
          <div className="mt-4">
            <Table>
              <THead>
                <Th>{t("Who")}</Th>
                <Th>{t("Action")}</Th>
                <Th>{t("Item")}</Th>
                <Th>{t("When")}</Th>
              </THead>
              <TBody>
                {auditLog.map((row) => (
                  <Tr key={row.id}>
                    <Td className="font-medium text-fg">{row.actorName}</Td>
                    <Td className="text-fg">
                      {t(AUDIT_LABEL[row.action] ?? row.action)}
                      {row.detail ? (
                        <span className="block text-[12px] text-fg-muted">{row.detail}</span>
                      ) : null}
                    </Td>
                    <Td className="text-fg-muted">{row.gigName ?? row.entityName ?? "—"}</Td>
                    <Td className="whitespace-nowrap text-fg-muted">
                      {formatDateTime(row.createdAt)}
                    </Td>
                  </Tr>
                ))}
              </TBody>
            </Table>
          </div>
        )}
      </Card>

      {roleDraft ? (
        <RoleDialog
          draft={roleDraft}
          onClose={() => setRoleDraft(null)}
          onSave={async (r) => {
            await actions.saveProductionRoleAction(r)
            await refresh()
            setRoleDraft(null)
          }}
        />
      ) : null}

      <ConfirmDialog
        open={!!confirmRole}
        onClose={() => setConfirmRole(null)}
        title={t("Remove {name}?", { name: confirmRole?.name ?? "" })}
        description={t("Past gig lines are kept. The crew will no longer be selectable.")}
        onConfirm={async () => {
          if (confirmRole) {
            await actions.deleteProductionRoleAction(confirmRole.id)
            await refresh()
          }
        }}
      />
    </div>
  )
}

function RoleDialog({
  draft,
  onClose,
  onSave,
}: {
  draft: ProductionRole
  onClose: () => void
  onSave: (r: ProductionRole) => Promise<void>
}) {
  const { t } = useLocale()
  const [r, setR] = useState<ProductionRole>(draft)
  return (
    <Dialog open onClose={onClose} title={draft.name ? t("Edit crew") : t("Add role")}>
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault()
          onSave(r)
        }}
      >
        <Field label={t("Role name")}>
          <Input value={r.name} onChange={(e) => setR({ ...r, name: e.target.value })} required />
        </Field>
        <Field label={t("Default pay")}>
          <MoneyInput value={r.defaultFee} onChange={(n) => setR({ ...r, defaultFee: n })} />
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            {t("Cancel")}
          </Button>
          <Button type="submit">{t("Save")}</Button>
        </div>
      </form>
    </Dialog>
  )
}