// inspiration from https://blocks.so/ai

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

// Converted to lucide-react matching standard Vite project conventions
import { ArrowUp, PlusCircle, Paperclip, X, Car, ShoppingCart, MessageCircle } from "lucide-react";

interface AttachedFile {
    id: string;
    name: string;
    file: File;
    preview?: string;
}

const ACTIONS = [
    { id: "product-inquiry", icon: Car, label: "Product Inquiry" },
    { id: "cart-assist", icon: ShoppingCart, label: "Cart Assist" },
    { id: "general-support", icon: MessageCircle, label: "General Support" },
];

export default function ChatbotPrompt({ onSubmit }: { onSubmit?: (prompt: string, template: string) => void }) {
    const [prompt, setPrompt] = useState("");
    const [activeTemplate, setActiveTemplate] = useState<string>("general-support");
    const [isDragOver, setIsDragOver] = useState(false);
    const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);

    const generateFileId = () => Math.random().toString(36).substring(7);
    const processFiles = (files: File[]) => {
        for (const file of files) {
            const fileId = generateFileId();
            const attachedFile: AttachedFile = {
                id: fileId,
                name: file.name,
                file,
            };

            if (file.type.startsWith("image/")) {
                const reader = new FileReader();
                reader.onload = () => {
                    setAttachedFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, preview: reader.result as string } : f)));
                };
                reader.readAsDataURL(file);
            }

            setAttachedFiles((prev) => [...prev, attachedFile]);
        }
    };
    const submitPrompt = () => {
        if (prompt.trim() && onSubmit) {
            onSubmit(prompt.trim(), activeTemplate);
            setPrompt("");
        }
    };
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        submitPrompt();
    };
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };
    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    };
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);

        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            processFiles(files);
        }
    };
    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setPrompt(e.target.value);
    };
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submitPrompt();
        }
    };

    const handleRemoveFile = (fileId: string) => {
        setAttachedFiles((prev) => prev.filter((file) => file.id !== fileId));
    };

    return (
        <div className="mx-auto flex w-full flex-col gap-2">
            <h1 className="font-heading text-foreground text-center text-[29px] font-semibold tracking-tighter text-balance sm:text-[32px] md:text-[46px]">
                Your Personal EV Assistant
            </h1>
            <h2 className="text-muted-foreground pb-4 text-center text-xl text-balance">
                Find the perfect vehicle, explore customizations, or get support with your cart.
            </h2>

            <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-col content-center">
                <form
                    className="focus-within:border-ring overflow-visible rounded-xl border p-2 transition-colors duration-200"
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onSubmit={handleSubmit}
                >
                    {attachedFiles.length > 0 && (
                        <div className="relative mb-2 flex w-fit items-center gap-2 overflow-hidden">
                            {attachedFiles.map((file) => (
                                <Badge
                                    className="group hover:bg-accent relative h-6 max-w-30 cursor-pointer overflow-hidden px-0 text-[13px] transition-colors"
                                    key={file.id}
                                    variant="outline"
                                >
                                    <span className="flex h-full items-center gap-1.5 overflow-hidden pl-1 font-normal">
                                        <div className="relative flex h-4 min-w-4 items-center justify-center">
                                            {file.preview ? (
                                                <img
                                                    alt={file.name}
                                                    className="absolute inset-0 h-4 w-4 rounded border object-cover"
                                                    height={16}
                                                    src={file.preview}
                                                    width={16}
                                                />
                                            ) : (
                                                <Paperclip className="opacity-60" size={12} />
                                            )}
                                        </div>
                                        <span className="inline truncate overflow-hidden pr-1.5">{file.name}</span>
                                    </span>
                                    <button
                                        className="text-muted-foreground focus-visible:bg-accent focus-visible:ring-offset-background absolute right-1 z-10 rounded-sm p-0.5 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2"
                                        onClick={() => handleRemoveFile(file.id)}
                                        type="button"
                                    >
                                        <X size={12} />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    )}
                    <Textarea
                        className="max-h-50 min-h-12 resize-none rounded-none border-none bg-transparent! p-0 text-sm shadow-none focus-visible:border-transparent focus-visible:ring-0"
                        onChange={handleTextareaChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask anything"
                        value={prompt}
                    />

                    <div className="flex items-center gap-1">
                        <div className="ml-auto flex items-center gap-0.5 sm:gap-1">
                            <Button
                                aria-label="Send message"
                                className="rounded-md"
                                disabled={!prompt.trim()}
                                size="icon"
                                type="submit"
                                variant="default"
                            >
                                <ArrowUp size={16} />
                            </Button>
                        </div>
                    </div>

                    <div
                        className={cn(
                            "border-border bg-muted text-foreground pointer-events-none absolute inset-0 z-20 flex items-center justify-center rounded-[inherit] border border-dashed text-sm transition-opacity duration-200",
                            isDragOver ? "opacity-100" : "opacity-0"
                        )}
                    >
                        <span className="flex w-full items-center justify-center gap-1 font-medium">
                            <PlusCircle className="min-w-4" size={16} />
                            Drop files here to add as attachments
                        </span>
                    </div>
                </form>
            </div>

            <div className="mx-auto flex min-h-0 max-w-250 shrink-0 flex-wrap items-center justify-center gap-3">
                {ACTIONS.map((action) => (
                    <Button
                        className="gap-2 rounded-full transition-colors duration-200"
                        key={action.id}
                        size="sm"
                        variant={activeTemplate === action.id ? "default" : "outline"}
                        onClick={() => setActiveTemplate(action.id)}
                        type="button"
                    >
                        <action.icon size={16} />
                        {action.label}
                    </Button>
                ))}
            </div>
        </div>
    );
}
