"use client";

import DynamicCMSPage from "@/components/DynamicCMSPage";
import { Lock } from "lucide-react";

export default function CookiePolicyPage() {
    return <DynamicCMSPage 
        title="Cookie Policy" 
        highlightWord="Cookie" 
        cmsType="cookie_policy" 
        icon={Lock} 
    />;
}
