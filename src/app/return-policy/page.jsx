"use client";

import DynamicCMSPage from "@/components/DynamicCMSPage";
import { HelpCircle } from "lucide-react";

export default function ReturnPolicyPage() {
    return <DynamicCMSPage 
        title="Return Policy" 
        highlightWord="Return" 
        cmsType="return_policy" 
        icon={HelpCircle} 
    />;
}
