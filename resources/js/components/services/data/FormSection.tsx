import * as React from 'react';

interface FormSectionProps {
    title: string;
    description: string;
    children: React.ReactNode;
}

export const FormSection: React.FC<FormSectionProps> = ({
    title,
    description,
    children,
}) => {
    return (
        <section className="space-y-2.5">
            <div>
                <h2 className="text-sm font-bold text-text-primary">
                    {title}
                </h2>
                <p className="text-xs text-text-secondary mt-0.5">
                    {description}
                </p>
            </div>
            {children}
        </section>
    );
};
