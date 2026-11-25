# MediRAG UI

React + TypeScript + Vite frontend for your existing Spring Boot MediRAG backend.

## Requirements
- Node.js 18+
- Spring Boot backend running at http://localhost:8081
- Existing backend endpoints: GET /api/documents, POST /api/documents/upload, DELETE /api/documents/{id}, GET /api/documents/{id}/parse, GET /api/documents/{id}/chunks, GET /api/documents/{id}/download

## Start
Open a terminal in this `medirag-ui` folder:

```bash
npm install
npm run dev
```

Visit http://localhost:5173

Vite proxies `/api` requests to `http://localhost:8081`, avoiding browser CORS errors during local development. To use another backend port, edit `vite.config.ts` and restart Vite.

## Notes
- The chunks endpoint currently uses your PDF-only section-aware chunker; it may not work on Word, Excel, or images until you add adaptive chunking.
- OCR for scanned documents and AI chat are not implemented in the backend yet. The UI does not pretend these features work.
- Use synthetic test documents, not identifiable patient records.
- If your existing GET /api/documents endpoint returns document DTOs with different field names, adjust the `Doc` type and mapping in `src/main.tsx`.

## API integration
All frontend requests use relative `/api/...` paths. `vite.config.ts` proxies these to the Spring Boot server on port 8081. No CORS change is needed while running via Vite.

The UI expects `GET /api/documents` to return an array with `id`, `fileName`, `fileSize`, `contentType`, and optionally `uploadedAt`. The upload endpoint should return an object containing `id`. `/parse` should return `extractedText` and `characterCount`. `/chunks` should return `totalChunks` and `chunks`.

If the backend runs on port 8080 instead, change `target` in `vite.config.ts` to `http://localhost:8080` and restart `npm run dev`.

For production, serve the UI and API from the same origin or configure CORS/security appropriately. The local proxy is development-only.
