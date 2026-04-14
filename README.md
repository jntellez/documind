# Documind

Cross-platform mobile application designed to improve productivity and digital information comprehension by transforming web content and documents into a clean, minimalist, distraction-free format.

> ⚠️ **Repository transition in progress**: this repo is now the **root of a pnpm monorepo**. The current Expo/React Native mobile app lives in `apps/mobile`.

## 🚀 Project Status

**Version:** Initialization (v0.1.0)  
**Status:** Active development - Base structure implemented

This project is in its early stages. Currently implements basic navigation infrastructure and authentication structure.

## 📱 Tech Stack

- **React Native** 0.81.4
- **Expo SDK** ~54.0.10
- **TypeScript** ~5.9.2

## 🎯 Project Vision

### Planned Modules

1. **Content Processing**: Text and image extraction and cleaning from URLs and files
2. **Library and Organization**: Storage, classification, and search of processed documents
3. **Document**: Visualization, editing, and document interactions
4. **AI Interaction**: Conversational assistant for summaries and analysis
5. **Security and Account Management**: Authentication and cloud synchronization
6. **Settings and Preferences**: Interface and application customization

> ⚠️ **Note**: These modules are in planning phase and not implemented in current code.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm 10+
- Expo CLI (optional if you use `pnpm start`)
- iOS Simulator (Mac) or Android Studio (for emulators)

### Steps

```bash
# Clone repository
git clone https://github.com/jntellez/documind.git
cd documind

# Install dependencies
pnpm install

# Start development server
pnpm start
# or run the mobile workspace directly
pnpm --filter @documind/mobile start
```

## 🏗️ Monorepo Transition

This repository is being prepared as the future workspace root.

Planned layout:

```text
apps/
  mobile/   # Expo / React Native app
  api/      # future Bun runtime API
packages/   # shared packages
```

Current status:

- `pnpm-workspace.yaml` already defines `apps/*` and `packages/*`
- the mobile app now runs from `apps/mobile`
- `packages/` is still placeholder-only for now
- no API has been added yet

## 🎨 Supported Platforms

- ✅ iOS (native)
- ✅ Android (native)
- ✅ Web (browser)

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
