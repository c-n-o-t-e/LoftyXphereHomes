import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Terms and conditions for using LoftyXphereHomes services.",
};

export default function TermsPage() {
  return (
    <div className="pt-20 pb-20 bg-white min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="pt-12 mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">
            Terms & Conditions
          </h1>
          <p className="text-black/70">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="prose prose-lg max-w-none space-y-8 text-black/80">
          <section>
            <h2 className="text-2xl font-bold text-black mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using LoftyXphereHomes services, you accept and agree to be bound
              by the terms and provision of this agreement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">2. Booking and Payment</h2>
            <ul className="list-disc pl-6 space-y-2 text-black/80">
              <li>All bookings are subject to availability and confirmation.</li>
              <li>Payment must be made in full at the time of booking unless otherwise agreed.</li>
              <li>Prices are subject to change without notice until booking is confirmed.</li>
              <li>Refunds are subject to our cancellation policy.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">3. Cancellation Policy</h2>
            <ul className="list-disc pl-6 space-y-2 text-black/80">
              <li>Cancellations made 7 days or more before check-in: Full refund</li>
              <li>Cancellations made 3-6 days before check-in: 50% refund</li>
              <li>Cancellations made less than 3 days before check-in: No refund</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">4. Guest Responsibilities</h2>
            <ul className="list-disc pl-6 space-y-2 text-black/80">
              <li>Guests must provide valid identification upon check-in.</li>
              <li>Guests are responsible for any damage to the property during their stay.</li>
              <li>No smoking indoors or parties without prior approval.</li>
              <li>Respect neighbors and maintain noise levels, especially after 10 PM.</li>
              <li>Check-in time is 2:00 PM and check-out time is 11:00 AM.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">5. Liability</h2>
            <p className="text-black/80">
              LoftyXphereHomes is not liable for any loss, damage, or injury to guests or their
              property during their stay. Guests are advised to secure appropriate travel insurance.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">6. Contact Information</h2>
            <p className="text-black/80">
              For any questions regarding these terms, please contact us at
              info@loftyxpherehomes.com or +234 800 000 0000.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

