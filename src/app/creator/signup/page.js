"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  Globe2,
  Lock,
  Mail,
  MapPin,
  Plus,
  Sparkles,
  Trash2,
  Upload,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { getIn, setIn, useFormik } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { theme } from "@/theme";
import { apiWithoutAuth } from "@/lib/apiService";
import { API_ENDPOINTS } from "@/lib/apiEndpoints";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const languageOptions = [
  "English",
  "Spanish",
  "French",
  "German",
  "Hindi",
  "Arabic",
  "Mandarin",
  "Portuguese",
];

const PLATFORM_SERVICES = {
  instagram: [
    "Instagram Post",
    "Instagram Story",
    "Instagram Reel",
    "Instagram Shoutout",
  ],
  tiktok: ["TikTok Video", "TikTok Live Shoutout"],
  youtube: ["YouTube Video", "YouTube Short", "YouTube Link/Shoutout"],
  twitter: ["Tweet", "Retweet", "X/Twitter Thread"],
  facebook: ["Facebook Post", "Facebook Story", "Facebook Video"],
  snapchat: ["Snapchat Story", "Snapchat Spotlight"],
  pinterest: ["Pinterest Pin", "Pinterest Board Placement"],
  linkedin: ["LinkedIn Post", "LinkedIn Shoutout"],
};

const steps = [
  { title: "Email" },
  { title: "Password" },
  { title: "Location" },
  { title: "Creator title" },
  { title: "About you" },
  { title: "Identity & language" },
  { title: "Social platforms" },
  { title: "Content categories" },
  { title: "Portfolio" },
  { title: "Service packages" },
];

const inputBase =
  "block w-full rounded-xl border border-gray-200 bg-white py-3 px-3 text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 sm:text-sm transition-all";

const baseSocialSchema = Yup.object({
  platform: Yup.string().required("Platform is required"),
  username: Yup.string().required("Username is required"),
  followers: Yup.number()
    .transform((value, originalValue) =>
      originalValue === "" ? undefined : value,
    )
    .typeError("Followers must be a number")
    .integer("Followers must be a whole number")
    .min(0, "Followers cannot be negative")
    .required("Followers are required"),
});

const baseServiceSchema = Yup.object({
  platformKey: Yup.string().required("Platform is required"),
  serviceType: Yup.string().required("Service type is required"),
  quantity: Yup.number()
    .transform((value, originalValue) =>
      originalValue === "" ? undefined : value,
    )
    .typeError("Quantity must be a number")
    .integer("Quantity must be a whole number")
    .min(1, "Quantity must be at least 1")
    .required("Quantity is required"),
  price: Yup.number()
    .transform((value, originalValue) =>
      originalValue === "" ? undefined : value,
    )
    .typeError("Price must be a valid number")
    .min(0, "Price cannot be negative")
    .required("Price is required"),
  description: Yup.string().required("Description is required"),
});

const stepSchemas = [
  Yup.object({
    email: Yup.string()
      .email("Enter a valid email")
      .required("Email is required"),
  }),
  Yup.object({
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password")], "Passwords must match")
      .required("Confirm password is required"),
  }),
  Yup.object({
    location: Yup.object({
      address: Yup.string().required("Address is required"),
      city: Yup.string().required("City is required"),
      state: Yup.string().required("State is required"),
      country: Yup.string().required("Country is required"),
    }),
  }),
  Yup.object({
    creatorTitle: Yup.string()
      .min(4, "Title is too short")
      .required("Title is required"),
  }),
  Yup.object({
    bio: Yup.string()
      .min(20, "Please add more detail")
      .required("Bio is required"),
  }),
  Yup.object({
    gender: Yup.string().required("Gender is required"),
    ethnicity: Yup.string().required("Ethnicity is required"),
    languages: Yup.array()
      .of(Yup.string())
      .min(1, "Select at least one language"),
  }),
  Yup.object({
    socialAccounts: Yup.array()
      .of(baseSocialSchema)
      .min(1, "Add at least one platform"),
  }),
  Yup.object({
    contentCategories: Yup.array()
      .of(Yup.string())
      .min(1, "Select at least one category"),
  }),
  Yup.object({
    portfolio: Yup.array()
      .of(Yup.mixed())
      .max(12, "You can upload up to 12 files"),
  }),
  Yup.object({
    services: Yup.array()
      .of(baseServiceSchema)
      .min(1, "Add at least one service package"),
  }),
];

