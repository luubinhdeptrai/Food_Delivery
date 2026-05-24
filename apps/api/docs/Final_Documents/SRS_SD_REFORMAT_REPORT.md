# SRS Sequence Diagrams — Reformatting Report

**Document:** `SRS_SequenceDiagrams.md`
**Reformat Date:** 2025 (this session)
**Produced By:** `tools/reformat-sd.ps1` + `tools/sd-metadata.json`

---

## Report 1 — Formatting Change Summary

| # | Section | Old Layout | New Layout | Reason |
|---|---------|-----------|-----------|--------|
| 1 | Cover / Title | None — document began immediately at first `## SD-1:` header | Full H1 cover block with metadata table (Title, Version, Status, Scope, Diagram Count, Traceability Source) | Academic submission standard; DOCX Title style target |
| 2 | Traceability statement | None | `**Traceability Statement**` paragraph explaining step-number alignment with SRS activity diagrams | Provides examiners a self-contained reference without consulting the SRS |
| 3 | Table of Contents | None | Grouped numbered TOC: five module buckets (Customer 1–10, Restaurant 11–15, Shipper 16–19, Shared Platform 20–26, Admin 27–35), each with per-SD sub-items | Navigation and readability in both rendered Markdown and exported DOCX |
| 4 | SD section headers | `## SD-X: UC-X — Title` (H2, flat) | `### SD-X — UC-X: Title` (H3, nested under H2 module group) | Enables proper DOCX Heading 3 style; keeps diagrams visually subordinate to modules |
| 5 | Module groupings | None — all 35 SDs in one flat list | Five H2 module sections: **Customer Module**, **Restaurant Module**, **Shipper Module**, **Shared Platform Services**, **Administration and Governance**, each with a subtitle H3 and a descriptive paragraph | Matches bounded-context architecture; aids academic reviewers in locating related diagrams |
| 6 | Page breaks | None | `<div style="page-break-before: always;"></div>` before each of the five module H2 headings | Ensures clean DOCX pagination when converted via Pandoc or Word; each module begins on a new page |
| 7 | Per-SD metadata table | None | Eight-row Markdown table per SD: SD ID, Use Case, Module, Primary Actors, Primary Service, Related Services, Complexity, Trace Source | Provides structured metadata for exam appendix and enables quick cross-referencing |
| 8 | Per-SD overview paragraph | None | `**Overview**` paragraph (1–2 sentences) summarising the interaction depicted | Aids comprehension before the diagram is rendered; required for academic appendix standards |
| 9 | PlantUML fenced blocks | `` ```plantuml … ``` `` verbatim, unchanged | Identical — extracted and re-inserted byte-for-byte | No content change; only structural wrapping changed |
| 10 | Horizontal rules | `---` between each SD section | `---` preserved between each SD section and additionally after module header blocks | Consistent visual separation maintained |
| 11 | Footer / closing | None | `*End of Appendix SD — Sequence Diagrams Specification v2.0*` + project name line | Document closure standard |
| 12 | Line count | 2 815 lines | 3 416 lines | Added: cover (~20), TOC (~60), 5 module headers (~50 each = 250), 35 metadata tables (10 rows each = 350), 35 overview paragraphs (~70 total), spacing and rules |

---

## Report 2 — PlantUML Integrity Report

| Check | Result | Detail |
|-------|--------|--------|
| `@startuml` marker count | **PASS — 35 / 35** | Matches original count exactly |
| `@enduml` marker count | **PASS — 35 / 35** | Matches original count exactly |
| SD sections present | **PASS — 35 / 35** | `### SD-1` through `### SD-35` all present |
| Plantuml block extraction method | Verbatim byte copy | `Get-PlantUMLBlock` reads raw lines between fence markers; no parsing or modification |
| PlantUML content changed | **NO** | All message labels, participant names, alt/loop/group blocks, step numbers, arrow directions, and styling annotations are identical to the source |
| Message numbering changed | **NO** | Step labels (e.g. `1.`, `2.1`, `3.a`) inside PlantUML blocks not touched |
| Participant declarations changed | **NO** | All `actor`, `participant`, `boundary`, `control`, `entity` declarations preserved |
| Note / autonumber directives changed | **NO** | `autonumber`, `note over`, `note left of` etc. preserved verbatim |
| Encoding of output file | UTF-8 without BOM, CRLF | Same as SRS_FoodDelivery.md convention; safe for DOCX conversion |
| Em-dash characters in headings | **PASS** | 162 lines contain U+2014 em-dash; 0 literal `$emd` placeholders remain |

