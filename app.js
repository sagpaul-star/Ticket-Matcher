const h = React.createElement;

function App() {
  const [tickets, setTickets] = React.useState([]);
  const [subject, setSubject] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [matches, setMatches] = React.useState([]);
  const [loadingTickets, setLoadingTickets] = React.useState(true);
  const [searching, setSearching] = React.useState(false);
  const [error, setError] = React.useState("");
  const [searchError, setSearchError] = React.useState("");
  const searchSequence = React.useRef(0);

  React.useEffect(() => {
    fetch("/api/tickets")
      .then((response) => {
        if (!response.ok) throw new Error("Could not load example tickets.");
        return response.json();
      })
      .then((data) => {
        setTickets(data.tickets);
      })
      .catch((problem) => setError(problem.message))
      .finally(() => setLoadingTickets(false));
  }, []);

  React.useEffect(() => {
    const sequence = ++searchSequence.current;
    if (!subject.trim() && !description.trim()) {
      setMatches([]);
      setSearchError("");
      setSearching(false);
      return undefined;
    }

    const controller = new AbortController();
    setSearching(true);
    setMatches([]);
    const timeout = window.setTimeout(() => {
      setSearchError("");
      fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, description, limit: 5 }),
        signal: controller.signal,
      })
        .then(async (response) => {
          const data = await response.json();
          if (!response.ok) throw new Error(data.error || "Search failed.");
          if (sequence === searchSequence.current) setMatches(data.matches);
        })
        .catch((problem) => {
          if (problem.name !== "AbortError" && sequence === searchSequence.current) {
            setSearchError(problem.message);
          }
        })
        .finally(() => {
          if (!controller.signal.aborted && sequence === searchSequence.current) {
            setSearching(false);
          }
        });
    }, 300);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [subject, description]);

  function chooseTicket(ticket) {
    setSubject(ticket.subject || "");
    setDescription(ticket.description || "");
  }

  return h("div", { className: "app-shell" }, [
    h("header", { className: "topbar", key: "topbar" }, [
      h("a", { className: "brand", href: "/", key: "brand" }, [
        h("span", { className: "brand-mark", key: "mark" }, "T"),
        h("span", { key: "name" }, "Ticket Matcher"),
      ]),
      h("div", { className: "status-pill", key: "status" }, [
        h("span", { className: "status-dot", key: "dot" }),
        "Semantic search ready",
      ]),
    ]),
    h("main", { className: "page", key: "main" }, [
      h("section", { className: "page-heading", key: "heading" }, [
        h("div", { className: "eyebrow", key: "eyebrow" }, "SUPPORT WORKSPACE"),
        h("h1", { key: "title" }, "Find the answer faster."),
        h(
          "p",
          { key: "subtitle" },
          "Explore resolved tickets for the most relevant fixes as a new request comes in."
        ),
      ]),
      h("div", { className: "workspace", key: "workspace" }, [
        h("aside", { className: "inbox panel", key: "inbox" }, [
          h("div", { className: "panel-heading", key: "panel-heading" }, [
            h("div", { key: "labels" }, [
              h("div", { className: "eyebrow", key: "eyebrow" }, "INBOX"),
              h("h2", { key: "title" }, "New tickets"),
            ]),
            h("span", { className: "count-badge", key: "count" }, String(tickets.length)),
          ]),
          h("p", { className: "panel-hint", key: "hint" }, "Select an example or enter a ticket."),
          loadingTickets
            ? h("div", { className: "empty-state", key: "loading" }, "Loading examples…")
            : error
              ? h("div", { className: "inline-error", key: "error" }, error)
              : h(
                  "div",
                  { className: "ticket-list", key: "list" },
                  tickets.map((ticket) => {
                    const selected =
                      ticket.subject === subject && ticket.description === description;
                    return h(
                      "button",
                      {
                        className: `ticket-option${selected ? " selected" : ""}`,
                        key: ticket.ticket_id,
                        onClick: () => chooseTicket(ticket),
                        type: "button",
                      },
                      [
                        h("span", { className: "ticket-option-top", key: "top" }, [
                          h("span", { className: "ticket-id", key: "id" }, ticket.ticket_id),
                          h(
                            "span",
                            { className: "ticket-arrow", "aria-hidden": true, key: "arrow" },
                            "↗"
                          ),
                        ]),
                        h("span", { className: "ticket-option-title", key: "title" }, ticket.subject),
                      ]
                    );
                  })
                ),
          h("div", { className: "inbox-footer", key: "footer" }, [
            h("span", { className: "footer-dot", key: "dot" }),
            "Connected to ticket examples",
          ]),
        ]),
        h("section", { className: "details-column", key: "details" }, [
          h("section", { className: "panel composer", key: "composer" }, [
            h("div", { className: "panel-heading composer-heading", key: "heading" }, [
              h("div", { key: "labels" }, [
                h("div", { className: "eyebrow", key: "eyebrow" }, "TICKET DETAILS"),
                h("h2", { key: "title" }, "What does the customer need?"),
              ]),
              h("span", { className: "ai-badge", key: "badge" }, [
                h("span", { key: "spark" }, "✳"),
                "AI-assisted",
              ]),
            ]),
            h("label", { className: "field-label", htmlFor: "subject", key: "subject-label" }, "Subject"),
            h("input", {
              id: "subject",
              className: "text-input",
              key: "subject",
              onChange: (event) => setSubject(event.target.value),
              placeholder: "Briefly summarize the issue",
              value: subject,
            }),
            h("label", { className: "field-label description-label", htmlFor: "description", key: "description-label" }, "Description"),
            h("textarea", {
              id: "description",
              className: "text-input description-input",
              key: "description",
              onChange: (event) => setDescription(event.target.value),
              placeholder: "Add details, symptoms, or error messages…",
              rows: 3,
              value: description,
            }),
          ]),
          h("section", { className: "results-section", key: "results" }, [
            h("div", { className: "results-heading", key: "heading" }, [
              h("div", { key: "title-area" }, [
                h("div", { className: "eyebrow", key: "eyebrow" }, "FROM RESOLVED HISTORY"),
                h("h2", { key: "title" }, "Similar tickets & resolutions"),
              ]),
              h(
                "span",
                { className: "result-count", key: "count" },
                searching ? "Searching…" : `${matches.length} matches`
              ),
            ]),
            searchError
              ? h("div", { className: "inline-error result-error", key: "error" }, searchError)
              : matches.length
                ? h(
                    "div",
                    { className: "results-list", key: "list" },
                    matches.map((ticket, index) =>
                      h("article", { className: "result-card", key: ticket.ticket_id }, [
                        h("div", { className: "result-card-top", key: "top" }, [
                          h("div", { className: "result-number", key: "number" }, String(index + 1).padStart(2, "0")),
                          h("span", { className: "ticket-id", key: "id" }, ticket.ticket_id),
                          h(
                            "span",
                            { className: "similarity", key: "score" },
                            `${Math.max(0, Math.min(100, Math.round(ticket.similarity * 100)))}% similar`
                          ),
                        ]),
                        h("h3", { key: "title" }, ticket.subject),
                        h("p", { className: "ticket-description", key: "description" }, ticket.description),
                        h("div", { className: "resolution", key: "resolution" }, [
                          h("div", { className: "resolution-heading", key: "heading" }, [
                            h("span", { className: "resolution-icon", key: "icon" }, "✓"),
                            h("strong", { key: "label" }, "RESOLUTION"),
                            ticket.category
                              ? h("span", { className: "category", key: "category" }, ticket.category)
                              : null,
                          ]),
                          h("p", { key: "text" }, ticket.resolution_notes),
                        ]),
                        Array.isArray(ticket.tags) && ticket.tags.length
                          ? h(
                              "div",
                              { className: "tags", key: "tags" },
                              ticket.tags.map((tag) =>
                                h("span", { className: "tag", key: tag }, tag)
                              )
                            )
                          : null,
                      ])
                    )
                  )
                : h(
                    "div",
                    { className: "empty-results", key: "empty" },
                    searching
                      ? "Finding the closest resolved tickets…"
                      : "Enter a subject or description to find related resolutions."
                  ),
          ]),
        ]),
      ]),
      h(
        "footer",
        { className: "page-footer", key: "footer" },
        "Matches are ranked by semantic similarity. Review each resolution before applying it."
      ),
    ]),
  ]);
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(h(App));
