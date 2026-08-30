"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

const campTypes = [
  "Free Eye Check-up Camp",
  "Vision Screening Camp",
  "Cataract Screening Camp",
  "School Eye Screening Camp",
  "Diabetic Eye Screening Camp",
  "Community Eye Camp",
  "Corporate Eye Camp",
  "Rural Eye Camp",
  "Other",
];

const services = [
  "Visual Acuity Testing",
  "Refraction / Vision Testing",
  "Eye Health Screening",
  "Cataract Screening",
  "Diabetic Eye Screening",
  "Glaucoma Screening",
  "Children's Eye Screening",
  "Contact Lens Assessment",
  "Spectacle Distribution",
  "Referral for Further Treatment",
  "Other",
];

const supportOptions = [
  "Camp Planning & Coordination",
  "Optometrist / Eye Care Professional Support",
  "Ophthalmologist Support",
  "Medical Equipment Support",
  "Spectacle / Lens Support",
  "Patient Registration & Management",
  "Awareness & Promotion",
  "Volunteer Support",
  "Venue / Logistics Support",
  "Other",
];

export default function EyeCampRegistrationPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setSubmitting(true);
    setError("");

    try {
      const form = e.currentTarget;
      const formData = new FormData(form);

      /* =====================================================
         UPLOAD DOCUMENTS
      ===================================================== */

      const documents: {
        documentType: string;
        url: string;
        fileName: string;
      }[] = [];

      const fileFields = [
        {
          field: "organizationProof",
          documentType: "Organization / Identity Proof",
        },
        {
          field: "authorizationDocument",
          documentType: "Authorization Document",
        },
        {
          field: "campProposal",
          documentType: "Camp Proposal / Plan",
        },
        {
          field: "organizationLogo",
          documentType: "Organization Logo",
        },
      ];

      for (const item of fileFields) {
        const file = formData.get(item.field);

        if (file instanceof File && file.size > 0) {
          const uploadData = new FormData();

          uploadData.append("file", file);

          const uploadResponse = await fetch("/api/upload", {
            method: "POST",
            body: uploadData,
          });

          const uploadResult = await uploadResponse.json();

          if (!uploadResponse.ok || !uploadResult.success) {
            throw new Error(
              uploadResult.error ||
                `Failed to upload ${item.documentType}.`
            );
          }

          documents.push({
            documentType: item.documentType,
            url: uploadResult.url,
            fileName: file.name,
          });
        }
      }

      /* =====================================================
         COLLECT FORM DATA
      ===================================================== */

      const registrationData = {
        type: "EYE_CAMP",

        name: String(formData.get("organizerName") || ""),
        email: String(formData.get("email") || ""),
        phone: String(formData.get("mobileNumber") || ""),

        formData: {
          /* Organizer Information */

          organizerName: formData.get("organizerName"),
          organizationName: formData.get("organizationName"),
          organizationType: formData.get("organizationType"),
          designation: formData.get("designation"),

          mobileNumber: formData.get("mobileNumber"),
          whatsappNumber: formData.get("whatsappNumber"),
          email: formData.get("email"),

          /* Camp Information */

          campName: formData.get("campName"),
          campType: formData.get("campType"),
          expectedParticipants: formData.get(
            "expectedParticipants"
          ),
          previousCampExperience: formData.get(
            "previousCampExperience"
          ),

          /* Camp Date */

          proposedCampDate: formData.get("proposedCampDate"),
          alternateCampDate: formData.get(
            "alternateCampDate"
          ),

          /* Location */

          state: formData.get("state"),
          district: formData.get("district"),
          city: formData.get("city"),
          pinCode: formData.get("pinCode"),
          campVenue: formData.get("campVenue"),
          venueAddress: formData.get("venueAddress"),

          /* Services */

          services: formData.getAll("services"),

          /* Facilities */

          seatingAvailable: formData.get(
            "seatingAvailable"
          ),
          electricityAvailable: formData.get(
            "electricityAvailable"
          ),
          internetAvailable: formData.get(
            "internetAvailable"
          ),

          /* Support */

          support: formData.getAll("support"),

          additionalRequirements: formData.get(
            "additionalRequirements"
          ),

          reasonToJoin: formData.get("reasonToJoin"),
        },

        documents,
      };

      /* =====================================================
         SUBMIT REGISTRATION TO DATABASE
      ===================================================== */

      const response = await fetch("/api/registrations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registrationData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error ||
            "Failed to submit eye camp registration."
        );
      }

      setSubmitted(true);
    } catch (err) {
      console.error(
        "Eye camp registration submission error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  /* =========================================================
     SUCCESS PAGE
  ========================================================= */

  if (submitted) {
    return (
      <main className="min-h-screen bg-[#fafaff]">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-7xl items-center px-5 py-5">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#3426a8] text-xl">
                👁️
              </div>

              <div>
                <div className="text-xl font-black tracking-tight text-[#10152c]">
                  SPECTWALA
                </div>

                <div className="text-xs font-medium text-slate-500">
                  Eye Care Network
                </div>
              </div>
            </Link>
          </div>
        </header>

        <section className="flex min-h-[75vh] items-center justify-center px-5">
          <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl md:p-12">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-4xl text-green-600">
              ✓
            </div>

            <h1 className="mt-6 text-3xl font-black text-[#10152c]">
              Thank You for Registering!
            </h1>

            <p className="mt-4 leading-7 text-slate-600">
              Your Eye Camp Registration has been successfully
              submitted.
            </p>

            <p className="mt-3 leading-7 text-slate-600">
              Our team will review your camp information and
              requirements. Once the review is completed, you will
              receive further communication from Spectwala.
            </p>

            <p className="mt-6 font-bold text-[#3426a8]">
              Team Spectwala
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Care • Help • Support
            </p>

            <Link
              href="/"
              className="mt-8 inline-flex rounded-xl bg-[#3426a8] px-6 py-3 font-bold text-white transition hover:bg-[#291d91]"
            >
              Back to Spectwala
            </Link>
          </div>
        </section>
      </main>
    );
  }

  /* =========================================================
     REGISTRATION FORM
  ========================================================= */

  return (
    <main className="min-h-screen bg-[#f8f8ff]">
      {/* HEADER */}

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#3426a8] text-xl">
              👁️
            </div>

            <div>
              <div className="text-xl font-black tracking-tight text-[#10152c]">
                SPECTWALA
              </div>

              <div className="text-xs font-medium text-slate-500">
                Eye Care Network
              </div>
            </div>
          </Link>

          <Link
            href="/register"
            className="rounded-lg px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
          >
            ← Registration Types
          </Link>
        </div>
      </header>

      {/* INTRO */}

      <section className="mx-auto max-w-4xl px-5 pb-8 pt-12">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f0efff] text-3xl">
            🏥
          </div>

          <p className="mt-5 font-bold uppercase tracking-[0.18em] text-[#3426a8]">
            Spectwala Community Eye Care
          </p>

          <h1 className="mt-3 text-3xl font-black tracking-tight text-[#10152c] md:text-4xl">
            Eye Camp Registration
          </h1>

          <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-600">
            Register your eye camp with Spectwala and get support
            for planning, coordination and eye-care services.
          </p>

          <p className="mt-3 text-sm text-slate-500">
            Fields marked with{" "}
            <span className="font-bold text-red-500">*</span>{" "}
            are mandatory.
          </p>
        </div>
      </section>

      {/* FORM */}

      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-4xl px-5 pb-20"
      >
        {/* SECTION 1 */}

        <section className="mb-7 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <SectionHeading
            number="01"
            title="Organizer Information"
            description="Tell us about the person or organization organizing the eye camp."
          />

          <div className="grid gap-5 md:grid-cols-2">
            <Input
              name="organizerName"
              label="Organizer Name"
              required
              placeholder="Enter organizer name"
            />

            <Input
              name="organizationName"
              label="Organization / Institution Name"
              required
              placeholder="Enter organization name"
            />

            <Select
              name="organizationType"
              label="Organization Type"
              required
              options={[
                "NGO",
                "Hospital",
                "Eye Care Organization",
                "Optical Organization",
                "School / College",
                "Corporate",
                "Government Organization",
                "Community Organization",
                "Other",
              ]}
            />

            <Input
              name="designation"
              label="Designation / Role"
              required
              placeholder="Enter your designation"
            />

            <Input
              name="mobileNumber"
              label="Mobile Number"
              required
              type="tel"
              placeholder="Enter mobile number"
            />

            <Input
              name="whatsappNumber"
              label="WhatsApp Number"
              type="tel"
              placeholder="Enter WhatsApp number"
            />

            <Input
              name="email"
              label="Email ID"
              required
              type="email"
              placeholder="Enter email address"
            />
          </div>
        </section>

        {/* SECTION 2 */}

        <section className="mb-7 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <SectionHeading
            number="02"
            title="Eye Camp Information"
            description="Provide the basic details of the proposed eye camp."
          />

          <div className="grid gap-5 md:grid-cols-2">
            <Input
              name="campName"
              label="Eye Camp Name"
              required
              placeholder="Enter eye camp name"
            />

            <Select
              name="campType"
              label="Type of Eye Camp"
              required
              options={campTypes}
            />

            <Input
              name="expectedParticipants"
              label="Expected Number of Participants"
              required
              type="number"
              inputMode="numeric"
              placeholder="e.g. 100"
            />

            <Select
              name="previousCampExperience"
              label="Previous Eye Camp Experience"
              required
              options={[
                "Yes - Regularly Organize Camps",
                "Yes - Occasionally",
                "No - First Camp",
              ]}
            />
          </div>
        </section>

        {/* SECTION 3 */}

        <section className="mb-7 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <SectionHeading
            number="03"
            title="Camp Date"
            description="Tell us when you would like to organize the camp."
          />

          <div className="grid gap-5 md:grid-cols-2">
            <Input
              name="proposedCampDate"
              label="Proposed Camp Date"
              required
              type="date"
            />

            <Input
              name="alternateCampDate"
              label="Alternate Date"
              type="date"
            />
          </div>
        </section>

        {/* SECTION 4 */}

        <section className="mb-7 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <SectionHeading
            number="04"
            title="Camp Location"
            description="Provide the complete location where the camp will be organized."
          />

          <div className="grid gap-5 md:grid-cols-2">
            <Select
              name="state"
              label="State"
              required
              options={[
                "Maharashtra",
                "Gujarat",
                "Madhya Pradesh",
                "Goa",
                "Karnataka",
                "Telangana",
                "Andhra Pradesh",
                "Delhi",
                "Rajasthan",
                "Uttar Pradesh",
                "Other",
              ]}
            />

            <Input
              name="district"
              label="District"
              required
              placeholder="Enter district"
            />

            <Input
              name="city"
              label="City / Town / Village"
              required
              placeholder="Enter city, town or village"
            />

            <Input
              name="pinCode"
              label="PIN Code"
              required
              inputMode="numeric"
              placeholder="Enter PIN code"
            />

            <Input
              name="campVenue"
              label="Camp Venue"
              required
              placeholder="e.g. Community Hall / School"
            />

            <div className="md:col-span-2">
              <Textarea
                name="venueAddress"
                label="Complete Venue Address"
                required
                placeholder="Enter complete camp venue address"
              />
            </div>
          </div>
        </section>

        {/* SECTION 5 */}

        <section className="mb-7 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <SectionHeading
            number="05"
            title="Eye Care Services"
            description="Select all services that you plan to provide at the camp."
          />

          <CheckboxGrid
            name="services"
            options={services}
            required
          />
        </section>

        {/* SECTION 6 */}

        <section className="mb-7 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <SectionHeading
            number="06"
            title="Venue Facilities"
            description="Tell us about the facilities available at the camp venue."
          />

          <div className="grid gap-5 md:grid-cols-3">
            <Select
              name="seatingAvailable"
              label="Seating Available"
              required
              options={[
                "Yes",
                "Partially",
                "No",
              ]}
            />

            <Select
              name="electricityAvailable"
              label="Electricity Available"
              required
              options={[
                "Yes",
                "Partially",
                "No",
              ]}
            />

            <Select
              name="internetAvailable"
              label="Internet Available"
              required
              options={[
                "Yes",
                "No",
                "Not Required",
              ]}
            />
          </div>
        </section>

        {/* SECTION 7 */}

        <section className="mb-7 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <SectionHeading
            number="07"
            title="Support Required"
            description="Select the type of support you need from Spectwala."
          />

          <CheckboxGrid
            name="support"
            options={supportOptions}
          />

          <div className="mt-6">
            <Textarea
              name="additionalRequirements"
              label="Additional Requirements"
              placeholder="Tell us about any additional equipment, manpower, logistics or other requirements..."
            />
          </div>

          <div className="mt-6">
            <Textarea
              name="reasonToJoin"
              label="Why would you like to register your camp with Spectwala?"
              placeholder="Tell us why you would like Spectwala to support your eye camp..."
            />
          </div>
        </section>

        {/* SECTION 8 */}

        <section className="mb-7 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <SectionHeading
            number="08"
            title="Document Upload"
            description="Upload supporting documents related to your organization or eye camp."
          />

          <div className="grid gap-5 md:grid-cols-2">
            <FileInput
              name="organizationProof"
              label="Organization / Identity Proof"
              accept=".pdf,.jpg,.jpeg,.png"
            />

            <FileInput
              name="authorizationDocument"
              label="Authorization Document"
              accept=".pdf,.jpg,.jpeg,.png"
            />

            <FileInput
              name="campProposal"
              label="Camp Proposal / Plan"
              accept=".pdf,.jpg,.jpeg,.png"
            />

            <FileInput
              name="organizationLogo"
              label="Organization Logo"
              accept=".jpg,.jpeg,.png"
            />
          </div>

          <p className="mt-4 text-xs text-slate-500">
            Accepted formats: PDF, JPG, JPEG and PNG.
          </p>
        </section>

        {/* SECTION 9 */}

        <section className="mb-7 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <SectionHeading
            number="09"
            title="Declaration & Consent"
            description="Please confirm the following before submitting your registration."
          />

          <label className="flex cursor-pointer gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <input
              type="checkbox"
              name="declaration"
              required
              className="mt-1 h-5 w-5 shrink-0 accent-[#3426a8]"
            />

            <span className="text-sm leading-6 text-slate-700">
              I confirm that the information provided by me is
              true and correct to the best of my knowledge. I
              authorize Spectwala to verify the information
              submitted for this eye camp and agree to the
              Spectwala&apos;s Terms & Conditions.
            </span>
          </label>
        </section>

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5">
            <p className="font-bold text-red-700">
              Eye Camp Registration could not be submitted
            </p>

            <p className="mt-1 text-sm text-red-600">
              {error}
            </p>
          </div>
        )}

        {/* SUBMIT */}

        <div className="rounded-3xl border border-[#dcd8ff] bg-[#f0efff] p-6 text-center md:p-8">
          <h2 className="text-xl font-black text-[#10152c]">
            Ready to register your eye camp?
          </h2>

          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
            Submit your camp details and our team will review your
            requirements and contact you for further coordination.
          </p>

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 rounded-xl bg-[#3426a8] px-10 py-4 text-base font-black text-white shadow-lg transition hover:bg-[#291d91] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting
              ? "Uploading & Submitting..."
              : "Register Eye Camp →"}
          </button>

          {submitting && (
            <p className="mt-3 text-xs font-semibold text-slate-500">
              Please keep this page open while your documents
              upload.
            </p>
          )}
        </div>
      </form>
    </main>
  );
}

