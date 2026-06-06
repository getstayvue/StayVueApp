import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  {
    category: 'Getting Started',
    questions: [
      {
        q: 'How do I get my booking data into StayVue?',
        a: 'There are two main ways. First, you can use CSV Import — go to Bookings, click "Import CSV", and upload an export file from Airbnb, VRBO, or Booking.com. StayVue auto-detects the column format from each platform. Second, you can link your iCal calendar URL from each platform (found in your host dashboard\'s calendar settings) and StayVue will sync reservations automatically.\n\nSome booking details like nightly rates and fees may need to be entered or adjusted manually, since platforms don\'t always include full financial data in their exports. This is a deliberate trade-off — by not requiring expensive API integrations with each platform, we keep StayVue as a one-time purchase instead of charging monthly fees.',
      },
      {
        q: 'Why do I need to do some manual data entry?',
        a: 'Short-term rental platforms like Airbnb and VRBO don\'t provide free, open APIs for third-party apps to pull your data automatically. The companies that offer full automation charge monthly fees ($20-50/mo) because they pay for premium API access and ongoing data sync infrastructure.\n\nStayVue takes a different approach: we give you powerful CSV import and iCal sync that handles the bulk of the work, and you fill in any gaps manually. Most hosts spend 5-10 minutes after each booking adding details. The trade-off? You pay once instead of every month. Over a year, that saves you $240-600.',
      },
      {
        q: 'Can I try StayVue before buying?',
        a: 'Absolutely! Every new account gets a free 3-day trial with full access to all features — no credit card required. Explore the dashboard, import bookings, test the calendar sync, try expense tracking, and browse the Help Centre. After 3 days, simply choose the plan that fits your hosting business to keep all your data and continue using StayVue.',
      },
      {
        q: 'Where can I find help using the app?',
        a: 'StayVue includes a comprehensive built-in Help Centre with step-by-step guides for every feature. You\'ll find a Help tab in the sidebar, plus a (?) button on every page that opens a guide specific to that section. Between the Help Centre, the FAQ page, and the how-to guides for calendar syncing, most questions are answered right inside the app.',
      },
    ],
  },
  {
    category: 'Pricing & Payments',
    questions: [
      {
        q: 'Is this really a one-time payment? No monthly fees?',
        a: 'Yes — you pay once and own StayVue forever. No monthly subscriptions, no annual renewals, no surprise charges. All core features (bookings, expenses, guest CRM, calendar, dashboard, tax reports, cleaning checklists) are included in your one-time purchase. All prices are in USD.\n\n*The only optional cost is Optional Cloud Backup & Sync if you need storage beyond your plan\'s included amount. You can also avoid this entirely by downloading your files locally to free up cloud space — the app has a built-in data export tool for exactly this purpose.',
      },
      {
        q: 'What\'s included in each plan?',
        a: 'Starter ($49.99) — 2 properties, all core features, 1 GB cloud storage. Perfect for solo hosts.\n\nProfessional ($74.99) — 7 properties, 3 team members, 5 GB cloud storage, vendor management, priority support. Best value for growing hosts.\n\nPortfolio ($129.99) — 15 properties, 10 team members, 10 GB cloud storage, full data export, early access to new features.\n\nAll prices are in USD.',
      },
      {
        q: 'Can I upgrade my plan later?',
        a: 'Absolutely. You can also add individual property slots, team members, or cloud storage at any time through the app without upgrading your entire plan. Add-on pricing (USD): +1 property ($9), +5 properties ($29), +1 team member ($19), +5 team members ($49). Optional Cloud Backup & Sync available if you need extra storage.',
      },
      {
        q: 'What payment methods do you accept?',
        a: 'We accept all major credit cards (Visa, Mastercard, American Express), debit cards, Apple Pay, and Google Pay through our secure Stripe payment processing.',
      },
      {
        q: 'I purchased a plan but I\'m having trouble. What should I do?',
        a: 'Check the Help Centre inside the app — it has step-by-step guides for every feature and covers the most common questions. There\'s a Help tab in the sidebar and a (?) button on each page. The FAQ section also covers common setup questions. Our support team is focused on resolving technical issues that can\'t be solved through the built-in guides.',
      },
    ],
  },
  {
    category: 'Features & Functionality',
    questions: [
      {
        q: 'Which booking platforms does StayVue work with?',
        a: 'StayVue works with Airbnb, VRBO, Booking.com, and any platform that supports iCal calendar export. You can also track direct bookings. The CSV import tool auto-detects formats from Airbnb, VRBO, and Booking.com exports.',
      },
      {
        q: 'Can I manage multiple properties?',
        a: 'Yes — every plan supports multiple properties (2 with Starter, 7 with Professional, 15 with Portfolio). Use the property selector in the sidebar to switch between properties or view combined data across your entire portfolio. Need more? Add individual property slots starting at $9 each.',
      },
      {
        q: 'How does the tax reporting work?',
        a: 'The Tax Centre gives you an annual summary with per-property income, expense breakdowns, deductible expenses, and net income. Click "Download CSV" to get a comprehensive spreadsheet with five sections your accountant can open in Excel or Google Sheets. It includes every booking, every expense (with vendor and receipt status), category totals, maintenance costs, and a net income summary.',
      },
      {
        q: 'Can I share access with my co-host or cleaning team?',
        a: 'Yes — the Team feature (included in Professional and Portfolio plans, or available as an add-on) lets you invite co-hosts, property managers, cleaners, and accountants with granular permissions. You control exactly what each person can see and edit.',
      },
      {
        q: 'Does StayVue work on my phone?',
        a: 'Yes — StayVue is a Progressive Web App (PWA) that works on iPhone and Android. Open it in your phone\'s browser, then add it to your home screen for a native app experience with its own icon and full-screen mode. No app store download required.',
      },
      {
        q: 'Can I upload receipts and documents?',
        a: 'Yes — you can attach photos of receipts, invoices, contracts, insurance policies, and any other documents directly to expenses or the property\'s document vault. Supports images, PDFs, and documents up to 25 MB each.',
      },
    ],
  },
  {
    category: 'Data & Storage',
    questions: [
      {
        q: 'What happens if I run out of storage?',
        a: 'You have two options: add Optional Cloud Backup & Sync for extra storage, or download your files locally and delete them from the cloud to free up space. Your booking records, expense data, and guest information don\'t count toward storage — only uploaded files like receipt photos and documents use storage space.\n\nThe app includes a Storage & Data page where you can see exactly how much space you\'re using, and a "Download All Data" button that exports everything as a backup file you can keep on your computer.',
      },
      {
        q: 'Is my data secure?',
        a: 'Yes — your data is stored with encryption at rest and in transit. Passwords are hashed with bcrypt. Sessions use secure tokens with automatic expiration. File uploads are stored in private cloud storage accessible only to authenticated users.',
      },
      {
        q: 'Can I export my data?',
        a: 'Yes — you can export all your data at any time. The Tax Centre exports financial data as CSV. The Storage & Data page has a "Download All Data" button that exports your entire database as a JSON file. Your data is always yours.',
      },
      {
        q: 'Can I download my receipts and files to free up storage?',
        a: 'Yes — this is exactly what we recommend if you\'re approaching your storage limit. Download your receipt images and documents to your computer, then remove them from the app to reclaim cloud storage space. Your expense records and booking data stay in the app — only the attached files are removed. This way you can keep using StayVue without ever needing Optional Cloud Backup & Sync.',
      },
    ],
  },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-stone-100 last:border-0">
      <button onClick={() => setOpen(!open)} className="w-full flex items-start justify-between gap-4 py-4 text-left group">
        <span className={`text-sm font-medium transition-colors ${open ? 'text-brand-600' : 'text-stone-800 group-hover:text-brand-600'}`}>{q}</span>
        <ChevronDown size={16} className={`shrink-0 mt-0.5 text-stone-400 transition-transform ${open ? 'rotate-180 text-brand-500' : ''}`} />
      </button>
      {open && (
        <div className="pb-4 pr-8">
          {a.split('\n\n').map((para, i) => (
            <p key={i} className={`text-sm text-stone-500 leading-relaxed ${i > 0 ? 'mt-3' : ''}`}>{para}</p>
          ))}
        </div>
      )}
    </div>
  );
}

export default function FAQ({ embedded }) {
  return (
    <div className={embedded ? '' : 'space-y-6'}>
      {!embedded && (
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Frequently Asked Questions</h1>
          <p className="text-sm text-stone-400 mt-1">Everything you need to know about StayVue</p>
        </div>
      )}

      <div className="space-y-8">
        {FAQS.map(cat => (
          <div key={cat.category} className={embedded ? '' : 'card p-6'}>
            <h2 className={`text-sm font-bold uppercase tracking-wider mb-4 ${embedded ? 'text-stone-500' : 'text-brand-600'}`}>{cat.category}</h2>
            <div>
              {cat.questions.map(faq => (
                <FAQItem key={faq.q} q={faq.q} a={faq.a} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {!embedded && (
        <div className="card p-6 bg-stone-50 text-center">
          <p className="text-sm font-medium text-stone-700 mb-1">Need more help?</p>
          <p className="text-xs text-stone-500">Check the <span className="font-medium text-brand-600">Help Centre</span> in the sidebar for step-by-step guides on every feature.</p>
        </div>
      )}
    </div>
  );
}

export { FAQS, FAQItem };