const fullSchema = Yup.object({
  email: Yup.string()
    .email("Enter a valid email")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Confirm password is required"),
  location: Yup.object({
    address: Yup.string().required("Address is required"),
    city: Yup.string().required("City is required"),
    state: Yup.string().required("State is required"),
    country: Yup.string().required("Country is required"),
  }),
  creatorTitle: Yup.string()
    .min(4, "Title is too short")
    .required("Title is required"),
  bio: Yup.string()
    .min(20, "Please add more detail")
    .required("Bio is required"),
  gender: Yup.string().required("Gender is required"),
  ethnicity: Yup.string().required("Ethnicity is required"),
  languages: Yup.array()
    .of(Yup.string())
    .min(1, "Select at least one language"),
  socialAccounts: Yup.array()
    .of(baseSocialSchema)
    .min(1, "Add at least one platform"),
  contentCategories: Yup.array()
    .of(Yup.string())
    .min(1, "Select at least one category"),
  portfolio: Yup.array()
    .of(Yup.mixed())
    .max(12, "You can upload up to 12 files"),
  services: Yup.array()
    .of(baseServiceSchema)
    .min(1, "Add at least one service package"),
});

const stepRoots = [
  ["email"],
  ["password", "confirmPassword"],
  ["location"],
  ["creatorTitle"],
  ["bio"],
  ["gender", "ethnicity", "languages"],
  ["socialAccounts"],
  ["contentCategories"],
  ["portfolio"],
  ["services"],
];

function toFormikErrors(yupError) {
  if (!yupError || !yupError.inner) return {};
  let errors = {};
  yupError.inner.forEach((err) => {
    if (err.path && !getIn(errors, err.path)) {
      errors = setIn(errors, err.path, err.message);
    }
  });
  return errors;
}

function touchedFromErrors(errors) {
  if (Array.isArray(errors)) return errors.map((v) => touchedFromErrors(v));
  if (errors && typeof errors === "object") {
    return Object.keys(errors).reduce((acc, key) => {
      acc[key] = touchedFromErrors(errors[key]);
      return acc;
    }, {});
  }
  return true;
}

function pickErrorsForStep(errors, stepIndex) {
  return stepRoots[stepIndex].reduce((acc, rootPath) => {
    const rootError = getIn(errors, rootPath);
    if (rootError !== undefined) return setIn(acc, rootPath, rootError);
    return acc;
  }, {});
}

function stepFromErrorPath(path) {
  if (!path) return 0;
  const root = path.split(".")[0].split("[")[0];
  const found = stepRoots.findIndex((roots) => roots.includes(root));
  return found === -1 ? 0 : found;
}

function FieldError({ formik, name }) {
  const error = getIn(formik.errors, name);
  const touched = getIn(formik.touched, name);
  if (!touched || !error || typeof error !== "string") return null;
  return <p className="mt-1 text-xs text-red-600">{error}</p>;
}

function StepShell({ children }) {
  return (
    <div className="rounded-2xl bg-white p-4 sm:p-6 shadow-lg ring-1 ring-gray-100">
      {children}
    </div>
  );
}

function normalizePlatformKey(platform) {
  if (!platform) return "";
  const normalized = platform.toLowerCase().trim();
  if (normalized.includes("twitter") || normalized.includes("x"))
    return "twitter";
  return normalized.replace(/[^a-z0-9]+/g, "");
}

function buildUserName(email) {
  const localPart = (email || "").split("@")[0] || "creator";
  const candidate = localPart
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
  return candidate || "Creator";
}

