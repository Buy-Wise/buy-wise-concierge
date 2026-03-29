/**
 * buildReportPrompt — Constructs the Gemini prompt for a given order's intake form.
 * Optimized for local Indian market data and specific language output.
 */
const buildReportPrompt = (user, order, form) => {
  const optionCount = order.service_tier === 'PRO' ? '5–7' : '3';
  const langCode = user.language_preference || 'EN';
  const langName = langCode === 'HI' ? 'Hindi' : langCode === 'TA' ? 'Tamil' : 'English';

  const budget = form.budget_range || (form.budget_min ? `₹${form.budget_min} to ₹${form.budget_max}` : 'Not specified');
  const primaryUse = form.primary_use || form.primary_use_case || 'General use';
  const mustHave = form.must_have_features || form.preferences || 'Not specified';
  const priorities = form.priority_factors || form.deal_breakers || 'Not specified';
  const notes = form.additional_notes || 'None';

  return `SYSTEM INSTRUCTION: You are a elite Product Research Specialist for "Buy Wise".
Your goal is to provide a comprehensive, data-driven research report for a customer in India.
LANGUAGE: You MUST write the ENTIRE report in ${langName}. If technical terms don't have a direct translation, use the English term written in ${langName} script (transliteration).

USER PROFILE:
- Customer Name: ${user.name}
- Language: ${langName}
- Budget: ${budget}
- Product Category: ${order.product_category}
- Use Case: ${primaryUse}
- Must-Haves: ${mustHave}
- Deal Breakers: ${priorities}
- Context: ${notes}

REPORT STRUCTURE (Strictly follow this):

# ${langName === 'Tamil' ? 'சிறந்த தயாரிப்பு ஆராய்ச்சி அறிக்கை' : langName === 'Hindi' ? 'स्मार्ट खरीद अनुसंधान रिपोर्ट' : 'Smart Buy Research Report'}: ${order.product_category}

## 1. Executive Summary
- Brief overview of the market for ${order.product_category} in India within ${budget}.
- Top 3 things to look for in this category.

## 2. Top ${optionCount} Recommendations
For each product, provide:
- **[Model Name]** (Price: ₹[Current Price])
- **Why this fits you:** (Directly link to their use case: ${primaryUse})
- **Pros:** (Detailed, specific to India/Warranty/Service)
- **Cons:** (Be honest about drawbacks)
- **Best for:** (e.g., Professionals, Students, Home use)

## 3. Comparison Matrix
- Create a markdown table comparing the top 3 options on: Price, Performance, Battery/Durability, and After-Sales Support in India.

## 4. Buying Guide & Best Deals
- Where to buy (Amazon.in, Flipkart, Reliance Digital, or Croma).
- Current bank offers or card discounts to look for.
- "Buyer Beware": Specific things to check at the time of delivery.

## 5. Final Expert Verdict
- The absolute #1 choice for ${user.name} based on ${mustHave}.
- Closing advice.

STRICT CONSTRAINTS:
- No generic advice. Reference real products available on Amazon.in/Flipkart right now.
- Current 2024/2025 pricing only.
- Formatting: Use Markdown headers, bold text, and bullet points.
- TONE: Professional, helpful, and premium.
- OUTPUT LANGUAGE: ${langName} ONLY.`;
};

module.exports = { buildReportPrompt };
