"""Convert markdown documentation files to PDF."""
import re
from fpdf import FPDF

class DocPDF(FPDF):
    def header(self):
        self.set_font('Helvetica', 'I', 8)
        self.set_text_color(150, 150, 150)
        self.cell(0, 5, 'Plateforme Securite Routiere - PFE', align='R')
        self.ln(8)

    def footer(self):
        self.set_y(-15)
        self.set_font('Helvetica', 'I', 8)
        self.set_text_color(150, 150, 150)
        self.cell(0, 10, f'Page {self.page_no()}/{{nb}}', align='C')

    def chapter_title(self, text, level=1):
        sizes = {1: 18, 2: 15, 3: 13, 4: 11}
        size = sizes.get(level, 11)
        self.set_font('Helvetica', 'B', size)
        if level == 1:
            self.set_fill_color(21, 101, 192)
            self.set_text_color(255, 255, 255)
            self.cell(0, 12, f'  {text}', fill=True, new_x='LMARGIN', new_y='NEXT')
            self.set_text_color(0, 0, 0)
        elif level == 2:
            self.set_text_color(21, 101, 192)
            self.cell(0, 10, text, new_x='LMARGIN', new_y='NEXT')
            self.set_draw_color(21, 101, 192)
            self.line(self.l_margin, self.get_y(), self.w - self.r_margin, self.get_y())
            self.set_text_color(0, 0, 0)
        else:
            self.set_text_color(50, 50, 50)
            self.cell(0, 9, text, new_x='LMARGIN', new_y='NEXT')
            self.set_text_color(0, 0, 0)
        self.ln(3)

    def body_text(self, text):
        self.set_font('Helvetica', '', 10)
        self.set_text_color(30, 30, 30)
        self.multi_cell(0, 5.5, text)
        self.ln(2)

    def code_block(self, text):
        self.set_fill_color(245, 245, 245)
        self.set_font('Courier', '', 8)
        self.set_text_color(50, 50, 50)
        for line in text.split('\n'):
            safe = line.encode('latin-1', 'replace').decode('latin-1')
            self.cell(0, 4.5, f'  {safe}', fill=True, new_x='LMARGIN', new_y='NEXT')
        self.set_text_color(0, 0, 0)
        self.set_font('Helvetica', '', 10)
        self.ln(3)

    def table_row(self, cells, header=False):
        self.set_font('Helvetica', 'B' if header else '', 8)
        n = len(cells)
        w = (self.w - self.l_margin - self.r_margin) / n
        w = min(w, 65)
        if header:
            self.set_fill_color(21, 101, 192)
            self.set_text_color(255, 255, 255)
        else:
            self.set_fill_color(248, 249, 250)
            self.set_text_color(30, 30, 30)
        for cell in cells:
            safe = cell.encode('latin-1', 'replace').decode('latin-1')
            self.cell(w, 6, f' {safe}', border=1, fill=True)
        self.ln()
        self.set_text_color(0, 0, 0)

    def bullet(self, text):
        self.set_font('Helvetica', '', 10)
        self.cell(8, 5.5, '-')
        self.multi_cell(0, 5.5, text)
        self.ln(1)

    def bold_text(self, text):
        self.set_font('Helvetica', 'B', 10)
        self.multi_cell(0, 5.5, text)
        self.set_font('Helvetica', '', 10)
        self.ln(1)


def safe(text):
    """Replace characters that latin-1 can't encode."""
    replacements = {
        '\u2192': '->', '\u2190': '<-', '\u2194': '<->',
        '\u2500': '-', '\u2502': '|', '\u250c': '+', '\u2510': '+',
        '\u2514': '+', '\u2518': '+', '\u251c': '+', '\u2524': '+',
        '\u252c': '+', '\u2534': '+', '\u253c': '+',
        '\u2588': '#', '\u2591': '.', '\u2592': ':', '\u2593': '#',
        '\u25b6': '>', '\u25cf': '*', '\u2022': '*',
        '\u2713': '[v]', '\u2717': '[x]', '\u2714': '[v]', '\u2718': '[x]',
        '\u2018': "'", '\u2019': "'", '\u201c': '"', '\u201d': '"',
        '\u2013': '-', '\u2014': '--', '\u2026': '...',
        '\u2264': '<=', '\u2265': '>=', '\u2260': '!=',
        '\u25b2': '^', '\u25bc': 'v',
        '\u2580': '=', '\u2584': '=',
        '\u2016': '||',
        '\u2550': '=', '\u2551': '||', '\u2552': '+', '\u2553': '+',
        '\u2554': '+', '\u2555': '+', '\u2556': '+', '\u2557': '+',
        '\u2558': '+', '\u2559': '+', '\u255a': '+', '\u255b': '+',
        '\u255c': '+', '\u255d': '+', '\u255e': '+', '\u255f': '+',
        '\u2560': '+', '\u2561': '+', '\u2562': '+', '\u2563': '+',
        '\u2564': '+', '\u2565': '+', '\u2566': '+', '\u2567': '+',
        '\u2568': '+', '\u2569': '+', '\u256a': '+', '\u256b': '+',
        '\u256c': '+',
    }
    for k, v in replacements.items():
        text = text.replace(k, v)
    # Remove emojis and other non-latin1 chars
    return text.encode('latin-1', 'replace').decode('latin-1')