export default function CreatorSignupPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [socialPlatformOptions, setSocialPlatformOptions] = useState([
    { name: "Instagram", key: "instagram" },
    { name: "TikTok", key: "tiktok" },
    { name: "YouTube", key: "youtube" },
    { name: "Twitter / X", key: "twitter" },
    { name: "Facebook", key: "facebook" },
    { name: "Snapchat", key: "snapchat" },
    { name: "Pinterest", key: "pinterest" },
    { name: "LinkedIn", key: "linkedin" },
  ]);

  const [contentCategoryOptions, setContentCategoryOptions] = useState([]);
  const [dynamicServices, setDynamicServices] = useState({}); // Stores services by platform key/ID

  const getPlatformName = (platformId) => {
    if (!platformId) return "";
    const platform = socialPlatformOptions.find(
      (p) =>
        String(p.id) === String(platformId) ||
        String(p.key) === String(platformId),
    );
    return platform ? platform.name : platformId;
  };

  const getServiceTypeName = (platformId, serviceId) => {
    if (!serviceId) return "";
    const list = dynamicServices[platformId] || [];
    const service = list.find(
      (s) =>
        (typeof s === "object" &&
          (String(s._id) === String(serviceId) ||
            String(s.id) === String(serviceId))) ||
        (typeof s === "string" && s === serviceId),
    );
    if (typeof service === "object")
      return service.name || service.title || serviceId;
    return service || serviceId;
  };

  const fetchServicesForPlatform = async (platformId) => {
    if (!platformId || dynamicServices[platformId]) return;
    try {
      const response = await apiWithoutAuth.get(
        `${API_ENDPOINTS.SERVICE.LIST}/${platformId}`,
      );
      const data = response?.data?.data || response?.data || [];
      if (Array.isArray(data)) {
        setDynamicServices((prev) => ({ ...prev, [platformId]: data }));
      }
    } catch (err) {
      console.error(`Failed to fetch services for ${platformId}`, err);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("authToken");
      if (token) {
        // You might want to decode the token here to check the role
        // For now, redirecting to creator dashboard as requested
        router.push("/creator/dashboard");
      }
    }
  }, [router]);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      confirmPassword: "",
      location: { address: "", city: "", state: "", country: "" },
      creatorTitle: "",
      bio: "",
      gender: "Female",
      ethnicity: "",
      languages: [],
      socialAccounts: [{ platform: "instagram", username: "", followers: "" }],
      contentCategories: [],
      portfolio: [],
      services: [
        {
          platformKey: "instagram",
          serviceType: "",
          quantity: "1",
          price: "",
          description: "",
        },
      ],
    },
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: async (values, helpers) => {
      try {
        // 1. Validate the current (last) step first so errors stay on this step
        try {
          await stepSchemas[steps.length - 1].validate(values, {
            abortEarly: false,
          });
        } catch (stepErr) {
          const stepErrors = toFormikErrors(stepErr);
          const filtered = pickErrorsForStep(stepErrors, steps.length - 1);
          // Only set errors/touched for this step's fields — don't merge
          // with existing state so untouched fields on this step show errors
          // without leaking stale touched state from other steps.
          helpers.setErrors(filtered);
          helpers.setTouched(touchedFromErrors(filtered), false);
          return; // stay on the current step
        }

        // 2. Full schema validation across all steps
        await fullSchema.validate(values, { abortEarly: false });

        const primaryService = values.services[0];
        const primarySocial =
          values.socialAccounts.find(
            (sa) => sa.platform === primaryService?.platformKey,
          ) || values.socialAccounts[0];

        const payload = {
          userName: buildUserName(values.email),
          email: values.email,
          password: values.password,
          role: "creator",
          location: {
            address: values.location.address,
            city: values.location.city,
            state: values.location.state,
            country: values.location.country,
          },
          title: values.creatorTitle,
          bio: values.bio,
          gender: String(values.gender || "").toLowerCase(),
          ethnicity: values.ethnicity,
          languages: values.languages,
          category: values.contentCategories.map((catId) => {
            const catObj = contentCategoryOptions.find((c) => c.id === catId);
            return catObj ? catObj.name : catId;
          }),
          social: {
            platformKey: getPlatformName(primarySocial?.platform),
            handle: primarySocial?.username || "",
            followers: Number(primarySocial?.followers || 0),
          },
          service: {
            platformKey: getPlatformName(
              primaryService?.platformKey || primarySocial?.platform,
            ),
            serviceType: getServiceTypeName(
              primaryService?.platformKey || primarySocial?.platform,
              primaryService?.serviceType,
            ),
            quantity: Number(primaryService?.quantity || 0),
            price: Number(primaryService?.price || 0),
            description: primaryService?.description || "",
          },
        };

        const response = await apiWithoutAuth.post(
          API_ENDPOINTS.USER.REGISTER,
          payload,
        );
        const message =
          response?.data?.message || "Creator account registered successfully";
        toast.success(message);

        // Store token and redirect
        const token = response?.data?.data?.token;
        if (token && typeof window !== "undefined") {
          localStorage.setItem("authToken", token);
        }

        if (values.socialAccounts.length > 1 || values.services.length > 1) {
          toast.warning(
            "API currently accepts one social and one service. First entries were submitted.",
          );
        }

        router.push("/creator/dashboard");
      } catch (err) {
        if (err?.name === "ValidationError") {
          const nextErrors = toFormikErrors(err);
          const firstPath = err?.inner?.[0]?.path;
          const errorStep = stepFromErrorPath(firstPath);
          // Only set errors/touched for the step we're navigating to,
          // so other steps don't show premature validation messages.
          const errorStepErrors = pickErrorsForStep(nextErrors, errorStep);
          helpers.setErrors(errorStepErrors);
          helpers.setTouched(touchedFromErrors(errorStepErrors), false);
          toast.error(
            `Please complete step ${errorStep + 1}: ${steps[errorStep]?.title}`,
          );
          setCurrentStep(errorStep);
          return;
        }
        const apiMessage =
          err?.response?.data?.message ||
          "Unable to register creator. Please try again.";
        toast.error(apiMessage);
      }
    },
  });

  useEffect(() => {
    const fetchPlatforms = async () => {
      try {
        const response = await apiWithoutAuth.get(API_ENDPOINTS.PLATFORM.LIST);
        const data = response?.data?.data || response?.data || [];
        if (Array.isArray(data) && data.length > 0) {
          const formattedOptions = data.map((p) =>
            typeof p === "string"
              ? { name: p, key: p, id: p }
              : {
                  name:
                    p.name || p.title || p.platformName || p.id || String(p),
                  key:
                    p.key || p.name?.toLowerCase() || String(p).toLowerCase(),
                  id: p._id || p.id || p.key || String(p),
                },
          );
          setSocialPlatformOptions(formattedOptions);

          // Apply top option as default if the user hasn't overridden the fallback "instagram"
          const firstOptId = formattedOptions[0].id;
          const currentAccounts = formik.values.socialAccounts;

          if (
            currentAccounts.length > 0 &&
            currentAccounts[0].platform === "instagram" &&
            firstOptId !== "instagram" &&
            !getIn(formik.touched, "socialAccounts.0.platform")
          ) {
            formik.setFieldValue("socialAccounts.0.platform", firstOptId);
            // Also update the first service row to stay in sync
            if (formik.values.services[0].platformKey === "instagram") {
              formik.setFieldValue("services.0.platformKey", firstOptId);
            }
            // Fetch services for the now-dynamic platform ID
            fetchServicesForPlatform(firstOptId);
          }
        }
      } catch (err) {
        console.error("Failed to load platforms", err);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await apiWithoutAuth.get(API_ENDPOINTS.CATEGORY.LIST);
        const data = response?.data?.data || response?.data || [];
        if (Array.isArray(data) && data.length > 0) {
          const formattedOptions = data.map((c) => ({
            id: c._id,
            name: c.name,
          }));
          setContentCategoryOptions(formattedOptions);
        }
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    };

    // safe because formik updates don't break simple mount effects
    fetchPlatforms();
    fetchCategories();
  }, []);

  const progress = useMemo(
    () => Math.round(((currentStep + 1) / steps.length) * 100),
    [currentStep],
  );
  const hasFieldError = (name) =>
    Boolean(getIn(formik.touched, name) && getIn(formik.errors, name));
  const getFieldClass = (name, extra = "") =>
    `${inputBase} ${
      hasFieldError(name)
        ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
        : ""
    } ${extra}`.trim();

  const toggleSelection = (listName, value) => {
    const set = new Set(formik.values[listName]);
    set.has(value) ? set.delete(value) : set.add(value);
    formik.setFieldValue(listName, Array.from(set));
  };

  const addSocialAccount = () => {
    formik.setFieldValue("socialAccounts", [
      ...formik.values.socialAccounts,
      {
        platform: socialPlatformOptions[0]?.id || "instagram",
        username: "",
        followers: "",
      },
    ]);
  };

  const removeSocialAccount = (index) => {
    formik.setFieldValue(
      "socialAccounts",
      formik.values.socialAccounts.filter((_, i) => i !== index),
    );
  };

  const addService = () => {
    const firstPlatform = formik.values.socialAccounts[0]?.platform || "";
    formik.setFieldValue("services", [
      ...formik.values.services,
      {
        platformKey: firstPlatform,
        serviceType: "",
        quantity: "1",
        price: "",
        description: "",
      },
    ]);
    if (firstPlatform) {
      fetchServicesForPlatform(firstPlatform);
    }
  };

  const removeService = (index) => {
    formik.setFieldValue(
      "services",
      formik.values.services.filter((_, i) => i !== index),
    );
  };

  const handlePortfolioChange = (files) => {
    const combined = [
      ...formik.values.portfolio,
      ...Array.from(files || []),
    ].slice(0, 12);
    formik.setFieldValue("portfolio", combined);
  };

  const nextStep = async () => {
    try {
      await stepSchemas[currentStep].validate(formik.values, {
        abortEarly: false,
      });

      // If it's the first step (email), check if it exists in the database
      if (currentStep === 0) {
        setIsCheckingEmail(true);
        try {
          const checkRes = await apiWithoutAuth.post(API_ENDPOINTS.USER.CHECK_EMAIL, {
            email: formik.values.email,
          });
          
          // Assuming the API returns 200/201 if email is available
          // If the API returns success even if registered, we should check its body.
          // Usually, if it points out availability, it might return { available: true } or similar.
          // For now, we assume a "not success" response (like 400/409) handles the error case.
        } catch (err) {
          const apiMessage = err?.response?.data?.message || "Email is already registered";
          formik.setFieldError("email", apiMessage);
          formik.setFieldTouched("email", true);
          toast.error(apiMessage);
          return; // Stay on the current step
        } finally {
          setIsCheckingEmail(false);
        }
      }

      // Clear errors & touched state for ALL FUTURE steps
      // so untouched fields don't show validation messages.
      const nextStepIndex = Math.min(currentStep + 1, steps.length - 1);
      const cleanErrors = { ...formik.errors };
      const cleanTouched = { ...formik.touched };
      for (let i = currentStep + 1; i < steps.length; i++) {
        stepRoots[i].forEach((root) => {
          delete cleanErrors[root];
          delete cleanTouched[root];
        });
      }
      formik.setErrors(cleanErrors);
      formik.setTouched(cleanTouched, false);

      setCurrentStep(nextStepIndex);
    } catch (err) {
      const nextErrors = toFormikErrors(err);
      const stepErrors = pickErrorsForStep(nextErrors, currentStep);

      // Clear errors for ALL steps except the current one to prevent
      // stale errors from surfacing prematurely.
      const cleanErrors = {};
      const cleanTouched = {};

      formik.setErrors({ ...cleanErrors, ...stepErrors });
      formik.setTouched(
        { ...cleanTouched, ...touchedFromErrors(stepErrors) },
        false,
      );
    }
  };

  const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 0));

  const renderStep = (stepIndex) => {
    switch (stepIndex) {
      case 0:
        return (
          <StepShell>
            <label className="block text-sm font-semibold text-gray-800">
              Email address
            </label>
            <div className="relative mt-2">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                name="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={getFieldClass("email", "pl-10")}
                placeholder="creator@email.com"
              />
            </div>
            <FieldError formik={formik} name="email" />
          </StepShell>
        );
      case 1:
        return (
          <StepShell>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-gray-800">
                  Password
                </label>
                <div className="relative mt-2">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={getFieldClass("password", "pl-10 pr-10")}
                    placeholder="At least 6 characters"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-500 focus:outline-none"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" aria-hidden="true" />
                      ) : (
                        <Eye className="h-5 w-5" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>
                <FieldError formik={formik} name="password" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800">
                  Confirm password
                </label>
                <div className="relative mt-2">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formik.values.confirmPassword}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={getFieldClass("confirmPassword", "pl-10 pr-10")}
                    placeholder="Repeat password"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="text-gray-400 hover:text-gray-500 focus:outline-none"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" aria-hidden="true" />
                      ) : (
                        <Eye className="h-5 w-5" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>
                <FieldError formik={formik} name="confirmPassword" />
              </div>
            </div>
          </StepShell>
        );
      case 2:
        return (
          <StepShell>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-800">
                  Street address
                </label>
                <input
                  className={getFieldClass("location.address")}
                  name="location.address"
                  value={formik.values.location.address}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="123 Creator Lane"
                />
                <FieldError formik={formik} name="location.address" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800">
                  City
                </label>
                <input
                  className={getFieldClass("location.city")}
                  name="location.city"
                  value={formik.values.location.city}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Los Angeles"
                />
                <FieldError formik={formik} name="location.city" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800">
                  State / Province
                </label>
                <input
                  className={getFieldClass("location.state")}
                  name="location.state"
                  value={formik.values.location.state}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="CA"
                />
                <FieldError formik={formik} name="location.state" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800">
                  Country
                </label>
                <div className="relative mt-2 sm:mt-0">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Globe2 className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    className={getFieldClass("location.country", "pl-10")}
                    name="location.country"
                    value={formik.values.location.country}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="United States"
                  />
                </div>
                <FieldError formik={formik} name="location.country" />
              </div>
              <div className="flex items-start gap-3 sm:col-span-2 text-xs text-gray-500">
                <MapPin className="mt-0.5 h-4 w-4 text-purple-500" />
                <span>We show city and country on your public profile.</span>
              </div>
            </div>
          </StepShell>
        );
      case 3:
        return (
          <StepShell>
            <label className="block text-sm font-semibold text-gray-800">
              Creator headline
            </label>
            <input
              className={getFieldClass("creatorTitle")}
              name="creatorTitle"
              value={formik.values.creatorTitle}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Travel & lifestyle creator focused on UGC"
            />
            <FieldError formik={formik} name="creatorTitle" />
          </StepShell>
        );
      case 4:
        return (
          <StepShell>
            <label className="block text-sm font-semibold text-gray-800">
              Describe yourself and your content
            </label>
            <textarea
              className={getFieldClass("bio", "min-h-[140px]")}
              name="bio"
              value={formik.values.bio}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Share your style, audience, and results you drive for brands."
            />
            <FieldError formik={formik} name="bio" />
            <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
              <Sparkles className="h-4 w-4 text-purple-500" />
              <span>Include audience demographics and previous results.</span>
            </div>
          </StepShell>
        );
      case 5:
        return (
          <StepShell>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-sm font-semibold text-gray-800">
                  Gender
                </label>
                <Select
                  name="gender"
                  value={formik.values.gender}
                  onValueChange={(value) => formik.setFieldValue("gender", value)}
                >
                  <SelectTrigger
                    className={getFieldClass("gender", "!flex !h-[46px]")}
                    onBlur={() => formik.setFieldTouched("gender", true)}
                  >
                    <SelectValue placeholder="Select Gender">
                      {formik.values.gender || undefined}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Non-binary">Non-binary</SelectItem>
                    <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FieldError formik={formik} name="gender" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800">
                  Ethnicity
                </label>
                <input
                  className={getFieldClass("ethnicity")}
                  name="ethnicity"
                  value={formik.values.ethnicity}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="e.g., South Asian"
                />
                <FieldError formik={formik} name="ethnicity" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800">
                  Languages
                </label>
                <div
                  className={`mt-2 flex flex-wrap gap-2 rounded-xl border p-2 ${
                    hasFieldError("languages")
                      ? "border-red-500"
                      : "border-transparent"
                  }`}
                >
                  {languageOptions.map((language) => {
                    const active = formik.values.languages.includes(language);
                    return (
                      <button
                        type="button"
                        key={language}
                        onClick={() => toggleSelection("languages", language)}
                        className={`rounded-full px-3 py-2 text-xs font-semibold transition-all ${
                          active
                            ? "bg-purple-600 text-white shadow-md"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {language}
                      </button>
                    );
                  })}
                </div>
                <FieldError formik={formik} name="languages" />
              </div>
            </div>
          </StepShell>
        );
      case 6:
        return (
          <StepShell>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  Social platforms
                </p>
                <p className="text-xs text-gray-500">
                  Add username and follower count for each platform.
                </p>
              </div>
              <button
                type="button"
                onClick={addSocialAccount}
                className="flex items-center gap-2 rounded-full border border-purple-200 px-3 py-2 text-sm font-semibold text-purple-600 hover:bg-purple-50"
              >
                <Plus className="h-4 w-4" /> Add platform
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {formik.values.socialAccounts.map((account, idx) => (
                <div
                  key={idx}
                  className="grid gap-3 rounded-xl border border-gray-100 bg-gray-50/60 p-4 sm:grid-cols-[1.1fr_1fr_1fr_auto]"
                >
                  <div>
                    <Select
                      value={account.platform}
                      onValueChange={(value) => {
                        formik.setFieldValue(
                          `socialAccounts.${idx}.platform`,
                          value,
                        );
                      }}
                    >
                      <SelectTrigger
                        className={getFieldClass(
                          `socialAccounts.${idx}.platform`,
                          "!flex !h-[46px]",
                        )}
                        onBlur={() =>
                          formik.setFieldTouched(
                            `socialAccounts.${idx}.platform`,
                            true,
                          )
                        }
                      >
                        <SelectValue placeholder="Select Platform">
                          {account.platform ? getPlatformName(account.platform) : undefined}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {socialPlatformOptions.map((option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError
                      formik={formik}
                      name={`socialAccounts.${idx}.platform`}
                    />
                  </div>
                  <div>
                    <input
                      className={getFieldClass(
                        `socialAccounts.${idx}.username`,
                      )}
                      name={`socialAccounts.${idx}.username`}
                      value={account.username}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="@creatorhandle"
                    />
                    <FieldError
                      formik={formik}
                      name={`socialAccounts.${idx}.username`}
                    />
                  </div>
                  <div>
                    <input
                      className={getFieldClass(
                        `socialAccounts.${idx}.followers`,
                      )}
                      type="number"
                      min="0"
                      name={`socialAccounts.${idx}.followers`}
                      value={account.followers}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="Followers"
                    />
                    <FieldError
                      formik={formik}
                      name={`socialAccounts.${idx}.followers`}
                    />
                  </div>
                  {formik.values.socialAccounts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSocialAccount(idx)}
                      className="flex h-12 items-center justify-center rounded-xl bg-white text-red-500 transition hover:bg-red-50"
                      aria-label="Remove platform"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              <FieldError formik={formik} name="socialAccounts" />
            </div>
          </StepShell>
        );
      case 7:
        return (
          <StepShell>
            <p className="text-sm font-semibold text-gray-800">
              Content categories
            </p>
            <p className="text-xs text-gray-500">
              Choose all that apply so brands can find you.
            </p>
            <div
              className={`mt-4 grid gap-2 rounded-xl border p-2 sm:grid-cols-3 ${
                hasFieldError("contentCategories")
                  ? "border-red-500"
                  : "border-transparent"
              }`}
            >
              {contentCategoryOptions.map((categoryObj) => {
                const active = formik.values.contentCategories.includes(
                  categoryObj.id,
                );
                return (
                  <button
                    type="button"
                    key={categoryObj.id}
                    onClick={() =>
                      toggleSelection("contentCategories", categoryObj.id)
                    }
                    className={`rounded-xl border px-3 py-3 text-sm font-semibold transition-all ${
                      active
                        ? "border-purple-300 bg-purple-50 text-purple-700 shadow-sm"
                        : "border-gray-200 bg-white text-gray-800 hover:border-purple-200"
                    }`}
                  >
                    {categoryObj.name}
                  </button>
                );
              })}
            </div>
            <FieldError formik={formik} name="contentCategories" />
          </StepShell>
        );
      case 8:
        return (
          <StepShell>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  Portfolio (optional)
                </p>
                <p className="text-xs text-gray-500">
                  Upload up to 12 photos or videos.
                </p>
              </div>
              <span className="text-xs font-semibold text-gray-600">
                {formik.values.portfolio.length}/12
              </span>
            </div>

            <label
              className={`mt-4 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-8 text-center transition ${
                hasFieldError("portfolio")
                  ? "border-red-500 bg-red-50/40 hover:border-red-500"
                  : "border-purple-200 bg-purple-50/50 hover:border-purple-300 hover:bg-purple-50"
              }`}
            >
              <Upload className="h-6 w-6 text-purple-500" />
              <span className="text-sm font-semibold text-gray-800">
                Drag and drop or click to select files
              </span>
              <span className="text-xs text-gray-500">
                Accepts images or videos, max 12 files
              </span>
              <input
                type="file"
                accept="image/*,video/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  handlePortfolioChange(e.target.files);
                  formik.setFieldTouched("portfolio", true, false);
                }}
              />
            </label>
            <FieldError formik={formik} name="portfolio" />

            {formik.values.portfolio.length > 0 && (
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {formik.values.portfolio.map((file, idx) => (
                  <div
                    key={`${file.name}-${idx}`}
                    className="rounded-xl border border-gray-100 bg-white p-3 text-sm text-gray-700"
                  >
                    <p className="truncate font-semibold">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ))}
              </div>
            )}
          </StepShell>
        );
      case 9:
        return (
          <StepShell>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  Service packages
                </p>
                <p className="text-xs text-gray-500">
                  Add deliverables brands can book.
                </p>
              </div>
              <button
                type="button"
                onClick={addService}
                className="flex items-center gap-2 rounded-full border border-purple-200 px-3 py-2 text-sm font-semibold text-purple-600 hover:bg-purple-50"
              >
                <Plus className="h-4 w-4" /> Add package
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {formik.values.services.map((service, idx) => (
                <div
                  key={idx}
                  className="grid gap-3 rounded-xl border border-gray-100 bg-gray-50/60 p-4 sm:grid-cols-[1fr_1.1fr_0.5fr_0.6fr_auto]"
                >
                  {/* Platform Selection */}
                  <div>
                    <Select
                      value={service.platformKey}
                      onValueChange={(value) => {
                        formik.setFieldValue(
                          `services.${idx}.platformKey`,
                          value,
                        );
                        formik.setFieldValue(`services.${idx}.serviceType`, "");
                        fetchServicesForPlatform(value);
                      }}
                    >
                      <SelectTrigger
                        className={getFieldClass(
                          `services.${idx}.platformKey`,
                          "!flex !h-[46px]",
                        )}
                        onBlur={() =>
                          formik.setFieldTouched(
                            `services.${idx}.platformKey`,
                            true,
                          )
                        }
                      >
                        <SelectValue placeholder="Select Platform">
                          {service.platformKey ? getPlatformName(service.platformKey) : undefined}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {formik.values.socialAccounts.map((account) => {
                          const platform = socialPlatformOptions.find(
                            (p) =>
                              p.id === account.platform ||
                              p.key === account.platform,
                          );
                          return (
                            <SelectItem
                              key={account.platform}
                              value={account.platform}
                            >
                              {platform?.name || account.platform}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <FieldError
                      formik={formik}
                      name={`services.${idx}.platformKey`}
                    />
                  </div>

                  {/* Service Type Selection */}
                  <div>
                    <Select
                      value={service.serviceType}
                      onValueChange={(value) => {
                        formik.setFieldValue(
                          `services.${idx}.serviceType`,
                          value,
                        );
                      }}
                      disabled={!service.platformKey}
                    >
                      <SelectTrigger
                        className={getFieldClass(
                          `services.${idx}.serviceType`,
                          "!flex !h-[46px]",
                        )}
                        onBlur={() =>
                          formik.setFieldTouched(
                            `services.${idx}.serviceType`,
                            true,
                          )
                        }
                      >
                        <SelectValue placeholder="Select Service">
                          {service.serviceType ? getServiceTypeName(service.platformKey, service.serviceType) : undefined}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {(
                          dynamicServices[service.platformKey] ||
                          PLATFORM_SERVICES[
                            getPlatformName(service.platformKey)?.toLowerCase()
                          ] || ["Custom Service"]
                        ).map((st) => {
                          const label =
                            typeof st === "string"
                              ? st
                              : st.name || st.title || String(st);
                          const value =
                            typeof st === "string"
                              ? st
                              : st._id || st.id || String(st);
                          return (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <FieldError
                      formik={formik}
                      name={`services.${idx}.serviceType`}
                    />
                  </div>

                  {/* Quantity */}
                  <div>
                    <input
                      className={getFieldClass(`services.${idx}.quantity`)}
                      type="number"
                      min="1"
                      name={`services.${idx}.quantity`}
                      value={service.quantity}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="Qty"
                    />
                    <FieldError
                      formik={formik}
                      name={`services.${idx}.quantity`}
                    />
                  </div>

                  {/* Price */}
                  <div>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <BadgeCheck className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        className={getFieldClass(
                          `services.${idx}.price`,
                          "pl-9",
                        )}
                        type="number"
                        min="0"
                        name={`services.${idx}.price`}
                        value={service.price}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="INR"
                      />
                    </div>
                    <FieldError
                      formik={formik}
                      name={`services.${idx}.price`}
                    />
                  </div>

                  {/* Remove Button */}
                  {formik.values.services.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeService(idx)}
                      className="flex h-12 items-center justify-center rounded-xl bg-white text-red-500 transition hover:bg-red-50 px-2"
                      aria-label="Remove package"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}

                  {/* Description */}
                  <div className="sm:col-span-4">
                    <textarea
                      className={getFieldClass(
                        `services.${idx}.description`,
                        "min-h-[80px]",
                      )}
                      name={`services.${idx}.description`}
                      value={service.description}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="Describe deliverables, usage rights, and turnaround time."
                    />
                    <FieldError
                      formik={formik}
                      name={`services.${idx}.description`}
                    />
                  </div>
                </div>
              ))}
              <FieldError formik={formik} name="services" />
            </div>
          </StepShell>
        );
      default:
        return null;
    }
  };

  return (
    <main
      className={`min-h-screen flex flex-col ${theme.colors.pageBackground}`}
    >
      <Header />

      <div className="flex-1 px-4 py-10 sm:px-8 lg:px-16">
        <div className="mx-auto w-full max-w-5xl pt-6 sm:pt-10">
          <div className="mb-6 rounded-2xl bg-white p-4 shadow-lg ring-1 ring-gray-100">
            <div className="flex items-center justify-between text-sm font-semibold text-gray-700">
              <span>
                Step {currentStep + 1} of {steps.length}
              </span>
              <span className="text-xs text-gray-500">
                {steps[currentStep]?.title}
              </span>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            <div>{renderStep(currentStep)}</div>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <Lock className="h-4 w-4 text-green-500" />
                Your progress is saved locally. Connect the API to persist
                signup data.
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className={`group flex items-center gap-2 rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 ${
                    currentStep === 0 ? "cursor-not-allowed opacity-60" : ""
                  }`}
                >
                  <ChevronLeft className="h-4 w-4 shrink-0 transition-transform group-hover:-translate-x-1" />
                  Previous
                </button>
                {currentStep >= steps.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => formik.handleSubmit()}
                    disabled={formik.isSubmitting}
                    className="flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-lg transition bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-xl hover:scale-[1.01] disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {formik.isSubmitting
                      ? "Submitting..."
                      : "Submit application"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={isCheckingEmail}
                    className="group flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-lg transition bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-xl hover:scale-[1.01] disabled:opacity-70 disabled:cursor-not-allowed min-w-[100px]"
                  >
                    {isCheckingEmail ? "Checking..." : "Next"}
                    {!isCheckingEmail && <ChevronRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" />}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </main>
  );
}
