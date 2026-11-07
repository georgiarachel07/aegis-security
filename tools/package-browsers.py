"""Build unpacked folders and archives for each browser family."""
import argparse
import json
import shutil
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('output', type=Path)
output = parser.parse_args().output.resolve()
common = ['rules.json', 'LICENSE', 'README.md']
full = ['background.js', 'content.js', 'dashboard.html', 'dashboard.js', 'dashboard.css',
        'docs/privacy.md', *[p.relative_to(ROOT).as_posix() for p in (ROOT/'modules').glob('*.js')]]

for target in ['chromium', 'firefox', 'safari']:
    folder = output/target
    folder.mkdir(parents=True, exist_ok=True)
    manifest = json.loads((ROOT/'manifest.json').read_text())
    files = common + (full if target != 'safari' else [])
    if target == 'firefox':
        manifest.pop('minimum_chrome_version')
        manifest['background'] = {'scripts': ['background.js'], 'type': 'module'}
        manifest['browser_specific_settings'] = {'gecko': {
            'id': 'aegis-shield@georgiarachel07.github.io', 'strict_min_version': '140.0'}}
    if target == 'safari':
        # Safari build offers the network blocker without unsupported download/telemetry APIs.
        manifest.pop('minimum_chrome_version')
        manifest.pop('background')
        manifest.pop('content_scripts')
        manifest['permissions'] = ['declarativeNetRequest']
        manifest['description'] = 'Block requests to starter advertising and tracking domains in Safari. Made by Georgia Rachel.'
        manifest['action'] = {'default_popup':'safari.html','default_title':'Aegis Shield'}
        files.extend(['safari.html','safari.js'])
    for name in files:
        destination = folder/name
        destination.parent.mkdir(parents=True, exist_ok=True)
        source = ROOT/('ports/'+name if name in ['safari.html','safari.js'] else name)
        if target == 'firefox' and name.endswith('.js'):
            script = source.read_text(encoding='utf-8')
            # Firefox's browser namespace returns promises for asynchronous APIs.
            script = script.replace('globalThis.chrome?', 'globalThis.browser?').replace('chrome.', 'browser.')
            if name == 'modules/state.js':
                # Firefox keeps session storage private by default. Only non-secret
                # preferences live in local storage.
                script = '\n'.join(line for line in script.split('\n') if '.setAccessLevel(' not in line)
            destination.write_text(script, encoding='utf-8')
        else:
            shutil.copyfile(source, destination)
    (folder/'manifest.json').write_text(json.dumps(manifest, indent=2)+'\n',encoding='utf-8')
    with zipfile.ZipFile(output/f'Aegis-Shield-{target}.zip','w',zipfile.ZIP_DEFLATED) as archive:
        for name in ['manifest.json', *files]:
            archive.write(folder/name, name)
