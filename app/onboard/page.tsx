"use client";

import { useState, useRef } from "react";
import { submitAlumniProfile, AlumniProfile } from "@/lib/supabase";
import {
  User,
  GraduationCap,
  Briefcase,
  Heart,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Upload,
  Sparkles,
  Camera,
  AlertCircle,
  Loader2,
} from "lucide-react";

const STEPS = [
  { id: 1, label: "Personal", icon: User },
  { id: 2, label: "At Vedantu", icon: Sparkles },
  { id: 3, label: "Education", icon: GraduationCap },
  { id: 4, label: "Today", icon: Briefcase },
  { id: 5, label: "Mentorship", icon: Heart },
];

const FIELDS = [
  "Engineering",
  "Medicine",
  "Finance & MBA",
  "Civil Services",
  "Law",
  "Design & Arts",
  "Commerce",
  "Science Research",
  "Other",
];

const EXAMS = [
  "JEE Main",
  "JEE Advanced",
  "NEET",
  "CAT",
  "UPSC CSE",
  "CLAT",
  "CA Foundation/Intermediate/Final",
  "GMAT",
  "GRE",
  "NIFT/NID",
  "Other",
];

const SUBJECTS = [
  "Physics",
  "Chemistry",
  "Maths",
  "Biology",
  "English",
  "Social Science",
  "Economics",
  "Accountancy",
  "Business Studies",
];

const CLASSES = [
  "Class 6",
  "Class 7",
  "Class 8",
  "Class 9",
  "Class 10",
  "Class 11",
  "Class 12",
];

const SESSION_TAGS = [
  "Study Plan",
  "Exam Strategy",
  "College Guidance",
  "Career Advice",
  "Doubt Solving",
  "Mock Interviews",
  "Essay Writing",
  "Coding / DSA",
  "Research Guidance",
];

const REFERRAL = [
  "My Vedantu teacher",
  "WhatsApp / Social media",
  "Email from Vedantu",
  "A friend / alumni",
  "Other",
];

const EMPTY: AlumniProfile = {
  full_name: "",
  email: "",
  phone: "",
  vedantu_study_years: "",
  vedantu_classes: "",
  vedantu_subjects: [],
  college_name: "",
  degree: "",
  college_year_of_passing: undefined,
  current_company: "",
  current_designation: "",
  current_city: "",
  field: "",
  specialization: "",
  exam_cleared: "",
  rank_or_result: "",
  bio: "",
  linkedin_url: "",
  tags: [],
  available_for_mentoring: true,
  session_preference: "both",
  preferred_session_duration: 45,
  referral_source: "",
};

function ToggleChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
        active
          ? "bg-orange-500 text-white border-orange-500"
          : "border-gray-200 text-gray-600 hover:border-orange-300 hover:text-orange-500"
      }`}
    >
      {label}
    </button>
  );
}

function Field({
  label,
  required,
  children,
  hint,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label} {required && <span className="text-orange-500">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

const inputCls =
  "w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all";

export default function OnboardPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<AlumniProfile>(EMPTY);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (key: keyof AlumniProfile, val: unknown) =>
    setForm((f) => ({ ...f, [key]: val }));

  const toggleArray = (key: "vedantu_subjects" | "tags", val: string) => {
    const arr = (form[key] as string[]) ?? [];
    set(key, arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);
  };

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const validate = (): boolean => {
    if (step === 1 && (!form.full_name || !form.email)) return false;
    if (step === 2 && (!form.vedantu_study_years || !form.vedantu_classes)) return false;
    if (step === 3 && (!form.college_name || !form.degree)) return false;
    if (step === 4 && !form.field) return false;
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    const result = await submitAlumniProfile(form, photoFile ?? undefined);
    setSubmitting(false);
    if (result.success) {
      setSubmitted(true);
    } else {
      setError(result.error ?? "Something went wrong. Please try again.");
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#FFFAF7] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-orange-100 shadow-xl p-10 text-center">
          <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">
            You&apos;re in the list! 🎉
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            Thanks <strong>{form.full_name.split(" ")[0]}</strong>! Your profile
            is under review. Once approved, you&apos;ll appear on the AlumConnect
            mentor directory and we&apos;ll drop you an email.
          </p>
          <div className="bg-orange-50 rounded-2xl p-4 text-left border border-orange-100">
            <p className="text-xs font-bold text-orange-600 mb-2">
              What happens next
            </p>
            <ul className="text-xs text-gray-500 space-y-1.5">
              <li>✦ Vedantu team reviews your profile (1–2 days)</li>
              <li>✦ You get a confirmation email</li>
              <li>✦ Your profile goes live on AlumConnect</li>
              <li>✦ Learners start booking sessions with you</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFAF7] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-gray-900 text-lg">
              Vedantu AlumConnect
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-1">
            Join as a Mentor
          </h1>
          <p className="text-sm text-gray-500">
            Takes 3 minutes · Be the mentor you wish you had
          </p>
        </div>

        {/* Progress stepper */}
        <div className="flex items-center justify-between mb-8 px-2">
          {STEPS.map((s, i) => {
            const done = step > s.id;
            const active = step === s.id;
            return (
              <div key={s.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                      done
                        ? "bg-orange-500 text-white"
                        : active
                        ? "bg-orange-500 text-white ring-4 ring-orange-100"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {done ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <s.icon className="w-4 h-4" />
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-semibold mt-1 ${
                      active ? "text-orange-500" : "text-gray-400"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-px mx-2 mb-4 ${
                      done ? "bg-orange-300" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">

          {/* ── STEP 1: Personal Info ── */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900 mb-1">
                  Let&apos;s start with you
                </h2>
                <p className="text-sm text-gray-400">Basic personal details</p>
              </div>

              {/* Photo upload */}
              <div className="flex items-center gap-5">
                <div
                  onClick={() => fileRef.current?.click()}
                  className="w-20 h-20 rounded-2xl border-2 border-dashed border-orange-200 bg-orange-50 flex flex-col items-center justify-center cursor-pointer hover:border-orange-400 transition-all overflow-hidden relative"
                >
                  {photoPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={photoPreview}
                      alt="preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <>
                      <Camera className="w-5 h-5 text-orange-400 mb-1" />
                      <span className="text-[9px] text-orange-400 font-semibold">
                        Add Photo
                      </span>
                    </>
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">
                    Profile Photo
                  </p>
                  <p className="text-xs text-gray-400 mb-2">
                    JPG or PNG, max 2MB. This shows on your mentor card.
                  </p>
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="text-xs font-semibold text-orange-500 bg-orange-50 px-3 py-1.5 rounded-lg hover:bg-orange-100 transition-all flex items-center gap-1.5"
                  >
                    <Upload className="w-3 h-3" /> Upload
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhoto}
                  />
                </div>
              </div>

              <Field label="Full Name" required>
                <input
                  className={inputCls}
                  placeholder="Arjun Sharma"
                  value={form.full_name}
                  onChange={(e) => set("full_name", e.target.value)}
                />
              </Field>
              <Field label="Email Address" required hint="We'll send your approval confirmation here">
                <input
                  className={inputCls}
                  type="email"
                  placeholder="arjun@gmail.com"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                />
              </Field>
              <Field label="Phone Number" hint="Optional — for WhatsApp reminders">
                <input
                  className={inputCls}
                  placeholder="+91 98765 43210"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                />
              </Field>
              <Field label="LinkedIn URL" hint="Optional but strongly recommended">
                <input
                  className={inputCls}
                  placeholder="https://linkedin.com/in/arjunsharma"
                  value={form.linkedin_url}
                  onChange={(e) => set("linkedin_url", e.target.value)}
                />
              </Field>
              <Field label="How did you hear about AlumConnect?">
                <select
                  className={inputCls}
                  value={form.referral_source}
                  onChange={(e) => set("referral_source", e.target.value)}
                >
                  <option value="">Select one</option>
                  {REFERRAL.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </Field>
            </div>
          )}

          {/* ── STEP 2: Vedantu Journey ── */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900 mb-1">
                  Your Vedantu journey
                </h2>
                <p className="text-sm text-gray-400">
                  Tell us when and how you used Vedantu
                </p>
              </div>
              <Field
                label="Years on Vedantu"
                required
                hint='e.g. "2015–2018" or "2019–2020"'
              >
                <input
                  className={inputCls}
                  placeholder="2015–2018"
                  value={form.vedantu_study_years}
                  onChange={(e) => set("vedantu_study_years", e.target.value)}
                />
              </Field>
              <Field
                label="Which classes?"
                required
                hint="Select all that apply"
              >
                <div className="flex flex-wrap gap-2 mt-1">
                  {CLASSES.map((c) => (
                    <ToggleChip
                      key={c}
                      label={c}
                      active={form.vedantu_classes.includes(c)}
                      onClick={() => {
                        const arr = form.vedantu_classes
                          ? form.vedantu_classes
                              .split(", ")
                              .filter(Boolean)
                          : [];
                        const updated = arr.includes(c)
                          ? arr.filter((v) => v !== c)
                          : [...arr, c];
                        set("vedantu_classes", updated.join(", "));
                      }}
                    />
                  ))}
                </div>
              </Field>
              <Field
                label="Subjects you studied on Vedantu"
                hint="Select all that apply"
              >
                <div className="flex flex-wrap gap-2 mt-1">
                  {SUBJECTS.map((s) => (
                    <ToggleChip
                      key={s}
                      label={s}
                      active={(form.vedantu_subjects ?? []).includes(s)}
                      onClick={() => toggleArray("vedantu_subjects", s)}
                    />
                  ))}
                </div>
              </Field>
              <Field label="Exam you cracked">
                <select
                  className={inputCls}
                  value={form.exam_cleared}
                  onChange={(e) => set("exam_cleared", e.target.value)}
                >
                  <option value="">Select exam</option>
                  {EXAMS.map((e) => (
                    <option key={e}>{e}</option>
                  ))}
                </select>
              </Field>
              <Field
                label="Your rank / result"
                hint='e.g. "AIR 89", "720/720", "99.2 Percentile", "AIR 34"'
              >
                <input
                  className={inputCls}
                  placeholder="AIR 89"
                  value={form.rank_or_result}
                  onChange={(e) => set("rank_or_result", e.target.value)}
                />
              </Field>
            </div>
          )}

          {/* ── STEP 3: College & Education ── */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900 mb-1">
                  Education
                </h2>
                <p className="text-sm text-gray-400">
                  Where did you go after cracking it?
                </p>
              </div>
              <Field label="College / University" required>
                <input
                  className={inputCls}
                  placeholder="IIT Bombay / AIIMS Delhi / SRCC"
                  value={form.college_name}
                  onChange={(e) => set("college_name", e.target.value)}
                />
              </Field>
              <Field label="Degree / Programme" required>
                <input
                  className={inputCls}
                  placeholder="B.Tech Computer Science / MBBS / B.Com (H)"
                  value={form.degree}
                  onChange={(e) => set("degree", e.target.value)}
                />
              </Field>
              <Field label="Year of passing / graduation">
                <input
                  className={inputCls}
                  type="number"
                  placeholder="2022"
                  value={form.college_year_of_passing ?? ""}
                  onChange={(e) =>
                    set(
                      "college_year_of_passing",
                      e.target.value ? parseInt(e.target.value) : undefined
                    )
                  }
                />
              </Field>
            </div>
          )}

          {/* ── STEP 4: Current Status ── */}
          {step === 4 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900 mb-1">
                  Where are you now?
                </h2>
                <p className="text-sm text-gray-400">
                  Your current professional status
                </p>
              </div>
              <Field label="Career Field" required>
                <div className="flex flex-wrap gap-2 mt-1">
                  {FIELDS.map((f) => (
                    <ToggleChip
                      key={f}
                      label={f}
                      active={form.field === f}
                      onClick={() => set("field", f)}
                    />
                  ))}
                </div>
              </Field>
              <Field label="Current Role / Designation">
                <input
                  className={inputCls}
                  placeholder="Software Engineer / Resident Doctor / IAS Officer"
                  value={form.current_designation}
                  onChange={(e) => set("current_designation", e.target.value)}
                />
              </Field>
              <Field label="Current Company / Organisation">
                <input
                  className={inputCls}
                  placeholder="Google / AIIMS Delhi / Maharashtra Govt."
                  value={form.current_company}
                  onChange={(e) => set("current_company", e.target.value)}
                />
              </Field>
              <Field label="Current City">
                <input
                  className={inputCls}
                  placeholder="Bengaluru / Delhi / Mumbai"
                  value={form.current_city}
                  onChange={(e) => set("current_city", e.target.value)}
                />
              </Field>
              <Field
                label="Specialization"
                hint='e.g. "Machine Learning", "Cardiology", "Constitutional Law"'
              >
                <input
                  className={inputCls}
                  placeholder="Machine Learning / Constitutional Law"
                  value={form.specialization}
                  onChange={(e) => set("specialization", e.target.value)}
                />
              </Field>
              <Field
                label="Short bio"
                hint="2–3 lines about yourself and your journey. This appears on your mentor card."
              >
                <textarea
                  className={`${inputCls} resize-none`}
                  rows={3}
                  maxLength={280}
                  placeholder="IIT-B CS grad. Cracked JEE AIR 89. Now at Google. Happy to guide future engineers."
                  value={form.bio}
                  onChange={(e) => set("bio", e.target.value)}
                />
                <p className="text-[10px] text-gray-400 text-right">
                  {(form.bio ?? "").length}/280
                </p>
              </Field>
            </div>
          )}

          {/* ── STEP 5: Mentorship Preferences ── */}
          {step === 5 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900 mb-1">
                  Mentorship setup
                </h2>
                <p className="text-sm text-gray-400">
                  How would you like to help learners?
                </p>
              </div>
              <Field label="Available for mentoring?">
                <div className="flex gap-3">
                  {[
                    { val: true, label: "Yes — I'm ready" },
                    { val: false, label: "Not yet, just registering" },
                  ].map((opt) => (
                    <button
                      key={String(opt.val)}
                      type="button"
                      onClick={() => set("available_for_mentoring", opt.val)}
                      className={`flex-1 py-3 rounded-xl text-sm font-semibold border transition-all ${
                        form.available_for_mentoring === opt.val
                          ? "bg-orange-500 text-white border-orange-500"
                          : "border-gray-200 text-gray-600 hover:border-orange-300"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Session preference">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { val: "1on1", label: "1-on-1 only" },
                    { val: "group", label: "Group / Webinar" },
                    { val: "both", label: "Both" },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => set("session_preference", opt.val)}
                      className={`py-3 rounded-xl text-xs font-semibold border text-center transition-all ${
                        form.session_preference === opt.val
                          ? "bg-orange-500 text-white border-orange-500"
                          : "border-gray-200 text-gray-600 hover:border-orange-300"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Preferred session duration">
                <div className="flex gap-3">
                  {[30, 45, 60].map((min) => (
                    <button
                      key={min}
                      type="button"
                      onClick={() => set("preferred_session_duration", min)}
                      className={`flex-1 py-3 rounded-xl text-sm font-semibold border transition-all ${
                        form.preferred_session_duration === min
                          ? "bg-orange-500 text-white border-orange-500"
                          : "border-gray-200 text-gray-600 hover:border-orange-300"
                      }`}
                    >
                      {min} min
                    </button>
                  ))}
                </div>
              </Field>
              <Field
                label="Areas you can help with"
                hint="Select all you're comfortable mentoring on"
              >
                <div className="flex flex-wrap gap-2 mt-1">
                  {SESSION_TAGS.map((t) => (
                    <ToggleChip
                      key={t}
                      label={t}
                      active={(form.tags ?? []).includes(t)}
                      onClick={() => toggleArray("tags", t)}
                    />
                  ))}
                </div>
              </Field>

              {/* Review summary */}
              <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100 mt-4">
                <p className="text-xs font-bold text-orange-600 mb-2">
                  Review before submitting
                </p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600">
                  <span className="text-gray-400">Name</span>
                  <span className="font-medium truncate">{form.full_name}</span>
                  <span className="text-gray-400">Email</span>
                  <span className="font-medium truncate">{form.email}</span>
                  <span className="text-gray-400">College</span>
                  <span className="font-medium truncate">{form.college_name}</span>
                  <span className="text-gray-400">Field</span>
                  <span className="font-medium truncate">{form.field}</span>
                  <span className="text-gray-400">Exam</span>
                  <span className="font-medium truncate">{form.exam_cleared} {form.rank_or_result}</span>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-4">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-50">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="flex items-center gap-2 px-5 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:border-orange-300 hover:text-orange-500 transition-all"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            ) : (
              <div />
            )}

            {step < 5 ? (
              <button
                type="button"
                disabled={!validate()}
                onClick={() => setStep((s) => s + 1)}
                className="flex items-center gap-2 btn-orange px-6 py-3 rounded-xl text-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 btn-orange px-8 py-3 rounded-xl text-sm disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" /> Submit Profile
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          By submitting, you agree to Vedantu&apos;s{" "}
          <span className="text-orange-500 cursor-pointer">Terms of Use</span>{" "}
          and{" "}
          <span className="text-orange-500 cursor-pointer">Privacy Policy</span>
        </p>
      </div>
    </div>
  );
}
