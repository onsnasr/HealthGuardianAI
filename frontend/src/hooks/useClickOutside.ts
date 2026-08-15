import { useEffect, RefObject } from 'react';

/**
 * Hook personnalisé pour détecter les clics en dehors d'un élément
 * @param ref - Référence à l'élément à surveiller
 * @param handler - Fonction à exécuter lors d'un clic extérieur
 */
export const useClickOutside = <T extends HTMLElement = HTMLElement>(
    ref: RefObject<T>,
    handler: (event: MouseEvent | TouchEvent) => void
) => {
    useEffect(() => {
        const listener = (event: MouseEvent | TouchEvent) => {
            const el = ref?.current;

            // Ne rien faire si l'élément n'existe pas ou si le clic est à l'intérieur
            if (!el || el.contains(event.target as Node)) {
                return;
            }

            // Exécuter le handler si le clic est à l'extérieur
            handler(event);
        };

        // Ajouter les event listeners
        document.addEventListener('mousedown', listener);
        document.addEventListener('touchstart', listener);

        // Nettoyer les event listeners
        return () => {
            document.removeEventListener('mousedown', listener);
            document.removeEventListener('touchstart', listener);
        };
    }, [ref, handler]);
};