def parse_md_to_pdf(md_path, pdf_path):
    with open(md_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    pdf = DocPDF()
    pdf.alias_nb_pages()
    pdf.set_auto_page_break(auto=True, margin=20)
    pdf.add_page()

    i = 0
    in_code = False
    code_buf = []
    in_table = False
    table_header_done = False

    while i < len(lines):
        line = lines[i].rstrip('\n')

        # Code blocks
        if line.startswith('```'):
            if in_code:
                pdf.code_block('\n'.join(code_buf))
                code_buf = []
                in_code = False
            else:
                in_code = True
            i += 1
            continue

        if in_code:
            code_buf.append(line)
            i += 1
            continue

        # Table rows
        if '|' in line and line.strip().startswith('|'):
            cells = [c.strip() for c in line.strip().strip('|').split('|')]
            # Skip separator rows
            if all(set(c.strip()) <= set('-: ') for c in cells):
                table_header_done = True
                i += 1
                continue
            if not in_table:
                in_table = True
                table_header_done = False
                pdf.table_row([safe(c) for c in cells], header=True)
            else:
                pdf.table_row([safe(c) for c in cells], header=False)
            i += 1
            continue
        else:
            in_table = False
            table_header_done = False

        # Headers
        m = re.match(r'^(#{1,4})\s+(.*)', line)
        if m:
            level = len(m.group(1))
            title = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', m.group(2))
            title = re.sub(r'[*_`]', '', title)
            pdf.chapter_title(safe(title), level)
            i += 1
            continue

        # Horizontal rule
        if re.match(r'^---+\s*$', line):
            pdf.ln(3)
            pdf.set_draw_color(200, 200, 200)
            pdf.line(pdf.l_margin, pdf.get_y(), pdf.w - pdf.r_margin, pdf.get_y())
            pdf.ln(5)
            i += 1
            continue

        # Bullet points
        m = re.match(r'^[\s]*[-*]\s+(.*)', line)
        if m:
            text = re.sub(r'\*\*([^*]+)\*\*', r'\1', m.group(1))
            text = re.sub(r'`([^`]+)`', r'\1', text)
            text = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', text)
            pdf.bullet(safe(text))
            i += 1
            continue

        # Numbered list
        m = re.match(r'^[\s]*\d+\.\s+(.*)', line)
        if m:
            text = re.sub(r'\*\*([^*]+)\*\*', r'\1', m.group(1))
            text = re.sub(r'`([^`]+)`', r'\1', text)
            pdf.bullet(safe(text))
            i += 1
            continue

        # Bold lines
        m = re.match(r'^\*\*(.+)\*\*\s*[:.]?\s*(.*)', line)
        if m and not m.group(2):
            pdf.bold_text(safe(m.group(1)))
            i += 1
            continue

        # Empty lines
        if not line.strip():
            pdf.ln(3)
            i += 1
            continue

        # Regular text
        text = re.sub(r'\*\*([^*]+)\*\*', r'\1', line)
        text = re.sub(r'`([^`]+)`', r'\1', text)
        text = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', text)
        if line.startswith('>'):
            text = text.lstrip('> ')
            pdf.set_font('Helvetica', 'I', 10)
            pdf.set_text_color(100, 100, 100)
            pdf.multi_cell(0, 5.5, safe(text))
            pdf.set_text_color(0, 0, 0)
            pdf.set_font('Helvetica', '', 10)
        else:
            pdf.body_text(safe(text))
        i += 1

    pdf.output(pdf_path)
    print(f'PDF genere: {pdf_path}')


if __name__ == '__main__':
    parse_md_to_pdf(
        'docs/diagrammes-uml.md',
        'docs/diagrammes-uml.pdf'
    )
    parse_md_to_pdf(
        'docs/documentation-technique.md',
        'docs/documentation-technique.pdf'
    )
    parse_md_to_pdf(
        'docs/revision-soutenance-fonctionnalites.md',
        'docs/revision-soutenance-fonctionnalites.pdf'
    )
    print('Terminee!')
