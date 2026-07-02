# MIDISCANAI — TEST CASE INSTRUCTIONS
## Three Test Files for Agent Validation

---

## BEFORE YOU START

Make sure both servers are running:
- Backend: cd backend && npm run dev (must show "running on port 5000")
- Frontend: cd frontend && pnpm run dev (must show "ready on port 3000")
- Open browser: http://localhost:3000

---

## TEST 1 — Blood Test Report (Iron Deficiency Anemia)
**File:** test-cases/test1_blood_report.txt

**How to test:**
1. Open http://localhost:3000 and scroll to the Upload section
2. Drag the file test1_blood_report.txt into the upload zone
3. Confirm green checkmark appears with filename and file size shown
4. Click "Analyze Report" button
5. Wait up to 45 seconds for analysis to complete

**Expected results — PASS criteria:**
- Detected Condition card: Must mention "Anemia" or "Iron Deficiency" and show hemoglobin value (8.4 g/dL)
- Risk Score: Must be between 50 and 75 (Medium to High range)
- Condition Level badge: Must show "Medium" or "High"
- Clinical Explanation: Must mention hemoglobin being low and iron deficiency in 2 brief sentences
- Recommended Guidance: Must recommend seeing a doctor and taking iron supplements
- Estimated Cost: Must show a real INR cost range — NOT "Not determined"
- Extracted Metrics: Must show "Hemoglobin", "Serum Ferritin", "TIBC" with values and ranges
- Abnormal values in Extracted Metrics must be marked with ⚠ symbol
- Detection Reasoning: Must explain which specific values triggered the anemia diagnosis

**FAIL if:**
- Any card shows "Not determined from available report data"
- Estimated Cost shows "Not determined" or is blank
- Risk Assessment card shows only "Based on current biomarkers and medical history"
- Extracted Metrics shows keys with underscores like "serum_iron" instead of "Serum Iron"

---

## TEST 2 — Diabetes and Lipid Panel Report
**File:** test-cases/test2_diabetes_report.txt

**How to test:**
1. Refresh the page or scroll back to Upload section
2. Drag the file test2_diabetes_report.txt into the upload zone
3. Confirm green checkmark appears
4. Click "Analyze Report" button
5. Wait up to 45 seconds

**Expected results — PASS criteria:**
- Detected Condition card: Must mention "Diabetes" or "Hyperglycemia" and show HbA1c value (9.2%)
- Risk Score: Must be between 75 and 95 (High range — this is a severe case)
- Condition Level badge: Must show "High" in red
- Clinical Explanation: Must mention HbA1c of 9.2% and uncontrolled blood sugar in 2 brief sentences
- Recommended Guidance: Must recommend seeing an endocrinologist urgently and dietary changes
- Estimated Cost: Must show a real INR cost range for diabetes treatment
- Extracted Metrics: Must show HbA1c, Fasting Glucose, Post-Prandial Glucose, LDL, Triglycerides
- All above-normal values must be marked with ⚠ symbol in red
- Detection Reasoning: Must explain that HbA1c above 6.5% confirms diabetes diagnosis
- Risk gauge meter on summary panel: Must show needle pointing toward the High/Red zone

**FAIL if:**
- Condition Level is "Low" or "Medium" (this is clearly a High risk case)
- Risk score is below 70
- Any card shows placeholder text

---

## TEST 3 — Fake Non-Medical File (Pet Shop Inventory)
**File:** test-cases/test3_fake_nonmedical.txt

**How to test:**
1. Refresh the page or scroll back to Upload section
2. Drag the file test3_fake_nonmedical.txt into the upload zone
3. Confirm green checkmark appears (upload validation passes — file type and size are valid)
4. Click "Analyze Report" button
5. Watch for the rejection message

**Expected results — PASS criteria:**
- The file must upload successfully (it is a valid TXT file within size limits)
- After clicking Analyze Report, within a few seconds a RED error message must appear
- The error message must say something like: "No medical terminology detected" or "This does not appear to be a medical report"
- The error must appear BEFORE the result cards load — no result cards should populate
- The upload zone must remain visible so the user can upload a different file
- NO AI tokens should be wasted calling the AI with non-medical content

**FAIL if:**
- The agent actually analyzes the pet shop file and returns fake medical results
- No error message appears and result cards show made-up medical data
- The error message says something generic like "Analysis failed" without explaining why

---

## SUMMARY TEST RESULTS TABLE

| Test | File | Expected Outcome | Pass/Fail |
|------|------|-----------------|-----------|
| Test 1 | test1_blood_report.txt | Iron Deficiency Anemia detected, Medium/High risk, real INR cost | [ ] |
| Test 2 | test2_diabetes_report.txt | Type 2 Diabetes detected, High risk 75+, urgent guidance | [ ] |
| Test 3 | test3_fake_nonmedical.txt | REJECTED with medical validation error message | [ ] |

---

## IF TESTS FAIL — TROUBLESHOOTING

**Test 1 or 2 fail with "Analysis Could Not Be Completed":**
- Check backend terminal for error logs
- Confirm GOOGLE_API_KEY is correctly set in backend/.env
- Confirm the AI API key has sufficient credits

**Test 1 or 2 show "Not determined" in Estimated Cost:**
- The AI prompt needs to be updated — apply Fix A2 from the Fix Prompts document
- The user prompt must explicitly forbid returning "Not determined" for cost

**Test 3 is NOT rejected (fake file gets analyzed):**
- The medical validation in ocr.util.js or pdfParser.util.js is not working
- Check that validateMedicalText function is being called before the AI call
- Check that MEDICAL_KEYWORDS array contains enough keywords to catch real reports

**Extracted Metrics show underscores in keys:**
- Apply Fix A3 from the Fix Prompts document to the Extracted Metrics card in page.tsx

---

*Designed by Aditya, an area student*
**CREATED BY BMS**
