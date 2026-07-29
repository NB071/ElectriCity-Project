import type { ChatTemplate } from "@/hooks/api/chatbot/use-chat";
import { Car, MessageCircle, ShoppingCart, type LucideIcon } from "lucide-react";

export const CHAT_TEMPLATES: { id: ChatTemplate; icon: LucideIcon; label: string; hint: string }[] = [
    { id: "product-inquiry", icon: Car, label: "Vehicles", hint: "Specs, models, comparisons" },
    { id: "cart-assist", icon: ShoppingCart, label: "Cart", hint: "Checkout & cart help" },
    { id: "general-support", icon: MessageCircle, label: "Support", hint: "Financing & general Q&A" },
];

export const CHAT_WELCOME =
    "Hi! I can help with vehicles, customizations, financing, or your cart. What are you looking for?";

export const CHAT_SUGGESTIONS: { label: string; prompt: string; template: ChatTemplate }[] = [
    { label: "Best EVs under $50k", prompt: "What electric vehicles do you recommend under $50,000?", template: "product-inquiry" },
    { label: "Compare Model 3 vs Ioniq 5", prompt: "Can you compare the Tesla Model 3 and Hyundai Ioniq 5?", template: "product-inquiry" },
    { label: "Help with my cart", prompt: "I need help reviewing my cart before checkout.", template: "cart-assist" },
    { label: "Financing options", prompt: "What financing or payment options are available?", template: "general-support" },
];
