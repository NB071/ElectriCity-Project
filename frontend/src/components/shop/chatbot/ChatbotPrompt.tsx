// inspiration from https://blocks.so/ai

import { useFormik } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { ArrowUp, Loader2 } from "lucide-react";
import type { ChatTemplate } from "@/hooks/api/chatbot/use-chat";
import { CHAT_TEMPLATES } from "@/components/shop/chatbot/chat-constants";
import { CHAT_USER_MESSAGE, chatUserPromptSchema, type ChatUserPromptValues } from "@/zod/chatbot";

type ChatbotPromptProps = {
    onSubmit: (prompt: string, template: ChatTemplate) => void;
    isSending?: boolean;
    className?: string;
};

const initialValues: ChatUserPromptValues = {
    userMessage: "",
    template: "general-support",
};

export default function ChatbotPrompt({ onSubmit, isSending = false, className }: ChatbotPromptProps) {
    const formik = useFormik<ChatUserPromptValues>({
        initialValues,
        validationSchema: toFormikValidationSchema(chatUserPromptSchema),
        onSubmit: (values, { resetForm }) => {
            onSubmit(values.userMessage.trim(), values.template);
            resetForm({
                values: { ...initialValues, template: values.template },
                errors: {},
                touched: {},
                submitCount: 0,
            });
        },
    });

    const messageLength = formik.values.userMessage.length;
    const trimmedLength = formik.values.userMessage.trim().length;
    const showError = Boolean(formik.touched.userMessage && formik.errors.userMessage && messageLength > 0);
    const canSend = trimmedLength >= CHAT_USER_MESSAGE.MIN && messageLength <= CHAT_USER_MESSAGE.MAX && !isSending && !formik.isSubmitting;

    return (
        <div className={cn("mx-auto flex w-full max-w-3xl flex-col gap-3", className)}>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                {CHAT_TEMPLATES.map((action) => {
                    const active = formik.values.template === action.id;
                    return (
                        <Button
                            key={action.id}
                            type="button"
                            size="sm"
                            variant={active ? "default" : "outline"}
                            className="h-8 gap-1.5 rounded-full"
                            disabled={isSending}
                            onClick={() => formik.setFieldValue("template", action.id)}
                            title={action.hint}
                        >
                            <action.icon className="size-3.5" />
                            {action.label}
                        </Button>
                    );
                })}
            </div>

            <form
                className={cn(
                    "bg-background rounded-2xl border p-2 shadow-sm transition-shadow",
                    showError
                        ? "border-destructive focus-within:border-destructive focus-within:ring-destructive/20 focus-within:ring-2"
                        : "border-border focus-within:border-ring focus-within:ring-ring/20 focus-within:ring-2"
                )}
                onSubmit={formik.handleSubmit}
            >
                <Textarea
                    id="userMessage"
                    name="userMessage"
                    className="max-h-40 min-h-12 resize-none rounded-none border-none bg-transparent p-2 text-sm shadow-none focus-visible:ring-0 aria-invalid:border-transparent aria-invalid:ring-0 dark:aria-invalid:border-transparent dark:aria-invalid:ring-0"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            if (!canSend) return;
                            void formik.submitForm();
                        }
                    }}
                    placeholder="Ask about vehicles, your cart, or support..."
                    value={formik.values.userMessage}
                    disabled={isSending}
                    maxLength={CHAT_USER_MESSAGE.MAX}
                    rows={2}
                    aria-invalid={showError}
                />

                <div className="flex items-center justify-between gap-2 px-1 pt-1">
                    <p className={cn("text-[11px]", showError ? "text-destructive" : "text-muted-foreground")}>
                        {showError ? (
                            formik.errors.userMessage
                        ) : (
                            <>
                                <span className="hidden sm:inline">Enter to send · Shift+Enter for a new line · </span>
                                {messageLength}/{CHAT_USER_MESSAGE.MAX}
                            </>
                        )}
                    </p>
                    <Button aria-label="Send message" className="ml-auto rounded-xl" disabled={!canSend} size="icon" type="submit">
                        {isSending ? <Loader2 className="size-4 animate-spin" /> : <ArrowUp className="size-4" />}
                    </Button>
                </div>
            </form>
        </div>
    );
}
