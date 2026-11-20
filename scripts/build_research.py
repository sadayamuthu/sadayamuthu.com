#!/usr/bin/env python3
"""Regenerate the Open Source and Research parts of index.html from research.json.

Usage: python3 scripts/build_research.py
"""
import json
import re
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
GITHUB = "https://github.com/sadayamuthu/"


def e(value):
    return escape(str(value), quote=True)


def link(url, text, cls=""):
    attr = f' class="{cls}"' if cls else ""
    return f'<a{attr} href="{e(url)}" target="_blank" rel="noopener">{e(text)}</a>'


def citations(person, p):
    year = p["date"][:4]
    key = f'{person["family"].lower()}_{re.sub(r"[^a-z0-9]", "", p["repo"].lower())}_{year}'
    doi_url = f'https://doi.org/{p["doi"]}'
    apa = f'{person["family"]}, {person["given"][0]}. ({year}). {p["title"]} [Computer software]. Zenodo. {doi_url}'
    bibtex = (
        f'@software{{{key},\n'
        f'  author = {{{person["family"]}, {person["given"]}}},\n'
        f'  title = {{{p["title"]}}},\n'
        f'  year = {{{year}}},\n'
        f'  publisher = {{Zenodo}},\n'
        f'  doi = {{{p["doi"]}}},\n'
        f'  url = {{{doi_url}}}\n'
        f'}}'
    )
    return apa, bibtex


def project_card(person, p):
    apa, bibtex = citations(person, p)
    links = [link(GITHUB + p["repo"], "Code")]
    if p.get("website"):
        links.append(link(p["website"], "Website"))
    adoption = p.get("adoption")
    adoption_html = f'<p class="oss-card-adoption">{link(adoption["url"], adoption["text"])}</p>\n    ' if adoption else ""
    return f'''<article class="oss-card">
    <h4 class="oss-card-title">{e(p["name"])}</h4>
    <p class="oss-card-desc">{e(p["summary"])}</p>
    {adoption_html}<p class="oss-card-meta">{e(p["language"])} &middot; {link("https://doi.org/" + p["doi"], "doi.org/" + p["doi"], "oss-doi")}</p>
    <p class="oss-card-links">{" ".join(links)}</p>
    <details class="oss-cite">
        <summary>Cite</summary>
        <p class="oss-cite-label">APA</p>
        <pre>{e(apa)}</pre>
        <button type="button" class="oss-copy">Copy APA</button>
        <p class="oss-cite-label">BibTeX</p>
        <pre>{e(bibtex)}</pre>
        <button type="button" class="oss-copy">Copy BibTeX</button>
    </details>
</article>'''


def open_source(data):
    parts = []
    for theme in data["themes"]:
        cards = "\n".join(project_card(data["person"], p) for p in theme["projects"])
        parts.append(f'<h3 class="oss-theme">{e(theme["name"])}</h3>\n<div class="oss-grid">\n{cards}\n</div>')
    parts.append(
        '<p class="oss-all">OCBC and ControlGate are published through '
        + link("https://openastra.org/", "OpenAstra")
        + ". See "
        + link("https://github.com/sadayamuthu?tab=repositories", "all repositories on GitHub")
        + ".</p>"
    )
    return "\n".join(parts)


def peer_review_card(r):
    meta = " &middot; ".join(e(x) for x in (r["publisher"], r["group"] + " Working Group", r.get("date")) if x)
    return f'''<div class="pub-card margin-b-30">
    <div class="pub-card-accent"></div>
    <i class="icon-doc pub-card-icon"></i>
    <div class="pub-card-body">
        <span class="research-role">Peer reviewer</span>
        <h4 class="pub-card-title">{link(r["url"], r["title"])}</h4>
        <p class="pub-card-meta">{meta}</p>
        <p class="pub-card-desc">{e(r["summary"])}</p>
    </div>
</div>'''


def archive_row(p):
    version = ("v" if p["version"][0].isdigit() else "") + p["version"]
    return (
        f'<li><strong>{e(p["name"])}</strong> <span>{e(version)} &middot; {e(p["date"][:4])}</span> '
        f'{link("https://doi.org/" + p["doi"], "doi.org/" + p["doi"], "oss-doi")}</li>'
    )


def simple_entries(entries):
    cards = []
    for x in entries:
        meta = e(x.get("meta", ""))
        cards.append(
            f'<div class="pub-card margin-b-30"><div class="pub-card-accent"></div>'
            f'<div class="pub-card-body"><h4 class="pub-card-title">{link(x["url"], x["title"])}</h4>'
            f'<p class="pub-card-meta">{meta}</p></div></div>'
        )
    return "\n".join(cards)


def research(data):
    projects = [p for t in data["themes"] for p in t["projects"]]
    parts = ['<h3 class="oss-theme oss-theme-first">Peer review for the Cloud Security Alliance</h3>']
    parts += [peer_review_card(r) for r in data["peerReviews"]]
    parts.append('<h3 class="oss-theme">Citable software releases</h3>')
    parts.append('<ul class="archive-list">\n' + "\n".join(archive_row(p) for p in projects) + "\n</ul>")
    if data["publications"]:
        parts += ['<h3 class="oss-theme">Publications</h3>', simple_entries(data["publications"])]
    if data["patents"]:
        parts += ['<h3 class="oss-theme">Patents</h3>', simple_entries(data["patents"])]
    return "\n".join(parts)


def json_ld(data):
    p = data["person"]
    author = {"@type": "Person", "name": p["name"], "url": p["url"]}
    # Peer-reviewed papers are deliberately absent: the person is not their author.
    graph = [{"@type": "Person", "name": p["name"], "jobTitle": p["jobTitle"], "url": p["url"], "sameAs": p["sameAs"]}]
    for theme in data["themes"]:
        for x in theme["projects"]:
            graph.append({
                "@type": "SoftwareSourceCode",
                "name": x["title"],
                "description": x["summary"],
                "codeRepository": GITHUB + x["repo"],
                "programmingLanguage": x["language"],
                "identifier": "https://doi.org/" + x["doi"],
                "datePublished": x["date"],
                "author": author,
            })
    body = json.dumps({"@context": "https://schema.org", "@graph": graph}, ensure_ascii=False, indent=2)
    return '<script type="application/ld+json">\n' + body.replace("</", "<\\/") + "\n</script>"


def replace_block(html, name, content):
    begin, end = f"<!-- BEGIN GENERATED: {name} -->", f"<!-- END GENERATED: {name} -->"
    if html.count(begin) != 1 or html.count(end) != 1:
        raise SystemExit(f"index.html must contain exactly one {name} marker pair")
    return re.sub(
        re.escape(begin) + r".*?" + re.escape(end),
        lambda _: f"{begin}\n{content}\n{end}",
        html,
        flags=re.S,
    )


def main():
    data = json.loads((ROOT / "research.json").read_text(encoding="utf-8"))
    path = ROOT / "index.html"
    html = path.read_text(encoding="utf-8")
    for name, content in (("open-source", open_source(data)), ("research", research(data)), ("json-ld", json_ld(data))):
        html = replace_block(html, name, content)
    path.write_text(html, encoding="utf-8")
    print("index.html updated")


if __name__ == "__main__":
    main()