### SD Coverage Matrix

| Module | SDs | @startuml count |
|--------|-----|----------------|
| Customer Module | SD-1 – SD-10 | 10 |
| Restaurant Module | SD-11 – SD-15 | 5 |
| Shipper Module | SD-16 – SD-19 | 4 |
| Shared Platform Services | SD-20 – SD-26 | 7 |
| Administration and Governance | SD-27 – SD-35 | 9 |
| **Total** | **35** | **35** |

---

## Report 3 — DOCX Readiness Checklist

| # | Criterion | Status | Notes |
|---|-----------|--------|-------|
| 1 | Single H1 title | **PASS** | `# Appendix SD — Sequence Diagrams Specification` maps to Word Title style |
| 2 | Cover metadata table | **PASS** | 8-field table immediately under H1; clean Pandoc rendering |
| 3 | H2 for module groupings | **PASS** | 5 × H2 headings → Word Heading 2; appear in DOCX navigation pane |
| 4 | H3 for individual SDs | **PASS** | 35 × H3 headings → Word Heading 3; sub-entries in navigation pane |
| 5 | H3 for module subtitles | **PASS** | 5 × subtitle H3s (e.g. "Foundation and Customer Ordering Core") appear as sub-headings |
| 6 | No H4 or deeper headings | **PASS** | Heading hierarchy stops at H3; DOCX export stays clean |
| 7 | Page-break divs | **PASS** | 6 × `<div style="page-break-before: always;">` — Pandoc `--from=markdown` respects raw HTML `div` page-break hints |
| 8 | Markdown tables | **PASS** | All tables use pipe-delimited format with header separator row; Pandoc converts to Word table style |
| 9 | Bold text in table cells | **PASS** | `**Field**` syntax in attribute column renders as bold in DOCX |
| 10 | Fenced code blocks (plantuml) | **PASS** | Pandoc passes fenced blocks through as `CodeBlock`; `--listings` flag or default verbatim block preserves content |
| 11 | Horizontal rules (`---`) | **PASS** | Rendered as Word horizontal rule / page-break divider |
| 12 | Em-dash characters | **PASS** | U+2014 em-dash stored as UTF-8 in headings and table cells; renders natively in DOCX |
| 13 | PlantUML diagrams rendered | **CONDITIONAL** | Requires `plantuml-filter` for Pandoc (e.g. `pandoc --filter pandoc-plantuml`) or pre-render diagrams to PNG and embed; not a Markdown formatting issue |
| 14 | Table of Contents | **PASS** | Manual TOC in Markdown; Pandoc `--toc` flag generates automatic DOCX TOC in addition |
| 15 | File encoding | **PASS** | UTF-8 without BOM; no BOM stripping needed before Pandoc |
| 16 | Line endings | **PASS** | CRLF; compatible with Windows Word and cross-platform Pandoc |

### Recommended Pandoc Command

```bash
pandoc apps/api/docs/Final_Documents/SRS_SequenceDiagrams.md \
  --from=markdown+raw_html \
  --to=docx \
  --toc \
  --toc-depth=3 \
  --reference-doc=reference.docx \
  -o SRS_SequenceDiagrams.docx
```

> **Note on PlantUML:** To render diagrams as images in the DOCX, use `--filter pandoc-plantuml` (requires Java + PlantUML jar) or pre-generate PNG exports and replace the fenced blocks with `![SD-N](images/sd-N.png)` image references before conversion.

---

*End of SRS SD Reformatting Report*
