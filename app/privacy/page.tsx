import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for LoftyXphereHomes - how we collect, use, and protect your personal information.",
};

export default function PrivacyPage() {
  return (
    <div className="pt-20 pb-20 bg-white min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="pt-12 mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">
            Privacy Policy
          </h1>
          <p className="text-black/70">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="prose prose-lg max-w-none space-y-8 text-black/80">
          <section>
            <h2 className="text-2xl font-bold text-black mb-4">1. Information We Collect</h2>
            <p>We collect information that you provide directly to us, including:</p>
            <ul className="list-disc pl-6 space-y-2 text-black/80">
              <li>Name, email address, and phone number</li>
              <li>Booking and payment information</li>
              <li>Communication preferences</li>
              <li>Any other information you choose to provide</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">2. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-2 text-black/80">
              <li>Process and manage your bookings</li>
              <li>Communicate with you about your reservations</li>
              <li>Send you updates and promotional materials (with your consent)</li>
              <li>Improve our services and customer experience</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">3. Information Sharing</h2>
            <p>
              We do not sell, trade, or rent your personal information to third parties. We may
              share your information only in the following circumstances:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-black/80">
              <li>With service providers who assist us in operating our business</li>
              <li>When required by law or to protect our rights</li>
              <li>With your explicit consent</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">4. Data Security</h2>
            <p>
              We implement appropriate security measures to protect your personal information.
              However, no method of transmission over the internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">5. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2 text-black/80">
              <li>Access your personal information</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Opt-out of marketing communications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">6. Contact Us</h2>
            <p>
              If you have questions about this privacy policy, please contact us at
              info@loftyxpherehomes.com or +234 800 000 0000.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

