"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

const services = [
  "Eyeglass Dispensing",
  "Frame Selection & Fitting",
  "Lens Selection & Fitting",
  "Prescription Lens Verification",
  "Single Vision Lenses",
  "Bifocal Lenses",
  "Progressive Lenses",
  "Blue Light / Computer Lenses",
  "Photochromic Lenses",
  "Contact Lens Dispensing",
  "Frame Repair & Adjustment",
  "Other",
];

const supportOptions = [
  "Professional Networking",
  "Customer Referrals",
  "Job Opportunities",
  "Optical Product Support",
  "Lens & Frame Product Support",
  "Training & Education",
  "Business Growth Support",
  "Other",
];

export default function OpticianRegistrationPage() {
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
         OPTIONAL DOCUMENT UPLOADS
      ===================================================== */

      const documents: {
        documentType: string;
        url: string;
        fileName: string;
      }[] = [];

      const fileFields = [
        {
          field: "qualificationCertificate",
          documentType: "Qualification Certificate",
        },
        {
          field: "professionalCertificate",
          documentType: "Professional Certificate",
        },
        {
          field: "professionalId",
          documentType: "Professional ID",
        },
        {
          field: "profilePhoto",
          documentType: "Profile Photo",
        },
      ];

      /*
        Documents are OPTIONAL.

        If the user does not select a document,
        nothing is uploaded and registration continues.
      */

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
        type: "OPTICIAN",

        name: String(formData.get("fullName") || ""),
        email: String(formData.get("email") || ""),
        phone: String(formData.get("mobileNumber") || ""),

        formData: {
          fullName: formData.get("fullName"),
          mobileNumber: formData.get("mobileNumber"),
          whatsappNumber: formData.get("whatsappNumber"),
          email: formData.get("email"),
          gender: formData.get("gender"),

          highestQualification: formData.get(
            "highestQualification"
          ),
          collegeInstitute: formData.get(
            "collegeInstitute"
          ),
          yearOfPassing: formData.get("yearOfPassing"),
          certificateNumber: formData.get("certificateNumber"),

          professionalExperience: formData.get(
            "professionalExperience"
          ),
          workSetting: formData.get("workSetting"),
          workplaceName: formData.get("workplaceName"),

          state: formData.get("state"),
          district: formData.get("district"),
          city: formData.get("city"),
          pinCode: formData.get("pinCode"),
          address: formData.get("address"),

          services: formData.getAll("services"),

          reasonToJoin: formData.get("reasonToJoin"),

          support: formData.getAll("support"),
        },

        documents,
      };

      /* =====================================================
         SUBMIT REGISTRATION
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
          result.error || "Failed to submit registration."
        );
      }

      setSubmitted(true);
    } catch (err) {
      console.error("Registration submission error:", err);

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
              Your Optician Registration has been successfully
              submitted.
            </p>

            <p className="mt-3 leading-7 text-slate-600">
              Our team will verify your information.
              If documents were submitted, they will also be
              reviewed during verification.
            </p>

            <p className="mt-3 leading-7 text-slate-600">
              If you did not upload documents, our team may
              request them later if required.
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
            👓
          </div>

          <p className="mt-5 font-bold uppercase tracking-[0.18em] text-[#3426a8]">
            Spectwala Professional Network
          </p>

          <h1 className="mt-3 text-3xl font-black tracking-tight text-[#10152c] md:text-4xl">
            Optician Registration
          </h1>

          <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-600">
            Register as an Optician with Spectwala and become
            part of our professional eye-care network.
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
            title="Personal Information"
            description="Tell us about yourself."
          />

          <div className="grid gap-5 md:grid-cols-2">
            <Input
              name="fullName"
              label="Full Name"
              required
              placeholder="Enter your full name"
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

            <Select
              name="gender"
              label="Gender"
              options={[
                "Male",
                "Female",
                "Other",
              ]}
            />
          </div>
        </section>

        {/* SECTION 2 */}

        <section className="mb-7 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <SectionHeading
            number="02"
            title="Educational Qualification"
            description="Provide your optical education and qualification details."
          />

          <div className="grid gap-5 md:grid-cols-2">
            <Select
              name="highestQualification"
              label="Highest Qualification"
              required
              options={[
                "Diploma in Opticianry",
                "Diploma in Optical Dispensing",
                "Certificate in Opticianry",
                "B.Optom",
                "M.Optom",
                "Other",
              ]}
            />

            <Input
              name="collegeInstitute"
              label="College / Institute Name"
              required
              placeholder="Enter college or institute name"
            />

            <Select
              name="yearOfPassing"
              label="Year of Passing"
              required
              options={Array.from(
                { length: 40 },
                (_, i) =>
                  String(
                    new Date().getFullYear() - i
                  )
              )}
            />

            <Input
              name="certificateNumber"
              label="Certificate / Registration Number"
              placeholder="Enter certificate or registration number"
            />
          </div>
        </section>

        {/* SECTION 3 */}

        <section className="mb-7 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <SectionHeading
            number="03"
            title="Professional Information"
            description="Tell us about your optical experience and workplace."
          />

          <div className="grid gap-5 md:grid-cols-2">
            <Select
              name="professionalExperience"
              label="Total Professional Experience"
              required
              options={[
                "Fresher",
                "1–3 Years",
                "4–7 Years",
                "8–15 Years",
                "15+ Years",
              ]}
            />

            <Select
              name="workSetting"
              label="Current Work Setting"
              required
              options={[
                "Optical Store",
                "Eye Clinic",
                "Hospital",
                "Optical Laboratory",
                "Independent Practice",
                "Corporate",
                "Other",
              ]}
            />

            <div className="md:col-span-2">
              <Input
                name="workplaceName"
                label="Optical Store / Clinic / Workplace Name"
                placeholder="Enter workplace name"
              />
            </div>
          </div>
        </section>

        {/* SECTION 4 */}

        <section className="mb-7 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <SectionHeading
            number="04"
            title="Location Details"
            description="Where do you currently work or practice?"
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
              label="City / Town"
              required
              placeholder="Enter city or town"
            />

            <Input
              name="pinCode"
              label="PIN Code"
              required
              inputMode="numeric"
              placeholder="Enter PIN code"
            />

            <div className="md:col-span-2">
              <Textarea
                name="address"
                label="Full Address"
                required
                placeholder="Enter your complete professional address"
              />
            </div>
          </div>
        </section>

        {/* SECTION 5 */}

        <section className="mb-7 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <SectionHeading
            number="05"
            title="Optical Services"
            description="Select all services that you currently provide."
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
            title="Document Upload"
            description="Documents are optional. You can upload them now or provide them later if requested."
          />

          <div className="grid gap-5 md:grid-cols-2">

            <FileInput
              name="qualificationCertificate"
              label="Upload Qualification Certificate"
              accept=".pdf,.jpg,.jpeg,.png"
            />

            <FileInput
              name="professionalCertificate"
              label="Upload Professional Certificate"
              accept=".pdf,.jpg,.jpeg,.png"
            />

            <FileInput
              name="professionalId"
              label="Upload Professional ID"
              accept=".pdf,.jpg,.jpeg,.png"
            />

            <FileInput
              name="profilePhoto"
              label="Upload Profile Photo"
              accept=".jpg,.jpeg,.png"
            />

          </div>

          <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4">
            <p className="text-sm font-semibold text-blue-800">
              Documents are optional.
            </p>

            <p className="mt-1 text-sm leading-6 text-blue-700">
              You can submit your registration without uploading
              any documents. Our team may request the required
              documents later during verification.
            </p>
          </div>

          <p className="mt-4 text-xs text-slate-500">
            Accepted formats: PDF, JPG, JPEG and PNG.
          </p>
        </section>

        {/* SECTION 7 */}

        <section className="mb-7 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <SectionHeading
            number="07"
            title="Join Spectwala"
            description="Help us understand how we can support you."
          />

          <Textarea
            name="reasonToJoin"
            label="Why would you like to join Spectwala?"
            placeholder="Tell us why you would like to join Spectwala..."
          />

          <div className="mt-6">
            <label className="mb-3 block text-sm font-bold text-[#10152c]">
              What kind of support are you looking for from
              Spectwala?
            </label>

            <CheckboxGrid
              name="support"
              options={supportOptions}
            />
          </div>
        </section>

        {/* SECTION 8 */}

        <section className="mb-7 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <SectionHeading
            number="08"
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
              agree to Spectwala&apos;s{" "}
              <span className="font-bold text-[#3426a8]">
                Terms & Conditions
              </span>{" "}
              and authorize Spectwala to verify the information
              and documents submitted by me.
            </span>
          </label>
        </section>

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5">
            <p className="font-bold text-red-700">
              Registration could not be submitted
            </p>

            <p className="mt-1 text-sm text-red-600">
              {error}
            </p>
          </div>
        )}

        {/* SUBMIT */}

        <div className="rounded-3xl border border-[#dcd8ff] bg-[#f0efff] p-6 text-center md:p-8">
          <h2 className="text-xl font-black text-[#10152c]">
            Ready to join Spectwala?
          </h2>

          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
            Submit your registration. Documents are optional
            and can be provided later if required.
          </p>

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 rounded-xl bg-[#3426a8] px-10 py-4 text-base font-black text-white shadow-lg transition hover:bg-[#291d91] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting
              ? "Submitting..."
              : "Submit Registration →"}
          </button>

          {submitting && (
            <p className="mt-3 text-xs font-semibold text-slate-500">
              Please keep this page open while your registration
              is being submitted.
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
   OPTIONAL FILE INPUT
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
        required={false}
        accept={accept}
        className="block w-full cursor-pointer rounded-xl border border-slate-200 bg-white text-sm text-slate-600 file:mr-4 file:border-0 file:bg-[#f0efff] file:px-4 file:py-3 file:font-bold file:text-[#3426a8] hover:file:bg-[#e7e5ff]"
      />
    </div>
  );
}