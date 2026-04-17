import React from 'react';

export const LoadingSpinner = ({ fullScreen = false, size = 'md' }) => {
    const sizes = {
        sm: 'w-8 h-8',
        md: 'w-12 h-12',
        lg: 'w-16 h-16'
    };

    const spinner = (
        <div className="flex flex-col items-center justify-center gap-4">
            <div className="relative">
                <div className={`${sizes[size]} rounded-full border-4 border-[#e2e8f0] dark:border-[#161641]`}></div>
                <div className={`${sizes[size]} rounded-full border-4 border-transparent border-t-blue-600 animate-spin absolute top-0 left-0`}></div>
            </div>
            <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-white dark:bg-[#030318] flex items-center justify-center z-50">
                {spinner}
            </div>
        );
    }

    return spinner;
};
