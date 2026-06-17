"use client";

import DynamicCMSPage from "@/components/DynamicCMSPage";
import { Shield } from "lucide-react";

export default function PrivacyPolicyPage() {
    return <DynamicCMSPage 
        title="Privacy Policy" 
        highlightWord="Policy" 
        cmsType="privacy_policy" 
        icon={Shield} 
    />;
}
