import { onCLS, onINP, onFCP, onLCP, onTTFB } from 'web-vitals';

export const initWebVitals = () => {
    onCLS(console.log);
    onINP(console.log);
    onFCP(console.log);
    onLCP(console.log);
    onTTFB(console.log);
};

export const trackPageView = (page: string) => {
    // Можно отправлять в аналитику или собирать локально
    console.log(`Page view: ${page}`);
};