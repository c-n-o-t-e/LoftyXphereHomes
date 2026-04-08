"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  category: z.enum(["booking", "partnership", "long-stay", "complaints"]).refine(
    (val) => val !== undefined,
    { message: "Please select an inquiry category" }
  ),
  message: z.string().min(10, "Message must be at least 10 characters"),
  // Honeypot: should remain empty (hidden from humans)
  website: z.string().optional(),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

export function ContactForm() {
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const prefill = useMemo(() => {
    const category = searchParams.get("category");
    const message = searchParams.get("message");
    const allowed = new Set(["booking", "partnership", "long-stay", "complaints"]);
    return {
      category:
        category && allowed.has(category)
          ? (category as ContactFormData["category"])
          : undefined,
      message: typeof message === "string" && message.trim() ? message : "",
    };
  }, [searchParams]);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      category: undefined,
      message: '',
      website: '',
    },
  });

  useEffect(() => {
    if (prefill.category) {
      form.setValue("category", prefill.category, { shouldValidate: true });
    }
    if (prefill.message) {
      form.setValue("message", prefill.message, { shouldValidate: true });
    }
    // We only want to apply prefill on first load / when URL changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefill.category, prefill.message]);

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg =
          (typeof payload?.error === "string" && payload.error) ||
          "We couldn’t send your message right now. Please try again.";
        throw new Error(msg);
      }

      setIsSubmitted(true);
      form.reset({
        name: "",
        email: "",
        phone: "",
        category: undefined,
        message: "",
        website: "",
      });

      setTimeout(() => {
        setIsSubmitted(false);
      }, 3000);
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : "We couldn’t send your message right now. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-[#FA5C5C]/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-[#FA5C5C]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-black mb-2">Message Sent!</h3>
        <p className="text-black/70">
          We&apos;ve received your message and will get back to you soon.
        </p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Honeypot field (hidden from humans) */}
        <div className="hidden" aria-hidden="true">
          <label htmlFor="website">Website</label>
          <input
            id="website"
            tabIndex={-1}
            autoComplete="off"
            {...form.register("website")}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" autoComplete="name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    autoComplete="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input
                    type="tel"
                    placeholder="+234 8161122328"
                    autoComplete="tel"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Inquiry Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="booking">Booking</SelectItem>
                    <SelectItem value="partnership">Partnership</SelectItem>
                    <SelectItem value="long-stay">Long-stay</SelectItem>
                    <SelectItem value="complaints">Complaints</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="How can we help you?"
                  className="min-h-[150px]"
                  autoComplete="off"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {submitError && (
          <div
            className="bg-red-50 border border-red-200 rounded-lg p-3"
            role="alert"
          >
            <p className="text-sm text-red-700">{submitError}</p>
          </div>
        )}

        <Button
          type="submit"
          size="lg"
          className="w-full rounded-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Sending..." : "Send Message"}
        </Button>
      </form>
    </Form>
  );
}

