const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const College = require('../models/College');
const StudentFee = require('../models/StudentFee');

const getSystemPrompt = (role, userContext = '') => {
  let prompt = `You are EduFin AI, a smart admin assistant for a college fee management system.
You detect the user's intent and extract relevant field values from their message.

=== SUPPORTED INTENTS & FIELDS TO EXTRACT ===\n`;

  if (role === 'admin') {
    prompt += `
1. BULK_CREATE_USERS - Create multiple student accounts with a username pattern.
   Examples: "create 10 users from CS001 to CS010 with password test123"
   Extract: prefix, startRange, endRange, suffix, initialPassword

2. ADD_FEE_TO_GROUP - Add a fee assigned to a group/batch.
   Examples: "add tuition fee of 5000 to group"
   Extract: title, amount

3. ADD_FEE_TO_USER - Add a fee assigned to a specific student.
   Examples: "add library fee 500 to student john"
   Extract: title, amount

4. CREATE_GROUP - Create a new group or batch.
   Examples: "create a group named CSE"
   Extract: name, description

5. ASSIGN_STUDENT_TO_GROUP - Assign a student/user to a group.
   Examples: "assign student to CS-A group"
   Extract: (user will select from dropdowns)

6. ASSIGN_SUBGROUP - Assign a group as a child/subgroup of another group.
   Examples: "assign CSE as subgroup of AI&DS"
   Extract: childGroupName, parentGroupName

7. CREATE_FEE_TYPE - Create a fee category/type.
   Examples: "create fee type Tuition"
   Extract: name, description

8. CREATE_SCHOLARSHIP - Create a scholarship with discount.
   Examples: "create merit scholarship 20% discount"
   Extract: name, discountPercentage, minAcademicScore

9. DELETE_FEE - Delete an existing fee.
   Examples: "delete fee"
   Extract: (dropdown)

10. APPROVE_LOAN - Approve or reject a loan request.
    Examples: "approve loan"
    Extract: (dropdown)

11. APPROVE_FEE_REQUEST - Approve or reject a fee waiver/adjustment request.
    Examples: "approve fee request"
    Extract: (dropdown)

12. UPDATE_USER_SCHOLARSHIP - Assign a scholarship to a student.
    Examples: "assign merit scholarship to student"
    Extract: (dropdown)\n`;
  } else if (role === 'superadmin') {
    prompt += `
13. TOGGLE_AI_ACCESS - Enable or disable the AI agent for a specific college.
    Examples: "disable agent for kit", "turn off ai for default college", "enable chatbot for kitcbe"
    Extract: collegeQuery (the name or code of the college), action (either "enable" or "disable")

14. CREATE_COLLEGE_ADMIN - Create an admin account for a specific college.
    Examples: "create admin john for kit with username johnkit and password pass123"
    Extract: collegeQuery, name, username, password

15. CREATE_COLLEGE - Create a new college/tenant.
    Examples: "add a new college named XYZ College with code XYZ01 located in Mumbai"
    Extract: name, code, address

=== UNAUTHORIZED ACTIONS ===
If the user asks to manage users, fees, groups, scholarships, loans, or perform ANY administrative action other than toggling AI access, you MUST politely refuse and state: "This action can only be done through the college Admin portal." Do NOT pretend that you have performed the action.\n`;
  } else {
    prompt += `
1. CREATE_FEE_REQUEST - Request a fee waiver, reduction, or custom fee.
   Examples: "request fee waiver of 2000 for medical reasons"
   Extract: requestedFeeTitle (e.g. 'Medical Waiver'), amount, reason

2. EDIT_PROFILE - Update student profile information.
   Examples: "change my phone number to 9876543210"
   Extract: phoneNumber, personalEmail

* Note: You are a student. You cannot perform administrative actions.

=== UNAUTHORIZED ACTIONS ===
If the user asks to enable, disable, or manage the AI agent/chatbot, or perform ANY action not explicitly listed in your supported intents above, you MUST politely refuse. State that you do not have permission to perform that action for them. Do NOT pretend that you have performed the action.\n`;
  }

  prompt += `
=== ANSWERING QUESTIONS ===
If the user asks a question about their fees, the system, or any data provided in the USER CONTEXT section below, you MUST answer it using that data. Do NOT reply that you have no access if the answer is in your context. Only say you don't have access if the question is completely irrelevant to the provided data.

=== PAYMENT EXCEPTION ===
If user asks about payment, Razorpay, paying fees, or initiating payment → intent: "PAYMENT_RESTRICTED"

=== RESPONSE FORMAT (strict JSON only, no markdown) ===

For detected intents:
{
  "intent": "<INTENT_NAME>",
  "data": { <all extracted fields with their exact values, null for missing optional fields> },
  "message": "<friendly 1-sentence summary of what you understood>"
}

For general conversation:
{
  "intent": "CHAT",
  "message": "<friendly helpful response>"
}

For payment requests:
{
  "intent": "PAYMENT_RESTRICTED",
  "message": "Payment processing is handled directly through the dashboard and cannot be initiated via the assistant."
}

CRITICAL: Always extract field values from the user message into the data object. Never return an empty data object if the user mentioned a name, amount, or other value.

=== USER CONTEXT ===
${userContext}
`;

  return prompt;
};

