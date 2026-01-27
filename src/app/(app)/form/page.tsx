"use client";

import { FormEvent, useState } from "react";

type SubmitStatus = "idle" | "submitting" | "success" | "error";

export default function FormPage() {
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [message, setMessage] = useState<string>("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("submitting");
    setMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setStatus("error");
        setMessage(data?.error ?? "Something went wrong. Try again.");
        return;
      }

      form.reset();
      setStatus("success");
      setMessage("Thanks! Your form was submitted.");
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-gray-900">Contact Form</h1>
        <p className="text-sm text-gray-600">
          Fields marked with <span className="text-red-600">*</span> are
          required.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
      >
        <section className="space-y-4">
          <label className="block text-sm font-medium text-gray-800">
            Your name <span className="text-red-600">*</span>
          </label>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <input
              name="firstName"
              required
              placeholder="First name"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            <input
              name="lastName"
              required
              placeholder="Last name"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        </section>

        <section className="space-y-2">
          <label className="block text-sm font-medium text-gray-800">
            Email address <span className="text-red-600">*</span>
          </label>
          <input
            name="email"
            type="email"
            required
            placeholder="name@example.com"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </section>

        <section className="space-y-2">
          <label className="block text-sm font-medium text-gray-800">
            Phone number <span className="text-red-600">*</span>
          </label>
          <div className="flex flex-col gap-3 md:flex-row">
            <select
              name="phoneType"
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm md:w-40"
              defaultValue="Mobile"
            >
              <option>Mobile</option>
              <option>Home</option>
              <option>Work</option>
            </select>
            <input
              name="phoneNumber"
              required
              placeholder="(555) 555-5555"
              type="tel"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        </section>

        <section className="space-y-2">
          <label className="block text-sm font-medium text-gray-800">
            Do we have your consent to send texts to you?{" "}
            <span className="text-red-600">*</span>
          </label>
          <select
            name="consentToText"
            required
            defaultValue=""
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="" disabled>
              Select...
            </option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </section>

        <section className="space-y-2">
          <label className="block text-sm font-medium text-gray-800">
            Birthdate <span className="text-red-600">*</span>
          </label>
          <input
            name="birthdate"
            type="date"
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </section>

        <section className="space-y-2">
          <label className="block text-sm font-medium text-gray-800">
            How can we help? <span className="text-red-600">*</span>
          </label>
          <select
            name="helpTopic"
            required
            defaultValue=""
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="" disabled>
              Select...
            </option>
            <option>General inquiry</option>
            <option>Prayer request</option>
            <option>Volunteer</option>
            <option>Small groups</option>
            <option>Other</option>
          </select>
        </section>

        <section className="space-y-2">
          <label className="block text-sm font-medium text-gray-800">
            Primary Campus <span className="text-red-600">*</span>
          </label>
          <select
            name="primaryCampus"
            required
            defaultValue=""
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="" disabled>
              Select...
            </option>
            <option>Main</option>
            <option>East</option>
            <option>West</option>
            <option>South</option>
            <option>North</option>
            <option>Online</option>
          </select>
        </section>

        <section className="space-y-2">
          <label className="block text-sm font-medium text-gray-800">
            Are you a regular attender?{" "}
            <span className="text-red-600">*</span>
          </label>
          <select
            name="regularAttender"
            required
            defaultValue=""
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="" disabled>
              Select...
            </option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </section>

        <section className="space-y-2">
          <label className="block text-sm font-medium text-gray-800">
            Additional Details
          </label>
          <p className="text-xs text-gray-500">
            Please provide any details that may be helpful for follow-up.
          </p>
          <textarea
            name="additionalDetails"
            rows={5}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </section>

        <div className="flex flex-col gap-2">
          <button
            type="submit"
            disabled={status === "submitting"}
            className="inline-flex items-center justify-center rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "submitting" ? "Submitting..." : "Submit"}
          </button>
          {status !== "idle" && (
            <p
              className={`text-sm ${
                status === "success" ? "text-green-600" : "text-red-600"
              }`}
            >
              {message}
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
