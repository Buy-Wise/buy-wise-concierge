import React from 'react';

const Contact = () => (
  <div className="max-w-2xl mx-auto px-4 py-32">
    <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
    <p className="text-gray-400 mb-10">Have a question? We're here to help.</p>
    <div className="grid gap-6 mb-10">
      <a href="mailto:support@buywiseindia.com"
        className="flex items-center bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-xl p-6 hover:bg-[#D4AF37]/20 transition-all">
        <div className="w-12 h-12 bg-[#D4AF37] rounded-full flex items-center justify-center mr-4 text-black font-bold text-xl">@</div>
        <div>
          <div className="font-bold text-lg text-white">Email Support</div>
          <div className="text-gray-400">support@buywiseindia.com • Reply within 1 hour</div>
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
      ['Information We Collect', 'We collect the information you provide when you register, place an order, or fill our intake form: name, email, and product preferences.'],
      ['Data Usage', 'Your data is solely used to generate personalized buying intelligence reports and alert you on price drops. We do not sell data.'],
      ['Third-Party Services', 'We use Razorpay for payments and Cloudinary for secure report storage. These services have their own privacy policies.'],
      ['Storage', 'We securely store your reports. You can delete your account and all associated data anytime.'],
      ['Cookies', 'We use essential cookies to maintain your session securely. We do not use third-party tracking cookies.'],
      ['Contact', 'For privacy concerns, contact us at privacy@buywiseindia.com']
    ].map(([title, body]) => (
      <div key={title} className="mb-8">
        <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
        <p className="text-gray-400">{body}</p>
      </div>
    ))}
  </div>
);

const FAQ = () => (
  <div className="max-w-3xl mx-auto px-4 py-32">
    <h1 className="text-4xl font-bold mb-8 text-center">Frequently Asked Questions</h1>
    <div className="space-y-6">
      {[
        ['How long does it take to get a report?', 'Typically, reports are generated instantly (within 1-2 minutes). For some complex queries, it might take up to 5 minutes.'],
        ['Is the research truly unbiased?', 'Yes. We do not accept sponsorship from brands. Our AI analyzes technical specifications, user reviews from across the web, and performance data to give you an objective recommendation.'],
        ['What if I am not happy with the report?', 'We strive for excellence. If you find the report completely irrelevant to your requirements, please contact support within 24 hours for a resolution or refund.'],
        ['Can I get the report in my local language?', 'Yes, we currently support English, Hindi, and Tamil. You can set your preference in your Profile settings.'],
        ['How does Deal Watch work?', 'You can set a target price for any product. Our system monitors major retailers and emails you the moment the price drops below your target.'],
        ['Is my payment secure?', 'We use Razorpay, India\'s leading payment gateway. We never store your card or banking details on our servers.'],
      ].map(([q, a]) => (
        <div key={q} className="bg-[#111] border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-2 text-[#D4AF37]">{q}</h3>
          <p className="text-gray-400">{a}</p>
        </div>
      ))}
    </div>
  </div>
);

const Terms = () => (
  <div className="max-w-3xl mx-auto px-4 py-32 prose prose-invert">
    <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
    <p className="text-gray-400 mb-6">Last updated: March 2026</p>
    {[
      ['Service Description', 'Buy Wise provides AI-driven retail intelligence and price monitoring services.'],
      ['User Accounts', 'You are responsible for maintaining the security of your account and password.'],
      ['Payments & Refunds', 'Payments are processed via Razorpay. Refunds are handled on a case-by-case basis as outlined in our FAQ.'],
      ['Intellectual Property', 'The reports generated are for your personal, non-commercial use only.'],
      ['Liability', 'We strive for accuracy but cannot guarantee that AI-generated recommendations are perfect or legally binding.'],
      ['Governing Law', 'These terms are governed by the laws of India.']
    ].map(([title, body]) => (
      <div key={title} className="mb-8">
        <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
        <p className="text-gray-400">{body}</p>
      </div>
    ))}
  </div>
);

export { Contact, Privacy, Terms, FAQ };
