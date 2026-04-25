import { FaWhatsapp } from "react-icons/fa";
import { cn } from "@/lib/utils";
import { getWhatsAppChatUrl, WHATSAPP_DEFAULT_MESSAGE } from "@/lib/constants";

type WhatsAppFloatButtonProps = {
  className?: string;
};

/**
 * Fixed bottom-right link to WhatsApp with a pre-filled message.
 * Renders nothing if the configured number is missing or invalid.
 *
 * Uses `WHATSAPP_NUMBER` (read at server runtime; no rebuild after .env changes) or
 * `NEXT_PUBLIC_WHATSAPP_NUMBER` (inlined at build time; requires rebuild in production).
 */
export default function WhatsAppFloatButton({ className }: WhatsAppFloatButtonProps) {
  const raw =
    process.env.WHATSAPP_NUMBER?.trim() ||
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim();
  const href = raw ? getWhatsAppChatUrl(raw, WHATSAPP_DEFAULT_MESSAGE) : null;

  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "fixed z-60 flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-[1.02] hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366]",
        "bottom-[max(1.25rem,env(safe-area-inset-bottom,0px))] right-4 sm:right-6",
        "max-sm:pr-3",
        className
      )}
      aria-label="Message us on WhatsApp. Opens in a new tab."
      title="Message us on WhatsApp"
    >
      <FaWhatsapp className="size-6 shrink-0" aria-hidden />
      <span className="max-sm:sr-only">Message us</span>
    </a>
  );
}
