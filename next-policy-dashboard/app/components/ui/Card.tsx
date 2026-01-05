import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    noPadding?: boolean;
}

export function Card({ className = "", noPadding = false, children, ...props }: CardProps) {
    return (
        <div
            className={`bg-[#0A0C10] border border-white/10 rounded-xl overflow-hidden shadow-sm ${className}`}
            {...props}
        >
            <div className={noPadding ? "" : "p-6"}>
                {children}
            </div>
        </div>
    );
}

export function CardHeader({ className = "", children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={`flex flex-col space-y-1.5 mb-4 ${className}`} {...props}>{children}</div>;
}

export function CardTitle({ className = "", children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
    return <h3 className="font-semibold leading-none tracking-tight text-white flex items-center gap-2" {...props}>{children}</h3>;
}

export function CardContent({ className = "", children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={`text-sm text-gray-400 ${className}`} {...props}>{children}</div>;
}
