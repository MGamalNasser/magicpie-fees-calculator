"use client"

import { useState } from "react"
import { Pencil, Plus, Trash2, Users } from "lucide-react"
import { useData } from "@/components/DataProvider"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { Card, SectionHeader } from "@/components/ui/Card"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { Combobox } from "@/components/ui/Combobox"
import { Dialog } from "@/components/ui/Dialog"
import { EmptyState } from "@/components/ui/EmptyState"
import { Field, Input, Select } from "@/components/ui/Input"
import { MoneyInput } from "@/components/ui/MoneyInput"
import { Table, TBody, Td, Th, THead, Tr } from "@/components/ui/Table"
import { useLocale } from "@/components/LocaleProvider"
import { formatIDR } from "@/lib/money"
import { CREW_ROLE_SUGGESTIONS } from "@/lib/rules"
import type { CrewMember, Member } from "@/lib/types"

export function Masters() {
  const { data, loading, saveMember, deleteMember, saveCrew, deleteCrew } = useData()
  const { t } = useLocale()

  const [memberDraft, setMemberDraft] = useState<Member | null>(null)
  const [crewDraft, setCrewDraft] = useState<CrewMember | null>(null)
  const [confirmMember, setConfirmMember] = useState<Member | null>(null)
  const [confirmCrew, setConfirmCrew] = useState<CrewMember | null>(null)

  if (loading || !data) return null

  return (
    <div className="animate-in space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-fg">{t("Masters")}</h1>
        <p className="text-sm text-fg-muted">
          {t("Members and crew reused across gigs.")}
        </p>
      </div>

      <Card className="p-5">
        <SectionHeader
          title={t("Members")}
          description={t("The band — their splits roll into new gigs.")}
          action={
            <Button
              size="sm"
              onClick={() =>
                setMemberDraft({
                  id: crypto.randomUUID(),
                  name: "",
                  role: "Member",
                  defaultSplit: 0,
                  active: true,
                })
              }
            >
              <Plus className="h-3.5 w-3.5" />
              {t("Add member")}
            </Button>
          }
        />
        {data.members.length === 0 ? (
          <div className="mt-4">
            <EmptyState icon={<Users className="h-5 w-5" />} title={t("No members")} description={t("Add your band members to split settlements.")} />
          </div>
        ) : (
          <div className="mt-4">
            <Table>
              <THead>
                <Th>{t("Name")}</Th>
                <Th>{t("Role")}</Th>
                <Th className="text-right">{t("Default split")}</Th>
                <Th>{t("Account")}</Th>
                <Th>{t("Status")}</Th>
                <Th className="text-right" />
              </THead>
              <TBody>
                {data.members.map((m) => (
                  <Tr key={m.id}>
                    <Td className="font-medium text-fg">{m.name}</Td>
                    <Td className="text-fg-muted">{m.role}</Td>
                    <Td className="tnum text-right text-fg-muted">{m.defaultSplit}%</Td>
                    <Td className="text-fg-muted">{m.account || "—"}</Td>
                    <Td>
                      <Badge tone={m.active ? "green" : "zinc"} dot>
                        {m.active ? t("Active") : t("Inactive")}
                      </Badge>
                    </Td>
                    <Td>
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => setMemberDraft({ ...m })}
                          className="focus-ring rounded-md p-1.5 text-fg-subtle hover:text-fg"
                          aria-label={t("Edit member")}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setConfirmMember(m)}
                          className="focus-ring rounded-md p-1.5 text-fg-subtle hover:text-red"
                          aria-label={t("Delete member")}
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
          title={t("Crew")}
          description={t("Standard rates and meal eligibility. Specialists are exempt from meal allowance.")}
          action={
            <Button
              size="sm"
              onClick={() =>
                setCrewDraft({
                  id: crypto.randomUUID(),
                  name: "",
                  role: "Stage Crew",
                  roleType: "standard",
                  defaultFee: data.settings.crewMinFee,
                  minFee: data.settings.crewMinFee,
                  maxFee: data.settings.crewMaxFee,
                  mealEligible: true,
                  active: true,
                })
              }
            >
              <Plus className="h-3.5 w-3.5" />
              {t("Add crew")}
            </Button>
          }
        />
        {data.crew.length === 0 ? (
          <div className="mt-4">
            <EmptyState icon={<Users className="h-5 w-5" />} title={t("No crew")} description={t("Add road crew and specialists.")} />
          </div>
        ) : (
          <div className="mt-4">
            <Table>
              <THead>
                <Th>{t("Name")}</Th>
                <Th>{t("Role")}</Th>
                <Th>{t("Type")}</Th>
                <Th className="text-right">{t("Default fee")}</Th>
                <Th>{t("Meals")}</Th>
                <Th>{t("Status")}</Th>
                <Th className="text-right" />
              </THead>
              <TBody>
                {data.crew.map((c) => (
                  <Tr key={c.id}>
                    <Td className="font-medium text-fg">{c.name}</Td>
                    <Td className="text-fg-muted">{c.role}</Td>
                    <Td>
                      <Badge tone={c.roleType === "specialist" ? "blue" : "zinc"}>
                        {c.roleType === "specialist" ? t("Specialist") : t("Standard")}
                      </Badge>
                    </Td>
                    <Td className="tnum text-right font-medium text-fg">
                      {formatIDR(c.defaultFee)}
                    </Td>
                    <Td className="text-fg-muted">
                      {c.mealEligible ? t("Yes") : t("Exempt")}
                    </Td>
                    <Td>
                      <Badge tone={c.active ? "green" : "zinc"} dot>
                        {c.active ? t("Active") : t("Inactive")}
                      </Badge>
                    </Td>
                    <Td>
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => setCrewDraft({ ...c })}
                          className="focus-ring rounded-md p-1.5 text-fg-subtle hover:text-fg"
                          aria-label={t("Edit crew")}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setConfirmCrew(c)}
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

      {memberDraft ? (
        <MemberDialog
          draft={memberDraft}
          onClose={() => setMemberDraft(null)}
          onSave={async (m) => {
            await saveMember(m)
            setMemberDraft(null)
          }}
        />
      ) : null}

      {crewDraft ? (
        <CrewDialog
          draft={crewDraft}
          onClose={() => setCrewDraft(null)}
          onSave={async (c) => {
            await saveCrew(c)
            setCrewDraft(null)
          }}
        />
      ) : null}

      <ConfirmDialog
        open={!!confirmMember}
        onClose={() => setConfirmMember(null)}
        title={t("Remove {name}?", { name: confirmMember?.name ?? "" })}
        description={t("Past gig payouts are kept. The member will no longer be selectable.")}
        onConfirm={async () => {
          if (confirmMember) await deleteMember(confirmMember.id)
        }}
      />
      <ConfirmDialog
        open={!!confirmCrew}
        onClose={() => setConfirmCrew(null)}
        title={t("Remove {name}?", { name: confirmCrew?.name ?? "" })}
        description={t("Past gig lines are kept. The crew will no longer be selectable.")}
        onConfirm={async () => {
          if (confirmCrew) await deleteCrew(confirmCrew.id)
        }}
      />
    </div>
  )
}

function MemberDialog({
  draft,
  onClose,
  onSave,
}: {
  draft: Member
  onClose: () => void
  onSave: (m: Member) => Promise<void>
}) {
  const { t } = useLocale()
  const [m, setM] = useState<Member>(draft)
  return (
    <Dialog open onClose={onClose} title={draft.name ? t("Edit member") : t("Add member")}>
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault()
          onSave(m)
        }}
      >
        <Field label={t("Name")}>
          <Input value={m.name} onChange={(e) => setM({ ...m, name: e.target.value })} required />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label={t("Role")}>
            <Input value={m.role} onChange={(e) => setM({ ...m, role: e.target.value })} />
          </Field>
          <Field label={t("Default split (%)")}>
            <Input
              type="number"
              min={0}
              max={100}
              value={m.defaultSplit}
              onChange={(e) => setM({ ...m, defaultSplit: Number(e.target.value) || 0 })}
            />
          </Field>
        </div>
        <Field label={t("Account (optional)")}>
          <Input
            value={m.account ?? ""}
            onChange={(e) => setM({ ...m, account: e.target.value })}
            placeholder={t("e.g. BCA — 1234567890")}
          />
        </Field>
        <label className="flex items-center gap-2 text-sm text-fg-muted">
          <input
            type="checkbox"
            checked={m.active}
            onChange={(e) => setM({ ...m, active: e.target.checked })}
            className="focus-ring h-3.5 w-3.5 accent-[var(--accent)]"
          />
          {t("Active")}
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            {t("Cancel")}
          </Button>
          <Button type="submit">{t("Save member")}</Button>
        </div>
      </form>
    </Dialog>
  )
}

function CrewDialog({
  draft,
  onClose,
  onSave,
}: {
  draft: CrewMember
  onClose: () => void
  onSave: (c: CrewMember) => Promise<void>
}) {
  const { t } = useLocale()
  const [c, setC] = useState<CrewMember>(draft)
  return (
    <Dialog open onClose={onClose} title={draft.name ? t("Edit crew") : t("Add crew")}>
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault()
          onSave(c)
        }}
      >
        <Field label={t("Name")}>
          <Input value={c.name} onChange={(e) => setC({ ...c, name: e.target.value })} required />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label={t("Role")}>
            <Combobox
              value={c.role}
              onChange={(r) => setC({ ...c, role: r })}
              options={CREW_ROLE_SUGGESTIONS}
              emptyText={t("No matches")}
            />
          </Field>
          <Field label={t("Type")}>
            <Select
              value={c.roleType}
              onChange={(e) => {
                const roleType = e.target.value as CrewMember["roleType"]
                setC({
                  ...c,
                  roleType,
                  mealEligible: roleType === "specialist" ? false : c.mealEligible,
                })
              }}
            >
              <option value="standard">{t("Standard")}</option>
              <option value="specialist">{t("Specialist")}</option>
            </Select>
          </Field>
        </div>
        <Field label={t("Default fee")}>
          <MoneyInput value={c.defaultFee} onChange={(n) => setC({ ...c, defaultFee: n })} />
        </Field>
        {c.roleType === "standard" ? (
          <div className="grid grid-cols-2 gap-3">
            <Field label={t("Min fee")}>
              <MoneyInput value={c.minFee} onChange={(n) => setC({ ...c, minFee: n })} />
            </Field>
            <Field label={t("Max fee")}>
              <MoneyInput value={c.maxFee} onChange={(n) => setC({ ...c, maxFee: n })} />
            </Field>
          </div>
        ) : null}
        <label className="flex items-center gap-2 text-sm text-fg-muted">
          <input
            type="checkbox"
            checked={c.mealEligible}
            onChange={(e) => setC({ ...c, mealEligible: e.target.checked })}
            className="focus-ring h-3.5 w-3.5 accent-[var(--accent)]"
          />
          {t("Eligible for meal allowance")}
        </label>
        <label className="flex items-center gap-2 text-sm text-fg-muted">
          <input
            type="checkbox"
            checked={c.active}
            onChange={(e) => setC({ ...c, active: e.target.checked })}
            className="focus-ring h-3.5 w-3.5 accent-[var(--accent)]"
          />
          {t("Active")}
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            {t("Cancel")}
          </Button>
          <Button type="submit">{t("Save crew")}</Button>
        </div>
      </form>
    </Dialog>
  )
}