import { PatientDetailView } from "@/components/dashboard/patient-detail-view"

export default async function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <PatientDetailView patientId={id} />
}
