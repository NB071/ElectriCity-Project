// ref: https://medium.com/@hamzamakh/typewriter-effect-in-react-a103a4f385c9

import useTypewriter from "@/hooks/use-typewriter";
import { cn } from "@/lib/utils";

type TypewriterProps = {
    text: string;
    speed?: number;
    className?: string;
};

const Typewriter = ({ text, speed = 50, className }: TypewriterProps) => {
    const displayText = useTypewriter(text, speed);

    return <span className={cn("whitespace-pre-wrap", className)}>{displayText}</span>;
};

export default Typewriter;
