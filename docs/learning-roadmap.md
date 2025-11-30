# Learning Roadmap

**Time Commitment:** 1-2 hours/day  
**Goal:** Build strong fundamentals while maintaining quality learning  
**Current Status:** You're already building real features! This roadmap fills gaps and strengthens core skills.

---

## Assessment: Where You Are

Based on your codebase, you're already:

- ✅ Building full-stack Next.js applications
- ✅ Using TypeScript effectively
- ✅ Working with databases (Prisma)
- ✅ Implementing authentication
- ✅ Managing complex state
- ✅ Creating reusable components
- ✅ Writing API routes

**You're likely closer to junior dev level than you think!** This roadmap will help you:

1. Solidify fundamentals you might have gaps in
2. Prepare for technical interviews
3. Understand best practices and patterns
4. Build confidence in core concepts

---

## Phase 1: TypeScript & JavaScript Fundamentals (3-4 weeks)

**Why:** TypeScript is your daily language. Understanding it deeply makes everything easier.

### Week 1-2: TypeScript Deep Dive

**Time:** 1-2 hours/day × 14 days = 14-28 hours

**Resources:**

1. **"Programming TypeScript" by Boris Cherny** (Book)
   - Best modern TypeScript book
   - Covers types, generics, advanced patterns
   - Practical examples
   - **Alternative:** "Effective TypeScript" by Dan Vanderkam (more concise)

2. **TypeScript Handbook** (Official Docs)
   - https://www.typescriptlang.org/docs/handbook/intro.html
   - Read: Basic Types → Advanced Types → Generics
   - Bookmark for reference

3. **Practice:**
   - Refactor one component in your project to use more advanced TypeScript
   - Add strict type definitions to your API routes
   - Practice with TypeScript playground: https://www.typescriptlang.org/play

**Reading Plan:**

- **Daily Goal:** 8-12 pages/day (dense concepts, need time to absorb)
- **Time Breakdown:** 30-45 min reading, 20-30 min notes, 20-45 min coding
- **Total Time:** ~32-40 days (4-6 weeks) for full book

**Skip:** "JavaScript: The Good Parts" - it's outdated (2008) and you're already using TypeScript.

### Week 3-4: Modern JavaScript (ES6+)

**Time:** 1-2 hours/day × 14 days = 14-28 hours

**Resources:**

1. **"You Don't Know JS Yet" (YDKJS)** - Free online book series
   - https://github.com/getify/You-Dont-Know-JS
   - Focus on: Scope & Closures, Objects & Classes, Async & Performance
   - Skip outdated parts (prefer modern async/await over callbacks)

2. **JavaScript.info** - Modern tutorial
   - https://javascript.info
   - Excellent, up-to-date explanations
   - Interactive examples

3. **Practice:**
   - Implement array methods from scratch (map, filter, reduce)
   - Understand closures, this binding, promises
   - Review your existing code: can you explain every line?

**Reading Plan:**

- **Daily Goal:** 12-15 pages/day (more practical, less theoretical)
- **Time Breakdown:** 35-50 min reading, 15-30 min notes, 20-40 min coding
- **Total Time:** ~20-24 days (3-4 weeks)

---

## Phase 2: React & Next.js Mastery (4-5 weeks)

**Why:** You're using React/Next.js daily. Deep understanding = better code.

### Week 5-6: React Fundamentals

**Time:** 1-2 hours/day × 14 days = 14-28 hours

**Resources:**

