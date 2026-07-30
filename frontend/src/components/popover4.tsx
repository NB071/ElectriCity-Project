"use client";

// idea: https://shadcnuikit.com/components/popover
import { CheckIcon, CopyIcon, MailIcon, MessageCircleIcon, Share2Icon, UsersIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type SharePopoverProps = {
    title: string;
    url?: string;
};

export default function SharePopover({ title, url }: SharePopoverProps) {
    const [copied, setCopied] = useState(false);
    const shareUrl = url ?? (typeof window !== "undefined" ? window.location.href : "");
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(title);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 rounded-full px-4 text-xs font-semibold">
                    <Share2Icon data-icon="inline-start" />
                    Share
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-72">
                <PopoverHeader className="text-center">
                    <PopoverTitle>Share vehicle</PopoverTitle>
                    <PopoverDescription>Send this vehicle to someone or copy its link.</PopoverDescription>
                </PopoverHeader>

                <div className="flex flex-wrap justify-center gap-2">
                    <Button asChild aria-label="Share on X" size="icon" variant="outline">
                        <a href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`} target="_blank" rel="noreferrer">
                            <MessageCircleIcon />
                        </a>
                    </Button>
                    <Button asChild aria-label="Share on Facebook" size="icon" variant="outline">
                        <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`} target="_blank" rel="noreferrer">
                            <UsersIcon />
                        </a>
                    </Button>
                    <Button asChild aria-label="Share by email" size="icon" variant="outline">
                        <a href={`mailto:?subject=${encodedTitle}&body=${encodeURIComponent(`${title}\n\n${shareUrl}`)}`}>
                            <MailIcon />
                        </a>
                    </Button>
                </div>

                <InputGroup>
                    <InputGroupInput aria-label="Share link" readOnly value={shareUrl} />
                    <InputGroupAddon align="inline-end">
                        <TooltipProvider delayDuration={0}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <InputGroupButton
                                        aria-label={copied ? "Copied" : "Copy link"}
                                        disabled={copied}
                                        onClick={() => void handleCopy()}
                                        size="icon-xs"
                                    >
                                        {copied ? <CheckIcon className="text-primary" /> : <CopyIcon />}
                                    </InputGroupButton>
                                </TooltipTrigger>
                                <TooltipContent>{copied ? "Copied" : "Copy link"}</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </InputGroupAddon>
                </InputGroup>
            </PopoverContent>
        </Popover>
    );
}
