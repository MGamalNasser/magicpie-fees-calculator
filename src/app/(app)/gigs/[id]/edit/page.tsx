import { GigEditor } from "@/components/gig/GigEditor"

export default async function EditGigPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <GigEditor gigId={id} />
}