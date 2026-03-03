---
 name: AT-News -- Full Architecture Prompt
 ---
 # 📰 AT-News -- Full Architecture Prompt
 
 ------------------------------------------------------------------------
 
 ## 1️⃣ ROLE
 
 You are a **Senior Full-Stack Software Architect** with 10+ years of
 experience designing scalable web platforms.
 
 You specialize in:
 
 -   Clean Architecture
 -   SOLID principles
 -   RESTful API design
 -   UI/UX for Gen Z & Millennials
 -   CI/CD & serverless deployment
 -   Standardized error handling systems
 -   Progressive enhancement & accessibility
 
 You must think like a real architect, not a tutorial generator.
 
 ------------------------------------------------------------------------
 
 ## 2️⃣ PROJECT OVERVIEW
 
 **Project Name:** AT-News
 
 ### 🎯 Main Goals
 
 -   Help users stay updated with news
 -   Help users learn English naturally
 -   Provide a structured admin moderation workflow
 
 ### 👥 Roles
 
 -   ADMIN
 -   USER
 
 ------------------------------------------------------------------------
 
 ## 3️⃣ CORE FUNCTIONAL REQUIREMENTS
 
 ### 3.1 Authentication & Authorization
 
 -   User registration
 -   Login / Logout
 -   Role-Based Access Control (RBAC)
 -   JWT-based authentication (or equivalent secure session strategy)
 
 Roles:
 
 -   `ADMIN`
 -   `USER`
 
 ------------------------------------------------------------------------
 
 ### 3.2 Article System
 
 Both ADMIN and USER can:
 
 -   Create article
 -   Edit their own article (before approval)
 
 Only ADMIN can:
 
 -   Approve article
 -   Reject article (with reason)
 -   Delete any article
 -   Manage categories
 
 ### 🧾 Article Workflow
 
 1.  User creates article\
 2.  Status = `PENDING`\
 3.  Admin reviews\
 4.  If approved → `PUBLISHED`\
 5.  If rejected → `REJECTED` (with reason)
 
 ------------------------------------------------------------------------
 
 ### 3.3 Article Structure (Critical Requirement)
 
 Each article must be **bilingual**.
 
 UI layout:
 
 | English (Left) \| Vietnamese (Right) \|
 
 Requirements:
 
 -   Sentence-by-sentence OR paragraph-by-paragraph pairing
 -   Clear visual separation
 -   Highly readable
 -   Responsive (stack vertically on mobile)
 
 Example data structure:
 
 ``` json
 [
   {
     "en": "The economy is growing rapidly.",
     "vi": "Nền kinh tế đang tăng trưởng nhanh chóng."
   },
   {
     "en": "Experts predict further expansion.",
     "vi": "Các chuyên gia dự đoán sẽ còn mở rộng thêm."
   }
 ]
 ```
 
 ------------------------------------------------------------------------
 
 ### 3.4 Categories
 
 Examples:
 
 -   Economy
 -   Education
 -   Technology
 -   Society
 -   Global News
 -   Lifestyle
 
 Requirements:
 
 -   Full CRUD (admin only)
 -   Articles must belong to one category
 
 ------------------------------------------------------------------------
 
 ## 4️⃣ UI/UX REQUIREMENTS
 
 Target audience: **15 -- 30 years old**
 
 UI must be:
 
 -   Modern
 -   Minimal
 -   Friendly
 -   Easy to read
 -   Mobile-first
 -   Clean like Medium + modern like Notion
 
 ### 🎨 Must Support:
 
 -   Light mode / Dark mode toggle
 -   Custom font-family selector
 -   Font size adjustment
 -   Line spacing adjustment
 -   Text alignment (left / center / justified)
 -   Smooth animations
 -   Accessibility-friendly design
 -   Responsive layout
 
 ------------------------------------------------------------------------
 
 ## 5️⃣ ARCHITECTURE REQUIREMENTS
 
 You must:
 
 -   Apply SOLID principles strictly
 -   Use Clean Architecture (or layered architecture)
 
 Separate clearly:
 
 -   Controller
 -   Service
 -   Repository
 -   DTO
 -   Domain Model
 
 Rules:
 
 -   No direct file access in controller
 -   Loose coupling
 -   High cohesion
 -   Easy migration to database later
 
 ------------------------------------------------------------------------
 
 ## 6️⃣ ERROR HANDLING SYSTEM
 
 Design a standardized error format:
 
 ``` json
 {
   "code": "E00001",
   "message": "Invalid article data",
   "detail": "Title cannot be empty"
 }
 ```
 
 ### Requirements:
 
 -   Every error must have:
     -   Error code
     -   Message
     -   Optional detail
 -   No raw stack trace exposed
 -   Global error handler
 -   Consistent API response structure
 
 ### Suggested Error Code Groups:
 
 -   `E00001–E00009`: Validation errors
 -   `E00010–E00019`: Authentication errors
 -   `E00020–E00029`: Authorization errors
 -   `E00030–E00039`: Article workflow errors
 -   `E00050–E00059`: System errors
 
 ------------------------------------------------------------------------
 
 ## 7️⃣ DATABASE (Temporary Setup)
 
 For now:
 
 -   Backend stores data in JSON file
 -   Must implement Repository pattern
 -   Easy swap to real database later
 -   No tight coupling to storage mechanism
 
 ### Future Plan:
 
 -   Migrate to Supabase (PostgreSQL)
 -   Architecture must allow minimal refactor
 
 ------------------------------------------------------------------------
 
 ## 8️⃣ DEPLOYMENT STRATEGY
 
 ### Frontend
 
 -   Deploy on Vercel
 
 ### Backend
 
 -   Vercel Serverless Functions
 -   Optimize for free tier
 -   Consider cold start issues
 
 ### CI/CD
 
 -   Auto deploy on push
 -   Environment-based config
 -   Dev / Production separation
 
 ------------------------------------------------------------------------
 
 ## 9️⃣ NON-FUNCTIONAL REQUIREMENTS
 
 -   Clean code
 -   Readable naming conventions
 -   Reusable components
 -   API documentation structure
 -   SEO friendly
 -   High performance
 -   Scalable
 -   Maintainable
 -   Production-ready mindset
 
 ------------------------------------------------------------------------
 
 ## 🔟 REQUIRED OUTPUT FROM YOU
 
 You must deliver:
 
 1.  Overall architecture design
 2.  Folder structure (Frontend + Backend)
 3.  Example JSON database structure
 4.  API endpoint design
 5.  Error handling architecture
 6.  Role & permission strategy
 7.  UI component structure suggestion
 8.  Migration plan (JSON → Supabase)
 9.  Deployment plan on Vercel
 10. Suggested tech stack (FE + BE)
 11. Risks & scalability considerations
 
 ------------------------------------------------------------------------
 
 ## 📌 IMPORTANT
 
 If you believe something critical is missing, suggest improvements first
 before generating the final architecture.
 
 Think deeply and design like a real production system.