const chat = async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ message: 'messages array is required' });
    }

    // Check AI access for the user's college
    if (req.user && req.user.collegeId && req.user.role !== 'superadmin') {
      const college = await College.findById(req.user.collegeId);
      if (college && college.aiAccess === false) {
        return res.json({
          intent: 'CHAT',
          message: 'AI Assistant access has been disabled for your institution. Please contact your administrator or the platform support team.'
        });
      }
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: 'Groq API key not configured on server' });
    }

    let userContextStr = 'Unknown User';
    if (req.user) {
      userContextStr = `Name: ${req.user.name}\nRole: ${req.user.role}`;
      try {
        if (req.user.role === 'superadmin') {
          const colleges = await College.find().select('name code aiAccess tokenCount promptCount');
          userContextStr += `\n\n=== SYSTEM DATA (COLLEGES) ===\n`;
          colleges.forEach(c => {
            userContextStr += `- ${c.name} (Code: ${c.code}): AI Access=${c.aiAccess ? 'Enabled' : 'Disabled'}, Tokens Used=${c.tokenCount || 0}, Prompts Used=${c.promptCount || 0}\n`;
          });
        } else if (req.user.role === 'cashier') {
          const Payment = require('../models/Payment');
          const startOfDay = new Date();
          startOfDay.setHours(0, 0, 0, 0);
          const endOfDay = new Date();
          endOfDay.setHours(23, 59, 59, 999);

          const payments = await Payment.find({
            collegeId: req.user.collegeId,
            paymentMethod: 'CASH',
            status: 'SUCCESS',
            paidAt: { $gte: startOfDay, $lte: endOfDay }
          });

          const totalToday = payments.reduce((sum, p) => sum + p.amount, 0);
          userContextStr += `\n\n=== CASHIER DASHBOARD DATA ===\n`;
          userContextStr += `Total Cash Collected Today: ₹${totalToday}\n`;
          userContextStr += `Transactions Today: ${payments.length}\n`;
        } else {
          const pendingFees = await StudentFee.find({ studentId: req.user._id, status: 'PENDING' }).populate('feeId');
          if (pendingFees.length > 0) {
            const totalPending = pendingFees.reduce((sum, f) => sum + f.finalAmount, 0);
            userContextStr += `\nTotal Pending Fees: ₹${totalPending}\nPending Fee Details:\n` +
              pendingFees.map(f => `- ${f.feeId?.title || 'Unknown Fee'}: ₹${f.finalAmount}`).join('\n');
          } else {
            userContextStr += `\nPending Fees: ₹0 (No pending fees)`;
          }
        }
      } catch (err) {
        console.error('Failed to fetch user context data:', err);
      }
    }

    const userRole = req.user ? req.user.role : 'student';
    const groqMessages = [
      { role: 'system', content: getSystemPrompt(userRole, userContextStr) },
      ...messages.map(m => ({ role: m.role, content: m.content }))
    ];

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: groqMessages,
        temperature: 0.4,
        max_tokens: 1024
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error:', errorText);
      return res.status(502).json({ message: 'Failed to get response from AI', detail: errorText });
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || '';
    if (req.user && req.user.collegeId) {
      const tokensUsed = data.usage?.total_tokens || 0;
      College.findByIdAndUpdate(req.user.collegeId, {
        $inc: { promptCount: 1, tokenCount: tokensUsed }
      }).catch(() => { });
    }

    // Parse JSON response from AI
    let parsed;
    try {
      // Strip possible markdown code fences
      const cleaned = rawContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = { intent: 'CHAT', message: rawContent };
    }

    // SERVER-SIDE SECURITY CHECK
    const isAdmin = req.user && (req.user.role === 'admin' || req.user.role === 'superadmin');
    if (!isAdmin && !['CHAT', 'PAYMENT_RESTRICTED', 'CREATE_FEE_REQUEST', 'EDIT_PROFILE'].includes(parsed.intent)) {
      console.warn(`Blocked restricted intent '${parsed.intent}' for user role '${req.user?.role}'`);
      parsed = {
        intent: 'CHAT',
        message: 'You do not have administrative permission to perform this action.'
      };
    }

    return res.json(parsed);
  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({ message: error.message });
  }
};

const getStatus = async (req, res) => {
  try {
    if (req.user && req.user.role === 'superadmin') {
      return res.json({ enabled: true });
    }
    if (req.user && req.user.collegeId) {
      const College = require('../models/College');
      const college = await College.findById(req.user.collegeId);
      return res.json({ enabled: college ? college.aiAccess : false });
    }
    res.json({ enabled: false });
  } catch (error) {
    res.status(500).json({ enabled: false });
  }
};

module.exports = { chat, getStatus };
