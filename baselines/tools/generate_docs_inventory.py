from __future__ import annotations

import re
from collections import Counter
from dataclasses import dataclass
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
DOCS_DIR = ROOT / "docs"
OUTPUT_PATH = ROOT / "baselines" / "DOCS_INVENTORY_DRAFT.md"


SECTION_RE = re.compile(r"^##+\s+(.*)", re.MULTILINE)
TITLE_RE = re.compile(r"^#\s+(.*)", re.MULTILINE)


@dataclass
class DocRecord:
    path: Path
    rel_path: str
    title: str
    section_count: int
    candidate_label: str
    mixed_risk: str
    reasons: list[str]


def read_text(path: Path) -> str:
    for encoding in ("utf-8", "utf-8-sig", "gb18030", "cp936", "latin-1"):
        try:
            return path.read_text(encoding=encoding)
        except UnicodeDecodeError:
            continue
    return path.read_text(encoding="utf-8", errors="replace")


def extract_title(text: str, fallback_name: str) -> str:
    match = TITLE_RE.search(text)
    if match:
        return match.group(1).strip()
    return fallback_name


def extract_sections(text: str) -> list[str]:
    return [m.group(1).strip() for m in SECTION_RE.finditer(text)]


def score_label(rel_path: str, text_lower: str, title_lower: str) -> tuple[str, list[str], Counter]:
    scores: Counter[str] = Counter()
    reasons: list[str] = []

    def add(label: str, points: int, reason: str) -> None:
        scores[label] += points
        reasons.append(reason)

    path_lower = rel_path.lower()

    # Path clues.
    if "/migration/" in path_lower:
        add("history", 6, "目录位于 migration，强烈偏向历史记录")
    if "/architecture/" in path_lower and "readme.md" not in path_lower:
        add("contract", 2, "位于 architecture，通常偏代码真相或边界规则")
        add("baseline", 2, "位于 architecture，通常也承担现状盘点")
    if "/guides/" in path_lower:
        add("guide", 5, "位于 guides，通常偏操作说明")
    if "/pmo/state/" in path_lower or "/pmo/inbox/" in path_lower or "/pmo/outbox/" in path_lower:
        add("contract", 6, "位于 PMO 运行面路径，强烈偏 contract")
    if "/pmo/workflows/" in path_lower:
        add("contract", 4, "位于 PMO workflow 路径，偏运行规则")
        add("guide", 2, "workflow 也带有操作说明属性")
    if path_lower.endswith("/readme.md"):
        add("guide", 2, "README 往往承担入口说明")
    if "baseline" in path_lower:
        add("baseline", 6, "文件名直接表明 baseline")
    if "history" in path_lower or "record" in path_lower:
        add("history", 3, "文件名包含 history 或 record")

    # Content clues.
    phrase_map = {
        "contract": [
            ("canonical", 2, "正文多次出现 canonical"),
            ("default rule", 2, "正文包含 default rule"),
            ("must", 2, "正文包含 must"),
            ("should remain", 1, "正文包含 should remain"),
            ("execution task", 1, "正文包含 execution task"),
            ("current sprint", 1, "正文包含 current sprint"),
        ],
        "baseline": [
            ("current system", 2, "正文包含 current system"),
            ("current shape", 2, "正文包含 current shape"),
            ("baseline", 4, "正文多次出现 baseline"),
            ("current status", 2, "正文包含 current status"),
            ("purpose", 1, "正文包含 purpose"),
        ],
        "guide": [
            ("guide", 3, "正文多次出现 guide"),
            ("when to", 2, "正文包含 when to"),
            ("preferred flow", 2, "正文包含 preferred flow"),
            ("usage rule", 2, "正文包含 usage rule"),
            ("checklist", 2, "正文包含 checklist"),
        ],
        "history": [
            ("migration", 4, "正文多次出现 migration"),
            ("record", 2, "正文包含 record"),
            ("history", 2, "正文包含 history"),
            ("happened", 1, "正文包含 happened"),
        ],
        "working note": [
            ("working", 2, "正文包含 working"),
            ("draft", 3, "正文包含 draft"),
            ("plan", 2, "正文包含 plan"),
            ("next step", 1, "正文包含 next step"),
        ],
    }

    for label, entries in phrase_map.items():
        for needle, points, reason in entries:
            count = text_lower.count(needle)
            if count:
                add(label, min(points + count - 1, points + 2), reason)

    # Title clues.
    if "baseline" in title_lower:
        add("baseline", 4, "标题直接表明 baseline")
    if "guide" in title_lower:
        add("guide", 4, "标题直接表明 guide")
    if "workflow" in title_lower or "protocol" in title_lower or "manual" in title_lower:
        add("contract", 3, "标题表明 workflow/protocol/manual")
    if "migration" in title_lower or "record" in title_lower or "history" in title_lower:
        add("history", 4, "标题表明历史记录")
    if "plan" in title_lower or "draft" in title_lower:
        add("working note", 3, "标题表明计划或草稿")

    if not scores:
        add("working note", 1, "未命中明显特征，先按 working note 候选处理")

    winner, _ = scores.most_common(1)[0]
    return winner, reasons, scores


