# SARTORIA — The Forge (Seller Platform)
### SATURN Ecosystem — AI-Powered Garment Digital Twin Infrastructure

---

# Overview

SARTORIA — “The Forge” is the B2B manufacturing platform inside the SATURN ecosystem that enables garment manufacturers to upload 2D garment images and automatically generate high-fidelity 3D digital twins.

The system is designed for scalable industrial fashion digitization using AI-assisted reconstruction pipelines, cloud-native infrastructure, GPU workers, and real-time asset orchestration.

This document provides:

- Full System Architecture
- Project Structure
- Supabase SQL Schema
- Backend Architecture
- Frontend Architecture
- AI Reconstruction Pipeline
- Storage Strategy
- Security Model
- FastAPI Worker Design
- GLB Compression Pipeline
- Three.js Viewer Integration
- Deployment Workflow
- Future Scaling Strategy

---

# 1. SYSTEM ARCHITECTURE

# The Forge (Sartoria-Seller)

The system consists of four primary layers:

---

## A. Frontend Layer (Next.js Dashboard)

### Responsibilities

- Seller Authentication
- Garment Upload Interface
- Product Management
- Reconstruction Status Tracking
- 3D Asset Preview
- Real-Time Notifications

### Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Shadcn/UI
- Lucide React Icons
- React Query / TanStack Query
- Zustand
- React Hook Form
- Supabase JS SDK
- React Three Fiber
- Drei

---

## B. Supabase Backend Layer

### Responsibilities

- Authentication
- PostgreSQL Database
- Storage Buckets
- Row Level Security
- Realtime Subscriptions
- Signed URL Management

### Buckets

| Bucket | Purpose |
|---|---|
| garment-uploads | Raw uploaded garment images |
| digital-twins | Final generated GLB files |
| previews | Thumbnail previews |
| temp-processing | Intermediate AI assets |

---

## C. AI Orchestration Layer (FastAPI Worker)

### Responsibilities

- Pull pending jobs
- Download uploaded images
- Background removal
- Multi-view synthesis
- 2D → 3D reconstruction
- GLB optimization
- Upload generated assets
- Update database states

### Core Stack

- FastAPI
- PyTorch
- CUDA
- OpenCV
- Segment Anything Model (SAM)
- CRM / Rodin / LGM
- Blender Python API
- gltf-pipeline
- Draco Compression

---

## D. GPU Compute Layer

### Recommended Infrastructure

| Provider | Usage |
|---|---|
| RunPod | GPU workers |
| Lambda Labs | Model training |
| Vast.ai | Cost-effective GPU scaling |
| AWS EC2 GPU | Enterprise deployment |
| Modal Labs | Serverless inference |

---

# 2. COMPLETE WORKFLOW

---

## Step 1 — Seller Upload

Manufacturer uploads:

- Front orthographic garment image
- Back orthographic garment image

Files are uploaded to:

```bash
garment-uploads/    