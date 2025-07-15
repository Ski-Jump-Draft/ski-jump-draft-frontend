import { useEffect, useState } from 'react';

function useDots(interval = 400) {
    const [dots, setDots] = useState('');

    useEffect(() => {
        const values = ['', '.', '..', '...'];
        let i = 0;

        const id = setInterval(() => {
            i = (i + 1) % values.length;
            setDots(values[i]);
        }, interval);

        return () => clearInterval(id);
    }, [interval]);

    return dots;
}
