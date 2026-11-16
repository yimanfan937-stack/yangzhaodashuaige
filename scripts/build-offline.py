"""Build the static game into one self-contained HTML, with no runtime downloads."""
from pathlib import Path
import base64, re
ROOT=Path(__file__).resolve().parents[1]
DIST=ROOT/'dist' if (ROOT/'dist'/'index.html').exists() else ROOT
def data(path,mime):
    return 'data:'+mime+';base64,'+base64.b64encode((DIST/path).read_bytes()).decode()
html=(DIST/'index.html').read_text()
css=(DIST/'style.css').read_text().replace("url('deck-preview.webp')","url('"+data('deck-preview.webp','image/webp')+"')")
html=re.sub(r'<link rel="stylesheet"[^>]+>',lambda m:'<style>'+css+'</style>',html)
html=re.sub(r'<link rel="manifest"[^>]+>','',html)
html=html.replace('href="icon-192.png"','href="'+data('icon-192.png','image/png')+'"')
html=html.replace('src="share-qr.svg"','src="'+data('share-qr.svg','image/svg+xml')+'"')
html=html.replace('<a id="downloadOffline" class="secondary" href="play-offline.html" download="Deckfire.html">下载电脑离线版</a>','<p class="small-print">你已打开独立版本。分享这个 HTML 文件，其他电脑即可离线游玩。</p>')
flag='<script>window.DECK_STANDALONE=true;</script>'
html=html.replace('<body>','<body>'+flag,1)
def script(match):
    name=match.group(1).split('?')[0]
    code=(DIST/name).read_text()
    if name=='game.js':
        fallback=(DIST/'fallback.js').read_text()
        code='window.DeckOfflineFallback=function(){\n'+fallback+'\n};\n'+code
    return '<script>'+code.replace('</script','<\\/script')+'</script>'
html=re.sub(r'<script src="([^"]+)"></script>',script,html)
html=html.replace('<title>甲板交火 | 3D 团队竞技</title>','<title>甲板交火 | 独立离线版</title>')
out=DIST/'play-offline.html';out.write_text(html)
print(f'Built {out.name}: {out.stat().st_size} bytes')
