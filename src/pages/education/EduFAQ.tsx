// src/pages/education/EduFAQ.tsx
// VeloxSync for Education — FAQ (V3 homeschool)
// Public route, no sidebar. Accordion cards with schema.org FAQPage microdata.

import { useEffect, useState } from 'react';

const FAQ_CSS = `
.edu-faq { min-height: 100vh; background: #FAF7F2; font-family: 'Open Sans', sans-serif; color: #1C1812; padding: 64px 24px; }
.edu-faq-wrap { max-width: 760px; margin: 0 auto; }
.edu-faq-eyebrow { font-size: 11px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: #3D6B4F; margin-bottom: 8px; }
.edu-faq-title { font-family: 'Cormorant Garamond', serif; font-size: 42px; font-weight: 400; line-height: 1.1; color: #1C1812; }
.edu-faq-sub { font-size: 15px; color: rgba(28,24,18,0.6); margin-top: 10px; }
.edu-faq-card { background: #FFFFFF; border: 1px solid rgba(28,24,18,0.1); border-radius: 16px; margin-bottom: 12px; overflow: hidden; }
.edu-faq-question { width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 20px 26px; background: none; border: none; cursor: pointer; text-align: left; font-family: 'Open Sans', sans-serif; font-size: 15px; font-weight: 600; color: #1C1812; }
.edu-faq-question:hover { color: #3D6B4F; }
.edu-faq-chevron { flex-shrink: 0; color: #3D6B4F; transition: transform 0.25s ease; }
.edu-faq-chevron.open { transform: rotate(180deg); }
.edu-faq-answer { max-height: 0; overflow: hidden; transition: max-height 0.3s ease; }
.edu-faq-answer.open { max-height: 480px; }
.edu-faq-answer-body { padding: 0 26px 22px; font-size: 14px; line-height: 1.75; color: rgba(28,24,18,0.72); }
`;

const FAQ_ITEMS: { q: string; a: string }[] = [
  {
    q: 'Is this really free for 30 days?',
    a: 'Yes. No credit card required during the beta period. You get full access to every feature including Ei-Core lesson generation, ADHD support tools, and the STEM coding platform. After 30 days, the Family Plan is $19 per month or $149 per year for up to 6 children.',
  },
  {
    q: 'What does Ei-Core actually do?',
    a: 'Ei-Core is the AI engine we built into VeloxSync. Every morning it looks at each child’s progress, identifies where gaps exist, and generates a specific daily lesson plan for that child. It is not a chatbot and it is not a generic curriculum generator. It knows your child’s grade level, how they learn best, your curriculum approach, and any accommodations you have added. It uses all of that to build a plan that fits your family, not a classroom of 30 students.',
  },
  {
    q: 'Is my children’s data safe?',
    a: 'Yes. VeloxSync is built by a CISSP certified cybersecurity professional. Your children’s data is never sold, never shared with advertisers, and never used to train AI models. All data is encrypted. Passwords are hashed. We do not store payment information. Full details are in our privacy policy.',
  },
  {
    q: 'Does the AI use my children’s real names?',
    a: 'No. When Ei-Core generates a lesson plan, it receives your child’s grade level, curriculum approach, and learning style. It does not receive their full name or any identifying information. The AI sees a learner profile, not a person’s identity.',
  },
  {
    q: 'Does it work with our curriculum?',
    a: 'Yes. VeloxSync supports Classical, Charlotte Mason, Unschooling, Eclectic, Online, and Textbook-based approaches. You select your approach during onboarding and Ei-Core adjusts every recommendation to fit it. If you use a hybrid or eclectic approach, select Eclectic and add notes about your preferences in your child’s profile.',
  },
  {
    q: 'Does it cover our state’s standards?',
    a: 'Yes. All 50 states are included. When you select your state during onboarding, Ei-Core aligns lesson recommendations to your state’s published curriculum standards. This is useful for portfolio reviews, co-op reporting, and any state that requires documentation of what your child has covered.',
  },
  {
    q: 'What if my child has ADHD or a learning difference?',
    a: 'ADHD support is built into the platform from day one, not sold as an add-on. You can toggle IEP or learning accommodation support for any child. Ei-Core will use focus-friendly lesson structures, shorter activity blocks, movement break suggestions, and differentiated pacing automatically. You can also add specific accommodation notes to each child’s profile.',
  },
  {
    q: 'What is included in the STEM and coding platform?',
    a: 'The K-12 STEM and coding platform has three tracks. Explorer (K-5) uses visual and block-based coding activities. Builder (6-8) introduces Python fundamentals and computational thinking. Creator (9-12) covers Python, web development with HTML and CSS, and introductory React. All tracks are included in the Family Plan at no extra cost.',
  },
  {
    q: 'Can I add more than one child?',
    a: 'Yes. The Family Plan covers up to 6 children, all grade levels, all subjects. Each child gets their own profile, their own daily plan, and their own progress tracking. Ei-Core treats each child as an individual, not as a group.',
  },
  {
    q: 'How do I cancel?',
    a: 'You can cancel any time from the Settings page inside your account. There are no cancellation fees and no long-term commitments. If you cancel during your free trial, you will not be charged anything.',
  },
];

const Chevron = ({ open }: { open: boolean }) => (
  <svg
    className={`edu-faq-chevron${open ? ' open' : ''}`}
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

export default function EduFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    const styleEl = document.createElement('style');
    styleEl.setAttribute('data-edu-faq', 'true');
    styleEl.textContent = FAQ_CSS;
    document.head.appendChild(styleEl);
    return () => { document.head.removeChild(styleEl); };
  }, []);

  return (
    <div className="edu-faq">
      <div className="edu-faq-wrap">
        <header style={{ marginBottom: 36 }}>
          <div className="edu-faq-eyebrow">FAQ</div>
          <h1 className="edu-faq-title">Things parents ask first.</h1>
          <p className="edu-faq-sub">Honest answers before you commit to anything.</p>
        </header>

        <section itemScope itemType="https://schema.org/FAQPage">
          {FAQ_ITEMS.map((item, i) => {
            const open = openIndex === i;
            return (
              <div
                key={item.q}
                className="edu-faq-card"
                itemScope
                itemProp="mainEntity"
                itemType="https://schema.org/Question"
              >
                <button
                  type="button"
                  className="edu-faq-question"
                  aria-expanded={open}
                  onClick={() => setOpenIndex(open ? null : i)}
                >
                  <span itemProp="name">{item.q}</span>
                  <Chevron open={open} />
                </button>
                <div
                  className={`edu-faq-answer${open ? ' open' : ''}`}
                  itemScope
                  itemProp="acceptedAnswer"
                  itemType="https://schema.org/Answer"
                >
                  <p className="edu-faq-answer-body" itemProp="text">{item.a}</p>
                </div>
              </div>
            );
          })}
        </section>
      </div>
    </div>
  );
}
