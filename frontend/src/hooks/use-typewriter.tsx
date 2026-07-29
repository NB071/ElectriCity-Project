// ref: https://medium.com/@hamzamakh/typewriter-effect-in-react-a103a4f385c9

import { useState, useEffect } from "react";

const useTypewriter = (text: string, speed = 50) => {
    const [displayText, setDisplayText] = useState("");
    const [typedText, setTypedText] = useState(text);

    if (text !== typedText) {
        setTypedText(text);
        setDisplayText("");
    }

    useEffect(() => {
        let i = 0;
        const typingInterval = setInterval(() => {
            if (i < text.length) {
                setDisplayText(text.slice(0, i + 1));
                i++;
            } else {
                clearInterval(typingInterval);
            }
        }, speed);

        return () => {
            clearInterval(typingInterval);
        };
    }, [text, speed]);

    return displayText;
};

export default useTypewriter;