/* =========================================================
   SECTION HEADING
========================================================= */

function SectionHeading({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-7">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#3426a8] text-xs font-black text-white">
          {number}
        </span>

        <h2 className="text-xl font-black text-[#10152c] md:text-2xl">
          {title}
        </h2>
      </div>

      <p className="mt-2 text-sm text-slate-500">
        {description}
      </p>
    </div>
  );
}

/* =========================================================
   INPUT
========================================================= */

function Input({
  name,
  label,
  required = false,
  type = "text",
  placeholder,
  inputMode,
}: {
  name: string;
  label: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-[#10152c]">
        {label}

        {required && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </label>

      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        inputMode={inputMode}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#3426a8] focus:ring-4 focus:ring-[#3426a8]/10"
      />
    </div>
  );
}

/* =========================================================
   SELECT
========================================================= */

function Select({
  name,
  label,
  required = false,
  options,
}: {
  name: string;
  label: string;
  required?: boolean;
  options: string[];
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-[#10152c]">
        {label}

        {required && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </label>

      <select
        name={name}
        required={required}
        defaultValue=""
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#3426a8] focus:ring-4 focus:ring-[#3426a8]/10"
      >
        <option value="" disabled>
          Select {label.toLowerCase()}
        </option>

        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

/* =========================================================
   TEXTAREA
========================================================= */

function Textarea({
  name,
  label,
  required = false,
  placeholder,
}: {
  name: string;
  label: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-[#10152c]">
        {label}

        {required && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </label>

      <textarea
        name={name}
        required={required}
        rows={5}
        placeholder={placeholder}
        className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#3426a8] focus:ring-4 focus:ring-[#3426a8]/10"
      />
    </div>
  );
}

/* =========================================================
   CHECKBOX GRID
========================================================= */

function CheckboxGrid({
  name,
  options,
  required = false,
}: {
  name: string;
  options: string[];
  required?: boolean;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {options.map((option, index) => (
        <label
          key={option}
          className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-[#bdb7ff] hover:bg-[#fafaff]"
        >
          <input
            type="checkbox"
            name={name}
            value={option}
            required={required && index === 0}
            className="mt-0.5 h-5 w-5 shrink-0 accent-[#3426a8]"
          />

          <span className="text-sm leading-5 text-slate-700">
            {option}
          </span>
        </label>
      ))}
    </div>
  );
}

/* =========================================================
   FILE INPUT
========================================================= */

function FileInput({
  name,
  label,
  required = false,
  accept,
}: {
  name: string;
  label: string;
  required?: boolean;
  accept?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-[#10152c]">
        {label}

        {required && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </label>

      <input
        name={name}
        type="file"
        required={required}
        accept={accept}
        className="block w-full cursor-pointer rounded-xl border border-slate-200 bg-white text-sm text-slate-600 file:mr-4 file:border-0 file:bg-[#f0efff] file:px-4 file:py-3 file:font-bold file:text-[#3426a8] hover:file:bg-[#e7e5ff]"
      />
    </div>
  );
}