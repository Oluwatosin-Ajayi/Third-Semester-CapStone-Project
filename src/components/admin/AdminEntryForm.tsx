"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import dynamic from "next/dynamic";
import {
  HospitalInputSchema,
  type HospitalInput,
  SPECIALTIES,
} from "@/lib/schema";
import { createClient } from "@/lib/supabase/client";
import type { Hospital } from "@/types";

// Lazy-load MD editor — heavy package
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

interface AdminEntryFormProps {
  hospital?: Hospital; // if provided → edit mode
}

export default function AdminEntryForm({ hospital }: AdminEntryFormProps) {
  const router = useRouter();
  const isEdit = !!hospital;
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<HospitalInput>({
    resolver: zodResolver(HospitalInputSchema),
    defaultValues: hospital
      ? {
          name: hospital.name,
          address: hospital.address,
          phone: hospital.phone,
          email: hospital.email ?? "",
          city: hospital.city,
          lga: hospital.lga,
          latitude: (hospital.location as { lat: number } | null)?.lat ?? 0,
          longitude: (hospital.location as { lng: number } | null)?.lng ?? 0,
          specialties: hospital.specialties,
          ownership: hospital.ownership,
          description_md: hospital.description_md ?? "",
          visiting_hours: hospital.visiting_hours ?? "",
        }
      : {
          specialties: [],
          ownership: "public",
        },
  });

  async function onSubmit(data: HospitalInput) {
    setSaving(true);
    setServerError("");

    try {
      const endpoint = isEdit
        ? `/api/admin/hospitals/${hospital!.id}`
        : "/api/admin/hospitals";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        setServerError(err.error ?? "Failed to save hospital");
        return;
      }

      router.push("/admin/dashboard");
      router.refresh();
    } catch {
      setServerError("Network error — please try again");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!hospital) return;
    if (
      !confirm(
        `Are you sure you want to delete "${hospital.name}"? This cannot be undone.`,
      )
    )
      return;

    setDeleting(true);
    const res = await fetch(`/api/admin/hospitals/${hospital.id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      router.push("/admin/dashboard");
      router.refresh();
    } else {
      setServerError("Failed to delete hospital");
      setDeleting(false);
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !hospital) return;

    // Validate
    if (file.size > 5 * 1024 * 1024) {
      setServerError("Image must be under 5MB");
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setServerError("Only JPEG, PNG, and WebP images are allowed");
      return;
    }

    setImageUploading(true);
    const supabase = createClient();
    const path = `${hospital.id}/${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from("hospital-images")
      .upload(path, file, { upsert: false });

    if (error) {
      setServerError(`Image upload failed: ${error.message}`);
    } else {
      const {
        data: { publicUrl },
      } = supabase.storage.from("hospital-images").getPublicUrl(path);
      setUploadedImageUrl(publicUrl);
    }
    setImageUploading(false);
  }

  function FieldError({ name }: { name: keyof typeof errors }) {
    const error = errors[name];
    if (!error) return null;
    return (
      <p className="text-red-500 text-xs mt-1">{error.message as string}</p>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-3xl">
      {serverError && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <p className="text-red-600 text-sm">{serverError}</p>
        </div>
      )}

      {/* Basic Info */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Basic Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Hospital Name *
            </label>
            <input
              {...register("name")}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Hospital name, e.g. Lagos University Teaching Hospital"
            />
            <FieldError name="name" />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Address *
            </label>
            <input
              {...register("address")}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Street address, e.g. 123 Hospital Road"
            />
            <FieldError name="address" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              City *
            </label>
            <input
              {...register("city")}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Lagos"
            />
            <FieldError name="city" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              LGA *
            </label>
            <input
              {...register("lga")}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Ikeja"
            />
            <FieldError name="lga" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Phone * (+234XXXXXXXXXX)
            </label>
            <input
              {...register("phone")}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500"
              placeholder="+2348012345678"
            />
            <FieldError name="phone" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Email
            </label>
            <input
              {...register("email")}
              type="email"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500"
              placeholder="info@hospital.ng"
            />
            <FieldError name="email" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Ownership *
            </label>
            <select
              {...register("ownership")}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500 bg-white"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
            <FieldError name="ownership" />
          </div>
        </div>
      </div>

      {/* Coordinates */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-1">Coordinates</h2>
        <p className="text-xs text-gray-400 mb-4">
          Find coordinates at{" "}
          <a
            href="https://www.latlong.net"
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-600 hover:underline"
          >
            latlong.net
          </a>
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Latitude * (4–14)
            </label>
            <input
              {...register("latitude", { valueAsNumber: true })}
              type="number"
              step="any"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500"
              placeholder="6.5244"
            />
            <FieldError name="latitude" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Longitude * (2–15)
            </label>
            <input
              {...register("longitude", { valueAsNumber: true })}
              type="number"
              step="any"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500"
              placeholder="3.3792"
            />
            <FieldError name="longitude" />
          </div>
        </div>
      </div>

      {/* Specialties */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">
          Specialties * (select at least one)
        </h2>
        <Controller
          name="specialties"
          control={control}
          render={({ field }) => (
            <div className="flex flex-wrap gap-2">
              {SPECIALTIES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    const current = field.value ?? [];
                    field.onChange(
                      current.includes(s)
                        ? current.filter((x) => x !== s)
                        : [...current, s],
                    );
                  }}
                  className={`px-3 py-1.5 text-xs rounded-full border transition-colors capitalize ${
                    (field.value ?? []).includes(s)
                      ? "bg-green-100 text-green-700 border-green-300"
                      : "border-gray-200 text-gray-600 hover:border-green-300"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        />
        <FieldError name="specialties" />
      </div>

      {/* Description */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Description</h2>
        <Controller
          name="description_md"
          control={control}
          render={({ field }) => (
            <div data-color-mode="light">
              <MDEditor
                value={field.value ?? ""}
                onChange={(val) => field.onChange(val ?? "")}
                height={250}
                preview="live"
              />
            </div>
          )}
        />
      </div>

      {/* Visiting Hours */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Visiting Hours</h2>
        <textarea
          {...register("visiting_hours")}
          rows={3}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500 resize-none"
          placeholder="Mon–Fri: 10am–12pm, 4pm–6pm&#10;Weekends: 10am–1pm"
        />
      </div>

      {/* Image Upload — edit mode only */}
      {isEdit && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Hospital Images</h2>
          <label className="block">
            <span className="sr-only">Upload image</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageUpload}
              disabled={imageUploading}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-green-50 file:text-green-700 file:font-medium hover:file:bg-green-100 file:cursor-pointer"
            />
          </label>
          {imageUploading && (
            <p className="text-sm text-gray-400 mt-2">Uploading...</p>
          )}
          {uploadedImageUrl && (
            <div className="mt-3">
              <p className="text-xs text-green-600 mb-2">✅ Image uploaded</p>
              <img
                src={uploadedImageUrl}
                alt="Uploaded"
                className="w-32 h-32 object-cover rounded-xl border border-gray-200"
              />
            </div>
          )}
          <p className="text-xs text-gray-400 mt-2">
            Max 5MB · JPEG, PNG, or WebP
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="bg-green-600 text-white px-6 py-2.5 rounded-xl font-medium text-sm hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Hospital"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        {isEdit && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="ml-auto px-6 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm hover:bg-red-100 transition-colors disabled:opacity-50"
          >
            {deleting ? "Deleting..." : "Delete Hospital"}
          </button>
        )}
      </div>
    </form>
  );
}
