'use client';

import { useEffect } from 'react';
import { useUI } from '@/context/UIContext';

export default function ClarityTracker() {
    const { organization } = useUI();

    useEffect(() => {
        const projectId = organization?.clarity_project_id;
        
        if (!projectId || typeof window === 'undefined') return;

        // Skip if already loaded
        if (window.clarity) return;

        // Clarity script initialization
        (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", projectId);

        console.log(`[Analytics] Microsoft Clarity initialized for project: ${projectId}`);
    }, [organization]);

    return null;
}