1. **"The Road to React" by Robin Wieruch** (Book)
   - Modern, practical approach
   - Covers hooks, context, performance
   - **Alternative:** React Beta Docs (https://react.dev) - excellent official docs

2. **React Beta Documentation** (Official)
   - https://react.dev
   - Read: Thinking in React, Managing State, Escape Hatches
   - Interactive examples

3. **Practice:**
   - Refactor a component to use useMemo/useCallback where appropriate
   - Implement a custom hook (you already have some!)
   - Understand when to use useState vs useReducer vs context

**Reading Plan:**

- **Daily Goal:** 12-15 pages/day
- **Time Breakdown:** 35-50 min reading, 15-30 min notes, 20-40 min coding
- **Total Time:** ~20-24 days (3-4 weeks)

### Week 7-8: Next.js App Router Deep Dive

**Time:** 1-2 hours/day × 14 days = 14-28 hours

**Resources:**

1. **Next.js Documentation** (Official)
   - https://nextjs.org/docs
   - Focus on: App Router, Server Components, Data Fetching, API Routes
   - You're already using these - understand WHY

2. **Next.js Learn Course** (Free, Official)
   - https://nextjs.org/learn
   - Interactive tutorial
   - Covers patterns you're using

3. **Practice:**
   - Review your API routes: are they following best practices?
   - Understand Server vs Client Components in your project
   - Optimize one page for performance

### Week 9: State Management & Data Flow

**Time:** 1-2 hours/day × 7 days = 7-14 hours

**Resources:**

1. **Kent C. Dodds - State Management** (Blog/YouTube)
   - https://kentcdodds.com/blog/application-state-management-with-react
   - When to lift state, when to use context, when to use external libs

2. **Practice:**
   - Review your DashboardPageClient: could state be better organized?
   - Consider: Would Zustand or Jotai help? (Probably not needed yet, but understand when)

---

## Phase 3: Backend & Database (3-4 weeks)

**Why:** You're using Prisma, but understanding databases deeply is crucial.

### Week 10-11: Database Fundamentals

**Time:** 1-2 hours/day × 14 days = 14-28 hours

**Resources:**

1. **"Database Design for Mere Mortals" by Michael J. Hernandez** (Book)
   - OR **"SQL for Data Analysis" by Cathy Tanimura** (if you prefer practical)
   - Understand: normalization, relationships, indexes, queries

2. **Prisma Documentation** (Official)
   - https://www.prisma.io/docs
   - You're using it - master it
   - Learn: transactions, migrations, relations, performance

3. **Practice:**
   - Review your schema: are relationships optimal?
   - Add indexes where needed
   - Write a complex query (maybe analytics for your app?)

**Reading Plan:**

- **Daily Goal:** 15-20 pages/day (focus on key chapters, skip reference material)
- **Time Breakdown:** 40-50 min reading, 20-30 min notes, 20-30 min practice
- **Total Time:** ~20-24 days (3-4 weeks) for essential chapters

### Week 12: API Design & REST

**Time:** 1-2 hours/day × 7 days = 7-14 hours

**Resources:**

1. **"Designing Web APIs" by Brenda Jin et al.** (Book)
   - OR **REST API Tutorial** (https://restfulapi.net)
   - Understand: HTTP methods, status codes, error handling, versioning

2. **Practice:**
   - Review your API routes: consistent error handling?
   - Add proper status codes everywhere
   - Consider: rate limiting, validation middleware

### Week 13: Authentication & Security

**Time:** 1-2 hours/day × 7 days = 7-14 hours

**Resources:**

1. **OWASP Top 10** (Web)
   - https://owasp.org/www-project-top-ten/
   - Understand common vulnerabilities

2. **NextAuth.js Documentation** (You're using it)
   - https://next-auth.js.org
   - Deep dive: sessions, JWT, OAuth flows

3. **Practice:**
   - Review your auth implementation
   - Understand: password hashing (you're using bcrypt - good!)
   - Add rate limiting to signup/login routes

---

## Phase 4: Testing & Quality (2-3 weeks)

**Why:** You have Vitest set up but might not be using it much. Testing is essential.

### Week 14-15: Testing Fundamentals

**Time:** 1-2 hours/day × 14 days = 14-28 hours

**Resources:**

1. **"Testing JavaScript Applications" by Lucas da Costa** (Book)
   - OR **Vitest Documentation** (Official)
   - https://vitest.dev
   - You're already set up - use it!

2. **Kent C. Dodds - Testing** (Blog/YouTube)
   - https://kentcdodds.com/blog/common-mistakes-with-react-testing-library
   - Testing philosophy: test behavior, not implementation

3. **Practice:**
   - Write tests for your validation functions (you have some!)
   - Test one API route
   - Test one complex component
   - Aim for 60-80% coverage on critical paths

### Week 16: Code Quality & Tooling

**Time:** 1-2 hours/day × 7 days = 7-14 hours

**Resources:**

1. **ESLint & Prettier** (You have these)
   - Understand your config
   - Add rules that catch bugs

2. **Git Best Practices**
   - Commit messages, branching strategies
   - https://www.conventionalcommits.org

3. **Practice:**
   - Review and improve your ESLint config
   - Write better commit messages
   - Set up pre-commit hooks (husky)

---

## Phase 5: Interview Prep & Algorithms (4-5 weeks)

**Why:** Technical interviews often include algorithm questions. Don't skip this.

### Week 17-20: Data Structures & Algorithms

**Time:** 1-2 hours/day × 28 days = 28-56 hours

**Resources:**

1. **"A Common-Sense Guide to Data Structures and Algorithms" by Jay Wengrow** (Book)
   - Beginner-friendly, practical
   - **Alternative:** "Grokking Algorithms" by Aditya Bhargava (visual, easy)

2. **LeetCode** (Practice Platform)
   - https://leetcode.com
   - Start with Easy problems
   - Focus on: arrays, strings, hash maps, two pointers
   - **Goal:** 1-2 problems per day

3. **Codewars** (Practice Platform)
   - https://www.codewars.com
   - Fun alternative to LeetCode
   - Good for building problem-solving skills
   - **Goal:** 1-2 katas per day

4. **NeetCode** (YouTube/Website)
   - https://neetcode.io
   - Curated problem list
   - Video explanations

5. **Practice Schedule:**
   - Day 1: Learn concept (arrays)
   - Day 2-3: Solve 3-5 problems on that topic
   - Day 4: Review, understand patterns
   - Repeat for: strings, hash maps, two pointers, sliding window, stacks, queues

**Reading Plan:**

- **Daily Goal:** 10-12 pages/day (concepts need time to sink in)
- **Time Breakdown:** 25-35 min reading, 15-25 min notes, 20-60 min practice problems
- **Total Time:** ~24-28 days (3-4 weeks)
- **Practice Goal:** 50-70 problems total by end of book

### Week 21: System Design Basics

**Time:** 1-2 hours/day × 7 days = 7-14 hours

**Resources:**

1. **"System Design Primer" (GitHub)**
   - https://github.com/donnemartin/system-design-primer
   - Start with basics: load balancing, caching, databases

2. **Practice:**
   - Design your Pointwise app architecture
   - How would it scale to 1M users?
   - Draw diagrams, explain trade-offs

---

## Phase 6: Specialization & Projects (Ongoing)

**Time:** Continue 1-2 hours/day while applying to jobs

### Choose 1-2 Areas to Deepen:

1. **Frontend Performance**
   - Web Vitals, code splitting, image optimization
   - Lighthouse audits on your project

2. **Backend Performance**
   - Database query optimization
   - Caching strategies
   - API response times

3. **DevOps Basics**
   - Docker basics
   - CI/CD (GitHub Actions)
   - Deployment (Vercel - you're probably using this)

4. **Accessibility**
   - WCAG guidelines
   - Screen readers
   - Make your app accessible

---

## Recommended Learning Resources Summary

### Books (Prioritize These)

1. **"Programming TypeScript" by Boris Cherny** - TypeScript mastery
2. **"The Road to React" by Robin Wieruch** - Modern React
3. **"A Common-Sense Guide to Data Structures and Algorithms" by Jay Wengrow** - Interview prep
4. **"Grokking Algorithms" by Aditya Bhargava** - Visual algorithm learning
5. **"Database Design for Mere Mortals"** - Database fundamentals

### Online Courses (If You Prefer Video)

1. **TypeScript Course** - https://www.totaltypescript.com (paid, excellent)
2. **React Course** - https://ui.dev/react (paid, modern)
3. **Next.js Course** - Official Next.js Learn (free)
4. **Algorithms** - https://www.neetcode.io (free + paid options)

### YouTube Channels

1. **Web Dev Simplified** - Clear explanations
2. **Theo - t3.gg** - Modern React/Next.js
3. **Jack Herrington** - React patterns
4. **NeetCode** - Algorithms

### Practice Platforms

1. **LeetCode** - Algorithms
2. **Codewars** - Coding challenges (fun alternative)
3. **Frontend Mentor** - Real projects
4. **Your Own Project** - Best practice!

---

## Weekly Schedule Template

**Monday-Wednesday:** Learn new concept (read/watch)  
**Thursday-Friday:** Practice (code, solve problems)  
**Saturday:** Review & apply to your project  
**Sunday:** Rest or catch up

**Daily Routine (1-2 hours):**

- 30-45 min: Reading/watching
- 30-45 min: Coding practice
- 15 min: Review notes

---

## Key Principles

1. **Build While Learning:** Apply everything to your Pointwise project
2. **Don't Rush:** Quality > Speed. Understand, don't memorize.
3. **Practice Daily:** Consistency beats intensity
4. **Ask Questions:** Join communities (Discord, Reddit r/webdev)
5. **Review Regularly:** Revisit concepts weekly
6. **Build Portfolio:** Your Pointwise app IS your portfolio - make it great!

---

## Timeline Summary

- **Months 1-2:** TypeScript, JavaScript, React (Phases 1-2)
- **Months 3:** Backend, Database, Testing (Phases 3-4)
- **Months 4-5:** Interview prep, Algorithms (Phase 5)
- **Ongoing:** Specialization, job applications (Phase 6)

**Total:** ~4-5 months of focused learning to be interview-ready

---

## Adaptive Reading Strategy

**If you already know how to code and have TypeScript experience:**

You can absolutely read 50+ pages per day when topics aren't challenging! Here's how to do it effectively:

**Speed Reading Strategy:**

1. **Skim First, Then Deep Dive**
   - Quick scan: Read headings, code examples, summaries
   - If it's familiar: Read for nuances and edge cases
   - If it's new: Slow down and read carefully

2. **Test Your Understanding**
   - After reading a section, try to explain it to yourself
   - Can you write the code without looking?
   - Do you know when to use this pattern vs alternatives?

3. **Focus on What You Don't Know**
   - Skip or skim sections you're confident about
   - Mark "review later" for things you want to revisit
   - Spend extra time on advanced topics (generics, mapped types, etc.)

4. **Practical Checkpoints**
   - After 50 pages: Can you apply 2-3 new concepts to your code?
   - If yes → You're learning effectively
   - If no → Slow down and practice more

**Recommended Approach:**

- **Familiar topics (basic types, functions):** 30-50 pages/day is fine
- **Moderate topics (generics, utility types):** 15-25 pages/day
- **Advanced topics (mapped types, conditional types):** 8-12 pages/day

**The Real Test:**

- Can you refactor your Pointwise code using what you just read?
- If you can't apply it, you didn't really learn it (even if you understood it while reading)

**Remember:** Reading fast is fine, but understanding deeply is the goal. If you're reading 50 pages but can't explain the concepts or apply them, you're just reading words, not learning.

---

## Final Thoughts

You're already building real software. That's huge! This roadmap will:

- Fill knowledge gaps
- Build interview confidence
- Deepen your understanding
- Make you a better developer

**Remember:** Many junior devs can't build what you're building. You're closer than you think. Focus on fundamentals, practice consistently, and you'll be ready.

Good luck! 🚀
