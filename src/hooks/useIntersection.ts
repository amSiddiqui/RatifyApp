import React from 'react';

const useIntersection = (ref: React.RefObject<HTMLElement>, rootMargin: string) => {
    const [isIntersecting, setIsIntersecting] = React.useState(false);
    
    React.useEffect(() => {
        const element = ref.current;

        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsIntersecting(entry.isIntersecting);
            }, { rootMargin }
        );

        element && observer.observe(element);

        return () => {
            if (element) {
                observer.unobserve(element)
            }
        };
    }, [ref, rootMargin]);

    return isIntersecting;    
}

export default useIntersection;