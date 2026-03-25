import React from 'react';

const Contact = () => (
  <div className="max-w-2xl mx-auto px-4 py-32">
    <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
    <p className="text-gray-400 mb-10">Have a question? We're here to help.</p>
    <div className="grid gap-6 mb-10">
      <a href="https://wa.me/919876543210" target="_blank" rel="noreferrer"
        className="flex items-center bg-[#25D366]/10 border border-[#25D366]/30 rounded-xl p-6 hover:bg-[#25D366]/20 transition-all">
        <div className="w-12 h-12 bg-[#25D366] rounded-full flex items-center justify-center mr-4 text-white font-bold text-xl">W</div>
        <div>
          <div className="font-bold text-lg">WhatsApp (Fastest)</div>
          <div className="text-gray-400">+91 98765 43210 — Reply within 1 hour</div>
        </div>
      </a>
    </div>
    <form className="bg-[#111] border border-white/10 rounded-2xl p-8 space-y-5">
      <h2 className="text-xl font-bold">Or send an email</h2>
      <div><label className="block text-sm text-gray-400 mb-1">Name</label>
        <input type="text" className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg p-3 text-white focus:border-[#D4AF37] focus:outline-none" placeholder="Your Name" /></div>
      <div><label className="block text-sm text-gray-400 mb-1">Email</label>
        <input type="email" className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg p-3 text-white focus:border-[#D4AF37] focus:outline-none" placeholder="you@email.com" /></div>
      <div><label className="block text-sm text-gray-400 mb-1">Message</label>
        <textarea rows="4" className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg p-3 text-white focus:border-[#D4AF37] focus:outline-none" placeholder="Your question or concern..." /></div>
      <button className="w-full bg-[#D4AF37] text-black py-3 rounded-lg font-bold hover:bg-[#b8972e]">Send Message</button>
    </form>
  </div>
);

const Privacy = () => (
  <div className="max-w-3xl mx-auto px-4 py-32 prose prose-invert">
    <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
    <p className="text-gray-400 mb-6">Last updated: March 2026</p>
    {[
      ['Information We Collect', 'We collect the information you provide when you register, place an order, or fill our intake form: name, email, WhatsApp number, and product preferences.'],
      ['How We Use Your Information', 'Your data is used solely to generate and deliver your personalised buying research report. We do not sell your data to third parties.'],
      ['Third-Party Services', 'We use Razorpay for payments and WATI for WhatsApp delivery. These services have their own privacy policies.'],
      ['WhatsApp Delivery', 'By providing your WhatsApp number, you consent to receiving your report and a single follow-up feedback message via WhatsApp.'],
      ['Data Retention', 'Order and report data is retained for 12 months for support purposes. You can request deletion by contacting us.'],
      ['Contact', 'For privacy concerns, contact us at privacy@buywiseindia.com or via WhatsApp.'],
    ].map(([title, body]) => (
      <div key={title} className="mb-8">
        <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
        <p className="text-gray-400">{body}</p>
      </div>
    ))}
  </div>
);

const Terms = () => (
  <div className="max-w-3xl mx-auto px-4 py-32">
    <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
    <p className="text-gray-400 mb-6">Last updated: March 2026</p>
    {[
      ['Service Description', 'Buy Wise provides AI-generated product research reports based on information you supply. Reports are advisory in nature and do not constitute professional financial advice.'],
      ['No Guarantee of Purchase Outcome', 'Product prices, availability, and specifications change continuously. We strive for accuracy but cannot guarantee real-time correctness.'],
      ['Payments and Refunds', 'All payments are final. Refunds are only issued if a report is not delivered within 48 hours of payment. Contact support for refund requests.'],
      ['Acceptable Use', 'You agree not to misuse the platform, attempt to reverse-engineer our AI system, or scrape our reports for commercial redistribution.'],
      ['Limitation of Liability', 'Buy Wise is not liable for purchases you make based on our reports. You are responsible for your own purchase decisions.'],
      ['Changes to Terms', 'We may update these terms at any time. Continued use of the platform constitutes acceptance of the updated terms.'],
    ].map(([title, body]) => (
      <div key={title} className="mb-8">
        <h2 className="text-xl font-bold mb-2">{title}</h2>
        <p className="text-gray-400">{body}</p>
      </div>
    ))}
  </div>
);

export { Contact, Privacy, Terms };
