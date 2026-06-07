import { notFound } from "next/navigation";
import { getHospitalById } from "@/lib/supabase/query";
import AdminEntryForm from "@/components/admin/AdminEntryForm";

interface Props {
  params: { id: string };
}

export default async function EditHospitalPage({ params }: Props) {
  const hospital = await getHospitalById(params.id);
  if (!hospital) notFound();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Edit Hospital</h1>
        <p className="text-gray-500 text-sm mt-1">{hospital.name}</p>
      </div>
      <AdminEntryForm hospital={hospital} />
    </div>
  );
}
