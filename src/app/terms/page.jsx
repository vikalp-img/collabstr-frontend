"use client";

import DynamicCMSPage from "@/components/DynamicCMSPage";
import { FileText } from "lucide-react";

export default function TermsConditionsPage() {
    return <DynamicCMSPage 
        title="Terms and Conditions" 
        highlightWord="Terms" 
        cmsType="terms_conditions" 
        icon={FileText} 
    />;
}
