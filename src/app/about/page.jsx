"use client";

import DynamicCMSPage from "@/components/DynamicCMSPage";
import { Info } from "lucide-react";

export default function AboutUsPage() {
    return <DynamicCMSPage 
        title="About Us" 
        highlightWord="About" 
        cmsType="about_us" 
        icon={Info} 
    />;
}
