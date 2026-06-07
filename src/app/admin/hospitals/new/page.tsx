import AdminEntryForm from "@/components/admin/AdminEntryForm";

export default function NewHospitalPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Add Hospital</h1>
        <p className="text-gray-500 text-sm mt-1">
          Create a new hospital entry in the directory
        </p>
      </div>
      <AdminEntryForm />
    </div>
  );
}
