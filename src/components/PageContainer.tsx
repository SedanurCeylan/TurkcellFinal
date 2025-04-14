'use client';

import type { ReactNode } from 'react';

interface PageContainerProps {
    children: ReactNode;
    className?: string;
    bgColor?: string;
}

const PageContainer = ({ children, className = '', bgColor }: PageContainerProps) => {
    return (
        <div className={`yüzdeyüz ${bgColor}`}>
            <div className={`page-container ${className}`}>
                {children}
            </div>

        </div>
    )
};

export default PageContainer;
