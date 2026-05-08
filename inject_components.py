"""
Strip old <header>…</header> and <footer>…</footer> from every HTML page,
inject <reads-nav> and <reads-footer> web components, and add the
components.js script tag.
"""
import re, os, glob

ROOT   = '/home/claude/reads_site'
BLOG   = os.path.join(ROOT, 'blog')

# ── helpers ──────────────────────────────────────────────────────────────────

def strip_tag_block(html, tag):
    """Remove the outermost <tag>…</tag> block (including nested tags)."""
    open_re  = re.compile(rf'<{tag}(\s[^>]*)?>',  re.IGNORECASE | re.DOTALL)
    close_re = re.compile(rf'</{tag}>',             re.IGNORECASE)

    m = open_re.search(html)
    if not m:
        return html

    start = m.start()
    depth = 0
    i     = start

    while i < len(html):
        mo = open_re.search(html, i)
        mc = close_re.search(html, i)

        if mo and (not mc or mo.start() < mc.start()):
            depth += 1
            i = mo.end()
        elif mc:
            depth -= 1
            if depth == 0:
                end = mc.end()
                html = html[:start] + html[end:]
                # recurse — page might have duplicate header/footer
                return strip_tag_block(html, tag)
            i = mc.end()
        else:
            break
    return html


def inject_components(html, depth=0):
    """Insert <reads-nav> after <body…> and <reads-footer> before </body>."""
    depth_attr = f' depth="{depth}"' if depth > 0 else ''
    nav_tag    = f'<reads-nav{depth_attr}></reads-nav>'
    foot_tag   = f'<reads-footer{depth_attr}></reads-footer>'

    # insert nav right after opening <body …>
    html = re.sub(r'(<body[^>]*>)', rf'\1\n  {nav_tag}', html,
                  flags=re.IGNORECASE, count=1)

    # insert footer just before </body>
    html = html.replace('</body>', f'\n  {foot_tag}\n</body>', 1)
    return html


def add_script(html, depth=0):
    """Add components.js before </head> if not already present."""
    prefix = '../' * depth
    tag = f'<script src="{prefix}js/components.js" defer></script>'
    if 'components.js' in html:
        return html
    return html.replace('</head>', f'  {tag}\n</head>', 1)


def remove_old_script(html):
    """Remove the old monolithic script.js reference (replaced by components.js)."""
    # keep script.js — it may still have page-specific logic
    # but remove any inline theme/nav init that duplicates components.js
    return html


def clean_page(html):
    for tag in ('header', 'footer'):
        html = strip_tag_block(html, tag)
    return html


def process_file(path, depth=0):
    with open(path, 'r', encoding='utf-8') as f:
        html = f.read()

    original = html
    html = clean_page(html)
    html = inject_components(html, depth)
    html = add_script(html, depth)

    if html != original:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(html)
        print(f'  ✅  {os.path.relpath(path, ROOT)}')
    else:
        print(f'  ⚠️  no change: {os.path.relpath(path, ROOT)}')


# ── run ───────────────────────────────────────────────────────────────────────

print('\n── Root pages ──')
for path in sorted(glob.glob(os.path.join(ROOT, '*.html'))):
    process_file(path, depth=0)

print('\n── Blog pages ──')
for path in sorted(glob.glob(os.path.join(BLOG, '*.html'))):
    process_file(path, depth=1)

print('\nDone.')
