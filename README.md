# Become Fit — Local development & debugging

This README describes quick steps to run and debug the app locally.

## Install

Make sure you have Node.js (16+) installed.

From the project root:

```bash
npm install
```

## Run the backend

Start the production-like server:

```bash
npm start
```

Start in development with auto-reload and an inspector (use a debugger client like Chrome DevTools or VS Code):

```bash
npm run dev
```

Start with the Node inspector paused at first line:

```bash
npm run debug
```

The inspector listens on `ws://127.0.0.1:9229` by default.

## Serve the frontend only

To quickly serve static files (public folder):

```bash
npm run serve
```

## Environment

Copy `.env.example` to `.env` and set Razorpay credentials:

```
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
PORT=3000
```

## Notes

- The server includes a simple request logger (console) to help trace incoming requests.
- Use your editor's debugger attached to port 9229 to set breakpoints in `index.js`.
