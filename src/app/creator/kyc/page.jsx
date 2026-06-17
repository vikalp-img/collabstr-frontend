"use client";
import Image from "next/image";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { theme } from "@/theme";
import { apiWithAuth } from "@/lib/apiService";
import { API_ENDPOINTS } from "@/lib/apiEndpoints";
import { useUser } from "@/context/UserContext";
import { toast } from "sonner";
import PageLoader from "@/components/PageLoader";
import OTPModal from "@/components/OTPModal";
import MobileInputModal from "@/components/MobileInputModal";
import { 
  ShieldCheck, 
  CreditCard, 
  User, 
  Building2, 
  Mail, 
  Smartphone, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ChevronRight,
  ArrowLeft,
  Camera,
  Upload,
  Clock,
  XCircle
} from "lucide-react";

export default function KYCPage() {
  const router = useRouter();
  const { user, loading, fetchProfile } = useUser();
  const [activeStep, setActiveStep] = useState(1);
  const [isSubmittingInternal, setIsSubmittingInternal] = useState(false);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [isVerifyingMobile, setIsVerifyingMobile] = useState(false);
  const [isMobileInputOpen, setIsMobileInputOpen] = useState(false);
  const [otpConfig, setOtpConfig] = useState({ isOpen: false, type: "email", identifier: "" });

  
  // Status Code Mapping
  const STATUS = {
    NOT_INITIATED: -1,
    PENDING: 0,
    APPROVED: 1,
    REJECTED: 2
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case STATUS.PENDING:
        return { label: "Pending", color: "bg-amber-100 text-amber-700", icon: Clock };
      case STATUS.APPROVED:
        return { label: "Approved", color: "bg-green-100 text-green-700", icon: CheckCircle2 };
      case STATUS.REJECTED:
        return { label: "Rejected", color: "bg-red-100 text-red-700", icon: XCircle };
      default:
        return null;
    }
  };

  // KYC Validation Schema
  const validationSchema = Yup.object().shape({
    pan: Yup.object().shape({
      number: Yup.string()
        .matches(/[A-Z]{5}[0-9]{4}[A-Z]{1}/, "Invalid PAN format (e.g. ABCDE1234F)")
        .length(10, "PAN must be exactly 10 characters")
        .required("PAN Number is required"),
      name: Yup.string().required("Name on PAN card is required"),
      dob: Yup.string().required("Date of Birth is required")
    }),
    aadhar: Yup.object().shape({
      number: Yup.string()
        .matches(/^[0-9]{12}$/, "Aadhaar must be 12 digits")
        .required("Aadhaar Number is required"),
      name: Yup.string().required("Name on Aadhaar is required")
    }),
    bank: Yup.object().shape({
      accountholder: Yup.string().required("Account holder name is required"),
      accno: Yup.string().required("Account number is required"),
      ifsc: Yup.string()
        .matches(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC Code")
        .required("IFSC Code is required"),
      bankname: Yup.string().required("Bank name is required"),
      bankbranch: Yup.string().required("Bank branch is required"),
      city: Yup.string().required("City is required"),
      state: Yup.string().required("State is required")
    })
  });

  const formik = useFormik({
    initialValues: {
      pan: { number: "", name: "", dob: "" },
      aadhar: { number: "", name: "" },
      bank: { accountholder: "", accno: "", ifsc: "", bankname: "", bankbranch: "", city: "", state: "" },
      email: "",
      mobile: ""
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsSubmittingInternal(true);
      try {
        let lastResponse;

        // 1. PAN Submission
        if (user?.user_verify?.pan_verify !== STATUS.APPROVED && user?.user_verify?.pan_verify !== STATUS.PENDING) {
          lastResponse = await apiWithAuth.post(API_ENDPOINTS.USER.REQUEST_PAN_KYC, {
            pan_number: values.pan.number,
            pan_name: values.pan.name,
            pan_dob: values.pan.dob
          });
        }
        
        // 2. Aadhaar Submission (JSON)
        if (user?.user_verify?.aadhar_verify !== STATUS.APPROVED && user?.user_verify?.aadhar_verify !== STATUS.PENDING) {
          lastResponse = await apiWithAuth.post(API_ENDPOINTS.USER.REQUEST_AADHAAR_KYC, {
            aadhar_number: values.aadhar.number,
            aadhar_name: values.aadhar.name
          });
        }
        
        // 3. Bank Submission (JSON)
        if (user?.user_verify?.bank_verify !== STATUS.APPROVED && user?.user_verify?.bank_verify !== STATUS.PENDING) {
          lastResponse = await apiWithAuth.post(API_ENDPOINTS.USER.REQUEST_BANK_KYC, {
            accountholder: values.bank.accountholder,
            accno: values.bank.accno,
            ifsc: values.bank.ifsc,
            bankname: values.bank.bankname,
            bankbranch: values.bank.bankbranch,
            city: values.bank.city,
            state: values.bank.state
          });
        }

        const response = lastResponse;

        if (!response || response.status === 200 || response.status === 201) {
          toast.success("KYC Details submitted successfully!");
          fetchProfile();
          router.push("/creator/dashboard");
        }
      } catch (error) {
        console.error("KYC submission error:", error);
        toast.error(error?.response?.data?.message || "Failed to submit KYC.");
      } finally {
        setIsSubmittingInternal(false);
      }
    }
  });

  useEffect(() => {
    if (!user && !loading) {
      fetchProfile();
    }
    if (user) {
      const v = user.user_verify;
      if (v?.pan_verify === 1 && v?.aadhar_verify === 1 && v?.bank_verify === 1) {
        toast.info("Your KYC is already verified.");
        router.push("/creator/dashboard");
      }
      formik.setFieldValue("email", user.email || "");
      formik.setFieldValue("mobile", user.mobile || user.phone || "");
    }
  }, [user, loading, fetchProfile, router]);

  const handleFileChange = (section, e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        formik.setFieldValue(`${section}.image`, file);
        formik.setFieldValue(`${section}.preview`, reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const submitStep = async (stepId) => {
    const stepCountMap = { 1: "PAN", 2: "Aadhaar", 3: "Bank" };
    setIsSubmittingInternal(true);
    try {
      const values = formik.values;
      let response;
      if (stepId === 2) {
        // Aadhaar KYC uses JSON payload
        response = await apiWithAuth.post(API_ENDPOINTS.USER.REQUEST_AADHAAR_KYC, {
          aadhar_number: values.aadhar.number,
          aadhar_name: values.aadhar.name
        });
      } else if (stepId === 3) {
        // Bank KYC uses JSON payload
        response = await apiWithAuth.post(API_ENDPOINTS.USER.REQUEST_BANK_KYC, {
          accountholder: values.bank.accountholder,
          accno: values.bank.accno,
          ifsc: values.bank.ifsc,
          bankname: values.bank.bankname,
          bankbranch: values.bank.bankbranch,
          city: values.bank.city,
          state: values.bank.state
        });
      } else {
        response = await apiWithAuth.post(API_ENDPOINTS.USER.REQUEST_PAN_KYC, {
          pan_number: values.pan.number,
          pan_name: values.pan.name,
          pan_dob: values.pan.dob
        });
      }

      if (response.status === 200 || response.status === 201) {
        toast.success(`${stepCountMap[stepId]} details saved successfully!`);
        fetchProfile();
        if (activeStep < 4) setActiveStep(prev => prev + 1);
      }
    } catch (error) {
      console.error(`KYC ${stepCountMap[stepId]} error:`, error);
      toast.error(error?.response?.data?.message || `Failed to save ${stepCountMap[stepId]} details.`);
    } finally {
      setIsSubmittingInternal(false);
    }
  };

  const nextStep = async () => {
    // Determine target status field
    const statusFieldMap = { 1: 'pan_verify', 2: 'aadhar_verify', 3: 'bank_verify' };
    const currentStatus = user?.user_verify?.[statusFieldMap[activeStep]];

    // If already pending or approved, just move next
    if (activeStep < 4 && (currentStatus === STATUS.PENDING || currentStatus === STATUS.APPROVED)) {
      setActiveStep(prev => prev + 1);
      return;
    }

    const currentStepObj = steps.find(s => s.id === activeStep);
    const errors = await formik.validateForm();
    
    const hasErrors = currentStepObj.fields.some(field => {
      const parts = field.split('.');
      return parts.length > 1 ? (errors[parts[0]]?.[parts[1]]) : errors[parts[0]];
    });

    if (hasErrors) {
      currentStepObj.fields.forEach(field => formik.setFieldTouched(field, true));
      toast.error("Please fill all required fields correctly.");
      return;
    }

    if (activeStep < 4) {
      await submitStep(activeStep);
    } else {
      formik.handleSubmit();
    }
  };

  const handleVerifyEmail = async () => {
    if (isVerifyingEmail) return;
    setIsVerifyingEmail(true);
    try {
      const response = await apiWithAuth.post(API_ENDPOINTS.USER.REQUEST_EMAIL_VERIFY, {
        email: formik.values.email
      });
      if (response.status === 200 || response.status === 201) {
        toast.success("Verification email sent! Please check your inbox.");
        setOtpConfig({ isOpen: true, type: "email", identifier: formik.values.email });
      }
    } catch (error) {
      console.error("Email verification request error:", error);
      toast.error(error?.response?.data?.message || "Failed to request email verification.");
    } finally {
      setIsVerifyingEmail(false);
    }
  };

  const handleVerifyMobile = async (passedMobile) => {
    // If passedMobile is a React event or similar, ignore it
    const actualMobile = typeof passedMobile === "string" ? passedMobile : null;
    const mobileToVerify = actualMobile || formik.values.mobile;

    if (!mobileToVerify) {
      setIsMobileInputOpen(true);
      return;
    }

    if (isVerifyingMobile) return;
    setIsVerifyingMobile(true);
    try {
      const response = await apiWithAuth.post(API_ENDPOINTS.USER.REQUEST_MOBILE_VERIFY, {
        mobile: mobileToVerify
      });
      if (response.status === 200 || response.status === 201) {
        toast.success("Verification code sent to your mobile!");
        setOtpConfig({ isOpen: true, type: "mobile", identifier: mobileToVerify });
      }
    } catch (error) {
      console.error("Mobile verification request error:", error);
      toast.error(error?.response?.data?.message || "Failed to request mobile verification.");
    } finally {
      setIsVerifyingMobile(false);
    }
  };

  const handleMobileSubmit = async (mobileNumber) => {
    formik.setFieldValue("mobile", mobileNumber);
    setIsMobileInputOpen(false);
    // Proceed to verify with the new number
    await handleVerifyMobile(mobileNumber);
  };


  const handleVerifyOtp = async (otp) => {
    try {
      const endpoint = otpConfig.type === "email" 
        ? API_ENDPOINTS.USER.VERIFY_EMAIL_OTP 
        : API_ENDPOINTS.USER.VERIFY_MOBILE_OTP;
      
      const payload = {
        otp: otp,
        [otpConfig.type]: otpConfig.identifier
      };

      const response = await apiWithAuth.post(endpoint, payload);
      if (response.status === 200 || response.status === 201) {
        toast.success(`${otpConfig.type === "email" ? "Email" : "Mobile"} verified successfully!`);
        fetchProfile();
        return true;
      }
    } catch (error) {
      throw error;
    }
  };

  const prevStep = () => {
    if (activeStep > 1) setActiveStep(prev => prev - 1);
  };

  const steps = [
    { id: 1, title: "PAN Card", icon: CreditCard, key: "pan", fields: ["pan.number", "pan.name", "pan.dob"] },
    { id: 2, title: "Aadhaar Card", icon: User, key: "aadhar", fields: ["aadhar.number", "aadhar.name"] },
    { id: 3, title: "Bank Details", icon: Building2, key: "bank", fields: ["bank.accountholder", "bank.accno", "bank.ifsc", "bank.bankname", "bank.bankbranch", "bank.city", "bank.state"] },
    { id: 4, title: "Verify & Finish", icon: ShieldCheck, key: "finish", fields: [] },
  ];

  const handleStepClick = async (stepId) => {
    if (stepId === activeStep) return;
    
    // If moving forward, validate current step first
    if (stepId > activeStep) {
      const statusFieldMap = { 1: 'pan_verify', 2: 'aadhar_verify', 3: 'bank_verify' };
      const currentStatus = user?.user_verify?.[statusFieldMap[activeStep]];

      // Only validate if not already pending/approved
      if (currentStatus !== STATUS.PENDING && currentStatus !== STATUS.APPROVED) {
        const currentStepObj = steps.find(s => s.id === activeStep);
        const errors = await formik.validateForm();
        const hasErrors = currentStepObj.fields.some(field => {
          const parts = field.split('.');
          return parts.length > 1 ? (errors[parts[0]]?.[parts[1]]) : errors[parts[0]];
        });

        if (hasErrors) {
          currentStepObj.fields.forEach(field => formik.setFieldTouched(field, true));
          toast.error("Please complete the current section before moving forward.");
          return;
        }
      }
    }
    
    setActiveStep(stepId);
  };

  if (loading && !user) {
    return (
      <main className="min-h-screen flex flex-col bg-white">
        <Header />
        <PageLoader message="Verifying authentication..." />
        <Footer />
      </main>
    );
  }

  return (
    <main className={`min-h-screen pb-20 flex flex-col ${theme.colors.pageBackground}`}>
      <Header />
      
      <div className="flex-1 px-4 py-12 md:py-20">
        <div className="container mx-auto max-w-6xl space-y-12">
          
          <div className="space-y-4 text-center">
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
              Verify Your <span className={theme.colors.textGradient}>Identity</span>
            </h1>
            <p className="text-gray-500 text-lg max-w-2xl font-medium mx-auto">
              Complete your KYC to enable balance withdrawals. Your data is encrypted and handled securely.
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="relative flex justify-between items-center max-w-5xl mx-auto px-4">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 z-0" />
            <div 
              className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 ease-out -translate-y-1/2 z-0"
              style={{ width: `${((activeStep - 1) / (steps.length - 1)) * 100}%` }}
            />
            {steps.map((step) => {
              const Icon = step.icon;
              const isActive = activeStep === step.id;
              const isCompleted = activeStep > step.id;
              
              return (
                <button 
                  key={step.id} 
                  type="button"
                  onClick={() => handleStepClick(step.id)}
                  className="relative z-10 flex flex-col items-center group cursor-pointer"
                >
                  <div className={`
                    w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center transition-all duration-300
                    ${isActive ? 'bg-purple-600 text-white shadow-lg shadow-purple-200 scale-110' : 
                      isCompleted ? 'bg-green-500 text-white shadow-lg shadow-green-100' : 'bg-white text-gray-400 border border-gray-100 group-hover:border-purple-200'}
                  `}>
                    {isCompleted ? <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6" /> : <Icon className="h-4 w-4 sm:h-5 sm:w-5" />}
                  </div>
                  <span className={`mt-3 text-[9px] sm:text-[11px] font-black uppercase tracking-widest ${isActive ? 'text-purple-600' : 'text-gray-400 group-hover:text-gray-600'}`}>
                    {step.title}
                  </span>
                </button>
              );
            })}
          </div>

          <form onSubmit={formik.handleSubmit} className="bg-white rounded-[40px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden">
            <div className="p-4 sm:p-8 md:p-12 lg:p-16">
              
              {activeStep === 1 && (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex flex-col items-center gap-6 text-center">
                    <div className="h-16 w-16 rounded-[24px] bg-purple-50 flex items-center justify-center shadow-inner">
                      <CreditCard className="h-8 w-8 text-purple-600" />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-3xl font-black text-gray-900 tracking-tight">PAN Card Details</h2>
                      <p className="text-gray-500 text-sm font-medium">Please enter your permanent account number as per your document.</p>
                    </div>
                    {getStatusInfo(user?.user_verify?.pan_verify) && (
                      <div className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-[10px] uppercase tracking-wider ${getStatusInfo(user.user_verify.pan_verify).color} shadow-sm border border-current/10`}>
                        {user.user_verify.pan_verify === STATUS.PENDING && <Clock className="h-3.5 w-3.5" />}
                        {user.user_verify.pan_verify === STATUS.APPROVED && <CheckCircle2 className="h-3.5 w-3.5" />}
                        {user.user_verify.pan_verify === STATUS.REJECTED && <XCircle className="h-3.5 w-3.5" />}
                        {getStatusInfo(user.user_verify.pan_verify).label}
                      </div>
                    )}
                  </div>

                  <div className="max-w-2xl mx-auto grid gap-6 md:grid-cols-2">
                    <div className="md:col-span-2 space-y-2">
                        <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest ml-1">PAN Number</label>
                        <input 
                          name="pan.number"
                          type="text"
                          disabled={user?.user_verify?.pan_verify === STATUS.APPROVED || user?.user_verify?.pan_verify === STATUS.PENDING}
                          value={formik.values.pan.number}
                          onChange={(e) => formik.setFieldValue("pan.number", e.target.value.toUpperCase())}
                          onBlur={formik.handleBlur}
                          placeholder="ABCDE1234F"
                          maxLength={10}
                          className={`w-full bg-gray-50/50 border ${formik.touched.pan?.number && formik.errors.pan?.number ? 'border-red-200 ring-1 ring-red-100' : 'border-gray-100'} rounded-2xl px-6 py-4 text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all placeholder:text-gray-300 disabled:opacity-50`}
                        />
                        {formik.touched.pan?.number && formik.errors.pan?.number && (
                          <p className="text-[10px] text-red-500 font-bold ml-1 uppercase mt-1.5">{formik.errors.pan.number}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest ml-1">Name on Card</label>
                        <input 
                          name="pan.name"
                          type="text"
                          disabled={user?.user_verify?.pan_verify === STATUS.APPROVED || user?.user_verify?.pan_verify === STATUS.PENDING}
                          value={formik.values.pan.name}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          placeholder="John Doe"
                          className={`w-full bg-gray-50/50 border ${formik.touched.pan?.name && formik.errors.pan?.name ? 'border-red-200 ring-1 ring-red-100' : 'border-gray-100'} rounded-2xl px-6 py-4 text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all placeholder:text-gray-300 disabled:opacity-50`}
                        />
                        {formik.touched.pan?.name && formik.errors.pan?.name && (
                          <p className="text-[10px] text-red-500 font-bold ml-1 uppercase mt-1.5">{formik.errors.pan.name}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest ml-1">Date of Birth</label>
                        <input 
                          name="pan.dob"
                          type="date"
                          disabled={user?.user_verify?.pan_verify === STATUS.APPROVED || user?.user_verify?.pan_verify === STATUS.PENDING}
                          value={formik.values.pan.dob}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          className={`w-full bg-gray-50/50 border ${formik.touched.pan?.dob && formik.errors.pan?.dob ? 'border-red-200 ring-1 ring-red-100' : 'border-gray-100'} rounded-2xl px-6 py-4 text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all placeholder:text-gray-300 disabled:opacity-50 appearance-none`}
                        />
                         {formik.touched.pan?.dob && formik.errors.pan?.dob && (
                          <p className="text-[10px] text-red-500 font-bold ml-1 uppercase mt-1.5">{formik.errors.pan.dob}</p>
                        )}
                    </div>
                  </div>
                </div>
              )}

              {activeStep === 2 && (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex flex-col items-center gap-6 text-center">
                    <div className="h-16 w-16 rounded-[24px] bg-purple-50 flex items-center justify-center shadow-inner">
                      <User className="h-8 w-8 text-purple-600" />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-3xl font-black text-gray-900 tracking-tight">Aadhaar Card Details</h2>
                      <p className="text-gray-500 text-sm font-medium">Please enter your 12-digit Aadhaar number as per your document.</p>
                    </div>
                    {getStatusInfo(user?.user_verify?.aadhar_verify) && (
                      <div className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-[10px] uppercase tracking-wider ${getStatusInfo(user.user_verify.aadhar_verify).color} shadow-sm border border-current/10`}>
                        {user.user_verify.aadhar_verify === STATUS.PENDING && <Clock className="h-3.5 w-3.5" />}
                        {user.user_verify.aadhar_verify === STATUS.APPROVED && <CheckCircle2 className="h-3.5 w-3.5" />}
                        {user.user_verify.aadhar_verify === STATUS.REJECTED && <XCircle className="h-3.5 w-3.5" />}
                        {getStatusInfo(user.user_verify.aadhar_verify).label}
                      </div>
                    )}
                  </div>

                  <div className="max-w-2xl mx-auto space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest ml-1">Aadhaar Number</label>
                      <input 
                        name="aadhar.number"
                        type="text"
                        disabled={user?.user_verify?.aadhar_verify === STATUS.APPROVED || user?.user_verify?.aadhar_verify === STATUS.PENDING}
                        value={formik.values.aadhar.number}
                        onChange={(e) => formik.setFieldValue("aadhar.number", e.target.value.replace(/\D/g, ''))}
                        onBlur={formik.handleBlur}
                        placeholder="0000 0000 0000"
                        maxLength={12}
                        className={`w-full bg-gray-50/50 border ${formik.touched.aadhar?.number && formik.errors.aadhar?.number ? 'border-red-200 ring-1 ring-red-100' : 'border-gray-100'} rounded-2xl px-6 py-4 text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all placeholder:text-gray-300 disabled:opacity-50`}
                      />
                      {formik.touched.aadhar?.number && formik.errors.aadhar?.number && (
                        <p className="text-[10px] text-red-500 font-bold ml-1 uppercase mt-1.5">{formik.errors.aadhar.number}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest ml-1">Name on Aadhaar</label>
                      <input 
                        name="aadhar.name"
                        type="text"
                        disabled={user?.user_verify?.aadhar_verify === STATUS.APPROVED || user?.user_verify?.aadhar_verify === STATUS.PENDING}
                        value={formik.values.aadhar.name}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="John Doe"
                        className={`w-full bg-gray-50/50 border ${formik.touched.aadhar?.name && formik.errors.aadhar?.name ? 'border-red-200 ring-1 ring-red-100' : 'border-gray-100'} rounded-2xl px-6 py-4 text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all placeholder:text-gray-300 disabled:opacity-50`}
                      />
                      {formik.touched.aadhar?.name && formik.errors.aadhar?.name && (
                        <p className="text-[10px] text-red-500 font-bold ml-1 uppercase mt-1.5">{formik.errors.aadhar.name}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeStep === 3 && (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex flex-col items-center gap-6 text-center">
                    <div className="h-16 w-16 rounded-[24px] bg-purple-50 flex items-center justify-center shadow-inner">
                      <Building2 className="h-8 w-8 text-purple-600" />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-3xl font-black text-gray-900 tracking-tight">Withdrawal Destination</h2>
                      <p className="text-gray-500 text-sm font-medium">Please provide your bank details where you'd like to receive payments.</p>
                    </div>
                    {getStatusInfo(user?.user_verify?.bank_verify) && (
                      <div className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-[10px] uppercase tracking-wider ${getStatusInfo(user.user_verify.bank_verify).color} shadow-sm border border-current/10`}>
                        {user.user_verify.bank_verify === STATUS.PENDING && <Clock className="h-3.5 w-3.5" />}
                        {user.user_verify.bank_verify === STATUS.APPROVED && <CheckCircle2 className="h-3.5 w-3.5" />}
                        {user.user_verify.bank_verify === STATUS.REJECTED && <XCircle className="h-3.5 w-3.5" />}
                        {getStatusInfo(user.user_verify.bank_verify).label}
                      </div>
                    )}
                  </div>

                  <div className="max-w-2xl mx-auto grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest ml-1">Account Holder Name</label>
                      <input 
                        name="bank.accountholder"
                        type="text"
                        disabled={user?.user_verify?.bank_verify === STATUS.APPROVED || user?.user_verify?.bank_verify === STATUS.PENDING}
                        value={formik.values.bank.accountholder}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="John Doe"
                        className={`w-full bg-gray-50/50 border ${formik.touched.bank?.accountholder && formik.errors.bank?.accountholder ? 'border-red-200 ring-1 ring-red-100' : 'border-gray-100'} rounded-2xl px-6 py-4 text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all font-sans disabled:opacity-50`}
                      />
                      {formik.touched.bank?.accountholder && formik.errors.bank?.accountholder && (
                          <p className="text-[10px] text-red-500 font-bold ml-1 uppercase mt-1.5">{formik.errors.bank.accountholder}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest ml-1">Account Number</label>
                      <input 
                        name="bank.accno"
                        type="text"
                        disabled={user?.user_verify?.bank_verify === STATUS.APPROVED || user?.user_verify?.bank_verify === STATUS.PENDING}
                        value={formik.values.bank.accno}
                        onChange={(e) => formik.setFieldValue("bank.accno", e.target.value.replace(/\D/g, ''))}
                        onBlur={formik.handleBlur}
                        placeholder="000000000000"
                        className={`w-full bg-gray-50/50 border ${formik.touched.bank?.accno && formik.errors.bank?.accno ? 'border-red-200 ring-1 ring-red-100' : 'border-gray-100'} rounded-2xl px-6 py-4 text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all font-sans disabled:opacity-50`}
                      />
                      {formik.touched.bank?.accno && formik.errors.bank?.accno && (
                          <p className="text-[10px] text-red-500 font-bold ml-1 uppercase mt-1.5">{formik.errors.bank.accno}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest ml-1">IFSC Code</label>
                      <input 
                        name="bank.ifsc"
                        type="text"
                        disabled={user?.user_verify?.bank_verify === STATUS.APPROVED || user?.user_verify?.bank_verify === STATUS.PENDING}
                        value={formik.values.bank.ifsc}
                        onChange={(e) => formik.setFieldValue("bank.ifsc", e.target.value.toUpperCase())}
                        onBlur={formik.handleBlur}
                        placeholder="SBIN0001234"
                        className={`w-full bg-gray-50/50 border ${formik.touched.bank?.ifsc && formik.errors.bank?.ifsc ? 'border-red-200 ring-1 ring-red-100' : 'border-gray-100'} rounded-2xl px-6 py-4 text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all font-sans disabled:opacity-50`}
                      />
                      {formik.touched.bank?.ifsc && formik.errors.bank?.ifsc && (
                          <p className="text-[10px] text-red-500 font-bold ml-1 uppercase mt-1.5">{formik.errors.bank.ifsc}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest ml-1">Bank Name</label>
                      <input 
                        name="bank.bankname"
                        type="text"
                        disabled={user?.user_verify?.bank_verify === STATUS.APPROVED || user?.user_verify?.bank_verify === STATUS.PENDING}
                        value={formik.values.bank.bankname}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="State Bank of India"
                        className={`w-full bg-gray-50/50 border ${formik.touched.bank?.bankname && formik.errors.bank?.bankname ? 'border-red-200 ring-1 ring-red-100' : 'border-gray-100'} rounded-2xl px-6 py-4 text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all font-sans disabled:opacity-50`}
                      />
                      {formik.touched.bank?.bankname && formik.errors.bank?.bankname && (
                          <p className="text-[10px] text-red-500 font-bold ml-1 uppercase mt-1.5">{formik.errors.bank.bankname}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest ml-1">Bank Branch</label>
                      <input 
                        name="bank.bankbranch"
                        type="text"
                        disabled={user?.user_verify?.bank_verify === STATUS.APPROVED || user?.user_verify?.bank_verify === STATUS.PENDING}
                        value={formik.values.bank.bankbranch}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="Main Branch"
                        className={`w-full bg-gray-50/50 border ${formik.touched.bank?.bankbranch && formik.errors.bank?.bankbranch ? 'border-red-200 ring-1 ring-red-100' : 'border-gray-100'} rounded-2xl px-6 py-4 text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all font-sans disabled:opacity-50`}
                      />
                      {formik.touched.bank?.bankbranch && formik.errors.bank?.bankbranch && (
                          <p className="text-[10px] text-red-500 font-bold ml-1 uppercase mt-1.5">{formik.errors.bank.bankbranch}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest ml-1">City</label>
                      <input 
                        name="bank.city"
                        type="text"
                        disabled={user?.user_verify?.bank_verify === STATUS.APPROVED || user?.user_verify?.bank_verify === STATUS.PENDING}
                        value={formik.values.bank.city}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="Mumbai"
                        className={`w-full bg-gray-50/50 border ${formik.touched.bank?.city && formik.errors.bank?.city ? 'border-red-200 ring-1 ring-red-100' : 'border-gray-100'} rounded-2xl px-6 py-4 text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all font-sans disabled:opacity-50`}
                      />
                      {formik.touched.bank?.city && formik.errors.bank?.city && (
                          <p className="text-[10px] text-red-500 font-bold ml-1 uppercase mt-1.5">{formik.errors.bank.city}</p>
                        )}
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest ml-1">State</label>
                      <input 
                        name="bank.state"
                        type="text"
                        disabled={user?.user_verify?.bank_verify === STATUS.APPROVED || user?.user_verify?.bank_verify === STATUS.PENDING}
                        value={formik.values.bank.state}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="Maharashtra"
                        className={`w-full bg-gray-50/50 border ${formik.touched.bank?.state && formik.errors.bank?.state ? 'border-red-200 ring-1 ring-red-100' : 'border-gray-100'} rounded-2xl px-6 py-4 text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all font-sans disabled:opacity-50`}
                      />
                      {formik.touched.bank?.state && formik.errors.bank?.state && (
                          <p className="text-[10px] text-red-500 font-bold ml-1 uppercase mt-1.5">{formik.errors.bank.state}</p>
                        )}
                    </div>
                  </div>
                </div>
              )}

              {activeStep === 4 && (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex flex-col items-center gap-6 text-center">
                    <div className="h-16 w-16 rounded-[24px] bg-purple-50 flex items-center justify-center shadow-inner">
                      <ShieldCheck className="h-8 w-8 text-purple-600" />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-3xl font-black text-gray-900 tracking-tight">Final Verification</h2>
                      <p className="text-gray-500 text-sm font-medium">Verify your contact details and acknowledge the terms to finish.</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-6 rounded-3xl bg-gray-50 border border-gray-100">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-white shadow-sm flex items-center justify-center">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Email Address</p>
                          <p className="font-bold text-gray-900">{formik.values.email}</p>
                        </div>
                      </div>
                      {user?.user_verify?.email_verify === 1 ? (
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase">Verified</span>
                      ) : (
                        <button 
                          type="button" 
                          onClick={handleVerifyEmail}
                          disabled={isVerifyingEmail}
                          className="text-purple-600 font-bold text-xs hover:underline flex items-center gap-1.5"
                        >
                          {isVerifyingEmail ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            "Verify Now"
                          )}
                        </button>
                      )}
                    </div>

                    <div className="flex items-center justify-between p-6 rounded-3xl bg-gray-50 border border-gray-100">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-white shadow-sm flex items-center justify-center">
                          <Smartphone className="h-5 w-5 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Mobile Number</p>
                          <p className="font-bold text-gray-900">{formik.values.mobile || "Not Linked"}</p>
                        </div>
                      </div>
                      {user?.user_verify?.mobile_verify === 1 ? (
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase">Verified</span>
                      ) : (
                        <button 
                          type="button" 
                          onClick={() => handleVerifyMobile()}
                          disabled={isVerifyingMobile}
                          className="text-purple-600 font-bold text-xs hover:underline flex items-center gap-1.5"
                        >
                          {isVerifyingMobile ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            "Verify Now"
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="p-6 rounded-3xl bg-blue-50/50 border border-blue-100 flex gap-4">
                    <AlertCircle className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-700 font-medium leading-relaxed">
                      By submitting, you agree that the information provided is correct. Verification usually takes 24-48 business hours.
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-16 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={activeStep === 1 || isSubmittingInternal}
                  className={`
                    px-4 sm:px-8 py-4 rounded-2xl font-bold text-sm transition-all
                    ${activeStep === 1 ? 'opacity-0 pointer-events-none' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
                  `}
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={isSubmittingInternal}
                  className="group flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 px-6 sm:px-10 py-4 text-white font-bold shadow-lg shadow-purple-200 hover:shadow-purple-300 transition-all active:scale-[0.98] disabled:opacity-50 ml-auto"
                >
                  {isSubmittingInternal ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : activeStep === 4 ? (
                    <ShieldCheck className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  )}
                  {isSubmittingInternal ? "Saving..." : activeStep === 4 ? "Submit KYC" : "Save & Next"}
                </button>
              </div>

            </div>
          </form>
        </div>
      </div>

      <Footer />

      <OTPModal 
        isOpen={otpConfig.isOpen}
        onClose={() => setOtpConfig(prev => ({ ...prev, isOpen: false }))}
        identifier={otpConfig.identifier}
        type={otpConfig.type}
        onVerify={handleVerifyOtp}
        onResend={otpConfig.type === "email" ? handleVerifyEmail : handleVerifyMobile}
      />

      <MobileInputModal 
        isOpen={isMobileInputOpen}
        onClose={() => setIsMobileInputOpen(false)}
        onSubmit={handleMobileSubmit}
        initialValue={formik.values.mobile}
        loading={isVerifyingMobile}
      />

    </main>
  );
}
