import { GigDetail } from "@/components/gig/GigDetail"

export default async function GigPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <GigDetail gigId={id} />
}