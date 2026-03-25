/**
 * buildReportPrompt — Constructs the OpenAI prompt for a given order's intake form.
 * @param {object} user - User data from DB (name, language_preference)
 * @param {object} order - Order data (service_tier, product_category)
 * @param {object} form  - Intake form data
 * @returns {string} - The full prompt string
 */
const buildReportPrompt = (user, order, form) => {
  const optionCount = order.service_tier === 'PRO' ? '4–6' : '2–3';
  const lang = user.language_preference === 'HI' ? 'Hindi' : user.language_preference === 'TA' ? 'Tamil' : 'English';

  return `You are a professional product research analyst specializing in the Indian market.

User Profile:
- Name: ${user.name}
- Language: ${lang}
- Budget: ₹${form.budget_min} to ₹${form.budget_max}
- Product type: ${order.product_category}
- Primary use case: ${form.primary_use_case}
- Priority factors: ${form.priority_factors}
- Must-have features: ${form.preferences}
- Additional context: ${form.additional_notes || 'None'}

TASK:
1. Identify the top ${optionCount} products available in India within budget.
2. For each product provide:
   - Exact model name and current market price in INR
   - Key specifications relevant to use case
   - Pros (minimum 3, specific to their needs)
   - Cons (minimum 2, honest)
   - Best for: which type of user
3. Create a comparison table across:
   - Price value
   - Performance for stated use case
   - Longevity / build quality
   - After-sale service in India
   - Overall score /10
4. PRIMARY RECOMMENDATION:
   - Single best pick with clear reasoning
   - Why this over others for their specific needs
5. ALTERNATIVE RECOMMENDATION:
   - If budget is flexible: upgrade option
   - If budget is tight: value option
6. BUYING ADVICE:
   - Where to buy (Amazon/Flipkart/offline)
   - Current deals or offers if any
   - What to check before purchasing
   - Any hidden costs to be aware of

CONSTRAINTS:
- No generic suggestions
- Only products available in India right now
- Realistic current prices (not outdated)
- Balanced honest analysis
- Output in ${lang} language
- Format as structured report with clear sections and markdown headings`;
};

module.exports = { buildReportPrompt };
