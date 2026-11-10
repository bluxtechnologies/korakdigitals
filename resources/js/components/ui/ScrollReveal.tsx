import * as React from 'react';

interface UseInViewOptions {
    threshold?: number | number[];
    rootMargin?: string;
    triggerOnce?: boolean;
}

export function useInView<T extends HTMLElement = HTMLDivElement>(
    options: UseInViewOptions = {}
): [React.RefObject<T | null>, boolean] {
    const { threshold = 0.12, rootMargin = '0px 0px -40px 0px', triggerOnce = true } = options;
    const ref = React.useRef<T | null>(null);
    const [isInView, setIsInView] = React.useState(false);

    React.useEffect(() => {
        if (typeof window === 'undefined') return;

        // Immediately show if user prefers reduced motion
        if (window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches) {
            setIsInView(true);
            return;
        }

        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    if (triggerOnce) {
                        observer.unobserve(element);
                    }
                } else if (!triggerOnce) {
                    setIsInView(false);
                }
            },
            { threshold, rootMargin }
        );

        observer.observe(element);

        return () => {
            observer.disconnect();
        };
    }, [threshold, rootMargin, triggerOnce]);

    return [ref, isInView];
}

interface ScrollRevealProps {
    children: React.ReactNode;
    className?: string;
    delay?: number; // Delay in milliseconds
    direction?: 'up' | 'down' | 'left' | 'right' | 'none';
    distance?: number; // Distance in pixels
    duration?: number; // Duration in milliseconds
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
    children,
    className = '',
    delay = 0,
    direction = 'up',
    distance = 22,
    duration = 650,
}) => {
    const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.1, triggerOnce: true });

    const getTransform = () => {
        if (inView) return 'translate3d(0, 0, 0)';
        switch (direction) {
            case 'up':
                return `translate3d(0, ${distance}px, 0)`;
            case 'down':
                return `translate3d(0, -${distance}px, 0)`;
            case 'left':
                return `translate3d(${distance}px, 0, 0)`;
            case 'right':
                return `translate3d(-${distance}px, 0, 0)`;
            case 'none':
            default:
                return 'translate3d(0, 0, 0)';
        }
    };

    return (
        <div
            ref={ref}
            className={className}
            style={{
                opacity: inView ? 1 : 0,
                transform: getTransform(),
                transitionProperty: 'opacity, transform',
                transitionDuration: `${duration}ms`,
                transitionDelay: `${delay}ms`,
                transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
                willChange: inView ? 'auto' : 'opacity, transform',
            }}
        >
            {children}
        </div>
    );
};