def mixed_risk_for(scores: Counter[str], sections: list[str]) -> str:
    top_two = scores.most_common(2)
    if len(top_two) == 1:
        return "low"

    top_label, top_score = top_two[0]
    next_label, next_score = top_two[1]

    if next_score >= top_score - 1:
        return "high"
    if len(sections) >= 6 and next_score >= top_score - 3:
        return "medium"
    if next_label != top_label and next_score >= 3:
        return "medium"
    return "low"


def summarize_reasons(reasons: list[str]) -> list[str]:
    seen: set[str] = set()
    unique: list[str] = []
    for reason in reasons:
        if reason not in seen:
            seen.add(reason)
            unique.append(reason)
    return unique[:3]


def collect_records() -> list[DocRecord]:
    records: list[DocRecord] = []

    for path in sorted(DOCS_DIR.rglob("*.md")):
        text = read_text(path)
        rel_path = path.relative_to(ROOT).as_posix()
        title = extract_title(text, path.stem)
        sections = extract_sections(text)
        candidate_label, reasons, scores = score_label(rel_path, text.lower(), title.lower())
        mixed_risk = mixed_risk_for(scores, sections)

        records.append(
            DocRecord(
                path=path,
                rel_path=rel_path,
                title=title,
                section_count=len(sections),
                candidate_label=candidate_label,
                mixed_risk=mixed_risk,
                reasons=summarize_reasons(reasons),
            )
        )

    return records


def build_markdown(records: list[DocRecord]) -> str:
    lines: list[str] = []
    lines.append("# Docs Inventory Draft")
    lines.append("")
    lines.append("> 这是自动生成的初稿，用来减少清点体力活，不替代人工判断。")
    lines.append("")
    lines.append("## 使用说明")
    lines.append("")
    lines.append("- `candidate label` 是脚本给出的候选主标签，不是最终裁决。")
    lines.append("- `mixed risk` 表示这份文档内部可能存在多种语义层的概率。")
    lines.append("- `reason hints` 只展示少量启发式依据，方便人工快速复核。")
    lines.append("")
    lines.append("## 文档清单")
    lines.append("")
    lines.append("| path | title | candidate label | mixed risk | sections | reason hints |")
    lines.append("| --- | --- | --- | --- | ---: | --- |")

    for record in records:
        reasons = "；".join(record.reasons)
        lines.append(
            f"| `{record.rel_path}` | {record.title.replace('|', '/')} | "
            f"`{record.candidate_label}` | `{record.mixed_risk}` | {record.section_count} | {reasons} |"
        )

    lines.append("")
    lines.append("## 下一步建议")
    lines.append("")
    lines.append("1. 先按 `mixed risk = high` 的文件优先人工复核。")
    lines.append("2. 再看 `candidate label` 和目录语义是否明显冲突。")
    lines.append("3. 最后再判断是否需要 section-level 拆分或重写。")
    lines.append("")
    return "\n".join(lines)


def main() -> None:
    records = collect_records()
    OUTPUT_PATH.write_text(build_markdown(records), encoding="utf-8")
    print(f"Wrote {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
