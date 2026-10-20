# Ticket Assist

A local support-ticket assistant that finds resolved historical tickets using
sentence-transformer embeddings and a FAISS cosine-similarity index. We can search the included incoming-ticket examples or any ticket entered
in the form.

## Run

The app expects these JSON files in the sibling `starter_kit\data` directory:

- `tickets.json` with a top-level `tickets` array
- `new_tickets_example.json` with a top-level `new_tickets` array

Install Python dependencies once:

```powershell
python -m pip install -r requirements.txt
```

Start the app with `run.bat` or:

```powershell
python backend\server.py
```

Open <http://127.0.0.1:8000](https://tracker-landing-logo-daughter.trycloudflare.com/>. The backend loads the
`sentence-transformers/all-MiniLM-L6-v2` model on startup; the first launch may
download it if it is not already cached. Set `TICKET_DATA_DIR` to override the
default data directory.

The API is served by the same local Python process:

- `GET /api/health`
- `GET /api/tickets`
- `POST /api/search` with `{"subject":"...", "description":"...", "limit":5}`
