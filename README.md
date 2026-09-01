# 🤖 AI Refund Agent

<p align="center">
  <b>Autonomous AI agent that reads Gmail, detects refund requests using an LLM, and simulates refund processing with mandatory human approval.</b>
</p>

<p align="center">

![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-Backend-000000?logo=express)
![LangChain](https://img.shields.io/badge/LangChain-Agent-1C3C3C)
![LangGraph](https://img.shields.io/badge/LangGraph-HITL-7C3AED)
![Groq](https://img.shields.io/badge/Groq-gpt--oss--120b-F55036)
![Gmail API](https://img.shields.io/badge/Gmail_API-OAuth_2.0-EA4335?logo=gmail)
![License](https://img.shields.io/badge/License-MIT-blue)

</p>

---

## ✨ Overview

Customer support teams spend hours manually reviewing refund requests.

This AI agent automates refund detection using Gmail + LLM reasoning while keeping **humans in complete control** before any refund action is executed.

### Workflow

```text
Client
   │
POST /api/chat
   │
Express API
   │
LangChain Agent (LangGraph)
   │
 ┌───────────────┬───────────────┐
 │               │
 ▼               ▼
get_emails     refund
(auto)      (interrupt)
 │               │
 ▼               ▼
Gmail API   Human Approval
                 │
        Approve / Reject
                 │
     Refund Simulated
```

---

## 🚀 Features

- Gmail OAuth 2.0 integration
- LangChain tool-calling agent
- LangGraph Human-in-the-Loop interrupts
- Session-based multi-user architecture
- MemorySaver state management
- REST API
- Refund simulation
- Zod validation

---

## 🏗 Tech Stack

| Layer | Technology |
|--------|------------|
| Backend | Express.js |
| Agent | LangChain |
| Orchestration | LangGraph |
| LLM | Groq |
| Email | Gmail API |
| Validation | Zod |

---

## 📌 Roadmap

- Stripe / Razorpay integration
- PostgreSQL checkpointer
- React frontend
- Gmail push notifications
- User authentication

---

## ⚠ Known Limitations
- Refunds are simulated
- In-memory MemorySaver
- Single Gmail account per session